
import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { MenuItem, MenuItemVariant } from "@/types/menu";
import { toast } from "@/hooks/use-toast";

interface CartItem extends MenuItem {
  quantity: number;
  selectedVariant?: MenuItemVariant;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: MenuItem, variant?: MenuItemVariant) => void;
  removeFromCart: (itemId: string, variantId?: string) => void;
  updateQuantity: (itemId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Optimize using useCallback to prevent unnecessary re-renders
  const addToCart = useCallback((item: MenuItem, variant?: MenuItemVariant) => {
    setCartItems((prevItems) => {
      // Generate a unique identifier for the cart item based on item ID and variant ID
      const itemKey = variant ? `${item.id}-${variant.id}` : item.id;
      
      // Check if this exact item with this variant already exists in cart
      const existingItemIndex = prevItems.findIndex((i) => {
        const existingKey = i.selectedVariant ? `${i.id}-${i.selectedVariant.id}` : i.id;
        return existingKey === itemKey;
      });
      
      if (existingItemIndex >= 0) {
        // Item with this variant exists, update quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1,
        };
        
        const variantInfo = variant ? ` (${variant.name})` : '';
        toast({
          title: "Added to cart",
          description: `${item.name}${variantInfo} quantity updated`,
        });
        
        return updatedItems;
      } else {
        // Item with this variant doesn't exist, add new item
        const variantInfo = variant ? ` (${variant.name})` : '';
        toast({
          title: "Added to cart",
          description: `${item.name}${variantInfo} added to your cart`,
          className: "bg-purple-100 border-purple-200 text-purple-900",
        });
        
        return [...prevItems, { 
          ...item, 
          quantity: 1,
          selectedVariant: variant 
        }];
      }
    });
  }, []);

  const removeFromCart = useCallback((itemId: string, variantId?: string) => {
    setCartItems((prevItems) => 
      prevItems.filter((item) => {
        if (variantId) {
          // If variant ID is provided, only remove items with that specific variant
          return !(item.id === itemId && item.selectedVariant?.id === variantId);
        }
        // Otherwise just check the item ID
        return item.id !== itemId;
      })
    );
    
    toast({
      title: "Removed from cart",
      description: "Item removed from your cart",
      variant: "destructive",
    });
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number, variantId?: string) => {
    setCartItems((prevItems) => {
      return prevItems.map((item) => {
        const isTarget = variantId 
          ? (item.id === itemId && item.selectedVariant?.id === variantId)
          : item.id === itemId;
          
        if (isTarget) {
          return { ...item, quantity: Math.max(0, quantity) };
        }
        return item;
      }).filter((item) => item.quantity > 0);
    });
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    toast({
      title: "Cart cleared",
      description: "Your cart has been cleared",
    });
  }, []);

  // Memoize calculated values to prevent recalculation on every render
  const getCartTotal = useCallback(() => {
    return cartItems.reduce(
      (total, item) => {
        // If there's a selected variant, use its price instead of the base item price
        const price = item.selectedVariant 
          ? parseFloat(item.selectedVariant.price) 
          : parseFloat(item.price);
        
        return total + price * item.quantity;
      },
      0
    );
  }, [cartItems]);

  const getItemCount = useCallback(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  // Create a memoized context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => ({
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getItemCount,
  }), [cartItems, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal, getItemCount]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
