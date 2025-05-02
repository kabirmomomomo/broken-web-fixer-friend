
import React from 'react';
import { useOrders } from '@/contexts/OrderContext';
import { format } from 'date-fns';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ClipboardList } from 'lucide-react';

interface OrderHistoryProps {
  tableId?: string;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ tableId }) => {
  const { orders } = useOrders();
  const location = window.location.pathname;
  const menuId = location.split('/menu-preview/')[1];

  const totalAmount = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="fixed bottom-8 left-8 h-16 w-16 rounded-full shadow-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-none"
        >
          <ClipboardList className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:max-w-md overflow-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>Order History</SheetTitle>
        </SheetHeader>
        <div className="mt-2 space-y-4">
          {orders.length === 0 ? (
            <p className="text-center text-muted-foreground">No orders yet</p>
          ) : (
            <>
              {orders.map((order) => (
                <div 
                  key={order.id}
                  className="bg-white rounded-lg shadow p-4 border border-gray-100"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(order.created_at), 'MMM d, yyyy h:mm a')}
                      </p>
                      <p className="font-medium">
                        Order #{order.id.slice(0, 8)}
                        {order.table_id && (
                          <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                            Table {order.table_id}
                          </span>
                        )}
                      </p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                      {order.status}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>
                          {item.quantity}x {item.item_name}
                          {item.variant_name && (
                            <span className="text-muted-foreground"> ({item.variant_name})</span>
                          )}
                        </span>
                        <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between font-medium">
                    <span>Total</span>
                    <span>₹{order.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              ))}
              
              <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t border-gray-200 shadow-lg">
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-semibold text-purple-900">Total Amount</span>
                    <span className="text-lg font-bold text-purple-900">
                      ₹{totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                  onClick={() => window.location.href = `/payment/₹{menuId}`}
                >
                  Proceed to Payment
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default OrderHistory;
