import React, { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { ShoppingCart, X, Minus, Plus, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useOrders } from '@/contexts/OrderContext';
import { useParams } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';

interface CartProps {
  tableId?: string;
}

const Cart: React.FC<CartProps> = ({ tableId }) => {
  const [open, setOpen] = useState(false);
  const { menuId } = useParams();
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, getItemCount, clearCart } = useCart();
  const { placeOrder, isLoading } = useOrders();

  const handleCheckout = async () => {
    if (!menuId) {
      toast.error('Restaurant ID not found');
      return;
    }
    await placeOrder(menuId, tableId);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-none pulse-animation z-50"
        >
          <ShoppingCart className="h-6 w-6 float-animation" />
          {getItemCount() > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-bounce">
              {getItemCount()}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md border-l border-purple-100 bg-gradient-to-b from-white to-purple-50">
        <SheetHeader>
          <SheetTitle className="text-xl flex items-center gap-2 text-purple-900">
            <ShoppingCart className="h-5 w-5" />
            Your Cart {tableId && <span className="text-sm font-normal">(Table {tableId})</span>}
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 flex flex-col h-[calc(100vh-180px)]">
          {cartItems.length === 0 ? (
            <div className="text-center py-10 animate-fade-in">
              <div className="mb-4 text-purple-300">
                <ShoppingCart className="h-16 w-16 mx-auto" />
              </div>
              <p className="text-muted-foreground">Your cart is empty</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-auto pr-2 space-y-4">
                {cartItems.map((item, index) => (
                  <div 
                    key={`${item.id}-${item.selectedVariant?.id || 'default'}`} 
                    className="py-4 px-3 border-b border-purple-100 rounded-lg transition-all duration-300 hover:bg-purple-50 animate-fade-in"
                    style={{animationDelay: `${index * 100}ms`}}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-purple-900">{item.name}</h3>
                        {item.selectedVariant && (
                          <p className="text-xs text-purple-600 font-medium mt-1">
                            Variant: {item.selectedVariant.name}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          ${item.selectedVariant ? parseFloat(item.selectedVariant.price).toFixed(2) : parseFloat(item.price).toFixed(2)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.id, item.selectedVariant?.id)}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>
                    <div className="flex items-center mt-2">
                      <div className="flex items-center border border-purple-200 rounded-full overflow-hidden bg-white">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedVariant?.id)}
                          className="h-8 w-8 p-0 rounded-full text-purple-700 hover:text-purple-900 hover:bg-purple-100"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                          <span className="sr-only">Decrease quantity</span>
                        </Button>
                        <span className="w-8 text-center text-sm font-medium text-purple-900">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedVariant?.id)}
                          className="h-8 w-8 p-0 rounded-full text-purple-700 hover:text-purple-900 hover:bg-purple-100"
                        >
                          <Plus className="h-3 w-3" />
                          <span className="sr-only">Increase quantity</span>
                        </Button>
                      </div>
                      <div className="ml-auto font-medium text-purple-900">
                        ${((item.selectedVariant ? parseFloat(item.selectedVariant.price) : parseFloat(item.price)) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-purple-100 py-4 mt-auto bg-white bg-opacity-70 backdrop-blur-sm rounded-t-xl">
                <div className="flex justify-between py-2 text-sm">
                  <span className="text-purple-700">Subtotal</span>
                  <span className="text-purple-900 font-medium">${getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 font-bold">
                  <span className="text-purple-900">Total</span>
                  <span className="text-purple-900">${getCartTotal().toFixed(2)}</span>
                </div>
                <div className="mt-4 space-y-2">
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                    onClick={handleCheckout}
                    disabled={isLoading || cartItems.length === 0}
                  >
                    {isLoading ? 'Placing Order...' : `Checkout ${tableId ? `(Table ${tableId})` : ''}`}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center gap-2 border-purple-200 text-purple-700 hover:bg-purple-50 transition-colors"
                    onClick={() => clearCart()}
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear Cart
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Cart;
