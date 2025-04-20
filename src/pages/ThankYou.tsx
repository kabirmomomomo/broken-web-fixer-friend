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

const THANK_YOU_LOTTIE1 = "https://lottiefiles.com/free-animation/thank-you-hUky7L46YA";
const THANK_YOU_LOTTIE2 = "https://lottiefiles.com/free-animation/thank-you-lottiefiles-SUGYQK6Ujf";

const ThankYou = () => {
  // ... existing component logic remains the same ...

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-tr from-purple-100 via-white to-pink-100 px-4 py-6 relative overflow-hidden">
      {/* ... other existing elements ... */}
      
      <Card className="w-full max-w-md z-10 shadow-2xl bg-white/80 backdrop-blur-lg border-none">
        <CardHeader className="pb-0">
          <div className="flex flex-col justify-center items-center">
            {/* Stacked Lottie animations */}
            <div className="relative h-[150px] w-[150px]">
              <Player
                autoplay
                loop
                src={THANK_YOU_LOTTIE1}
                style={{ height: "150px", width: "150px", position: "absolute", top: 0, left: 0 }}
              />
              <Player
                autoplay
                loop
                src={THANK_YOU_LOTTIE2}
                style={{ height: "150px", width: "150px", position: "absolute", top: 0, left: 0 }}
              />
            </div>
            <CardTitle className="text-3xl font-extrabold text-gradient-primary mt-3 mb-1 text-center leading-tight">
              Thank You!
            </CardTitle>
          </div>
        </CardHeader>
        {/* ... rest of the card content remains the same ... */}
      </Card>

      {/* ... rest of the component remains unchanged ... */}
    </div>
  );
};

export default ThankYou;
