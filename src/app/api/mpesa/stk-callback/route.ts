import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { BookingService } from '@/lib/services/booking';

interface CallbackMetadataItem {
  Name: string;
  Value: string | number;
}

interface STKCallback {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResultCode: number;
  ResultDesc: string;
  CallbackMetadata?: {
    Item: CallbackMetadataItem[];
  };
}

interface CallbackData {
  Body?: {
    stkCallback: STKCallback;
  };
}

export async function POST(request: Request) {
  console.log("M-Pesa STK Callback Received");
  try {
    const callbackData: CallbackData = await request.json();
    console.log("Callback Data:", JSON.stringify(callbackData, null, 2));

    const stkCallback = callbackData?.Body?.stkCallback;

    if (!stkCallback) {
      console.error("STK Callback data is missing or malformed");
      return NextResponse.json({ ResultCode: 1, ResultDesc: "Failed", ThirdPartyTransID: "" }, { status: 400 });
    }

    const checkoutRequestID = stkCallback.CheckoutRequestID;
    const resultCode = stkCallback.ResultCode;
    const resultDesc = stkCallback.ResultDesc;

    const booking = await prisma.booking.findUnique({
      where: { gatewayCheckoutId: checkoutRequestID },
      include: { service: true }
    });

    if (!booking) {
      console.error(`Booking not found for CheckoutRequestID: ${checkoutRequestID}`);
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted", ThirdPartyTransID: "" });
    }

    if (booking.paymentStatus === 'PAID') {
      console.log(`Booking ${booking.id} already marked as PAID. Ignoring callback.`);
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted", ThirdPartyTransID: "" });
    }

    const bookingService = BookingService.getInstance();

    if (resultCode === 0) {
      const callbackMetadata = stkCallback.CallbackMetadata?.Item;
      let amount: number | undefined;
      let mpesaReceiptNumber: string | undefined;

      if (callbackMetadata && Array.isArray(callbackMetadata)) {
        const amountItem = callbackMetadata.find((item: CallbackMetadataItem) => item.Name === 'Amount');
        const receiptItem = callbackMetadata.find((item: CallbackMetadataItem) => item.Name === 'MpesaReceiptNumber');
        
        amount = amountItem ? Number(amountItem.Value) : undefined;
        mpesaReceiptNumber = receiptItem ? String(receiptItem.Value) : undefined;
      }

      await prisma.$transaction(async (tx) => {
        await bookingService.updateBookingStatus(booking.id, 'CONFIRMED', 'PAID');
        await tx.transaction.create({
          data: {
            bookingId: booking.id,
            amount: amount || booking.service.price,
            currency: 'KES',
            paymentGateway: 'MPESA',
            gatewayTransactionId: mpesaReceiptNumber || checkoutRequestID,
            status: 'SUCCESS',
          },
        });
      });

      console.log(`M-Pesa Payment SUCCESS for Booking ID ${booking.id}, CheckoutRequestID: ${checkoutRequestID}`);
    } else {
      await bookingService.updateBookingStatus(booking.id, booking.status, 'FAILED');
      console.log(`M-Pesa Payment FAILED/CANCELLED for Booking ID ${booking.id}, CheckoutRequestID: ${checkoutRequestID}. ResultCode: ${resultCode}, Desc: ${resultDesc}`);
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted", ThirdPartyTransID: "" });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error("Error processing M-Pesa STK Callback:", errorMessage);
    return NextResponse.json({ ResultCode: 1, ResultDesc: "Failed", ThirdPartyTransID: "" }, { status: 500 });
  }
}