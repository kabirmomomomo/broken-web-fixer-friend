
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useOrders } from "@/contexts/OrderContext";
import { supabase } from "@/lib/supabase";
import { getDeviceId } from "@/utils/deviceId";
import { toast } from "@/components/ui/sonner";
import QRCodeDialog from "@/components/menu/QRCodeDialog";
import { useParams, useNavigate } from "react-router-dom";
import { Player } from "@lottiefiles/react-lottie-player";
import { ArrowRight, QrCode } from "lucide-react";

const THANK_YOU_LOTTIE =
  "https://lottie.host/17210db8-01e2-44bb-b1de-008a9ae1b1a7/F2FM4daGdS.json"; // cheerful thank you (replace url if you want later!)

const ThankYou = () => {
  const { clearCart } = useCart();
  const { orders } = useOrders();
  const { menuId } = useParams();
  const navigate = useNavigate();

  const [showQrDialog, setShowQrDialog] = useState(false);

  // Build QR code url (safe fallback if menuId not available)
  const qrCodeValue = menuId
    ? `${window.location.origin}/menu-preview/${menuId}`
    : window.location.origin;

  useEffect(() => {
    const cleanupEverything = async () => {
      try {
        clearCart();
        const currentDeviceId = getDeviceId();
        if (currentDeviceId) {
          const { error } = await supabase
            .from("orders")
            .delete()
            .eq("device_id", currentDeviceId);
          if (error) {
            console.error("Error deleting orders:", error);
          }
        }
        localStorage.removeItem("deviceId");
        toast.success("Your order has been confirmed!");
      } catch (error) {
        console.error("Error cleaning up:", error);
        toast.error("There was an issue processing your order");
      }
    };
    cleanupEverything();
  }, [clearCart]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-tr from-purple-100 via-white to-pink-100 px-4 py-6 relative overflow-hidden">
      {/* Animated modern shapes background */}
      <div
        className="absolute inset-0 pointer-events-none select-none"
        aria-hidden="true"
      >
        <div className="absolute left-[-8rem] top-[-8rem] w-[30rem] h-[30rem] rounded-full bg-purple-200/30 blur-3xl animate-float" />
        <div className="absolute right-[-6rem] bottom-[-10rem] w-[24rem] h-[24rem] rounded-full bg-pink-200/30 blur-3xl animate-float-slow" />
        <div className="absolute left-1/2 top-0 w-[20rem] h-[20rem] -translate-x-1/2 bg-gradient-to-br from-yellow-100/40 to-pink-200/50 rounded-full blur-2xl animate-pulse" />
      </div>
      <Card className="w-full max-w-md z-10 shadow-2xl bg-white/80 backdrop-blur-lg border-none">
        <CardHeader className="pb-0">
          <div className="flex flex-col justify-center items-center">
            {/* Lottie animation */}
            <Player
              autoplay
              loop
              src={THANK_YOU_LOTTIE}
              style={{ height: "150px", width: "150px" }}
            />
            <CardTitle className="text-3xl font-extrabold text-gradient-primary mt-3 mb-1 text-center leading-tight">
              Thank You!
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-medium text-center text-gray-600 mb-2">
            Your order was successful.
          </p>
          <p className="text-base text-center text-muted-foreground mb-4">
            We appreciate your visit. Come back soon.<br />
            <span className="font-semibold text-purple-700">Visit again!</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-5 justify-center items-center">
            {/* Button: Menu QR code */}
            <Button
              variant="outline"
              className="gap-2 px-6 py-2 border-purple-300 shadow hover:shadow-lg hover:scale-105 transition-transform"
              onClick={() => setShowQrDialog(true)}
            >
              <QrCode className="w-5 h-5" />
              Scan Menu QR
            </Button>
            {/* Button: Return to home */}
            <Button
              variant="ghost"
              className="gap-2 px-6 py-2"
              onClick={() => navigate("/")}
            >
              <ArrowRight className="w-5 h-5" />
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* QR Code Dialog rendered here */}
      {showQrDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl py-8 px-5 max-w-sm mx-auto relative animate-fade-in">
            <button
              aria-label="Close QR dialog"
              className="absolute right-4 top-4 text-gray-400 hover:text-purple-600 transition"
              onClick={() => setShowQrDialog(false)}
            >
              &times;
            </button>
            <QRCodeDialog qrCodeValue={qrCodeValue} />
          </div>
        </div>
      )}

      {/* Gradient fade for aesthetics */}
      <div className="absolute bottom-0 left-0 w-full h-36 bg-gradient-to-t from-white to-transparent z-0" />
    </div>
  );
};

export default ThankYou;
