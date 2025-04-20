
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { MenuItem as MenuItemType, MenuItemVariant } from "@/types/menu";
import { useCart } from "@/contexts/CartContext";
import { PlusCircle, MinusCircle, ChevronDown, ChevronUp, CircleSlash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface MenuItemProps {
  item: MenuItemType;
  index: number;
}

const MenuItem: React.FC<MenuItemProps> = ({ item, index }) => {
  if (item.is_visible === false) {
    return null;
  }

  const { addToCart, updateQuantity, cartItems } = useCart();
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<MenuItemVariant | undefined>(
    item.variants && item.variants.length > 0 ? item.variants[0] : undefined
  );
  
  const effectivePrice = selectedVariant ? selectedVariant.price : item.price;
  
  const cartItem = cartItems.find(cartItem => {
    if (selectedVariant) {
      return cartItem.id === item.id && cartItem.selectedVariant?.id === selectedVariant.id;
    }
    return cartItem.id === item.id && !cartItem.selectedVariant;
  });
  
  const itemQuantity = cartItem ? cartItem.quantity : 0;

  const incrementQuantity = () => {
    if (!item.is_available) return;
    
    if (itemQuantity === 0) {
      addToCart(item, selectedVariant);
    } else {
      const variantId = selectedVariant?.id;
      updateQuantity(cartItem!.id, itemQuantity + 1, variantId);
    }
  };

  const decrementQuantity = () => {
    if (!item.is_available) return;
    
    if (itemQuantity > 0) {
      const variantId = selectedVariant?.id;
      updateQuantity(cartItem!.id, itemQuantity - 1, variantId);
    }
  };

  const handleVariantChange = (variantId: string) => {
    const variant = item.variants?.find(v => v.id === variantId);
    setSelectedVariant(variant);
  };

  const hasDetails = (
    item.variants?.length > 0 || 
    (item.old_price && parseFloat(item.old_price) > 0) ||
    item.weight ||
    item.addons?.length > 0
  );

  return (
    <div 
      key={item.id} 
      className={cn(
        "border-b pb-6 last:border-b-0 transition-all duration-300 rounded-lg p-4",
        "transform hover:scale-[1.02] hover:shadow-md hover:bg-gradient-to-r hover:from-white hover:to-purple-50",
        "animate-fade-in",
        index % 2 === 0 ? "bg-gradient-to-r from-purple-50/40 to-white" : "bg-white",
        !item.is_available && "opacity-60"
      )}
    >
      <div className="flex items-start gap-4">
        {item.image_url && (
          <div className="w-24 h-24 rounded-md overflow-hidden flex-shrink-0 hidden sm:block">
            <img 
              src={item.image_url} 
              alt={item.name} 
              className={cn(
                "w-full h-full object-cover",
                !item.is_available && "filter grayscale"
              )}
            />
          </div>
        )}
        
        <div className="flex-1">
          <div className="flex justify-between items-baseline mb-2">
            <div>
              <h3 className="text-xl font-semibold text-purple-900">{item.name}</h3>
              {item.weight && (
                <p className="text-sm text-gray-500">{item.weight}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {item.old_price && parseFloat(item.old_price) > 0 && (
                <span className="text-sm font-medium line-through text-gray-400">
                  ${parseFloat(item.old_price).toFixed(2)}
                </span>
              )}
              <p className="text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-3 py-1 rounded-full shadow-sm">
                ${parseFloat(effectivePrice).toFixed(2)}
              </p>
            </div>
          </div>
          
          <p className="text-gray-600 leading-relaxed mb-3">{item.description}</p>
          
          {!item.is_available && (
            <div className="mb-3 flex items-center gap-2 text-red-500">
              <CircleSlash size={16} />
              <span className="text-sm font-medium">Out of stock</span>
            </div>
          )}
          
          {hasDetails && (
            <Collapsible open={isOptionsOpen} onOpenChange={setIsOptionsOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-purple-600 p-0 h-auto flex items-center hover:bg-transparent hover:text-purple-700 mb-2"
                >
                  {isOptionsOpen ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" /> Hide options
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" /> View options
                    </>
                  )}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="space-y-4">
                {item.variants && item.variants.length > 0 && (
                  <div className="border rounded-lg p-3 bg-purple-50/30 border-purple-100">
                    <h4 className="text-sm font-medium text-purple-900 mb-2">Available options:</h4>
                    <RadioGroup 
                      value={selectedVariant?.id} 
                      onValueChange={handleVariantChange}
                      className="space-y-2"
                    >
                      {item.variants.map(variant => (
                        <div key={variant.id} className="flex items-center justify-between hover:bg-purple-100/50 rounded-md p-1 transition-colors">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem 
                              value={variant.id} 
                              id={`variant-${variant.id}`} 
                              className="text-purple-600 border-purple-300 focus:ring-purple-500"
                            />
                            <Label htmlFor={`variant-${variant.id}`} className="text-sm text-purple-800">
                              {variant.name}
                            </Label>
                          </div>
                          <span className="text-sm font-medium text-purple-900">${parseFloat(variant.price).toFixed(2)}</span>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}
                
                {item.addons && item.addons.length > 0 && (
                  <div className="pl-2 border-l-2 border-purple-200">
                    {item.addons.map(addon => (
                      <div key={addon.id} className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">{addon.title}:</p>
                        <div className="grid grid-cols-2 gap-2">
                          {addon.options.map(option => (
                            <div key={option.id} className="flex justify-between text-sm">
                              <span>{option.name}</span>
                              <span className="font-medium">
                                {parseFloat(option.price) > 0 ? `+$${parseFloat(option.price).toFixed(2)}` : 'Free'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          )}
          
          <div className="flex justify-end items-center mt-4">
            {item.is_available ? (
              itemQuantity > 0 ? (
                <div className="flex items-center gap-2 bg-purple-50 p-1 rounded-full shadow-sm">
                  <Button 
                    onClick={decrementQuantity}
                    size="sm"
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-full h-8 w-8 p-0 flex items-center justify-center shadow-sm transform transition-transform hover:scale-105"
                  >
                    <MinusCircle size={16} />
                    <span className="sr-only">Decrease quantity</span>
                  </Button>
                  
                  <span className="font-medium text-lg w-8 text-center text-purple-900">{itemQuantity}</span>
                  
                  <Button 
                    onClick={incrementQuantity}
                    size="sm"
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-full h-8 w-8 p-0 flex items-center justify-center shadow-sm transform transition-transform hover:scale-105"
                  >
                    <PlusCircle size={16} />
                    <span className="sr-only">Increase quantity</span>
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={incrementQuantity}
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-full px-4 py-1 text-sm flex items-center gap-1 transform transition-all duration-200 hover:scale-105 shadow-sm"
                >
                  <PlusCircle size={16} />
                  Add to cart
                </Button>
              )
            ) : (
              <Button 
                disabled
                size="sm"
                variant="ghost"
                className="text-red-500 cursor-not-allowed"
              >
                <CircleSlash size={16} className="mr-1" />
                Out of stock
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuItem;
