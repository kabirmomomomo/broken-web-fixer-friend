
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
  const { signUp, loading } = useAuth();
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
    await signUp(data.email, data.password, data.name);
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

export default Signup;
