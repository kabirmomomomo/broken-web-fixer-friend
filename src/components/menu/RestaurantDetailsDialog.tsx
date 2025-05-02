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
import { RestaurantUI } from "@/services/menuService";

interface RestaurantDetailsDialogProps {
  restaurant: RestaurantUI;
  onSave: (details: Partial<RestaurantUI>) => void;
  children: React.ReactNode;
}

const getDraftKey = (restaurant: RestaurantUI) => 
  `restaurant_details_draft_₹{restaurant.id ?? restaurant.name}`;

const FormContent: React.FC<{
  formData: RestaurantUI;
  setFormData: React.Dispatch<React.SetStateAction<RestaurantUI>>;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}> = ({ formData, setFormData, onSubmit, onCancel }) => {
  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.select();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="image_url">Restaurant Image URL</Label>
          <Input
            id="image_url"
            value={formData.image_url || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
            placeholder="https://example.com/image.jpg"
            onFocus={handleFocus}
          />
        </div>
        <div className="col-span-2">
          <Label htmlFor="name">Restaurant Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
            onFocus={handleFocus}
          />
        </div>
        <div className="col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            required
            onFocus={handleFocus}
          />
        </div>
        <div className="col-span-2">
          <Label htmlFor="google_review_link">Google Review Link</Label>
          <Input
            id="google_review_link"
            value={formData.google_review_link || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, google_review_link: e.target.value }))}
            placeholder="https://g.page/..."
            onFocus={handleFocus}
          />
        </div>
        <div className="col-span-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            placeholder="123 Restaurant St, City"
            onFocus={handleFocus}
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={formData.phone || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="+1 (555) 123-4567"
            onFocus={handleFocus}
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <Label htmlFor="wifi_password">WiFi Password</Label>
          <Input
            id="wifi_password"
            value={formData.wifi_password || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, wifi_password: e.target.value }))}
            placeholder="restaurant123"
            onFocus={handleFocus}
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <Label htmlFor="opening_time">Opening Time</Label>
          <Input
            id="opening_time"
            value={formData.opening_time || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, opening_time: e.target.value }))}
            placeholder="11:00 AM"
            onFocus={handleFocus}
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <Label htmlFor="closing_time">Closing Time</Label>
          <Input
            id="closing_time"
            value={formData.closing_time || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, closing_time: e.target.value }))}
            placeholder="10:00 PM"
            onFocus={handleFocus}
          />
        </div>
      </div>
      <div className="flex justify-end gap-3 sticky bottom-0 bg-background py-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  );
};

const RestaurantDetailsDialog: React.FC<RestaurantDetailsDialogProps> = ({
  restaurant,
  onSave,
  children,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [formData, setFormData] = React.useState(restaurant);
  const isMobile = useIsMobile();

  // Load unsaved changes from localStorage when component mounts
  React.useEffect(() => {
    const draftKey = getDraftKey(restaurant);
    const savedChanges = localStorage.getItem(draftKey);
    if (savedChanges) {
      try {
        const parsedChanges = JSON.parse(savedChanges);
        setFormData(parsedChanges);
      } catch (error) {
        console.error('Error loading unsaved changes:', error);
        localStorage.removeItem(draftKey);
      }
    }
  }, [restaurant]);

  // Save changes to localStorage whenever formData changes
  React.useEffect(() => {
    if (isOpen) {
      const draftKey = getDraftKey(restaurant);
      localStorage.setItem(draftKey, JSON.stringify(formData));
    }
  }, [formData, isOpen, restaurant]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    toast.success("Restaurant details saved");
    setIsOpen(false);
    // Clear unsaved changes from localStorage after saving
    const draftKey = getDraftKey(restaurant);
    localStorage.removeItem(draftKey);
  };

  const handleCancel = () => {
    setIsOpen(false);
    // Clear unsaved changes from localStorage when canceling
    const draftKey = getDraftKey(restaurant);
    localStorage.removeItem(draftKey);
    // Reset form data to original restaurant data
    setFormData(restaurant);
  };

  // Update formData when restaurant prop changes
  React.useEffect(() => {
    if (!isOpen) {
      setFormData(restaurant);
    }
  }, [restaurant, isOpen]);

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>{children}</SheetTrigger>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>Edit Restaurant Details</SheetTitle>
            <SheetDescription>
              Update your restaurant's information and contact details
            </SheetDescription>
          </SheetHeader>
          <FormContent
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Restaurant Details</DialogTitle>
          <DialogDescription>
            Update your restaurant's information and contact details
          </DialogDescription>
        </DialogHeader>
        <FormContent
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
};

export default RestaurantDetailsDialog;
