
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';
import { useCart } from './CartContext';
import { getDeviceId } from '@/utils/deviceId';

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

interface OrderItem {
  id: string;
  item_name: string;
  quantity: number;
  price: number;
  variant_name?: string;
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
  const deviceId = getDeviceId();

  useEffect(() => {
    fetchOrders();
    
    // Get table_id from URL if it exists
    const url = window.location.pathname;
    const tableIdMatch = url.match(/\/table\/([^\/]+)/);
    const tableId = tableIdMatch ? tableIdMatch[1] : null;
    
    if (tableId) {
      subscribeToTableOrders(tableId);
    }
    
    return () => {
      supabase.removeAllChannels();
    };
  }, []);

  const subscribeToTableOrders = async (tableId: string) => {
    console.log("Subscribing to table orders:", tableId);
    
    // Initial fetch of all table orders
    const { data: initialOrders, error: initialError } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*)
      `)
      .eq('table_id', tableId)
      .order('created_at', { ascending: false });
    
    if (initialError) {
      console.error('Error fetching initial table orders:', initialError);
    } else {
      setTableOrders(initialOrders || []);
    }
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel(`table-orders-${tableId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `table_id=eq.${tableId}`
        },
        async (payload) => {
          console.log('Orders changed:', payload);
          // Refetch all orders for this table to get the latest state
          await fetchTableOrders(tableId);
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });
      
    return channel;
  };

  const fetchTableOrders = async (tableId: string) => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*)
      `)
      .eq('table_id', tableId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching table orders:', error);
      return;
    }
    
    setTableOrders(data || []);
  };

  const fetchOrders = async () => {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .eq('device_id', deviceId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    }
  };

  const placeOrder = async (restaurantId: string, tableId?: string) => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsLoading(true);
    try {
      // Get table_id from URL if not provided
      let finalTableId = tableId;
      if (!finalTableId) {
        const url = window.location.pathname;
        const tableIdMatch = url.match(/\/table\/([^\/]+)/);
        finalTableId = tableIdMatch ? tableIdMatch[1] : undefined;
      }
      
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          restaurant_id: restaurantId,
          total_amount: getCartTotal(),
          status: 'placed',
          device_id: deviceId,
          table_id: finalTableId
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        item_id: item.id,
        item_name: item.name,
        quantity: item.quantity,
        price: parseFloat(item.selectedVariant ? item.selectedVariant.price : item.price),
        variant_name: item.selectedVariant?.name,
        variant_id: item.selectedVariant?.id
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      clearCart();
      await fetchOrders();
      
      // Also fetch table orders if we have a table ID
      if (finalTableId) {
        await fetchTableOrders(finalTableId);
      }
      
      toast.success('Order placed successfully!');
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <OrderContext.Provider value={{ orders, tableOrders, placeOrder, isLoading }}>
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
