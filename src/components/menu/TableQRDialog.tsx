import React, { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table } from "lucide-react";
import html2canvas from "html2canvas";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { handleRelationDoesNotExistError } from "@/lib/setupDatabase";
import ErrorState from "@/components/menu/ErrorState";

interface TableQRDialogProps {
  restaurantId: string;
}

const TableQRDialog: React.FC<TableQRDialogProps> = ({ restaurantId }) => {
  const [tableCount, setTableCount] = useState<number | null>(null);
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [tableNumbers, setTableNumbers] = useState<number[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Load table count when dialog opens
  useEffect(() => {
    if (isDialogOpen) {
      loadTableCount();
    }
  }, [isDialogOpen]);

  const loadTableCount = async () => {
    try {
      setIsUpdating(true);
      
      // First try to get the table count from the restaurants table
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .select('table_count')
        .eq('id', restaurantId)
        .single();
        
      if (restaurantError) {
        console.error('Error fetching restaurant table count:', restaurantError);
        throw restaurantError;
      }
      
      const currentCount = restaurantData?.table_count || 1;
      setTableCount(currentCount);
      
      // Then fetch the actual table numbers
      const { data: tablesData, error: tablesError } = await supabase
        .from('tables')
        .select('table_number')
        .eq('restaurant_id', restaurantId)
        .order('table_number', { ascending: true });
        
      if (tablesError) {
        if (tablesError.code === 'PGRST116' || tablesError.message.includes('does not exist')) {
          // If tables table doesn't exist, create it and initialize tables
          await ensureTablesTableExists();
          await initializeTables(currentCount);
        } else {
          console.error('Error fetching tables:', tablesError);
          throw tablesError;
        }
      } else if (tablesData && tablesData.length > 0) {
        const numbers = tablesData.map(t => t.table_number);
        setTableNumbers(numbers);
      } else {
        // If no tables exist, initialize them
        await initializeTables(currentCount);
      }
    } catch (error) {
      console.error('Error loading table count:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load table count. Please try again."
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const initializeTables = async (count: number) => {
    try {
      const newTables = Array.from({ length: count }, (_, i) => ({
        restaurant_id: restaurantId,
        table_number: i + 1
      }));
      
      const { error } = await supabase
        .from('tables')
        .upsert(newTables);
        
      if (error) {
        console.error('Error initializing tables:', error);
        throw error;
      }
      
      setTableNumbers(Array.from({ length: count }, (_, i) => i + 1));
    } catch (error) {
      console.error('Error in initializeTables:', error);
      throw error;
    }
  };

  const updateTables = async (count: number) => {
    if (isUpdating || count === null) return;
    
    setIsUpdating(true);
    try {
      // First update the table count in the restaurants table
      const { error: updateError } = await supabase
        .from('restaurants')
        .update({ table_count: count })
        .eq('id', restaurantId);
        
      if (updateError) {
        console.error('Error updating table count:', updateError);
        throw updateError;
      }
      
      // Then update the actual tables
      const { data: existingTables, error: fetchError } = await supabase
        .from('tables')
        .select('id, table_number')
        .eq('restaurant_id', restaurantId)
        .order('table_number', { ascending: true });
        
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching existing tables:', fetchError);
        throw fetchError;
      }
      
      const existingTableNumbers = existingTables ? existingTables.map(t => t.table_number) : [];
      
      if (count > existingTableNumbers.length) {
        // Add new tables
        const newTablesCount = count - existingTableNumbers.length;
        const startingNumber = existingTableNumbers.length > 0 ? 
          Math.max(...existingTableNumbers) + 1 : 1;
        
        const newTables = [];
        for (let i = 0; i < newTablesCount; i++) {
          const tableNumber = startingNumber + i;
          newTables.push({
            restaurant_id: restaurantId,
            table_number: tableNumber
          });
        }
        
        if (newTables.length > 0) {
          const { error } = await supabase
            .from('tables')
            .upsert(newTables);
              
          if (error) {
            console.error(`Error adding tables:`, error);
            throw error;
          }
        }
      } else if (count < existingTableNumbers.length) {
        // Remove excess tables
        const tablesToRemove = existingTableNumbers.length - count;
        const sortedExistingTables = [...existingTables || []].sort((a, b) => b.table_number - a.table_number);
        
        const tableIdsToRemove = sortedExistingTables.slice(0, tablesToRemove).map(t => t.id);
        
        if (tableIdsToRemove.length > 0) {
          const { error } = await supabase
            .from('tables')
            .delete()
            .in('id', tableIdsToRemove);
            
          if (error) {
            console.error(`Error removing tables:`, error);
            throw error;
          }
        }
      }
      
      // Update local state
      setTableNumbers(Array.from({ length: count }, (_, i) => i + 1));
      setTableCount(count);
      
      toast({
        title: "QR codes updated",
        description: `Ready to download QR codes for ${count} tables`
      });
    } catch (error) {
      console.error('Error updating tables:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update tables. Please try again."
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const ensureTablesTableExists = async () => {
    try {
      const { error } = await supabase.rpc(
        'create_table_if_not_exists',
        {
          table_name: 'tables',
          table_definition: `
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
            table_number INTEGER NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
            UNIQUE(restaurant_id, table_number)
          `
        }
      );

      if (error) {
        console.error('Error ensuring tables table exists:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Exception ensuring tables table exists:', error);
      await handleRelationDoesNotExistError(error);
      return false;
    }
  };

  const handleTableCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCount = parseInt(e.target.value);
    if (isNaN(newCount) || newCount < 1) {
      toast({
        variant: "destructive",
        title: "Invalid table count",
        description: "Number of tables must be at least 1"
      });
      return;
    }
    setTableCount(newCount);
    updateTables(newCount);
  };

  const incrementTableCount = () => {
    if (tableCount === null) return;
    const newCount = tableCount + 1;
    setTableCount(newCount);
    updateTables(newCount);
  };
  
  const decrementTableCount = () => {
    if (tableCount === null || tableCount <= 1) return;
    const newCount = tableCount - 1;
    setTableCount(newCount);
    updateTables(newCount);
  };

  const downloadQRCode = async (tableId: string) => {
    const element = document.getElementById(`qr-code-${tableId}`);
    if (!element) return;

    const canvas = await html2canvas(element);
    const link = document.createElement('a');
    link.download = `table-${tableId}-qr.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 px-2 md:px-3">
          <Table className="h-4 w-4" />
          <span className="hidden md:inline ml-2">Table QR Codes</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Restaurant Table QR Codes</DialogTitle>
          <DialogDescription>
            Generate QR codes for each table. Customers can scan these to place orders.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              size="icon"
              onClick={decrementTableCount}
              disabled={tableCount === null || tableCount <= 1 || isUpdating}
            >
              <span className="font-bold text-lg">-</span>
            </Button>
            
            <div className="w-16">
              <Input
                id="tableCount"
                type="number"
                min="1"
                value={tableCount === null ? "" : tableCount}
                onChange={handleTableCountChange}
                className="text-center"
                disabled={isUpdating}
              />
            </div>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={incrementTableCount}
              disabled={isUpdating || tableCount === null}
            >
              <span className="font-bold text-lg">+</span>
            </Button>
          </div>
          
          <Label htmlFor="tableCount" className="text-sm font-medium">
            Tables
          </Label>
          
          {isUpdating && (
            <div className="text-sm text-muted-foreground animate-pulse ml-auto">
              Updating...
            </div>
          )}
        </div>

        <ScrollArea className="h-[60vh] w-full rounded-md">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
            {tableNumbers.map((tableNumber) => (
              <div
                key={tableNumber}
                className="p-4 border rounded-lg bg-white flex flex-col items-center space-y-3"
              >
                <div className="text-sm font-medium">Table {tableNumber}</div>
                <div 
                  id={`qr-code-${tableNumber}`}
                  className="bg-white p-4 rounded-lg"
                >
                  <QRCode
                    value={`${window.location.origin}/menu-preview/${restaurantId}?table=${tableNumber}&restaurantId=${restaurantId}`}
                    size={150}
                    className="h-auto max-w-full"
                  />
                </div>
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => downloadQRCode(tableNumber.toString())}
                >
                  Download QR
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TableQRDialog;

