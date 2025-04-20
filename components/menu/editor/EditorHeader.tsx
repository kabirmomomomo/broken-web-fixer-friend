import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import QRCode from "react-qr-code";
import { QrCode, Eye, Save, LogOut } from "lucide-react";
import { RestaurantUI } from "@/services/menuService";
import { useNavigate } from "react-router-dom";
import RestaurantDetailsDialog from "@/components/menu/RestaurantDetailsDialog";
import ChangePasswordDialog from "./ChangePasswordDialog";

interface EditorHeaderProps {
  restaurant: RestaurantUI;
  handleSaveMenu: () => void;
  handleSaveRestaurantDetails: (details: Partial<RestaurantUI>) => void;
  signOut: () => void;
  isSaving: boolean;
}

const EditorHeader: React.FC<EditorHeaderProps> = ({
  restaurant,
  handleSaveMenu,
  handleSaveRestaurantDetails,
  signOut,
  isSaving,
}) => {
  const navigate = useNavigate();
  const qrCodeValue = `${window.location.origin}/menu-preview/${restaurant.id}`;

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 md:gap-0">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Menu Editor</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Create and edit your restaurant menu
        </p>
      </div>
      <div className="flex flex-wrap gap-2 md:gap-3 w-full md:w-auto">
        <RestaurantDetailsDialog 
          restaurant={restaurant}
          onSave={handleSaveRestaurantDetails}
        />
        <ChangePasswordDialog />
        <Button variant="outline" className="gap-2" onClick={signOut}>
          <LogOut className="h-4 w-4" />
          <span className="hidden md:inline">Sign Out</span>
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <QrCode className="h-4 w-4" />
              <span className="hidden md:inline">QR Code</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Menu QR Code</DialogTitle>
              <DialogDescription>
                Scan this code to view your restaurant menu
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center p-4">
              <div className="w-48 md:w-64">
                <QRCode 
                  value={qrCodeValue} 
                  size={256}
                  className="w-full h-auto"
                />
              </div>
              <p className="mt-4 text-sm text-muted-foreground text-center break-all">
                {qrCodeValue}
              </p>
            </div>
          </DialogContent>
        </Dialog>
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={() => navigate(`/menu-preview/${restaurant.id}`, { state: { from: 'menu-editor' } })}
        >
          <Eye className="h-4 w-4" />
          <span className="hidden md:inline">Preview</span>
        </Button>
        <Button 
          className="gap-2"
          onClick={handleSaveMenu}
          disabled={isSaving}
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
};

export default EditorHeader;
