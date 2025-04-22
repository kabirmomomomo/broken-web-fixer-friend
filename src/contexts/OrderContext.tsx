
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';
import { useCart } from './CartContext';
import { getDeviceId } from '@/utils/deviceId';
import { useSearchParams } from 'react-router-dom';

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
  deleteTableOrder: (orderId: string) => Promise<void>;
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

  useEffect(() => {
    fetchOrders();
    
    if (tableId) {
      console.log('Table ID detected:', tableId);
      fetchTableOrders(tableId);
      subscribeToTableOrders(tableId);
    }
    
    return () => {
      supabase.removeAllChannels();
    };
  }, [tableId]);

  const fetchOrders = async () => {
    try {
      const { data: deviceOrders, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .eq('device_id', deviceId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(deviceOrders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    }
  };

  const fetchTableOrders = async (tableId: string) => {
    try {
      console.log('Fetching orders for table:', tableId);
      const { data, error } = await supabase
        .from('table_orders') // Using the new table_orders table
        .select(`
          *,
          items:order_items(*)
        `)
        .eq('table_id', tableId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching table orders:', error);
        throw error;
      }
      
      console.log('Table orders fetched:', data);
      setTableOrders(data || []);
    } catch (error) {
      console.error('Error in fetchTableOrders:', error);
      toast.error('Failed to load table orders');
    }
  };

  const subscribeToTableOrders = (tableId: string) => {
    console.log('Setting up subscription for table:', tableId);
    const channel = supabase
      .channel(`table-orders-${tableId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'table_orders', // Updated to use table_orders
          filter: `table_id=eq.${tableId}`
        },
        async (payload) => {
          console.log('Table orders changed:', payload);
          await fetchTableOrders(tableId);
        }
      )
      .subscribe((status) => {
        console.log('Table orders subscription status:', status);
      });
      
    return channel;
  };

  const deleteTableOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('table_orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;

      // Only update the tableOrders state, not the main orders
      setTableOrders(prev => prev.filter(order => order.id !== orderId));
      toast.success('Order deleted successfully');
    } catch (error) {
      console.error('Error deleting table order:', error);
      toast.error('Failed to delete order');
    }
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
      
      let orderData = {
        restaurant_id: restaurantId,
        total_amount: getCartTotal(),
        status: 'placed',
        device_id: deviceId,
        table_id: tableId
      };

      // Determine which table to insert into based on whether it's a table order
      const tableName = tableId ? 'table_orders' : 'orders';
      
      const { data: order, error: orderError } = await supabase
        .from(tableName)
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
      
      // Update the appropriate state based on order type
      if (tableId) {
        await fetchTableOrders(tableId);
      } else {
        await fetchOrders();
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
    <OrderContext.Provider value={{ orders, tableOrders, placeOrder, isLoading, deleteTableOrder }}>
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
