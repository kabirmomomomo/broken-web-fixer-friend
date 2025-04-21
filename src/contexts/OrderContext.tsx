
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';
import { useCart } from './CartContext';
import { getDeviceId } from '@/utils/deviceId';
import { useSearchParams } from 'react-router-dom';
import { setupDatabase, handleRelationDoesNotExistError, createRPCFunctions } from '@/lib/setupDatabase';

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
  const [searchParams] = useSearchParams();
  const deviceId = getDeviceId();
  const tableId = searchParams.get('table');

  useEffect(() => {
    console.log("OrderProvider initialized with deviceId:", deviceId);
    // Set up the database on initialization
    setupDatabase().then(success => {
      if (success) {
        console.log("Database setup completed successfully");
      }
      
      // Also ensure the RPC functions exist
      createRPCFunctions().then(() => {
        console.log("RPC functions verified");
      });
      
      // Fetch orders
      fetchOrders();
      
      // If there's a table ID, fetch table orders and set up subscription
      if (tableId) {
        console.log(`Fetching orders for tableId: ${tableId}`);
        fetchTableOrders(tableId);
        subscribeToTableOrders(tableId);
      }
    });
    
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

      if (error) {
        // If we get a relation does not exist error, try to set up the database
        const isSetupAttempted = await handleRelationDoesNotExistError(error);
        if (isSetupAttempted) {
          // Retry the fetch after setup
          setTimeout(() => fetchOrders(), 1000);
          return;
        }
        throw error;
      }
      
      setOrders(deviceOrders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    }
  };

  const fetchTableOrders = async (tableId: string) => {
    try {
      console.log(`Executing fetchTableOrders with tableId: ${tableId}`);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .eq('table_id', tableId)
        .order('created_at', { ascending: false });
        
      if (error) {
        // If we get a relation does not exist error, try to set up the database
        const isSetupAttempted = await handleRelationDoesNotExistError(error);
        if (isSetupAttempted) {
          // Retry the fetch after setup
          setTimeout(() => fetchTableOrders(tableId), 1000);
          return;
        }
        console.error('Error fetching table orders:', error);
        throw error;
      }
      
      console.log(`Table orders fetched for table ${tableId}:`, data);
      setTableOrders(data || []);
    } catch (error) {
      console.error('Error fetching table orders:', error);
      toast.error('Failed to load table orders');
    }
  };

  const subscribeToTableOrders = (tableId: string) => {
    console.log(`Setting up realtime subscription for table ${tableId}`);
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
          console.log('Table orders changed:', payload);
          await fetchTableOrders(tableId);
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
      // Debug logs to track input data
      console.log('Order placement started:');
      console.log('- Restaurant ID:', restaurantId);
      console.log('- Table ID:', tableId);
      console.log('- Device ID:', deviceId);
      console.log('- Cart items:', cartItems);
      
      // Validate restaurant ID
      if (!restaurantId || restaurantId === 'undefined' || restaurantId === 'null') {
        console.error('Invalid restaurant ID:', restaurantId);
        toast.error('Cannot place order: Invalid restaurant information');
        setIsLoading(false);
        return;
      }

      const cartTotal = getCartTotal();
      console.log('- Cart total:', cartTotal);
      
      // Validate cart total
      if (isNaN(cartTotal) || cartTotal <= 0) {
        console.error('Invalid cart total:', cartTotal);
        toast.error('Cannot place order: Invalid cart total');
        setIsLoading(false);
        return;
      }
      
      // Ensure database setup is complete with necessary columns
      const isSetupOk = await setupDatabase();
      if (!isSetupOk) {
        console.error('Database setup failed, retrying...');
        await setupDatabase(); // One more attempt
      }
      
      // Also ensure RPC functions exist
      await createRPCFunctions();
      
      console.log('Database setup verified, proceeding with order placement');
      
      // Create order data object
      const orderData: any = {
        restaurant_id: restaurantId,
        total_amount: cartTotal,
        status: 'placed',
        device_id: deviceId,
      };
      
      // Only add table_id if it exists and is not null/undefined/empty string
      if (tableId && tableId.trim() !== '' && tableId !== 'undefined' && tableId !== 'null') {
        // Convert to string if it's not already
        orderData.table_id = String(tableId);
        console.log(`Adding table_id: ${orderData.table_id} to order`);
      }
      
      console.log('Final order data to insert:', orderData);
      
      // Insert order into database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        console.error('Error inserting order:', orderError);
        
        if (orderError.message?.includes('table_id')) {
          console.log('Detected table_id column issue. Attempting fix...');
          // Try to add column directly as a last resort
          const { error: sqlError } = await supabase.rpc(
            'execute_sql',
            {
              sql_query: 'ALTER TABLE orders ADD COLUMN IF NOT EXISTS table_id TEXT;'
            }
          );
          
          if (sqlError) {
            console.error('Failed to add table_id column:', sqlError);
          }
          
          toast.error('Database schema updated. Please try again.');
          setIsLoading(false);
          return;
        }
        
        throw new Error(`Database error: ${orderError.message}`);
      }

      if (!order || !order.id) {
        console.error('No order ID returned from database');
        throw new Error('Failed to create order: No order ID returned');
      }

      console.log('Order inserted successfully:', order);
      
      // Prepare order items with proper price handling
      const orderItems = cartItems.map(item => {
        // Ensure price is properly formatted as a number
        let price: number;
        
        if (item.selectedVariant) {
          price = typeof item.selectedVariant.price === 'string' 
            ? parseFloat(item.selectedVariant.price) 
            : Number(item.selectedVariant.price);
        } else {
          price = typeof item.price === 'string' 
            ? parseFloat(item.price) 
            : Number(item.price);
        }
        
        // Verify price is valid
        if (isNaN(price)) {
          console.error('Invalid price detected for item:', item);
          price = 0; // Fallback to prevent database errors
        }
        
        return {
          order_id: order.id,
          item_id: item.id || 'unknown',
          item_name: item.name,
          quantity: item.quantity,
          price: price,
          variant_name: item.selectedVariant?.name || null,
          variant_id: item.selectedVariant?.id || null
        };
      });

      console.log('Order items to insert:', orderItems);

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error inserting order items:', itemsError);
        throw new Error(`Database error: ${itemsError.message}`);
      }

      console.log('Order items inserted successfully');
      clearCart();
      await fetchOrders();
      if (tableId) {
        await fetchTableOrders(tableId);
      }
      toast.success('Order placed successfully!');
    } catch (error: any) {
      console.error('Error placing order:', error);
      toast.error(`Failed to place order: ${error.message || 'Please try again'}`);
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
