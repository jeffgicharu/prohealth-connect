"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingButton } from "@/components/ui/loading-button"
import toast from 'react-hot-toast'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState } from "react"
import { User, Mail, Phone, Lock } from "lucide-react"

// Define the signup form schema
const signupFormSchema = z.object({
  firstName: z.string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters"),
  lastName: z.string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters"),
  email: z.string()
    .email("Please enter a valid email address"),
  phone: z.string()
    .regex(/^254\d{9}$/, "Phone number must be in format 254XXXXXXXXX (e.g., 254712345678)")
    .min(12, "Phone number must be 12 digits")
    .max(12, "Phone number must be 12 digits"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[!@#$%^&*]/, "Password must contain at least one special character (!@#$%^&*)"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupFormSchema>;

export default function SignupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
    setError
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupFormSchema),
    mode: "onTouched"
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          password: data.password,
        }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        if (responseData.details?.fieldErrors) {
          // Handle field-specific errors
          Object.entries(responseData.details.fieldErrors).forEach(([field, errors]) => {
            if (Array.isArray(errors) && errors.length > 0) {
              setError(field as keyof SignupFormData, {
                type: 'server',
                message: errors[0]
              });
            }
          });
        } else {
          // Use server-provided error message or fallback
          throw new Error(responseData.error || responseData.message || 'Registration failed. Please check your input and try again.');
        }
        return;
      }

      toast.success("Registration successful! You can now sign in to your account.")
      reset();
      router.push('/login')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again or contact support if the issue persists.';
      console.error('Registration error:', error);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-white flex items-center justify-center py-12 px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-md hover:shadow-lg focus-within:shadow-lg hover:scale-105 hover:-translate-y-1 focus-within:scale-105 focus-within:-translate-y-1 transition-all duration-300 ease-in-out border border-brand-light-gray/20 rounded-lg focus-within:ring-2 focus-within:ring-brand-primary focus-within:ring-offset-2">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
          <CardDescription className="text-center text-brand-light-gray">
            Enter your information to create your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="flex items-center">
                  <User className="mr-2 h-4 w-4 text-brand-light-gray" />
                  First name
                </Label>
                <Input
                  id="firstName"
                  {...register("firstName")}
                  className="border-brand-light-gray/30 focus:border-brand-primary"
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500 mt-1">{errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="flex items-center">
                  <User className="mr-2 h-4 w-4 text-brand-light-gray" />
                  Last name
                </Label>
                <Input
                  id="lastName"
                  {...register("lastName")}
                  className="border-brand-light-gray/30 focus:border-brand-primary"
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500 mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center">
                <Mail className="mr-2 h-4 w-4 text-brand-light-gray" />
                Email
              </Label>
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
              <Label htmlFor="phone" className="flex items-center">
                <Phone className="mr-2 h-4 w-4 text-brand-light-gray" />
                Phone number
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="254XXXXXXXXX"
                {...register("phone")}
                className="border-brand-light-gray/30 focus:border-brand-primary"
              />
              {errors.phone && (
                <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center">
                <Lock className="mr-2 h-4 w-4 text-brand-light-gray" />
                Password
              </Label>
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
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="flex items-center">
                <Lock className="mr-2 h-4 w-4 text-brand-light-gray" />
                Confirm password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword")}
                className="border-brand-light-gray/30 focus:border-brand-primary"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500 mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <LoadingButton 
              type="submit" 
              className="w-full" 
              disabled={!isValid || !isDirty}
              isLoading={isLoading}
              loadingText="Creating Account..."
            >
              Create Account
            </LoadingButton>
            <p className="text-center text-sm text-brand-light-gray">
              Already have an account?{" "}
              <Link href="/login" className="text-brand-primary hover:text-brand-primary-hover">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
