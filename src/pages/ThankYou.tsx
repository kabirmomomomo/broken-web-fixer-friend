
import React, { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useCart } from '@/contexts/CartContext';
import { useOrders } from '@/contexts/OrderContext';
import { supabase } from '@/lib/supabase';
import { getDeviceId } from '@/utils/deviceId';
import { toast } from '@/components/ui/sonner';

const ThankYou = () => {
  const { clearCart } = useCart();
  const { orders } = useOrders();

  useEffect(() => {
    const cleanupEverything = async () => {
      try {
        // Clear cart
        clearCart();
        
        // Get the current device ID before removing it
        const currentDeviceId = getDeviceId();
        
        // Delete all orders from the database for this device
        if (currentDeviceId) {
          const { error } = await supabase
            .from('orders')
            .delete()
            .eq('device_id', currentDeviceId);
          
          if (error) {
            console.error('Error deleting orders:', error);
          }
        }
        
        // Remove the device ID from localStorage to ensure a fresh start
        localStorage.removeItem('deviceId');
        
        toast.success('Your order has been confirmed!');
      } catch (error) {
        console.error('Error cleaning up:', error);
        toast.error('There was an issue processing your order');
      }
    };

    cleanupEverything();
  }, [clearCart]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl text-purple-900">Thank You!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Come back soon. Till then TAKE CARE!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThankYou;
