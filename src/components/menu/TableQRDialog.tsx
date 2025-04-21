
import React from "react";
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

interface TableQRDialogProps {
  restaurantId: string;
}

const TableQRDialog: React.FC<TableQRDialogProps> = ({ restaurantId }) => {
  const numberOfTables = 20;

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
        <ScrollArea className="h-[60vh] w-full rounded-md">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
            {Array.from({ length: numberOfTables }, (_, i) => i + 1).map((tableNumber) => (
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
                    value={`${window.location.origin}/menu-preview/${restaurantId}?table=${tableNumber}`}
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
