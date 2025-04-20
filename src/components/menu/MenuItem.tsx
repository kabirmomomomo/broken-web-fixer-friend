
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { MenuItem as MenuItemType, MenuItemVariant } from "@/types/menu";
import { useCart } from "@/contexts/CartContext";
import { PlusCircle, MinusCircle, CircleSlash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";

interface MenuItemProps {
  item: MenuItemType;
  index: number;
}

const MenuItem: React.FC<MenuItemProps> = ({ item, index }) => {
  if (item.is_visible === false) {
    return null;
  }

  const isMobile = useIsMobile();
  const { addToCart, updateQuantity, cartItems } = useCart();
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

  // The item can show options if it has variants/addons
  const hasOptions = !!(item.variants?.length > 0 || item.addons?.length > 0);

  return (
    <div
      key={item.id}
      className={cn(
        "border-b pb-4 last:border-b-0 transition-all duration-300 rounded-lg bg-white",
        isMobile ? "p-2" : "p-4",
        "hover:scale-[1.02] hover:shadow-md hover:bg-gradient-to-r hover:from-white hover:to-purple-50",
        "animate-fade-in",
        index % 2 === 0 ? "bg-gradient-to-r from-purple-50/40 to-white" : "bg-white",
        !item.is_available && "opacity-60"
      )}
    >
      <div className={cn("flex gap-2", isMobile ? "items-center" : "items-start")}>
        {item.image_url && (
          <div
            className={cn(
              "overflow-hidden flex-shrink-0 rounded-md border border-purple-100 bg-gray-100",
              isMobile ? "w-16 h-16" : "w-24 h-24"
            )}
          >
            <img
              src={item.image_url}
              alt={item.name}
              className={cn(
                "w-full h-full object-cover object-center",
                !item.is_available && "filter grayscale"
              )}
            />
          </div>
        )}

        <div className="flex-1 min-w-0 flex flex-col">
          <div className={cn(
            "flex justify-between items-center gap-2 mb-[2px]",
            isMobile ? "flex-row" : "flex-row"
          )}>
            <div className="min-w-0 flex flex-col">
              <h3 className={cn(
                "font-semibold text-purple-900 truncate leading-tight",
                isMobile ? "text-sm" : "text-xl"
              )}>
                {item.name}
              </h3>
              {item.weight && (
                <span className={cn(
                  "text-[11px] text-gray-500 mt-0.5",
                  isMobile ? "" : ""
                )}>{item.weight}</span>
              )}
            </div>
            <div className="flex flex-col items-end gap-0 flex-shrink-0">
              {item.old_price && parseFloat(item.old_price) > 0 && (
                <span className="text-[11px] font-medium line-through text-gray-400">
                  ${parseFloat(item.old_price).toFixed(2)}
                </span>
              )}
              <span className={cn(
                "font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-2 py-0.5 rounded-full shadow-sm tabular-nums",
                isMobile ? "text-xs min-w-[54px] text-center py-0.5 px-2" : "text-base px-2"
              )}>
                ${parseFloat(effectivePrice).toFixed(2)}
              </span>
            </div>
          </div>

          <p className={cn(
            "text-gray-600 mb-1 truncate break-words",
            isMobile
              ? "text-[12px] font-normal leading-snug line-clamp-2"
              : "text-sm font-normal leading-relaxed line-clamp-2"
          )}>
            {item.description}
          </p>

          {!item.is_available && (
            <div className="mb-1 flex items-center gap-1 text-red-500">
              <CircleSlash size={13} />
              <span className="text-[11px] font-medium">Out of stock</span>
            </div>
          )}

          {/* SHOW OPTIONS DIRECTLY if present */}
          {hasOptions && (
            <div className="space-y-2 mb-1">
              {item.variants && item.variants.length > 0 && (
                <div className="border rounded-md p-1.5 bg-purple-50/40 border-purple-100">
                  <span className="text-xs font-medium text-purple-900 mb-1 block">Options:</span>
                  <RadioGroup
                    value={selectedVariant?.id}
                    onValueChange={handleVariantChange}
                    className="space-y-1"
                  >
                    {item.variants.map(variant => (
                      <div key={variant.id} className="flex items-center justify-between hover:bg-purple-100/60 rounded-md px-1 py-0.5 transition-colors">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={variant.id}
                            id={`variant-${variant.id}`}
                            className="text-purple-600 border-purple-300 focus:ring-purple-500 h-3 w-3"
                          />
                          <Label htmlFor={`variant-${variant.id}`} className="text-xs text-purple-800">
                            {variant.name}
                          </Label>
                        </div>
                        <span className="text-xs font-medium text-purple-900">${parseFloat(variant.price).toFixed(2)}</span>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {item.addons && item.addons.length > 0 && (
                <div className="pl-2 border-l-2 border-purple-200">
                  {item.addons.map(addon => (
                    <div key={addon.id} className="mb-1">
                      <span className="text-xs font-medium text-gray-700 mb-0.5 block">{addon.title}:</span>
                      <div className="grid grid-cols-2 gap-2">
                        {addon.options.map(option => (
                          <div key={option.id} className="flex justify-between text-xs">
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
            </div>
          )}

          {/* Buttons row */}
          <div className="flex w-full justify-end items-center mt-1">
            {item.is_available ? (
              itemQuantity > 0 ? (
                <div className="flex items-center gap-1 bg-purple-50 p-0.5 rounded-full shadow-sm">
                  <Button
                    onClick={decrementQuantity}
                    size="sm"
                    className={cn(
                      "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-full flex items-center justify-center shadow-sm transition-transform hover:scale-105",
                      isMobile ? "h-6 w-6 p-0 min-w-0" : "h-8 w-8 p-0"
                    )}
                  >
                    <MinusCircle size={isMobile ? 14 : 16} />
                    <span className="sr-only">Decrease quantity</span>
                  </Button>
                  <span className={cn(
                    "font-medium text-center text-purple-900",
                    isMobile ? "text-sm w-7" : "text-lg w-8"
                  )}>
                    {itemQuantity}
                  </span>
                  <Button
                    onClick={incrementQuantity}
                    size="sm"
                    className={cn(
                      "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-full flex items-center justify-center shadow-sm transition-transform hover:scale-105",
                      isMobile ? "h-6 w-6 p-0 min-w-0" : "h-8 w-8 p-0"
                    )}
                  >
                    <PlusCircle size={isMobile ? 14 : 16} />
                    <span className="sr-only">Increase quantity</span>
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={incrementQuantity}
                  size="sm"
                  className={cn(
                    "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-full flex items-center gap-1 shadow-sm hover:scale-105 transition-transform",
                    isMobile ? "text-xs px-2 h-7 py-1 min-w-0" : "text-sm px-4 py-1"
                  )}
                >
                  <PlusCircle size={isMobile ? 14 : 16} />
                  <span className={isMobile ? "hidden sm:inline" : ""}>Add to cart</span>
                </Button>
              )
            ) : (
              <Button
                disabled
                size="sm"
                variant="ghost"
                className={cn(
                  "text-red-500 cursor-not-allowed",
                  isMobile ? "text-xs" : "text-sm"
                )}
              >
                <CircleSlash size={isMobile ? 14 : 16} className="mr-1" />
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
