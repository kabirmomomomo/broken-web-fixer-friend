import React from "react";
import { Bell } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

interface WaiterCallButtonProps {
  tableId?: string;
  restaurantId: string;
}

const WaiterCallButton: React.FC<WaiterCallButtonProps> = ({ tableId, restaurantId }) => {
  const { toast } = useToast();

  const handleWaiterCall = async (reason: string) => {
    if (!tableId) {
      toast({
        title: "Error",
        description: "Table ID is required to call waiter",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Attempting to create waiter call:', {
        table_id: tableId,
        restaurant_id: restaurantId,
        reason: reason
      });

      const { data, error } = await supabase
        .from('waiter_calls')
        .insert([
          {
            table_id: tableId,
            restaurant_id: restaurantId,
            reason: reason,
            status: 'pending'
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Waiter call created successfully:', data);

      toast({
        title: "Success",
        description: "Waiter has been notified",
      });
    } catch (error: any) {
      console.error('Error calling waiter:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to call waiter. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="icon"
          className="fixed bottom-4 right-4 md:top-4 md:right-4 h-12 w-12 rounded-full shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-none z-50"
        >
          <Bell className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-4">
        <DialogHeader>
          <DialogTitle>Call Waiter</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <Button
            variant="outline"
            className="w-full justify-start text-base py-6"
            onClick={() => handleWaiterCall("Need water")}
          >
            💧 Need Water
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-base py-6"
            onClick={() => handleWaiterCall("Need tissue")}
          >
            🧻 Need Tissue
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-base py-6"
            onClick={() => handleWaiterCall("General assistance")}
          >
            👋 General Assistance
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WaiterCallButton; 