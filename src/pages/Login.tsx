
import { useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { Player } from "@lottiefiles/react-lottie-player";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters",
  }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const { signIn } = useAuth();
  const [isHoveringButton, setIsHoveringButton] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const defaultValues: Partial<LoginFormValues> = {
    email: "",
    password: "",
  };

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues,
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      await signIn(data.email, data.password);
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error("Please enter your email address");
      return;
    }

    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast.success("Password reset email sent! Please check your inbox.");
      setShowResetPassword(false);
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error("Failed to send reset password email. Please try again.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden opacity-10">
        <div className="absolute top-1/4 left-1/4 h-32 w-32 rounded-full bg-blue-200 blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 h-32 w-32 rounded-full bg-purple-200 blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md space-y-6 rounded-2xl bg-white/80 p-8 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
        <div className="text-center">
          {/* Lottie Animation */}
          <div className="mx-auto -mt-20 mb-4 h-40 w-40 transition-all duration-500 hover:scale-105">
            <Player
              autoplay
              loop
              src="https://assets2.lottiefiles.com/packages/lf20_ktwnwv5m.json"
              style={{ height: '100%', width: '100%' }}
            />
          </div>
          
          <Link to="/" className="inline-block">
            <h2 className="font-mono text-4xl font-semibold text-gray-800">
              Easy<span className="font-medium text-blue-600">Menu</span>
            </h2>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-gray-800">Welcome back</h1>
          <p className="mt-2 text-gray-600">
            Enter your credentials to access your account
          </p>
        </div>

        {!showResetPassword ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          placeholder="name@example.com"
                          className="pl-10 transition-all duration-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="pl-10 transition-all duration-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className={`w-full gap-2 transition-all duration-300 ${isHoveringButton ? 'scale-[1.02] shadow-md' : ''}`}
                disabled={loading}
                onMouseEnter={() => setIsHoveringButton(true)}
                onMouseLeave={() => setIsHoveringButton(false)}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  <>
                    Log in
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </>
                )}
              </Button>

              <button
                type="button"
                onClick={() => setShowResetPassword(true)}
                className="w-full text-sm text-blue-600 hover:underline"
              >
                Forgot password?
              </button>
            </form>
          </Form>
        ) : (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Reset Password</h2>
            <p className="text-sm text-gray-600">
              Enter your email address and we'll send you instructions to reset your password.
            </p>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={resetLoading}
              >
                {resetLoading ? "Sending..." : "Send Reset Instructions"}
              </Button>
              <button
                type="button"
                onClick={() => setShowResetPassword(false)}
                className="w-full text-sm text-gray-600 hover:underline"
              >
                Back to login
              </button>
            </form>
          </div>
        )}

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link 
              to="/signup" 
              className="font-medium text-blue-600 underline-offset-4 transition-all duration-300 hover:underline hover:text-blue-700"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Custom CSS using standard style tag - fixed the jsx and global attributes */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Smooth transitions for all elements */
        * {
          transition: all 0.2s ease;
        }
        
        /* Custom focus styles */
        input:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }
        
        /* Animated underline effect */
        .animated-underline {
          position: relative;
        }
        .animated-underline::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background-color: #2563eb;
          transition: width 0.3s ease;
        }
        .animated-underline:hover::after {
          width: 100%;
        }
      `}} />
    </div>
  );
};

export default Login;
