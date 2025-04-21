
import React from "react";
import QRCode from "react-qr-code";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";

interface QRCodeDialogProps {
  qrCodeValue: string;
}

const QRCodeDialog: React.FC<QRCodeDialogProps> = ({ qrCodeValue }) => {
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
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <QRCode value={qrCodeValue} size={256} />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {qrCodeValue}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeDialog;
