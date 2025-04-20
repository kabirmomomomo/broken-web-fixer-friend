
import React, { useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImagePlus, ChevronDown } from "lucide-react";
import { RestaurantUI } from "@/services/menuService";
import { uploadRestaurantImage } from "@/utils/restaurantImageUpload";
import { uploadPaymentQR } from "@/utils/paymentQrUpload";
import { toast } from "@/components/ui/sonner";


interface RestaurantFormProps {
  restaurant: RestaurantUI;
  setRestaurant: React.Dispatch<React.SetStateAction<RestaurantUI>>;
}

const RestaurantForm: React.FC<RestaurantFormProps> = ({ restaurant, setRestaurant })  => {
  const [isExpanded, setIsExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadRestaurantImage(file);
    if (url) {
      setRestaurant({ ...restaurant, image_url: url });
      toast.success("Restaurant image updated successfully");
    }
  };

  const handleQRUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadPaymentQR(file);
    if (url) {
      setRestaurant({ ...restaurant, payment_qr_code: url });
      toast.success("Payment QR code updated successfully");
    }
  };

  return (
    <div className="space-y-4">
      <div 
        className="flex items-center justify-between p-2 bg-blue-100 rounded-lg cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        tabIndex={0}
      >
        <h2 className="text-xl font-semibold">Restaurant Details</h2>
        <ChevronDown className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </div>

      {isExpanded && (
        <div className="space-y-4 animate-in fade-in-50">
          <div className="grid gap-4 md:grid-cols-2 md:gap-8">
            {/* Restaurant Image Section */}
            <div className="space-y-2">
              <Label>Restaurant Image</Label>
              <div className="flex items-center gap-4">
                {restaurant.image_url ? (
                  <div className="relative group w-full aspect-square">
                    <img 
                      src={restaurant.image_url} 
                      alt={restaurant.name} 
                      className="w-full h-full object-cover rounded-lg border" 
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full aspect-square flex flex-col items-center justify-center gap-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImagePlus className="w-8 h-8" />
                    <span className="text-sm">Upload Image</span>
                  </Button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
            </div>

            {/* QR Code Section */}
            <div className="space-y-2">
              <Label>Payment QR Code</Label>
              <div className="flex items-center gap-4">
                {restaurant.payment_qr_code ? (
                  <div className="relative group w-full aspect-square">
                    <img 
                      src={restaurant.payment_qr_code} 
                      alt="Payment QR" 
                      className="w-full h-full object-cover rounded-lg border" 
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => qrInputRef.current?.click()}
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full aspect-square flex flex-col items-center justify-center gap-2"
                    onClick={() => qrInputRef.current?.click()}
                  >
                    <ImagePlus className="w-8 h-8" />
                    <span className="text-sm">Upload QR</span>
                  </Button>
                )}
                <input
                  ref={qrInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleQRUpload}
                />
              </div>
            </div>
          </div>

          {/* UPI ID Section */}
          <div className="space-y-2">
            <Label>UPI ID</Label>
            <Input
              value={restaurant.upi_id || ''}
              onChange={(e) => setRestaurant({ ...restaurant, upi_id: e.target.value })}
              placeholder="Enter your UPI id."
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantForm;
