
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import QRCodeDialog from "./QRCodeDialog";

interface PageHeaderProps {
  qrCodeValue: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ qrCodeValue }) => {
  const location = useLocation();
  const showBackButton = location.state?.from === "menu-editor";

  return (
    <header className="flex justify-between items-center mb-8">
      {showBackButton && (
        <Link to="/menu-editor">
          <Button variant="outline" size="sm" className="gap-2 rounded-full hover:shadow-md transition-all">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      )}
      {!showBackButton && <div />} {/* Empty div to maintain flex spacing when back button is hidden */}
      <QRCodeDialog qrCodeValue={qrCodeValue} />
    </header>
  );
};

export default PageHeader;
