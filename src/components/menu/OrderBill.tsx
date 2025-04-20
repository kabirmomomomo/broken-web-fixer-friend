
import React, { useRef, useCallback } from 'react';
import { format } from 'date-fns';
import { FileText, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useOrders } from '@/contexts/OrderContext';
import html2canvas from 'html2canvas';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

const OrderBill = () => {
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
    enabled: !!menuId
  });

  const totalAmount = orders.reduce((sum, order) => sum + order.total_amount, 0);

  const downloadBill = useCallback(async () => {
    if (!billRef.current) return;
    
    try {
      const canvas = await html2canvas(billRef.current);
      const dataUrl = canvas.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `receipt-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating bill:', error);
    }
  }, []);

  if (orders.length === 0) return null;

  return (
    <Card className="w-full max-w-md mb-6">
      <CardHeader>
        <CardTitle className="text-xl text-purple-900 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={billRef} className="space-y-6 bg-white p-4">
          {restaurant && (
            <div className="border-b border-gray-100 pb-4 text-center">
              <h2 className="text-xl font-semibold text-purple-900">{restaurant.name}</h2>
              {restaurant.description && (
                <p className="text-sm text-gray-600 mt-1">{restaurant.description}</p>
              )}
              {restaurant.location && (
                <p className="text-sm text-gray-600 mt-1">{restaurant.location}</p>
              )}
              {restaurant.phone && (
                <p className="text-sm text-gray-600 mt-1">{restaurant.phone}</p>
              )}
            </div>
          )}
          
          <Accordion type="single" collapsible className="w-full">
            {orders.map((order) => (
              <AccordionItem key={order.id} value={order.id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex flex-col items-start">
                    <div className="text-sm text-muted-foreground">
                      Order #{order.id.slice(0, 8)}
                    </div>
                    <div className="text-sm font-medium">
                      ${order.total_amount.toFixed(2)}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pt-2">
                    <div className="text-sm text-muted-foreground mb-2">
                      {format(new Date(order.created_at), 'MMM d, yyyy h:mm a')}
                    </div>
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>
                          {item.quantity}x {item.item_name}
                          {item.variant_name && (
                            <span className="text-muted-foreground"> ({item.variant_name})</span>
                          )}
                        </span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="pt-2 text-sm text-right text-purple-600 border-t border-gray-100 mt-2">
                      Subtotal: ${order.total_amount.toFixed(2)}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="pt-3 border-t border-gray-200">
            <div className="flex justify-between font-medium text-lg">
              <span>Total Amount</span>
              <span className="text-purple-600">${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
        <Button 
          onClick={downloadBill}
          variant="outline" 
          className="w-full mt-4"
        >
          <FileText className="w-4 h-4 mr-2" />
          Download Receipt as PNG
        </Button>
      </CardContent>
    </Card>
  );
};

export default OrderBill;
