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
      
      // Then fetch the actual table numbers
      const { data: tablesData, error: tablesError } = await supabase
        .from('tables')
        .select('table_number')
        .eq('restaurant_id', restaurantId)
        .order('table_number', { ascending: true });
        
      if (tablesError) {
        console.error('Error fetching tables:', tablesError);
        throw tablesError;
      }
      
      if (!tablesData || tablesData.length === 0) {
        // Initialize tables if none exist
        const newTables = Array.from({ length: currentCount }, (_, i) => ({
          restaurant_id: restaurantId,
          table_number: i + 1
        }));

        // Insert tables one by one to avoid conflicts
        for (const table of newTables) {
          const { error: insertError } = await supabase
            .from('tables')
            .insert([table]);
            
          if (insertError) {
            console.error('Error initializing table:', insertError);
            // If this table number exists, try the next available number
            if (insertError.code === '23505') {
              continue;
            }
            throw insertError;
          }
        }
        
        // Fetch the actual table numbers after initialization
        const { data: updatedData, error: refreshError } = await supabase
          .from('tables')
          .select('table_number')
          .eq('restaurant_id', restaurantId)
          .order('table_number', { ascending: true });
          
        if (refreshError) {
          console.error('Error refreshing table numbers:', refreshError);
          throw refreshError;
        }
        
        setTableNumbers(updatedData?.map(t => t.table_number) || []);
      } else {
        setTableNumbers(tablesData.map(t => t.table_number));
      }
      
      setTableCount(currentCount);
    } catch (error) {
      console.error('Error loading table count:', error);
      setTableCount(1);
      setTableNumbers([1]);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load table count. Using default value of 1."
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const updateTables = async (count: number) => {
    if (isUpdating || count === null || count < 1) return;
    
    setIsUpdating(true);
    try {
      // Update the restaurant's table count
      const { error: updateError } = await supabase
        .from('restaurants')
        .update({ table_count: count })
        .eq('id', restaurantId);
        
      if (updateError) {
        console.error('Error updating table count:', updateError);
        throw updateError;
      }
      
      // Get current tables
      const { data: existingTables, error: fetchError } = await supabase
        .from('tables')
        .select('id, table_number')
        .eq('restaurant_id', restaurantId)
        .order('table_number', { ascending: true });
        
      if (fetchError) {
        console.error('Error fetching existing tables:', fetchError);
        throw fetchError;
      }

      const existingTableNumbers = existingTables?.map(t => t.table_number) || [];
      
      if (count > existingTableNumbers.length) {
        // Add new tables
        const newTablesCount = count - existingTableNumbers.length;
        let nextNumber = existingTableNumbers.length > 0 ? 
          Math.max(...existingTableNumbers) + 1 : 1;

        // Add tables one by one to handle conflicts
        for (let i = 0; i < newTablesCount; i++) {
          let inserted = false;
          while (!inserted && nextNumber <= 1000) { // Prevent infinite loop
            const { error: insertError } = await supabase
              .from('tables')
              .insert([{
                restaurant_id: restaurantId,
                table_number: nextNumber
              }]);
              
            if (!insertError) {
              inserted = true;
            } else if (insertError.code === '23505') {
              // If this number exists, try the next one
              nextNumber++;
            } else {
              console.error('Error adding table:', insertError);
              throw insertError;
            }
          }
          if (!inserted) {
            throw new Error('Could not find available table number');
          }
        }
      } else if (count < existingTableNumbers.length) {
        // Remove excess tables starting from highest number
        const tablesToRemove = existingTableNumbers.length - count;
        const sortedExistingTables = [...existingTables].sort((a, b) => b.table_number - a.table_number);
        
        for (let i = 0; i < tablesToRemove; i++) {
          const tableToRemove = sortedExistingTables[i];
          const { error: deleteError } = await supabase
            .from('tables')
            .delete()
            .eq('id', tableToRemove.id);
            
          if (deleteError) {
            console.error('Error removing table:', deleteError);
            throw deleteError;
          }
        }
      }
      
      // Fetch final table numbers
      const { data: updatedTables, error: refreshError } = await supabase
        .from('tables')
        .select('table_number')
        .eq('restaurant_id', restaurantId)
        .order('table_number', { ascending: true });
        
      if (refreshError) {
        console.error('Error refreshing table numbers:', refreshError);
        throw refreshError;
      }
      
      setTableNumbers(updatedTables?.map(t => t.table_number) || []);
      setTableCount(count);
      
      toast({
        title: "Success",
        description: `Updated to ${count} tables for this restaurant`
      });
    } catch (error) {
      console.error('Error updating tables:', error);
      await loadTableCount();
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update tables. Please try again."
      });
    } finally {
      setIsUpdating(false);
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
