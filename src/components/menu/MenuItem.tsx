
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { MenuItem as MenuItemType, MenuItemVariant } from "@/types/menu";
import { useCart } from "@/contexts/CartContext";
import { PlusCircle, MinusCircle, CircleSlash, LeafyGreen, Beef } from "lucide-react";
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

  const hasOptions = !!(item.variants?.length > 0 || item.addons?.length > 0);

  const renderDietaryIcon = () => {
    console.log(`Rendering dietary icon for item ${item.id}: ${JSON.stringify(item.dietary_type)}`);
    if (item.dietary_type === 'veg') {
      return <LeafyGreen size={isMobile ? 14 : 16} className="text-green-600 flex-shrink-0" />;
    } else if (item.dietary_type === 'non-veg') {
      return <Beef size={isMobile ? 14 : 16} className="text-red-600 flex-shrink-0" />;
    }
    return null;
  };

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
      <div className={cn("flex flex-col items-center gap-2 w-full", isMobile ? "" : "flex-row items-start")}>
        {item.image_url && (
          <div
            className={cn(
              "overflow-hidden rounded-md border border-purple-100 bg-gray-100 mx-auto",
              isMobile ? "w-14 h-14 mb-1" : "w-20 h-20 mr-3 mb-0"
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

        <div className={cn(
          "flex-1 min-w-0 flex flex-col w-full",
          isMobile ? "items-center text-center" : "items-start text-left"
        )}>
          <div className={cn(
            "flex items-center justify-between w-full gap-2",
            isMobile ? "flex-col items-center gap-0 mb-1" : ""
          )}>
            <div className="flex items-center gap-1">
              {renderDietaryIcon()}
              <h3 className={cn(
                "font-semibold text-purple-900 truncate leading-tight",
                isMobile ? "text-xs w-full mb-0 px-1" : "text-lg"
              )}>
                {item.name}
              </h3>
            </div>
            <div className={cn(
              "flex flex-col items-end gap-0 flex-shrink-0",
              isMobile ? "items-center" : ""
            )}>
              {item.old_price && parseFloat(item.old_price) > 0 && (
                <span className="text-[10px] font-medium line-through text-gray-400">
                  ${parseFloat(item.old_price).toFixed(2)}
                </span>
              )}
              {(!item.variants || item.variants.length === 0) && (
                <span className={cn(
                  "font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-2 py-0.5 rounded-full shadow-sm tabular-nums",
                  isMobile ? "text-xs min-w-[48px] text-center px-2" : "text-base px-2"
                )}>
                  ${parseFloat(effectivePrice).toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {item.description && (
            <p className={cn(
              "text-gray-500 mt-1 mb-1 truncate break-words",
              isMobile
                ? "text-[10px] leading-tight font-normal line-clamp-2 px-1"
                : "text-xs font-normal leading-relaxed line-clamp-2"
            )}>
              {item.description}
            </p>
          )}

          {!item.is_available && (
            <div className="mb-1 flex items-center gap-1 text-red-500 justify-center">
              <CircleSlash size={12} />
              <span className="text-[10px] font-medium">Out of stock</span>
            </div>
          )}

          {hasOptions && (
            <div className={cn("space-y-2 mb-1 w-full", isMobile ? "px-1" : "")}>
              {item.variants && item.variants.length > 0 && (
                <div className={cn(
                  "border rounded-md bg-purple-50/40 border-purple-100 w-full mx-auto",
                  isMobile ? "p-0.5" : "p-1.5"
                )}>
                  <span className={cn(
                      "text-xs font-medium text-purple-900 mb-1 block",
                      isMobile ? "mb-0 px-1" : ""
                    )}>
                    Options:
                  </span>
                  <RadioGroup
                    value={selectedVariant?.id}
                    onValueChange={handleVariantChange}
                    className={cn("space-y-1", isMobile ? "gap-0" : "")}
                  >
                    {item.variants.map(variant => (
                      <div key={variant.id} className={cn(
                        "flex items-center justify-between hover:bg-purple-100/60 rounded-md transition-colors cursor-pointer",
                        isMobile ? "px-1 py-0.5" : "px-1 py-0.5"
                      )}
                      onClick={() => handleVariantChange(variant.id)}>
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
                <div className={cn(
                  "border-l-2 border-purple-200 w-full",
                  isMobile ? "pl-1" : "pl-2"
                )}>
                  {item.addons.map(addon => (
                    <div key={addon.id} className="mb-1">
                      <span className="text-xs font-medium text-gray-700 mb-0.5 block">{addon.title}:</span>
                      <div className={cn(
                        "grid gap-2",
                        isMobile ? "grid-cols-1" : "grid-cols-2"
                      )}>
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

          <div className={cn(
            "flex w-full justify-end items-center mt-1",
            isMobile ? "justify-center gap-2" : ""
          )}>
            {item.is_available ? (
              itemQuantity > 0 ? (
                <div className={cn(
                  "flex items-center gap-1 bg-purple-50 rounded-full shadow-sm",
                  isMobile ? "p-[2px]" : "p-0.5"
                )}>
                  <Button
                    onClick={decrementQuantity}
                    size="sm"
                    className={cn(
                      "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-full flex items-center justify-center shadow-sm transition-transform hover:scale-105",
                      isMobile ? "h-6 w-6 p-0 min-w-0" : "h-7 w-7 p-0"
                    )}
                  >
                    <MinusCircle size={isMobile ? 13 : 15} />
                    <span className="sr-only">Decrease quantity</span>
                  </Button>
                  <span className={cn(
                    "font-medium text-center text-purple-900",
                    isMobile ? "text-xs w-5" : "text-base w-8"
                  )}>
                    {itemQuantity}
                  </span>
                  <Button
                    onClick={incrementQuantity}
                    size="sm"
                    className={cn(
                      "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-full flex items-center justify-center shadow-sm transition-transform hover:scale-105",
                      isMobile ? "h-6 w-6 p-0 min-w-0" : "h-7 w-7 p-0"
                    )}
                  >
                    <PlusCircle size={isMobile ? 13 : 15} />
                    <span className="sr-only">Increase quantity</span>
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={incrementQuantity}
                  size="sm"
                  className={cn(
                    "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-full flex items-center gap-1 shadow-sm hover:scale-105 transition-transform",
                    isMobile ? "text-xs px-2 h-6 py-1 min-w-0" : "text-sm px-4 py-1"
                  )}
                >
                  <PlusCircle size={isMobile ? 13 : 15} />
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
                <CircleSlash size={isMobile ? 13 : 15} className="mr-1" />
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
