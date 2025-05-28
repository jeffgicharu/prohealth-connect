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
    console.error("Error creating booking:", error);
    return { error: "Failed to create booking. Please try again." };
  }
}

export async function getUserBookings() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: "User not authenticated." };
  }

  try {
    const bookingService = BookingService.getInstance();
    const bookings = await bookingService.getUserBookings(session.user.id);
    return { bookings };
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    return { error: "Failed to fetch bookings. Please try again." };
  }
} 