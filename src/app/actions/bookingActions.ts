"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { BookingService } from "@/lib/services/booking";

export async function createBooking(serviceId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: "User not authenticated. Please log in to book a service." };
  }

  if (!serviceId) {
    return { error: "Service ID is required." };
  }

  try {
    const bookingService = BookingService.getInstance();
    const newBooking = await bookingService.createBooking({
      userId: session.user.id,
      serviceId: serviceId,
      bookingDate: new Date(), // For MVP, set bookingDate to now.
                              // Later, this could come from a date picker.
    });

    return { success: "Booking created successfully!", booking: newBooking };
  } catch (error) {
    // Log detailed error information for debugging
    console.error("Error creating booking:", {
      error,
      userId: session.user.id,
      serviceId,
      timestamp: new Date().toISOString()
    });
    return { error: "Unable to create booking. Please try again or contact support if the issue persists." };
  }
}

export async function getUserBookings() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: "Please log in to view your bookings." };
  }

  try {
    const bookingService = BookingService.getInstance();
    const bookings = await bookingService.getUserBookings(session.user.id);
    return { bookings };
  } catch (error) {
    // Log detailed error information for debugging
    console.error("Error fetching user bookings:", {
      error,
      userId: session.user.id,
      timestamp: new Date().toISOString()
    });
    return { error: "Unable to fetch your bookings. Please try again or contact support if the issue persists." };
  }
} 