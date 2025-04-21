
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
  // Store form state locally only for the duration the dialog/sheet is open
  const [formData, setFormData] = React.useState(restaurant);
  const isMobile = useIsMobile();

  // Only update formData when dialog/sheet first opens or on restaurant change
  React.useEffect(() => {
    if (isOpen) {
      setFormData(restaurant);
    }
  }, [restaurant, isOpen]);

  // Select all value in an input/textarea on focus, like add item dialog
  const selectAllOnFocus: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement> =
    (e) => {
      e.target.select();
    };

  const handleChange = (
    field: keyof typeof formData,
    value: string
  ) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
            onChange={(e) => handleChange("image_url", e.target.value)}
            placeholder="https://example.com/image.jpg"
            onFocus={selectAllOnFocus}
            autoComplete="off"
            spellCheck={false}
            inputMode="url"
          />
        </div>
        <div className="col-span-2">
          <Label htmlFor="name">Restaurant Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
            onFocus={selectAllOnFocus}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <div className="col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            required
            onFocus={selectAllOnFocus}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <div className="col-span-2">
          <Label htmlFor="google_review_link">Google Review Link</Label>
          <Input
            id="google_review_link"
            value={formData.google_review_link || ''}
            onChange={(e) => handleChange("google_review_link", e.target.value)}
            placeholder="https://g.page/..."
            onFocus={selectAllOnFocus}
            autoComplete="off"
            spellCheck={false}
            inputMode="url"
          />
        </div>
        <div className="col-span-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location || ''}
            onChange={(e) => handleChange("location", e.target.value)}
            placeholder="123 Restaurant St, City"
            onFocus={selectAllOnFocus}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={formData.phone || ''}
            onChange={(e) => handleChange("phone", e.target.value)}
            placeholder="+1 (555) 123-4567"
            onFocus={selectAllOnFocus}
            inputMode="tel"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <Label htmlFor="wifi_password">WiFi Password</Label>
          <Input
            id="wifi_password"
            value={formData.wifi_password || ''}
            onChange={(e) => handleChange("wifi_password", e.target.value)}
            placeholder="restaurant123"
            onFocus={selectAllOnFocus}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <Label htmlFor="opening_time">Opening Time</Label>
          <Input
            id="opening_time"
            value={formData.opening_time || ''}
            onChange={(e) => handleChange("opening_time", e.target.value)}
            placeholder="11:00 AM"
            onFocus={selectAllOnFocus}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <Label htmlFor="closing_time">Closing Time</Label>
          <Input
            id="closing_time"
            value={formData.closing_time || ''}
            onChange={(e) => handleChange("closing_time", e.target.value)}
            placeholder="10:00 PM"
            onFocus={selectAllOnFocus}
            autoComplete="off"
            spellCheck={false}
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
        <SheetContent 
          side="bottom" 
          className="h-[90vh] overflow-y-auto pb-12"
          // Prevent sheet from stealing focus from inputs
          onPointerDownOutside={(e) => {
            // Prevent closing when clicking inside form elements
            const target = e.target as HTMLElement;
            if (target.closest('form')) {
              e.preventDefault();
            }
          }}
          onFocusOutside={(e) => {
            // Prevent focus trap from stealing focus from inputs
            if (e.target.closest('form')) {
              e.preventDefault();
            }
          }}
        >
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
