
import React, { useEffect } from 'react';
import { format } from 'date-fns';
import { useOrders } from '@/contexts/OrderContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Users } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const TableOrders = () => {
  const { tableOrders } = useOrders();
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get('table');
  
  const totalAmount = tableOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);
  const totalItems = tableOrders.reduce((sum, order) => 
    sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);

  const getTableNumber = (tableId: string) => {
    if (!tableId) return '';
    const number = tableId.match(/\d+/);
    return number ? number[0] : tableId;
  };
  
  // Debug log to check for tableOrders data
  useEffect(() => {
    console.log('TableOrders component - Current tableOrders:', tableOrders);
    console.log('Current tableId from URL:', tableId);
  }, [tableOrders, tableId]);
  
  return (
    <Card className="w-full bg-gradient-to-br from-purple-50 to-white shadow-md border-purple-100">
      <CardHeader className="bg-gradient-to-r from-purple-100 to-indigo-50 rounded-t-lg">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-bold text-purple-900 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Table {tableId ? getTableNumber(tableId) : ''} Orders
          </CardTitle>
          <Badge variant="outline" className="bg-white text-purple-900 border-purple-200">
            {tableOrders.length} {tableOrders.length === 1 ? 'Order' : 'Orders'}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground flex justify-between mt-2">
          <span className="flex items-center gap-1">
            <Smartphone className="h-3 w-3" /> {tableOrders.reduce((acc, order) => {
              if (!acc.includes(order.device_id)) acc.push(order.device_id);
              return acc;
            }, [] as string[]).length} Devices
          </span>
          <span>{totalItems} Items</span>
        </div>
      </CardHeader>
      <CardContent className="pt-4 divide-y divide-purple-100">
        {tableOrders.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <p>No orders placed at this table yet</p>
            <p className="text-sm mt-2">Orders will appear here in real-time</p>
          </div>
        ) : (
          <>
            {tableOrders.map((order) => (
              <div key={order.id} className="py-3 first:pt-0 animate-fade-in">
                <div className="flex justify-between mb-1">
                  <div className="text-sm font-medium text-purple-900">
                    {order.device_id.substring(0, 6)}...
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(order.created_at), 'h:mm a')}
                  </div>
                </div>
                <div className="space-y-1">
                  {order.items && order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.quantity}× {item.item_name}
                        {item.variant_name && (
                          <span className="text-gray-500 text-xs"> ({item.variant_name})</span>
                        )}
                      </span>
                      <span className="text-gray-900 font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            <div className="pt-3 flex justify-between font-medium">
              <span>Table Total</span>
              <span className="text-purple-900">${totalAmount.toFixed(2)}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TableOrders;
