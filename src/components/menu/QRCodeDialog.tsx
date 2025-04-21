
import React from "react";
import QRCode from "react-qr-code";
import html2canvas from "html2canvas";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode, Download } from "lucide-react";

interface QRCodeDialogProps {
  qrCodeValue: string;
}

const QRCodeDialog: React.FC<QRCodeDialogProps> = ({ qrCodeValue }) => {
  const downloadQRCode = async () => {
    const element = document.getElementById('menu-qr-code');
    if (!element) return;

    const canvas = await html2canvas(element);
    const link = document.createElement('a');
    link.download = 'menu-qr-code.png';
    link.href = canvas.toDataURL();
    link.click();
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 rounded-full hover:shadow-md transition-all">
          <QrCode className="h-4 w-4" />
          QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Menu QR Code</DialogTitle>
          <DialogDescription>
            Scan this code to view this restaurant menu
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-4">
          <div id="menu-qr-code" className="p-4 bg-white rounded-lg shadow-sm">
            <QRCode value={qrCodeValue} size={256} />
          </div>
          <p className="mt-4 text-sm text-muted-foreground break-all px-4">
            {qrCodeValue}
          </p>
          <Button 
            onClick={downloadQRCode}
            variant="secondary"
            className="mt-4 gap-2"
          >
            <Download className="h-4 w-4" />
            Download QR Code
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeDialog;
