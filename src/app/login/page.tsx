"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingButton } from "@/components/ui/loading-button"
import toast from 'react-hot-toast'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

// Define the login form schema
const loginFormSchema = z.object({
  email: z.string()
    .email("Please enter a valid email address"),
  password: z.string()
    .min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    mode: "onTouched"
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
      })

      if (result?.error) {
        // Map common error types to user-friendly messages
        const errorMessages: { [key: string]: string } = {
          "CredentialsSignin": "Invalid email or password. Please check your credentials and try again.",
          "EmailNotVerified": "Please verify your email address before signing in. Check your inbox for the verification link.",
          "AccountLocked": "Your account has been temporarily locked due to multiple failed attempts. Please try again later or contact support.",
          "AccountDisabled": "This account has been disabled. Please contact support for assistance.",
        };

        const errorMessage = errorMessages[result.error] || result.error;
        throw new Error(errorMessage);
      } else if (result?.ok) {
        toast.success("Successfully signed in!")
        router.push(callbackUrl)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred. Please try again or contact support if the issue persists.';
      console.error('Login error:', err);
      toast.error(errorMessage);
    }
  }

  return (
    <div className="min-h-screen bg-brand-white flex items-center justify-center py-12 px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-md hover:shadow-lg focus-within:shadow-lg hover:scale-105 hover:-translate-y-1 focus-within:scale-105 focus-within:-translate-y-1 transition-all duration-300 ease-in-out border border-brand-light-gray/20 rounded-lg focus-within:ring-2 focus-within:ring-brand-primary focus-within:ring-offset-2">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
          <CardDescription className="text-center text-brand-light-gray">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                {...register("email")}
                className="border-brand-light-gray/30 focus:border-brand-primary"
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                className="border-brand-light-gray/30 focus:border-brand-primary"
              />
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <LoadingButton 
              type="submit" 
              className="w-full" 
              isLoading={isSubmitting}
              loadingText="Signing in..."
            >
              Sign In
            </LoadingButton>
            <p className="text-center text-sm text-brand-light-gray">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-brand-primary hover:text-brand-primary-hover">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
