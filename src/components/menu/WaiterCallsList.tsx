import React, { useEffect, useState } from "react";
import { Bell, Check, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface WaiterCall {
  id: string;
  table_id: string;
  reason: string;
  status: string;
  created_at: string;
}

interface WaiterCallsListProps {
  restaurantId: string;
}

const WaiterCallsList: React.FC<WaiterCallsListProps> = ({ restaurantId }) => {
  const [waiterCalls, setWaiterCalls] = useState<WaiterCall[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const fetchWaiterCalls = async () => {
    try {
      console.log('Fetching waiter calls for restaurant:', restaurantId);

      const { data, error } = await supabase
        .from('waiter_calls')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Waiter calls fetched successfully:', data);
      setWaiterCalls(data || []);
    } catch (error: any) {
      console.error('Error fetching waiter calls:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch waiter calls",
        variant: "destructive",
      });
    }
  };

  const handleStatusUpdate = async (callId: string, newStatus: string) => {
    try {
      console.log('Updating waiter call status:', { callId, newStatus });

      // First update the status
      const { error: updateError } = await supabase
        .from('waiter_calls')
        .update({ status: newStatus })
        .eq('id', callId);

      if (updateError) {
        console.error('Supabase update error:', updateError);
        throw updateError;
      }

      // Then delete the record
      const { error: deleteError } = await supabase
        .from('waiter_calls')
        .delete()
        .eq('id', callId);

      if (deleteError) {
        console.error('Supabase delete error:', deleteError);
        throw deleteError;
      }

      console.log('Waiter call processed and deleted successfully');
      
      // Update local state
      setWaiterCalls(prev => prev.filter(call => call.id !== callId));
      
      toast({
        title: "Success",
        description: `Waiter call marked as ₹{newStatus} and removed`,
      });
    } catch (error: any) {
      console.error('Error processing waiter call:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process waiter call",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (!restaurantId) {
      console.log('No restaurant ID provided, skipping waiter calls fetch');
      return;
    }

    console.log('Setting up waiter calls subscription for restaurant:', restaurantId);
    fetchWaiterCalls();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('waiter_calls_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'waiter_calls',
          filter: `restaurant_id=eq.₹{restaurantId}`,
        },
        (payload) => {
          console.log('Waiter calls change received:', payload);
          fetchWaiterCalls();
        }
      )
      .subscribe((status) => {
        console.log('Waiter calls subscription status:', status);
      });

    return () => {
      console.log('Cleaning up waiter calls subscription');
      subscription.unsubscribe();
    };
  }, [restaurantId]);

  if (!restaurantId) {
    return null;
  }

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, pointerEvents: 'none' }}>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="default"
            size="icon"
            style={{
              height: '56px',
              width: '56px',
              borderRadius: '50%',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              background: 'linear-gradient(to right, #2563eb, #4f46e5)',
              border: 'none',
              position: 'relative',
              pointerEvents: 'auto'
            }}
            className="hover:from-blue-700 hover:to-indigo-700 text-white"
          >
            <Bell className="h-7 w-7" />
            {waiterCalls.length > 0 && (
              <Badge
                variant="destructive"
                style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  height: '24px',
                  width: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                {waiterCalls.length}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent 
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            maxWidth: '425px',
            padding: '16px',
            maxHeight: '80vh',
            overflowY: 'auto',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Waiter Calls
              {waiterCalls.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {waiterCalls.length}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {waiterCalls.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No pending waiter calls
              </p>
            ) : (
              waiterCalls.map((call) => (
                <div
                  key={call.id}
                  className="flex items-center justify-between p-3 border rounded-lg text-sm"
                >
                  <div>
                    <p className="font-medium">Table {call.table_id}</p>
                    <p className="text-muted-foreground">{call.reason}</p>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {new Date(call.created_at).toLocaleTimeString()}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleStatusUpdate(call.id, 'completed')}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleStatusUpdate(call.id, 'cancelled')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WaiterCallsList; 