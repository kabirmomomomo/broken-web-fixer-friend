import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { useIsMobile } from "@/hooks/use-mobile";

interface RestaurantDetailsDialogProps {
  restaurant: {
    name: string;
    description: string;
    image_url?: string;
    google_review_link?: string;
    location?: string;
    phone?: string;
    wifi_password?: string;
    opening_time?: string;
    closing_time?: string;
  };
  onSave: (details: Partial<RestaurantDetailsDialogProps['restaurant']>) => void;
  children?: React.ReactNode;
}

const RestaurantDetailsDialog: React.FC<RestaurantDetailsDialogProps> = ({
  restaurant,
  onSave,
  children,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [formData, setFormData] = React.useState(restaurant);
  const isMobile = useIsMobile();

  // Update formData when restaurant prop changes
  React.useEffect(() => {
    setFormData(restaurant);
  }, [restaurant]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Log the data being saved to help with debugging
    console.log("Saving restaurant details:", formData);
    
    onSave(formData);
    toast.success("Restaurant details saved");
    setIsOpen(false);
  };

  const FormContent = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="image_url">Restaurant Image URL</Label>
          <Input
            id="image_url"
            value={formData.image_url || ''}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            placeholder="https://example.com/image.jpg"
          />
        </div>
        <div className="col-span-2">
          <Label htmlFor="name">Restaurant Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
        </div>
        <div className="col-span-2">
          <Label htmlFor="google_review_link">Google Review Link</Label>
          <Input
            id="google_review_link"
            value={formData.google_review_link || ''}
            onChange={(e) => setFormData({ ...formData, google_review_link: e.target.value })}
            placeholder="https://g.page/..."
          />
        </div>
        <div className="col-span-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location || ''}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="123 Restaurant St, City"
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={formData.phone || ''}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+1 (555) 123-4567"
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <Label htmlFor="wifi_password">WiFi Password</Label>
          <Input
            id="wifi_password"
            value={formData.wifi_password || ''}
            onChange={(e) => setFormData({ ...formData, wifi_password: e.target.value })}
            placeholder="restaurant123"
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <Label htmlFor="opening_time">Opening Time</Label>
          <Input
            id="opening_time"
            value={formData.opening_time || ''}
            onChange={(e) => setFormData({ ...formData, opening_time: e.target.value })}
            placeholder="11:00 AM"
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <Label htmlFor="closing_time">Closing Time</Label>
          <Input
            id="closing_time"
            value={formData.closing_time || ''}
            onChange={(e) => setFormData({ ...formData, closing_time: e.target.value })}
            placeholder="10:00 PM"
          />
        </div>
      </div>
      <div className="flex justify-end gap-3 sticky bottom-0 bg-background py-4 border-t">
        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          {children}
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>Edit Restaurant Details</SheetTitle>
            <SheetDescription>
              Update your restaurant's information and contact details
            </SheetDescription>
          </SheetHeader>
          <FormContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Restaurant Details</DialogTitle>
          <DialogDescription>
            Update your restaurant's information and contact details
          </DialogDescription>
        </DialogHeader>
        <FormContent />
      </DialogContent>
    </Dialog>
  );
};

export default RestaurantDetailsDialog;
