import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Define the registration schema
const registerSchema = z.object({
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters long')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters long')
    .max(50, 'Last name must be less than 50 characters'),
  email: z.string()
    .email('Invalid email format')
    .min(1, 'Email is required'),
  phone: z.string()
    .regex(/^254\d{9}$/, 'Phone number must be in format 254XXXXXXXXX (e.g., 254712345678)')
    .min(12, 'Phone number must be 12 digits')
    .max(12, 'Phone number must be 12 digits'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*]/, 'Password must contain at least one special character (!@#$%^&*)'),
});

export async function POST(request: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
    
    // Validate input using Zod schema
    const validation = registerSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input', 
          details: validation.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, phone, password } = validation.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email,
        phone,
        password: hashedPassword,
      },
    });

    // Return user without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = newUser;
    return NextResponse.json(userWithoutPassword, { status: 201 });

  } catch (error) {
    // Log detailed error information for debugging
    console.error("Registration error:", {
      error,
      email: body?.email,
      timestamp: new Date().toISOString()
    });
    
    // Handle specific Prisma errors
    if (error instanceof Error) {
      const errorMessages: { [key: string]: string } = {
        "Unique constraint failed": "An account with this email already exists. Please use a different email or try logging in.",
        "Invalid input": "The provided information is invalid. Please check your input and try again.",
        "Connection": "Unable to connect to the database. Please try again later.",
        "Timeout": "The request timed out. Please try again.",
        "Validation": "The provided information doesn't meet our requirements. Please check the form and try again.",
      };

      // Check if the error message matches any known error patterns
      for (const [key, message] of Object.entries(errorMessages)) {
        if (error.message.includes(key)) {
          return NextResponse.json({ error: message }, { status: 400 });
      }
      }

      // If it's a known Prisma error but not in our mapping, use a generic message
      if (error.message.includes('Prisma') || error.message.includes('database')) {
        return NextResponse.json(
          { error: 'Unable to create your account. Please try again or contact support.' },
          { status: 500 }
        );
      }
    }

    // For unknown errors, return a generic message
    return NextResponse.json(
      { error: 'Unable to create your account. Please try again or contact support if the issue persists.' },
      { status: 500 }
    );
  }
}
