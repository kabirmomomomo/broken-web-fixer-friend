import React from "react";
import { Clock, MapPin, Phone, Wifi, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RestaurantHeaderProps {
  name: string;
  description: string;
  image_url?: string;
  google_review_link?: string;
  location?: string;
  phone?: string;
  wifi_password?: string;
  opening_time?: string;
  closing_time?: string;
}

const RestaurantHeader: React.FC<RestaurantHeaderProps> = ({ 
  name, 
  description, 
  image_url,
  google_review_link,
  location,
  phone,
  wifi_password,
  opening_time,
  closing_time
}) => {
  return (
    <div className="text-center mb-6 bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-md p-4 sm:p-6 border border-blue-100 transform transition-all duration-500 hover:shadow-lg">
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-4">
        {image_url && (
          <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-lg overflow-hidden flex-shrink-0">
            <img 
              src={image_url} 
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-blue-900 to-indigo-800 bg-clip-text text-transparent">
            {name}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mb-2">{description}</p>
          {google_review_link && (
            <Button
              variant="outline"
              size="sm"
              className="mt-2 text-xs sm:text-sm"
              onClick={() => window.open(google_review_link, '_blank')}
            >
              <Star className="h-3 w-3 mr-1" />
              Leave a Review
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-gray-500">
        {(opening_time || closing_time) && (
          <div className="flex items-center justify-center gap-1 bg-white p-1.5 rounded-full shadow-sm">
            <Clock className="h-3 w-3 text-blue-500 flex-shrink-0" />
            <span className="truncate">{opening_time || "11:00 AM"} - {closing_time || "10:00 PM"}</span>
          </div>
        )}
        {location && (
          <div className="flex items-center justify-center gap-1 bg-white p-1.5 rounded-full shadow-sm">
            <MapPin className="h-3 w-3 text-red-500 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </div>
        )}
        {phone && (
          <div className="flex items-center justify-center gap-1 bg-white p-1.5 rounded-full shadow-sm">
            <Phone className="h-3 w-3 text-green-500 flex-shrink-0" />
            <span className="truncate">{phone}</span>
          </div>
        )}
        {wifi_password && (
          <div className="flex items-center justify-center gap-1 bg-white p-1.5 rounded-full shadow-sm">
            <Wifi className="h-3 w-3 text-blue-500 flex-shrink-0" />
            <span className="truncate">WiFi: {wifi_password}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantHeader;
