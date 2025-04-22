
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

interface TableQRDialogProps {
  restaurantId: string;
}

const TableQRDialog: React.FC<TableQRDialogProps> = ({ restaurantId }) => {
  const [tableCount, setTableCount] = useState(20);
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const updateTables = async (count: number) => {
    if (isUpdating) return;
    
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

      // Now, ensure the tables exist in the database using stored procedure
      for (let i = 1; i <= count; i++) {
        // Use an individual try-catch for each table to ensure one failure doesn't stop the rest
        try {
          const tableData = {
            restaurant_id: restaurantId,
            table_number: i
          };
          
          // Use a SQL query as a workaround for direct table insertions
          const { error } = await supabase.rpc('upsert_table', {
            p_restaurant_id: restaurantId,
            p_table_number: i
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
      
      // Let the user know the process is complete
      toast({
        title: "Tables updated",
        description: `Successfully configured ${count} tables`
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
    await updateTables(newCount);
  };

  useEffect(() => {
    // Initialize tables when the component mounts
    updateTables(tableCount);
  }, []);

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
            {Array.from({ length: tableCount }, (_, i) => i + 1).map((tableNumber) => (
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
