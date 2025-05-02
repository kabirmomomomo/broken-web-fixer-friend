
import React, { useRef, useCallback } from 'react';
import { format } from 'date-fns';
import { FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useOrders } from '@/contexts/OrderContext';
import html2canvas from 'html2canvas';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface OrderBillProps {
  hideCardWrapper?: boolean;
  showDownloadButton?: boolean;
  className?: string;
}

const OrderBill: React.FC<OrderBillProps> = ({ hideCardWrapper = false, showDownloadButton = true, className }) => {
  const { orders } = useOrders();
  const billRef = useRef<HTMLDivElement>(null);
  const { menuId } = useParams();

  const { data: restaurant } = useQuery({
    queryKey: ['restaurant-details', menuId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('name, description, location, phone')
        .eq('id', menuId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!menuId,
  });

  const totalAmount = orders.reduce((sum, order) => sum + order.total_amount, 0);

  const downloadBill = useCallback(async () => {
    if (!billRef.current) return;

    try {
      const canvas = await html2canvas(billRef.current);
      const dataUrl = canvas.toDataURL('image/png');

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `receipt-₹{format(new Date(), 'yyyy-MM-dd-HH-mm')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating bill:', error);
    }
  }, []);

  if (orders.length === 0) return null;

  // Helper for formatting line-items
  const renderOrderItems = (items: any[]) =>
    items.map((item) => (
      <div
        key={item.id}
        className="flex justify-between items-center text-xs sm:text-sm border-b border-gray-100 py-1 px-1"
      >
        <div className="flex flex-col text-left w-2/3">
          <span>
            {item.quantity}x {item.item_name}
            {item.variant_name && (
              <span className="text-gray-500"> ({item.variant_name})</span>
            )}
          </span>
        </div>
        <div className="text-right w-1/3 flex flex-col">
          <span>
            ₹{item.price.toFixed(2)} × {item.quantity} = <span className="font-bold">₹{(item.price * item.quantity).toFixed(2)}</span>
          </span>
        </div>
      </div>
    ));

  const billContent = (
    <div ref={billRef} className={`space-y-4 bg-white p-4 rounded-xl border border-gray-200 ₹{className ?? ''}`}>
      {restaurant && (
        <div className="border-b border-gray-100 pb-2 text-center mb-2">
          <h2 className="text-lg font-semibold text-purple-900">{restaurant.name}</h2>
          {restaurant.description && (
            <p className="text-xs text-gray-600 mt-0.5">{restaurant.description}</p>
          )}
          {restaurant.location && (
            <p className="text-xs text-gray-600 mt-0.5">{restaurant.location}</p>
          )}
          {restaurant.phone && (
            <p className="text-xs text-gray-600 mt-0.5">{restaurant.phone}</p>
          )}
        </div>
      )}
      <div>
        {orders.map((order) => (
          <div key={order.id} className="mb-4 last:mb-0 rounded-md border border-purple-100 px-2 py-2 bg-gradient-to-br from-purple-50/20 to-white">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs text-muted-foreground">
                Order #{order.id.slice(0, 8)}
              </div>
              <div className="text-xs text-gray-500">
                {format(new Date(order.created_at), 'MMM d, yyyy h:mm a')}
              </div>
            </div>
            <div>
              {renderOrderItems(order.items)}
            </div>
            <div className="pt-1 text-xs text-right text-purple-700 border-t border-gray-100 mt-2">
              Subtotal: <span className="font-semibold">₹{order.total_amount.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="pt-2 border-t border-gray-300">
        <div className="flex justify-between font-semibold text-base mt-1">
          <span>Total Payable</span>
          <span className="text-purple-700">₹{totalAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );

  // Render collapsible if required by parent
  if (hideCardWrapper) {
    return (
      <div>
        {billContent}
        {showDownloadButton && (
          <Button
            onClick={downloadBill}
            variant="outline"
            className="w-full mt-4"
          >
            <FileText className="w-4 h-4 mr-2" />
            Download Receipt as PNG
          </Button>
        )}
      </div>
    );
  }

  // Default: render as card
  return (
    <Card className="w-full max-w-md mb-6">
      <CardHeader>
        <CardTitle className="text-xl text-purple-900 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        {billContent}
        {showDownloadButton && (
          <Button
            onClick={downloadBill}
            variant="outline"
            className="w-full mt-4"
          >
            <FileText className="w-4 h-4 mr-2" />
            Download Receipt as PNG
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderBill;
