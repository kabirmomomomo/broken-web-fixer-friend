
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
import { QrCode, ArrowLeft } from "lucide-react";

// Lottie links provided by user
const LOTTIE_THANK_YOU_1 = "https://lottie.host/b7660d056f5df29a85a6de31badfbc00/Thank-You-hUky7L46YA.json";
const LOTTIE_THANK_YOU_2 = "https://lottie.host/6f7ff7b2434b38b3b6b39a1a3e986f19/Thank-You-SUGYQK6Ujf.json";

const CAT_IMAGE = "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?auto=format&fit=crop&w=650&q=80";

const ThankYou = () => {
  const { clearCart } = useCart();
  const { menuId } = useParams();
  const navigate = useNavigate();

  const [showQrDialog, setShowQrDialog] = useState(false);

  // Build QR code url (fallback if menuId not available)
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
    <div className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden px-4 py-6 bg-gradient-to-br from-pink-50 via-yellow-50 to-purple-100 font-sans">
      {/* Animated Gradient Overlay */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute left-[-5rem] top-[-7rem] w-[25rem] h-[22rem] rounded-full bg-purple-200/30 blur-2xl animate-float" />
        <div className="absolute right-[-4rem] bottom-[-7rem] w-[23rem] h-[27rem] rounded-full bg-yellow-200/30 blur-3xl animate-float-slow" />
        <div className="absolute left-1/2 top-20 w-[22rem] h-[13rem] -translate-x-1/2 bg-gradient-to-br from-yellow-100/40 to-pink-200/50 rounded-full blur-2xl animate-pulse" />
      </div>

      {/* Lottie animations SECTION */}
      <div className="flex flex-col gap-0 items-center mt-2 z-30">
        {/* Main "Thank You" Lottie Animations */}
        <Player
          autoplay
          loop
          src={LOTTIE_THANK_YOU_1}
          style={{ height: 140, width: 240, pointerEvents: "none" }}
          className="mb-[-1.5rem] animate-fade-in"
          keepLastFrame
        />
        <Player
          autoplay
          loop
          src={LOTTIE_THANK_YOU_2}
          style={{ height: 120, width: 200, pointerEvents: "none" }}
          className="animate-fade-in"
          keepLastFrame
        />
      </div>
      {/* Cat Mascot - with motion */}
      <img
        src={CAT_IMAGE}
        alt="Cute cartoon cat"
        className="absolute left-8 sm:left-20 bottom-16 lg:bottom-20 w-36 h-36 object-cover rounded-full border-8 border-white shadow-2xl z-40 animate-[float_3s_ease-in-out_infinite]"
        style={{ animationDelay: "1s" }}
      />

      {/* Main Card */}
      <Card className="w-full max-w-lg z-30 shadow-2xl glass-effect border-none py-2 mt-2 animate-scale-in">
        <CardHeader className="pb-2">
          <div className="flex flex-col justify-center items-center gap-2">
            <CardTitle className="text-4xl text-center mb-0 mt-4 font-extrabold bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent tracking-tight drop-shadow-lg">
              Thank You!
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-medium text-center text-gray-700 mb-2">
            Your order was <span className="text-purple-600 font-semibold">successful</span>.<br />
            <span className="text-base text-muted-foreground">We appreciate your visit!</span>
          </p>
          {/* Action Buttons */}
          <div className="flex flex-col gap-3 mt-6 mb-4 items-center w-full">
            {/* QR Code CTA */}
            <Button
              variant="default"
              className="w-full max-w-xs gap-2 text-lg py-5 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-purple-500 hover:to-pink-400 shadow-lg border-0 font-bold animate-pulse"
              onClick={() => setShowQrDialog(true)}
            >
              <QrCode className="w-6 h-6" />
              Menu Preview QR
            </Button>
            {/* Back to Menu Button */}
            <Button
              variant="outline"
              className="w-full max-w-xs gap-2 text-lg py-4 border-purple-200 hover:bg-purple-50 shadow font-semibold"
              onClick={() => navigate(menuId ? `/menu-preview/${menuId}` : "/")}
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Menu
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* QR Code Dialog */}
      {showQrDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl py-8 px-5 max-w-sm mx-auto relative animate-fade-in border-2 border-violet-100">
            <button
              aria-label="Close QR dialog"
              className="absolute right-4 top-4 text-gray-400 hover:text-purple-600 transition"
              onClick={() => setShowQrDialog(false)}
              style={{ fontSize: "2rem", lineHeight: "1rem", fontWeight: 300 }}
            >
              &times;
            </button>
            <QRCodeDialog qrCodeValue={qrCodeValue} />
          </div>
        </div>
      )}
      {/* Decorative Bottom Gradient */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent z-0" />
    </div>
  );
};

export default ThankYou;
