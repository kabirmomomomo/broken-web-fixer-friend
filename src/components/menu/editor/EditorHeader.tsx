import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import QRCode from "react-qr-code";
import { QrCode, Eye, Save, LogOut, Settings, KeyRound, List } from "lucide-react";
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
    <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row justify-between items-start md:items-center mb-4 md:mb-8">
      <div>
        <h1 className="text-xl md:text-2xl font-bold">Menu Editor</h1>
        <p className="text-xs md:text-sm text-muted-foreground">
          Create and edit your restaurant menu
        </p>
      </div>
      <div className="flex flex-wrap gap-2 w-full md:w-auto">
        <RestaurantDetailsDialog 
          restaurant={restaurant}
          onSave={handleSaveRestaurantDetails}
        >
          <Button variant="outline" size="sm" className="h-8 px-2 md:px-3">
            <Settings className="h-4 w-4" />
            <span className="hidden md:inline ml-2">Settings</span>
          </Button>
        </RestaurantDetailsDialog>
        
        <ChangePasswordDialog>
          <Button variant="outline" size="sm" className="h-8 px-2 md:px-3">
            <KeyRound className="h-4 w-4" />
            <span className="hidden md:inline ml-2">Password</span>
          </Button>
        </ChangePasswordDialog>

        <Button 
          variant="outline" 
          size="sm"
          className="h-8 px-2 md:px-3"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden md:inline ml-2">Sign Out</span>
        </Button>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 px-2 md:px-3">
              <QrCode className="h-4 w-4" />
              <span className="hidden md:inline ml-2">QR Code</span>
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
          size="sm"
          className="h-8 px-2 md:px-3"
          onClick={() => navigate(`/menu-preview/${restaurant.id}`, { state: { from: 'menu-editor' } })}
        >
          <Eye className="h-4 w-4" />
          <span className="hidden md:inline ml-2">Preview</span>
        </Button>

        <Button 
          size="sm"
          className="h-8 px-3 md:px-4"
          onClick={handleSaveMenu}
          disabled={isSaving}
        >
          <Save className="h-4 w-4" />
          <span className="hidden md:inline ml-2">{isSaving ? "Saving..." : "Save"}</span>
        </Button>

        <Button 
          variant="outline" 
          size="sm"
          className="h-8 px-2 md:px-3"
          onClick={() => navigate(`/restaurant/${restaurant.id}/orders`)}
        >
          <List className="h-4 w-4" />
          <span className="hidden md:inline ml-2">Track Orders</span>
        </Button>
      </div>
    </div>
  );
};

export default EditorHeader;
