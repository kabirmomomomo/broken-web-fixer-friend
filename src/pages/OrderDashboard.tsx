  import React, { useState, useEffect } from 'react';
  import { useParams, useNavigate } from 'react-router-dom';
  import { supabase } from '@/lib/supabase';
  import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
  import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
  import { Badge } from '@/components/ui/badge';
  import { format } from 'date-fns';
  import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
  import { Smartphone, User, Table as TableIcon, Trash2, RefreshCcw, ChevronLeft, List, Clock, Utensils, CheckCircle, Package } from 'lucide-react';
  import { Button } from '@/components/ui/button';
  import { Separator } from '@/components/ui/separator';
  import { toast } from '@/components/ui/sonner';
  import OrderBill from '@/components/menu/OrderBill';
  import WaiterCallsList from '@/components/menu/WaiterCallsList';

  interface OrderItem {
    id: string;
    item_name: string;
    quantity: number;
    price: number;
    variant_name?: string;
  }

  interface Order {
    id: string;
    restaurant_id: string;
    table_id?: string;
    device_id: string;
    created_at: string;
    status: string;
    total_amount: number;
    items: OrderItem[];
  }

  const OrderDashboard = () => {
    const { restaurantId } = useParams<{ restaurantId: string }>();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('all');
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
      if (!restaurantId) return;
      
      fetchOrders();
      setupRealtimeSubscription();
      
      return () => {
        supabase.removeAllChannels();
      };
    }, [restaurantId]);

    const fetchOrders = async () => {
      if (!restaurantId) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            items:order_items(*)
          `)
          .eq('restaurant_id', restaurantId)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        console.log('Orders fetched:', data);
        setOrders(data || []);
      } catch (err: any) {
        console.error('Error fetching orders:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    const setupRealtimeSubscription = () => {
      if (!restaurantId) return;
      
      const channel = supabase
        .channel(`restaurant-orders-${restaurantId}`)
        .on(
          'postgres_changes',
          {
            event: '*', 
            schema: 'public',
            table: 'orders',
            filter: `restaurant_id=eq.${restaurantId}`
          },
          (payload) => {
            console.log('Order change received:', payload);
            fetchOrders();
          }
        )
        .subscribe((status) => {
          console.log('Subscription status:', status);
        });
        
      return channel;
    };
    
    const updateOrderStatus = async (orderId: string, newStatus: string) => {
      try {
        const { error } = await supabase
          .from('orders')
          .update({ status: newStatus })
          .eq('id', orderId);
          
        if (error) throw error;
        
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
        
        toast.success(`Order status updated to ${newStatus}`);
      } catch (err: any) {
        console.error('Error updating order status:', err);
        toast.error('Failed to update order status');
      }
    };
    
    const deleteOrderItem = async (orderId: string, itemId: string) => {
      try {
        // First, get the order to calculate the new total
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .select('*, items:order_items(*)')
          .eq('id', orderId)
          .single();

        if (orderError) throw orderError;

        // Find the item to be deleted
        const itemToDelete = order.items.find((item: OrderItem) => item.id === itemId);
        if (!itemToDelete) {
          throw new Error('Item not found');
        }

        // Calculate new total amount
        const newTotalAmount = order.total_amount - (itemToDelete.price * itemToDelete.quantity);

        // Delete the item
        const { error: deleteError } = await supabase
          .from('order_items')
          .delete()
          .eq('id', itemId);

        if (deleteError) throw deleteError;

        // Update the order's total amount
        const { error: updateError } = await supabase
          .from('orders')
          .update({ total_amount: newTotalAmount })
          .eq('id', orderId);

        if (updateError) throw updateError;

        // Refresh orders
        await fetchOrders();
        toast.success('Item deleted successfully');
      } catch (err: any) {
        console.error('Error deleting order item:', err);
        toast.error('Failed to delete item');
      }
    };
    
    const deleteTableOrders = async (tableId: string) => {
      if (!restaurantId) {
        toast.error('Restaurant ID is missing');
        return;
      }
      
      try {
        console.log(`Deleting orders for restaurant ${restaurantId}, table ${tableId}`);
        
        const { data: ordersToDelete, error: fetchError } = await supabase
          .from('orders')
          .select('id')
          .eq('restaurant_id', restaurantId)
          .eq('table_id', tableId);
          
        if (fetchError) {
          console.error('Error fetching orders to delete:', fetchError);
          throw fetchError;
        }
        
        if (!ordersToDelete || ordersToDelete.length === 0) {
          toast.info(`No orders found for table ${tableId}`);
          return;
        }
        
        console.log(`Found ${ordersToDelete.length} orders to delete`);
        
        const { error: deleteError } = await supabase
          .from('orders')
          .delete()
          .eq('restaurant_id', restaurantId)
          .eq('table_id', tableId);
          
        if (deleteError) {
          console.error('Error deleting table orders:', deleteError);
          throw deleteError;
        }
        
        toast.success(`All orders from Table ${tableId} have been deleted`);
        fetchOrders();
      } catch (err: any) {
        console.error('Error in deleteTableOrders:', err);
        toast.error(`Failed to delete orders: ${err.message || 'Unknown error'}`);
      }
    };
    
    const handleRefresh = async () => {
      setIsRefreshing(true);
      await fetchOrders();
      setIsRefreshing(false);
      toast.success('Orders refreshed');
    };

    const filteredOrders = orders.filter(order => {
      switch (activeTab) {
        case 'all':
          return true;
        case 'table':
          return !!order.table_id;
        case 'placed':
          return order.status === 'placed';
        case 'preparing':
          return order.status === 'preparing';
        case 'ready':
          return order.status === 'ready';
        case 'completed':
          return order.status === 'completed';
        default:
          return true;
      }
    });
    
    const ordersByTable = filteredOrders.reduce((acc, order) => {
      if (order.table_id) {
        if (!acc[order.table_id]) {
          acc[order.table_id] = [];
        }
        acc[order.table_id].push(order);
      } else {
        if (!acc['no-table']) {
          acc['no-table'] = [];
        }
        acc['no-table'].push(order);
      }
      return acc;
    }, {} as Record<string, Order[]>);
    
    console.log('Filtered orders:', filteredOrders);
    console.log('Orders by table:', ordersByTable);
    console.log('Table IDs:', Object.keys(ordersByTable));
    
    if (loading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-800 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading orders...</p>
          </div>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="flex items-center justify-center h-screen">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-red-600">Error Loading Orders</CardTitle>
              <CardDescription>
                There was a problem connecting to the database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{error}</p>
            </CardContent>
            <CardFooter>
              <Button onClick={fetchOrders}>Try Again</Button>
            </CardFooter>
          </Card>
        </div>
      );
    }
    
    return (
      <div className="container mx-auto py-2 md:py-4 px-1 md:px-2 max-w-[100vw] overflow-x-hidden">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/menu-editor')}
              className="h-8 w-8 bg-purple-50 hover:bg-purple-100"
            >
              <ChevronLeft className="h-4 w-4 text-purple-600" />
            </Button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-purple-900">Order Dashboard</h1>
              <p className="text-xs md:text-sm text-gray-500">Monitor and manage orders in real-time</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2 md:mt-0">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`h-8 w-8 bg-purple-50 hover:bg-purple-100 ${isRefreshing ? 'animate-spin' : ''}`}
            >
              <RefreshCcw className="h-4 w-4 text-purple-600" />
            </Button>
            <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-200 text-xs">
              {orders.length} Orders
            </Badge>
            <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200 text-xs">
              ${orders.reduce((sum, order) => sum + Number(order.total_amount), 0).toFixed(2)} Total
            </Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 md:gap-4">
          <div className="lg:col-span-2">
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="w-full overflow-x-auto">
                <TabsList className="w-full min-w-max mb-2 bg-purple-50">
                  <TabsTrigger value="all" className="text-xs md:text-sm whitespace-nowrap data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900">
                    <List className="h-3 w-3 mr-1" /> All Orders
                  </TabsTrigger>
                  <TabsTrigger value="table" className="text-xs md:text-sm whitespace-nowrap data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900">
                    <TableIcon className="h-3 w-3 mr-1" /> Table Orders
                  </TabsTrigger>
                  <TabsTrigger value="placed" className="text-xs md:text-sm whitespace-nowrap data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900">
                    <Clock className="h-3 w-3 mr-1" /> Placed
                  </TabsTrigger>
                  <TabsTrigger value="preparing" className="text-xs md:text-sm whitespace-nowrap data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900">
                    <Utensils className="h-3 w-3 mr-1" /> Preparing
                  </TabsTrigger>
                  <TabsTrigger value="ready" className="text-xs md:text-sm whitespace-nowrap data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900">
                    <CheckCircle className="h-3 w-3 mr-1" /> Ready
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="text-xs md:text-sm whitespace-nowrap data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900">
                    <Package className="h-3 w-3 mr-1" /> Completed
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="all">
                <Card className="border-purple-100">
                  <CardHeader className="p-3">
                    <CardTitle className="text-base md:text-lg">All Orders</CardTitle>
                    <CardDescription className="text-xs">
                      Showing all {filteredOrders.length} orders
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-2">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-purple-50">
                            <TableHead className="text-xs">Order ID</TableHead>
                            <TableHead className="text-xs">Time</TableHead>
                            <TableHead className="text-xs">Table</TableHead>
                            <TableHead className="text-xs">Items</TableHead>
                            <TableHead className="text-xs">Total</TableHead>
                            <TableHead className="text-xs">Status</TableHead>
                            <TableHead className="text-xs">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredOrders.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-4 text-gray-500 text-xs">
                                No orders found
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredOrders.map(order => (
                              <TableRow key={order.id} className="hover:bg-purple-50/50">
                                <TableCell className="text-xs">{order.id.slice(0, 8)}</TableCell>
                                <TableCell className="text-xs">{format(new Date(order.created_at), 'MMM d, h:mm a')}</TableCell>
                                <TableCell className="text-xs">
                                  {order.table_id ? (
                                    <div className="flex items-center">
                                      <TableIcon className="h-3 w-3 mr-1 text-purple-600" />
                                      Table {order.table_id}
                                    </div>
                                  ) : (
                                    <div className="flex items-center">
                                      <Smartphone className="h-3 w-3 mr-1 text-gray-400" />
                                      Individual
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell className="text-xs">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</TableCell>
                                <TableCell className="text-xs">${Number(order.total_amount).toFixed(2)}</TableCell>
                                <TableCell>
                                  <Badge 
                                    className={`text-xs ${
                                      order.status === 'placed' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                      order.status === 'preparing' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                      order.status === 'ready' ? 'bg-green-100 text-green-800 border-green-200' :
                                      'bg-gray-100 text-gray-800 border-gray-200'
                                    }`}
                                  >
                                    {order.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-1">
                                    {order.status === 'placed' && (
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                                        className="h-6 text-xs bg-amber-50 hover:bg-amber-100 border-amber-200"
                                      >
                                        <Utensils className="h-3 w-3 mr-1" /> Prepare
                                      </Button>
                                    )}
                                    {order.status === 'preparing' && (
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        onClick={() => updateOrderStatus(order.id, 'ready')}
                                        className="h-6 text-xs bg-green-50 hover:bg-green-100 border-green-200"
                                      >
                                        <CheckCircle className="h-3 w-3 mr-1" /> Ready
                                      </Button>
                                    )}
                                    {order.status === 'ready' && (
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        onClick={() => updateOrderStatus(order.id, 'completed')}
                                        className="h-6 text-xs bg-gray-50 hover:bg-gray-100 border-gray-200"
                                      >
                                        <Package className="h-3 w-3 mr-1" /> Complete
                                      </Button>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="table">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.keys(ordersByTable).length > 0 && Object.entries(ordersByTable).map(([tableId, tableOrders]) => {
                    if (tableId === 'no-table') return null;
                    
                    const tableTotal = tableOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);
                    const totalItems = tableOrders.reduce(
                      (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 
                      0
                    );
                    
                    return (
                      <Card key={tableId} className="overflow-hidden">
                        <CardHeader className="bg-purple-50">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-lg flex items-center">
                              <TableIcon className="h-5 w-5 mr-2 text-purple-800" />
                              Table {tableId}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-purple-100 text-purple-800">
                                {tableOrders.length} Orders
                              </Badge>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="h-7 px-2 text-destructive hover:text-destructive"
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to delete all orders from Table ${tableId}?`)) {
                                    deleteTableOrders(tableId);
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <CardDescription>
                            {totalItems} items · ${tableTotal.toFixed(2)} total
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="space-y-4 max-h-80 overflow-y-auto">
                            {tableOrders.map(order => (
                              <div key={order.id} className="border border-gray-100 rounded-lg p-3">
                                <div className="flex justify-between items-center mb-2">
                                  <div className="flex items-center space-x-1">
                                    <Smartphone className="h-4 w-4 text-gray-400" />
                                    <span className="text-xs text-gray-500">{order.device_id.substring(0, 6)}...</span>
                                  </div>
                                  <Badge 
                                    className={
                                      order.status === 'placed' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                      order.status === 'preparing' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                      order.status === 'ready' ? 'bg-green-100 text-green-800 border-green-200' :
                                      'bg-gray-100 text-gray-800 border-gray-200'
                                    }
                                  >
                                    {order.status}
                                  </Badge>
                                </div>
                                {order.items.map(item => (
                                  <div key={item.id} className="flex justify-between text-sm py-1">
                                    <span>
                                      {item.quantity}× {item.item_name}
                                      {item.variant_name && (
                                        <span className="text-gray-500 text-xs"> ({item.variant_name})</span>
                                      )}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-destructive hover:text-destructive"
                                        onClick={() => {
                                          if (window.confirm(`Are you sure you want to delete ${item.quantity}× ${item.item_name}?`)) {
                                            deleteOrderItem(order.id, item.id);
                                          }
                                        }}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                                <Separator className="my-2" />
                                <div className="flex justify-between items-center mt-1">
                                  <span className="text-sm">${Number(order.total_amount).toFixed(2)}</span>
                                  <div className="flex space-x-1">
                                    {order.status === 'placed' && (
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                                        className="text-xs h-7"
                                      >
                                        Prepare
                                      </Button>
                                    )}
                                    {order.status === 'preparing' && (
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        onClick={() => updateOrderStatus(order.id, 'ready')}
                                        className="text-xs h-7"
                                      >
                                        Ready
                                      </Button>
                                    )}
                                    {order.status === 'ready' && (
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        onClick={() => updateOrderStatus(order.id, 'completed')}
                                        className="text-xs h-7"
                                      >
                                        Complete
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  
                  {!Object.keys(ordersByTable).filter(id => id !== 'no-table').length && (
                    <Card className="col-span-full">
                      <CardContent className="pt-6 pb-6 text-center">
                        <TableIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500">No table orders found</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
              
              {['placed', 'preparing', 'ready', 'completed'].map(status => (
                <TabsContent key={status} value={status}>
                  <Card className="border-purple-100">
                    <CardHeader className="p-3">
                      <CardTitle className="capitalize text-base md:text-lg">{status} Orders</CardTitle>
                      <CardDescription className="text-xs">
                        Showing {filteredOrders.length} orders with status "{status}"
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {filteredOrders.length === 0 ? (
                          <div className="col-span-full text-center py-8 text-gray-500 text-xs">
                            No {status} orders found
                          </div>
                        ) : (
                          filteredOrders.map(order => (
                            <Card key={order.id} className="overflow-hidden border-purple-100">
                              <CardHeader className="p-3 bg-purple-50">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="text-xs text-gray-500">
                                      {format(new Date(order.created_at), 'MMM d, h:mm a')}
                                    </div>
                                    <div className="font-medium flex items-center text-sm">
                                      {order.table_id ? (
                                        <div className="flex items-center">
                                          <TableIcon className="h-3 w-3 mr-1 text-purple-600" />
                                          Table {order.table_id}
                                        </div>
                                      ) : (
                                        <div className="flex items-center">
                                          <Smartphone className="h-3 w-3 mr-1" />
                                          Individual
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <Badge 
                                    className={`text-xs ${
                                      order.status === 'placed' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                      order.status === 'preparing' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                      order.status === 'ready' ? 'bg-green-100 text-green-800 border-green-200' :
                                      'bg-gray-100 text-gray-800 border-gray-200'
                                    }`}
                                  >
                                    {order.status}
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="p-3">
                                <div className="space-y-1">
                                  {order.items.map(item => (
                                    <div key={item.id} className="flex justify-between text-xs">
                                      <span>
                                        {item.quantity}× {item.item_name}
                                        {item.variant_name && (
                                          <span className="text-gray-500"> ({item.variant_name})</span>
                                        )}
                                      </span>
                                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                  ))}
                                </div>
                                <Separator className="my-2" />
                                <div className="flex justify-between items-center">
                                  <span className="font-medium text-xs">
                                    ${Number(order.total_amount).toFixed(2)}
                                  </span>
                                  <div className="flex gap-1">
                                    {order.status === 'placed' && (
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                                        className="h-6 text-xs bg-amber-50 hover:bg-amber-100 border-amber-200"
                                      >
                                        <Utensils className="h-3 w-3 mr-1" /> Prepare
                                      </Button>
                                    )}
                                    {order.status === 'preparing' && (
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => updateOrderStatus(order.id, 'ready')}
                                        className="h-6 text-xs bg-green-50 hover:bg-green-100 border-green-200"
                                      >
                                        <CheckCircle className="h-3 w-3 mr-1" /> Ready
                                      </Button>
                                    )}
                                    {order.status === 'ready' && (
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => updateOrderStatus(order.id, 'completed')}
                                        className="h-6 text-xs bg-gray-50 hover:bg-gray-100 border-gray-200"
                                      >
                                        <Package className="h-3 w-3 mr-1" /> Complete
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </div>
          
          <div className="lg:col-span-1">
            <WaiterCallsList restaurantId={restaurantId || ''} />
          </div>
        </div>
      </div>
    );
  };

  export default OrderDashboard;
