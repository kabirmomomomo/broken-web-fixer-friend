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

  const checkDatabaseAccess = async () => {
    try {
      // Try a simple select query to check if we can access the database
      const { data, error } = await supabase
        .from('restaurants')
        .select('id')
        .limit(1);

      if (error) {
        console.error('Database access check failed:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Database access check error:', error);
      return false;
    }
  };

  const ensureTableCountColumn = async () => {
    try {
      console.log('Ensuring table_count column exists...');
      
      // Add table_count column if it doesn't exist
      const { error } = await supabase.rpc('execute_sql', {
        sql: `
          DO $$ 
          BEGIN 
            IF NOT EXISTS (
              SELECT 1 
              FROM information_schema.columns 
              WHERE table_name = 'restaurants' 
              AND column_name = 'table_count'
            ) THEN 
              ALTER TABLE restaurants 
              ADD COLUMN table_count INTEGER DEFAULT 1;
            END IF;
          END $$;
        `
      });

      if (error) {
        console.error('Error adding table_count column:', error);
        throw error;
      }
      
      // Ensure the restaurant has a table_count value
      const { error: updateError } = await supabase
        .from('restaurants')
        .update({ table_count: 1 })
        .eq('id', restaurantId)
        .is('table_count', null);
        
      if (updateError) {
        console.error('Error initializing table_count:', updateError);
        throw updateError;
      }
    } catch (error) {
      console.error('Failed to ensure table_count column:', error);
      throw error;
    }
  };

  const loadTableCount = async () => {
    if (!restaurantId) {
      console.error('No restaurant ID provided');
      toast({
        variant: "destructive",
        title: "Error",
        description: "Restaurant ID is missing."
      });
      return;
    }

    try {
      setIsUpdating(true);
      console.log('Starting table configuration load...', { restaurantId });

      // First, try to get the restaurant data
      const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', restaurantId)
        .single();

      if (restaurantError) {
        console.error('Error fetching restaurant:', restaurantError);
        // If the restaurant doesn't exist, create it with default values
        const { error: insertError } = await supabase
          .from('restaurants')
          .upsert({
            id: restaurantId,
            table_count: 1,
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('Error creating restaurant record:', insertError);
          throw insertError;
        }
        
        setTableCount(1);
        setTableNumbers([1]);
        
        // Create initial table
        await createInitialTables(1);
        return;
      }

      const tableCount = restaurant?.table_count || 1;
      console.log('Retrieved table count:', tableCount);

      // Get or create tables
      const { data: tables, error: tablesError } = await supabase
        .from('tables')
        .select('table_number')
        .eq('restaurant_id', restaurantId)
        .order('table_number', { ascending: true });

      if (tablesError) {
        console.error('Error fetching tables:', tablesError);
        // Create tables if they don't exist
        await createInitialTables(tableCount);
      } else if (!tables || tables.length === 0) {
        // Create initial tables if none exist
        await createInitialTables(tableCount);
      } else {
        // Use existing table numbers
        setTableNumbers(tables.map(t => t.table_number));
        setTableCount(tableCount);
      }

      console.log('Table configuration loaded successfully');

    } catch (error: any) {
      console.error('Failed to load table configuration:', error);
      setTableCount(1);
      setTableNumbers([1]);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load table configuration. Please try again."
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const createInitialTables = async (count: number) => {
    try {
      console.log('Creating initial tables:', count);
      
      // First, delete any existing tables for this restaurant to avoid conflicts
      const { error: deleteError } = await supabase
        .from('tables')
        .delete()
        .eq('restaurant_id', restaurantId);

      if (deleteError) {
        console.error('Error deleting existing tables:', deleteError);
        throw deleteError;
      }

      // Create tables in smaller batches to avoid potential conflicts
      const batchSize = 10;
      for (let i = 0; i < count; i += batchSize) {
        const batchCount = Math.min(batchSize, count - i);
        const tables = Array.from({ length: batchCount }, (_, index) => ({
          restaurant_id: restaurantId,
          table_number: i + index + 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        const { error } = await supabase
          .from('tables')
          .insert(tables);

        if (error) {
          console.error(`Error creating tables batch ${i}-${i + batchCount}:`, error);
          throw error;
        }
      }

      setTableNumbers(Array.from({ length: count }, (_, i) => i + 1));
      console.log('Initial tables created successfully');
    } catch (error) {
      console.error('Error in createInitialTables:', error);
      throw error;
    }
  };

  const updateTables = async (count: number) => {
    if (isUpdating || count === null || count < 1) return;

    try {
      setIsUpdating(true);
      console.log('Updating tables to count:', count);

      // First update restaurant table count
      const { error: updateError } = await supabase
        .from('restaurants')
        .update({
          table_count: count,
          updated_at: new Date().toISOString()
        })
        .eq('id', restaurantId);

      if (updateError) {
        console.error('Error updating restaurant:', updateError);
        throw updateError;
      }

      // Get current tables
      const { data: existingTables, error: fetchError } = await supabase
        .from('tables')
        .select('id, table_number')
        .eq('restaurant_id', restaurantId)
        .order('table_number', { ascending: true });

      if (fetchError) {
        console.error('Error fetching tables:', fetchError);
        // If tables don't exist, create them
        await createInitialTables(count);
      } else {
        const currentCount = existingTables?.length || 0;

        if (count > currentCount) {
          // Add new tables one by one to avoid conflicts
          for (let i = currentCount + 1; i <= count; i++) {
            const { error: insertError } = await supabase
              .from('tables')
              .insert({
                restaurant_id: restaurantId,
                table_number: i,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });

            if (insertError) {
              console.error(`Error adding table ${i}:`, insertError);
              throw insertError;
            }
          }
        } else if (count < currentCount) {
          // Remove excess tables starting from highest number
          const tablesToRemove = existingTables!
            .sort((a, b) => b.table_number - a.table_number)
            .slice(0, currentCount - count)
            .map(t => t.id);

          const { error: deleteError } = await supabase
            .from('tables')
            .delete()
            .in('id', tablesToRemove);

          if (deleteError) {
            console.error('Error removing tables:', deleteError);
            throw deleteError;
          }
        }
      }

      // Fetch final state to ensure UI is in sync
      const { data: finalTables, error: finalFetchError } = await supabase
        .from('tables')
        .select('table_number')
        .eq('restaurant_id', restaurantId)
        .order('table_number', { ascending: true });

      if (finalFetchError) {
        console.error('Error fetching final table state:', finalFetchError);
      } else {
        setTableNumbers(finalTables?.map(t => t.table_number) || []);
      }

      // Update local state
      setTableCount(count);

      toast({
        title: "Success",
        description: `Updated to ${count} tables successfully`
      });

    } catch (error: any) {
      console.error('Error updating tables:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update tables. Please try again."
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
