import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { MpesaService } from '@/lib/services/mpesa';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { bookingId, phoneNumber } = body;

    if (!bookingId || !phoneNumber) {
      return NextResponse.json({ error: 'Booking ID and phone number are required' }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId, userId: session.user.id },
      include: { service: true },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found or access denied' }, { status: 404 });
    }
    if (booking.paymentStatus === 'PAID') {
      return NextResponse.json({ error: 'Booking already paid' }, { status: 400 });
    }

    const amount = Math.round(booking.service.price);
    if (amount < 1) {
      return NextResponse.json({ error: 'Amount must be at least 1 KES' }, { status: 400 });
    }

    const mpesaService = MpesaService.getInstance();
    const response = await mpesaService.initiateSTKPush(bookingId, phoneNumber, amount);

    if (response.CheckoutRequestID) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { gatewayCheckoutId: response.CheckoutRequestID },
      });
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error("Error initiating M-Pesa STK Push:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to initiate M-Pesa payment' },
      { status: 500 }
    );
  }
}