
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
  const [hasPermissionError, setHasPermissionError] = useState(false);
  const [tableNumbers, setTableNumbers] = useState<number[]>([]);

  // Instead of trying to create tables on component mount, just fetch existing table numbers
  useEffect(() => {
    fetchTableNumbers();
  }, []);

  const fetchTableNumbers = async () => {
    try {
      const { data, error } = await supabase
        .from('tables')
        .select('table_number')
        .eq('restaurant_id', restaurantId);
      
      if (error) {
        // Check if it's a permission error
        if (error.code === '42501' || error.message.includes('permission denied')) {
          console.error('Permission error when fetching tables:', error);
          setHasPermissionError(true);
          return;
        }
        
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          // Table doesn't exist yet, but that's ok for generating QR codes
          console.log('Tables table does not exist yet');
          // Default to generating QR codes for tableCount tables
          setTableNumbers(Array.from({ length: tableCount }, (_, i) => i + 1));
          return;
        }
        
        console.error('Error fetching tables:', error);
        return;
      }
      
      if (data && data.length > 0) {
        const numbers = data.map(t => t.table_number);
        console.log('Table IDs:', numbers);
        setTableNumbers(numbers);
        // Update the table count to match the highest table number
        const maxTableNumber = Math.max(...numbers);
        setTableCount(maxTableNumber);
      } else {
        // No tables found, generate for default count
        setTableNumbers(Array.from({ length: tableCount }, (_, i) => i + 1));
      }
    } catch (error) {
      console.error('Exception during table fetch:', error);
      // Continue with default table numbers for QR generation
      setTableNumbers(Array.from({ length: tableCount }, (_, i) => i + 1));
    }
  };

  const updateTables = async (count: number) => {
    if (isUpdating || hasPermissionError) return;
    
    setIsUpdating(true);
    try {
      // First, check if the tables table exists by fetching a single row
      try {
        // Use RPC to check if table exists
        const { error: checkError } = await supabase.rpc(
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

        if (checkError) {
          console.error('Error checking tables table:', checkError);
          
          // Check if it's a permission error
          if (checkError.code === '42501' || checkError.message.includes('permission denied')) {
            setHasPermissionError(true);
            toast({
              variant: "destructive",
              title: "Insufficient permissions",
              description: "You don't have permission to update tables. QR codes will still be generated."
            });
            
            // Still generate QR codes for the specified number of tables
            setTableNumbers(Array.from({ length: count }, (_, i) => i + 1));
            setIsUpdating(false);
            return;
          }
          
          toast({
            variant: "destructive",
            title: "Error updating tables",
            description: "Failed to check if tables table exists."
          });
          setIsUpdating(false);
          return;
        }
      } catch (error) {
        console.error('Error checking tables table:', error);
        
        // Check if it's a permission error
        if (error instanceof Error && 
            (error.message.includes('42501') || error.message.includes('permission denied'))) {
          setHasPermissionError(true);
          toast({
            variant: "destructive",
            title: "Insufficient permissions",
            description: "You don't have permission to update tables. QR codes will still be generated."
          });
          
          // Still generate QR codes for the specified number of tables
          setTableNumbers(Array.from({ length: count }, (_, i) => i + 1));
          setIsUpdating(false);
          return;
        }
        
        // Try to set up the database
        const setupSuccess = await handleRelationDoesNotExistError(error);
        if (!setupSuccess) {
          console.error('Failed to set up tables table:', error);
          toast({
            variant: "destructive",
            title: "Error updating tables",
            description: "Failed to update table information. Database setup required."
          });
          setIsUpdating(false);
          return;
        }
      }

      // Only try to update the database if we don't have a permission error
      if (!hasPermissionError) {
        // Now, ensure the tables exist in the database using SQL queries directly
        for (let i = 1; i <= count; i++) {
          // Use an individual try-catch for each table to ensure one failure doesn't stop the rest
          try {
            // Instead of using rpc, use a direct SQL insert with ON CONFLICT DO UPDATE
            const { error } = await supabase
              .from('tables')
              .upsert({
                restaurant_id: restaurantId,
                table_number: i
              });

            if (error) {
              console.error('Error upserting table:', error);
              // Continue with other tables instead of stopping completely
            }
          } catch (tableError) {
            console.error('Exception during table upsert:', tableError);
            // Continue with other tables
          }
        }
      }
      
      // Update the UI with new table numbers regardless of database success
      setTableNumbers(Array.from({ length: count }, (_, i) => i + 1));
      
      // Let the user know the process is complete
      toast({
        title: "QR codes generated",
        description: `Ready to download QR codes for ${count} tables`
      });
    } catch (error) {
      console.error('Error updating tables:', error);
      toast({
        variant: "destructive",
        title: "Error updating tables",
        description: "Failed to update table information"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTableCountChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    // Generate new QR codes for the updated count
    setTableNumbers(Array.from({ length: newCount }, (_, i) => i + 1));
    
    // Only try to update the database if we don't have a permission error
    if (!hasPermissionError) {
      await updateTables(newCount);
    }
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
    <Dialog>
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

        {hasPermissionError && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
            <p className="font-medium">Limited functionality mode</p>
            <p className="mt-1">
              Due to database permission restrictions, table information cannot be saved.
              You can still generate and download QR codes for your tables.
            </p>
          </div>
        )}

        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 space-y-2">
            <Label htmlFor="tableCount">Number of Tables</Label>
            <Input
              id="tableCount"
              type="number"
              min="1"
              value={tableCount}
              onChange={handleTableCountChange}
              className="max-w-[200px]"
              disabled={isUpdating}
            />
          </div>
          {isUpdating && (
            <div className="text-sm text-muted-foreground">
              Updating tables...
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
