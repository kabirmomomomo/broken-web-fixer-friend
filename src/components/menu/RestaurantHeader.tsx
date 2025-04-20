
import React from "react";
import { Clock, MapPin, Phone, Wifi, Link2, Star } from "lucide-react";

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
    <div className="text-center mb-8 bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-md p-4 sm:p-8 border border-blue-100 transform transition-all duration-500 hover:shadow-lg">
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 mb-6">
        {image_url && (
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden flex-shrink-0">
            <img 
              src={image_url} 
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl sm:text-4xl font-bold mb-3 text-balance bg-gradient-to-r from-blue-900 to-indigo-800 bg-clip-text text-transparent">
            {name}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mb-3">{description}</p>
          {google_review_link && (
            <a 
              href={google_review_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-yellow-600 hover:text-yellow-700"
            >
              <Star className="h-4 w-4 mr-1" />
              View Reviews
            </a>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-sm text-gray-500">
        {(opening_time || closing_time) && (
          <div className="flex items-center gap-2 bg-white p-2 px-3 rounded-full shadow-sm">
            <Clock className="h-4 w-4 text-blue-500 flex-shrink-0" />
            <span className="truncate">{opening_time || "11:00 AM"} - {closing_time || "10:00 PM"}</span>
          </div>
        )}
        {location && (
          <div className="flex items-center gap-2 bg-white p-2 px-3 rounded-full shadow-sm">
            <MapPin className="h-4 w-4 text-red-500 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </div>
        )}
        {phone && (
          <div className="flex items-center gap-2 bg-white p-2 px-3 rounded-full shadow-sm">
            <Phone className="h-4 w-4 text-green-500 flex-shrink-0" />
            <span className="truncate">{phone}</span>
          </div>
        )}
        {wifi_password && (
          <div className="flex items-center gap-2 bg-white p-2 px-3 rounded-full shadow-sm">
            <Wifi className="h-4 w-4 text-blue-500 flex-shrink-0" />
            <span className="truncate">WiFi: {wifi_password}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantHeader;
