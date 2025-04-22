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
  const [tableCount, setTableCount] = useState(20);
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [tableNumbers, setTableNumbers] = useState<number[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch table numbers only when the dialog is opened
  useEffect(() => {
    if (isDialogOpen) {
      fetchTableNumbers();
    }
  }, [isDialogOpen]);

  const fetchTableNumbers = async () => {
    try {
      setIsUpdating(true);
      const { data, error } = await supabase
        .from('tables')
        .select('table_number')
        .eq('restaurant_id', restaurantId)
        .order('table_number', { ascending: true });
      
      if (error) {
        // Handle the case where the table doesn't exist yet
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          console.log('Tables table does not exist yet');
          // Default to generating QR codes for tableCount tables
          setTableNumbers(Array.from({ length: tableCount }, (_, i) => i + 1));
          setIsUpdating(false);
          return;
        }
        
        console.error('Error fetching tables:', error);
        // Continue with default table numbers
        setTableNumbers(Array.from({ length: tableCount }, (_, i) => i + 1));
        setIsUpdating(false);
        return;
      }
      
      if (data && data.length > 0) {
        const numbers = data.map(t => t.table_number);
        console.log('Table IDs:', numbers);
        setTableNumbers(numbers);
        // Update the table count to match the total number of tables
        setTableCount(numbers.length);
      } else {
        // If no tables exist in the database yet, create the default number
        setTableNumbers(Array.from({ length: tableCount }, (_, i) => i + 1));
        // Create the initial tables in the database
        await ensureTablesTableExists();
        await updateTables(tableCount);
      }
    } catch (error) {
      console.error('Exception during table fetch:', error);
      // Continue with default table numbers for QR generation
      setTableNumbers(Array.from({ length: tableCount }, (_, i) => i + 1));
    } finally {
      setIsUpdating(false);
    }
  };

  const updateTables = async (count: number) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      // Ensure the tables table exists
      await ensureTablesTableExists();
      
      // First, get existing table numbers
      const { data: existingTables, error: fetchError } = await supabase
        .from('tables')
        .select('id, table_number')
        .eq('restaurant_id', restaurantId)
        .order('table_number', { ascending: true });
        
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching existing tables:', fetchError);
      }
      
      const existingTableNumbers = existingTables ? existingTables.map(t => t.table_number) : [];
      
      if (count > existingTableNumbers.length) {
        // We need to add new tables
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
        
        // Bulk insert new tables for better performance
        if (newTables.length > 0) {
          const { error } = await supabase
            .from('tables')
            .upsert(newTables);
              
          if (error) {
            console.error(`Error adding tables:`, error);
            // Try individual inserts as fallback if bulk insert fails
            for (const tableData of newTables) {
              try {
                await supabase.from('tables').upsert(tableData);
              } catch (e) {
                console.error(`Error adding individual table ${tableData.table_number}:`, e);
              }
            }
          }
        }
      } else if (count < existingTableNumbers.length) {
        // We need to remove tables, starting from the highest numbers
        const tablesToRemove = existingTableNumbers.length - count;
        const sortedExistingTables = [...existingTables || []].sort((a, b) => b.table_number - a.table_number);
        
        // Get IDs of tables to remove
        const tableIdsToRemove = sortedExistingTables.slice(0, tablesToRemove).map(t => t.id);
        
        if (tableIdsToRemove.length > 0) {
          // Bulk delete tables
          const { error } = await supabase
            .from('tables')
            .delete()
            .in('id', tableIdsToRemove);
            
          if (error) {
            console.error(`Error removing tables:`, error);
            // Try individual deletes as fallback
            for (const tableId of tableIdsToRemove) {
              try {
                await supabase.from('tables').delete().eq('id', tableId);
              } catch (e) {
                console.error(`Error removing individual table ${tableId}:`, e);
              }
            }
          }
        }
      }
      
      // Update the UI with new table numbers - fetch from DB to ensure consistency
      const { data: updatedTables } = await supabase
        .from('tables')
        .select('table_number')
        .eq('restaurant_id', restaurantId)
        .order('table_number', { ascending: true });
      
      if (updatedTables && updatedTables.length > 0) {
        const updatedNumbers = updatedTables.map(t => t.table_number);
        setTableNumbers(updatedNumbers);
        setTableCount(updatedNumbers.length);
      } else {
        // Fallback: use the count parameter to generate numbers if DB fetch fails
        setTableNumbers(Array.from({ length: count }, (_, i) => i + 1));
        setTableCount(count);
      }
      
      // Let the user know the process is complete
      toast({
        title: "QR codes updated",
        description: `Ready to download QR codes for ${count} tables`
      });
    } catch (error) {
      console.error('Error updating tables:', error);
      
      // Even if DB operations fail, still update the UI to show the requested number of tables
      setTableNumbers(Array.from({ length: count }, (_, i) => i + 1));
      setTableCount(count);
    } finally {
      setIsUpdating(false);
    }
  };

  const ensureTablesTableExists = async () => {
    try {
      // Use RPC to check if table exists
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
      // Try to set up the database
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
    const newCount = tableCount + 1;
    setTableCount(newCount);
    updateTables(newCount);
  };
  
  const decrementTableCount = () => {
    if (tableCount <= 1) return;
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
              disabled={tableCount <= 1 || isUpdating}
            >
              <span className="font-bold text-lg">-</span>
            </Button>
            
            <div className="w-16">
              <Input
                id="tableCount"
                type="number"
                min="1"
                value={tableCount}
                onChange={handleTableCountChange}
                className="text-center"
                disabled={isUpdating}
              />
            </div>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={incrementTableCount}
              disabled={isUpdating}
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
