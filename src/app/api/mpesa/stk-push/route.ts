import { NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { getMpesaAccessToken } from '@/app/actions/mpesaActions';

const MPESA_STK_PUSH_URL = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

interface STKPushPayload {
  BusinessShortCode: string;
  Password: string;
  Timestamp: string;
  TransactionType: string;
  Amount: string;
  PartyA: string;
  PartyB: string;
  PhoneNumber: string;
  CallBackURL: string;
  AccountReference: string;
  TransactionDesc: string;
}

interface STKPushResponse {
  CheckoutRequestID?: string;
  MerchantRequestID?: string;
  ResponseCode?: string;
  ResponseDescription?: string;
  CustomerMessage?: string;
}

interface MpesaErrorResponse {
  errorMessage?: string;
  errorCode?: string;
}

function getTimestamp() {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

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

    const accessToken = await getMpesaAccessToken();
    if (!accessToken) {
      return NextResponse.json({ error: 'Failed to get M-Pesa access token' }, { status: 500 });
    }

    const shortCode = process.env.MPESA_SHORTCODE!;
    const passkey = process.env.MPESA_PASSKEY!;
    const timestamp = getTimestamp();
    const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');

    // Use MPESA_PUBLIC_BASE_URL for local development, NEXTAUTH_URL for production
    const publicBaseUrl = process.env.NODE_ENV === 'production'
      ? process.env.NEXTAUTH_URL
      : process.env.MPESA_PUBLIC_BASE_URL;
    
    const callBackURL = `${publicBaseUrl}/api/mpesa/stk-callback`;

    const payload: STKPushPayload = {
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: process.env.MPESA_TRANSACTION_TYPE!,
      Amount: amount.toString(),
      PartyA: phoneNumber,
      PartyB: shortCode,
      PhoneNumber: phoneNumber,
      CallBackURL: callBackURL,
      AccountReference: bookingId.substring(0, 12),
      TransactionDesc: `Payment for Booking ${bookingId.substring(0,10)}`,
    };

    const response = await axios.post<STKPushResponse>(MPESA_STK_PUSH_URL, payload, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.data && response.data.CheckoutRequestID) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { gatewayCheckoutId: response.data.CheckoutRequestID },
      });
    }

    return NextResponse.json(response.data);

  } catch (error) {
    const axiosError = error as AxiosError<MpesaErrorResponse>;
    const errorMessage = axiosError.response?.data?.errorMessage || axiosError.message || 'Unknown error occurred';
    
    console.error("Error initiating M-Pesa STK Push:", axiosError.response?.data || errorMessage);
    return NextResponse.json(
      { error: errorMessage || 'Failed to initiate M-Pesa payment' }, 
      { status: 500 }
    );
  }
}