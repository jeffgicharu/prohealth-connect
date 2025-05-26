"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions"; // Ensure this path is correct

export async function createBooking(serviceId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: "User not authenticated. Please log in to book a service." };
  }

  if (!serviceId) {
    return { error: "Service ID is required." };
  }

  try {
    // Check if the service exists
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) {
      return { error: "Service not found." };
    }

    const newBooking = await prisma.booking.create({
      data: {
        userId: session.user.id,
        serviceId: serviceId,
        bookingDate: new Date(), // For MVP, set bookingDate to now.
                                // Later, this could come from a date picker.
        status: "PENDING",      // Initial status
        paymentStatus: "UNPAID", // Payment will be handled later
      },
    });
    return { success: "Booking created successfully!", booking: newBooking };
  } catch (error) {
    console.error("Error creating booking:", error);
    return { error: "Failed to create booking. Please try again." };
  }
} 