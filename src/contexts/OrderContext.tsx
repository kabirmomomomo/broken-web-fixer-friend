
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';
import { useCart } from './CartContext';
import { getDeviceId } from '@/utils/deviceId';
import { useSearchParams } from 'react-router-dom';

interface OrderItem {
  id: string;
  item_name: string;
  quantity: number;
  price: number;
  variant_name?: string;
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  restaurant_id: string;
  table_id?: string;
  device_id: string;
  items: OrderItem[];
}

interface OrderContextType {
  orders: Order[];
  placeOrder: (restaurantId: string, tableId?: string) => Promise<void>;
  isLoading: boolean;
  tableOrders: Order[];
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tableOrders, setTableOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { cartItems, getCartTotal, clearCart } = useCart();
  const [searchParams] = useSearchParams();
  const deviceId = getDeviceId();
  const tableId = searchParams.get('table');
  const restaurantIdFromUrl = searchParams.get('restaurantId') || window.location.pathname.split('/')[2];

  useEffect(() => {
    if (restaurantIdFromUrl) {
      console.log('Restaurant ID detected:', restaurantIdFromUrl);
      fetchOrders(restaurantIdFromUrl);
    }
    
    if (tableId && restaurantIdFromUrl) {
      console.log('Table ID detected:', tableId);
      fetchTableOrders(restaurantIdFromUrl, tableId);
      subscribeToTableOrders(restaurantIdFromUrl, tableId);
    }
    
    return () => {
      supabase.removeAllChannels();
    };
  }, [tableId, restaurantIdFromUrl]);

  const fetchOrders = async (restaurantId: string) => {
    try {
      console.log('Fetching orders for restaurant:', restaurantId, 'device:', deviceId);
      
      const { data: deviceOrders, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .eq('device_id', deviceId)
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('Device orders fetched:', deviceOrders?.length || 0);
      setOrders(deviceOrders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    }
  };

  const fetchTableOrders = async (restaurantId: string, tableId: string) => {
    try {
      console.log('Fetching orders for restaurant:', restaurantId, 'table:', tableId);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .eq('restaurant_id', restaurantId)
        .eq('table_id', tableId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching table orders:', error);
        throw error;
      }
      
      console.log('Table orders fetched:', data?.length || 0);
      setTableOrders(data || []);
    } catch (error) {
      console.error('Error in fetchTableOrders:', error);
      toast.error('Failed to load table orders');
    }
  };

  const subscribeToTableOrders = (restaurantId: string, tableId: string) => {
    console.log('Setting up subscription for restaurant:', restaurantId, 'table:', tableId);
    const channel = supabase
      .channel(`table-orders-${restaurantId}-${tableId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `restaurant_id=eq.${restaurantId} AND table_id=eq.${tableId}`
        },
        async (payload) => {
          console.log('Table orders changed:', payload);
          await fetchTableOrders(restaurantId, tableId);
        }
      )
      .subscribe((status) => {
        console.log('Table orders subscription status:', status);
      });
      
    return channel;
  };

  const placeOrder = async (restaurantId: string, tableId?: string) => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Placing order with restaurant ID:', restaurantId);
      console.log('Table ID:', tableId);
      console.log('Device ID:', deviceId);
      console.log('Cart items:', cartItems);
      
      // Prepare order data
      const orderData = {
        restaurant_id: restaurantId,
        total_amount: getCartTotal(),
        status: 'placed',
        device_id: deviceId
      } as any;
      
      // Only add table_id if it exists and is not null/undefined/empty
      if (tableId) {
        orderData.table_id = tableId;
        console.log('Adding table_id to order:', tableId);
      }
      
      console.log('Order data to insert:', orderData);
      
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        console.error('Error inserting order:', orderError);
        throw orderError;
      }

      console.log('Order inserted successfully:', order);

      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        item_id: item.id,
        item_name: item.name,
        quantity: item.quantity,
        price: parseFloat(item.selectedVariant ? item.selectedVariant.price : item.price),
        variant_name: item.selectedVariant?.name,
        variant_id: item.selectedVariant?.id
      }));

      console.log('Order items to insert:', orderItems);

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error inserting order items:', itemsError);
        throw itemsError;
      }

      console.log('Order items inserted successfully');
      clearCart();
      await fetchOrders(restaurantId);
      if (tableId) {
        await fetchTableOrders(restaurantId, tableId);
      }
      toast.success('Order placed successfully!');
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order');
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue = {
    orders,
    tableOrders,
    placeOrder,
    isLoading
  };

  return (
    <OrderContext.Provider value={contextValue}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
