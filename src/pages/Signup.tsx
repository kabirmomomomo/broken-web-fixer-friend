
import { useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";

const signupSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z.string().min(8, {
      message: "Password must be at least 8 characters",
    }),
    confirmPassword: z.string(),
    terms: z.boolean().refine((value) => value === true, {
      message: "You must agree to the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

const Signup = () => {
  const { signUp, signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isHoveringButton, setIsHoveringButton] = useState(false);

  const defaultValues: Partial<SignupFormValues> = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  };

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues,
  });

  const onSubmit = async (data: SignupFormValues) => {
    setLoading(true);
    try {
      await signUp(data.email, data.password, data.name);
    } catch (error) {
      console.error("Signup error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Google sign-in error:", error);
    }
    // Note: We don't set googleLoading to false here because
    // the user will be redirected to Google's auth page
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
          <h1 className="mt-4 text-2xl font-bold text-gray-800">Create an account</h1>
          <p className="mt-2 text-gray-600">
            Sign up to get started with EasyMenu
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Full Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Jane Doe"
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

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Confirm Password</FormLabel>
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

            <FormField
              control={form.control}
              name="terms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="border-gray-300 data-[state=checked]:bg-blue-500"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-gray-700">
                      I agree to the{" "}
                      <a
                        href="#"
                        className="font-medium text-blue-600 underline-offset-4 transition-all duration-300 hover:underline hover:text-blue-700"
                      >
                        terms of service
                      </a>{" "}
                      and{" "}
                      <a
                        href="#"
                        className="font-medium text-blue-600 underline-offset-4 transition-all duration-300 hover:underline hover:text-blue-700"
                      >
                        privacy policy
                      </a>
                    </FormLabel>
                    <FormMessage className="text-red-500" />
                  </div>
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
                  Creating account...
                </span>
              ) : (
                <>
                  Create account
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </form>
        </Form>

        <div className="relative flex items-center justify-center">
          <Separator className="absolute w-full" />
          <span className="relative bg-white px-2 text-xs text-gray-500">OR</span>
        </div>
        
        <Button
          variant="outline"
          type="button"
          className="w-full flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
        >
          {googleLoading ? (
            <span className="flex items-center">
              <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Connecting...
            </span>
          ) : (
            <>
              <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
                <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
              </svg>
              Sign up with Google
            </>
          )}
        </Button>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link 
              to="/login" 
              className="font-medium text-blue-600 underline-offset-4 transition-all duration-300 hover:underline hover:text-blue-700"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>

      {/* Custom CSS using standard style tag */}
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

export default Signup;
