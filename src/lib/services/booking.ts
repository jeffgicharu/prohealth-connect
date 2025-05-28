import prisma from '@/lib/prisma';
import { Booking, Service, User } from '@prisma/client';

interface CreateBookingInput {
  userId: string;
  serviceId: string;
  bookingDate: Date;
}

interface BookingWithDetails extends Booking {
  service: Service;
  user: User;
}

export class BookingService {
  private static instance: BookingService;

  private constructor() {}

  static getInstance(): BookingService {
    if (!this.instance) {
      this.instance = new BookingService();
    }
    return this.instance;
  }

  async createBooking(input: CreateBookingInput): Promise<Booking> {
    try {
      // Check if the service exists
      const service = await prisma.service.findUnique({
        where: { id: input.serviceId }
      });

      if (!service) {
        throw new Error('Service not found');
      }

      const booking = await prisma.booking.create({
        data: {
          userId: input.userId,
          serviceId: input.serviceId,
          bookingDate: input.bookingDate,
          status: 'PENDING',
          paymentStatus: 'UNPAID'
        }
      });

      return booking;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw new Error('Failed to create booking');
    }
  }

  async getBookingById(bookingId: string, userId: string): Promise<BookingWithDetails | null> {
    try {
      const booking = await prisma.booking.findFirst({
        where: {
          id: bookingId,
          userId: userId
        },
        include: {
          service: true,
          user: true
        }
      });

      return booking;
    } catch (error) {
      console.error('Error fetching booking:', error);
      throw new Error('Failed to fetch booking');
    }
  }

  async getUserBookings(userId: string): Promise<BookingWithDetails[]> {
    try {
      const bookings = await prisma.booking.findMany({
        where: {
          userId: userId
        },
        include: {
          service: true,
          user: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return bookings;
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      throw new Error('Failed to fetch user bookings');
    }
  }

  async updateBookingStatus(bookingId: string, status: string, paymentStatus: string): Promise<Booking> {
    try {
      const booking = await prisma.booking.update({
        where: {
          id: bookingId
        },
        data: {
          status,
          paymentStatus
        }
      });

      return booking;
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw new Error('Failed to update booking status');
    }
  }
} 