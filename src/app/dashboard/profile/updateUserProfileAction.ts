"use server"

import { z } from "zod"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import { revalidatePath } from "next/cache"

const nameSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .trim() // Remove leading/trailing whitespace
    .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes")
})

export async function updateUserProfile(formData: { name: string }) {
  try {
    // Validate session
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return { error: "Not authenticated" }
    }

    // Validate input data
    if (!formData || typeof formData.name !== 'string') {
      return { error: "Invalid input data" }
    }

    // Validate with Zod schema
    const validation = nameSchema.safeParse(formData)
    
    if (!validation.success) {
      const errorMessage = validation.error.flatten().fieldErrors.name?.[0] || "Invalid name format"
      return { error: errorMessage }
    }

    const { name } = validation.data

    // Check if user exists before updating
    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true }
    })

    if (!existingUser) {
      return { error: "User not found" }
    }

    // Check if name is actually changing
    if (existingUser.name === name) {
      return { success: true, message: "No changes made" }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        name: name,
        updatedAt: new Date() // Explicitly set updated timestamp
      },
      select: { id: true, name: true } // Only return necessary fields
    })

    // Revalidate the profile page to show updated data
    revalidatePath('/dashboard/profile')

    return { 
      success: true, 
      data: { name: updatedUser.name }
    }

  } catch (error) {
    console.error('Error updating user profile:', error)
    
    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return { error: "This name is already taken" }
      }
      if (error.message.includes('Record to update not found')) {
        return { error: "User not found" }
      }
    }

    return { error: "Failed to update name. Please try again." }
  }
}