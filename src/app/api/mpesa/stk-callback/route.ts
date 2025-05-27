import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  console.log("M-Pesa STK Callback Received");
  try {
    const callbackData = await request.json();
    console.log("Callback Data:", JSON.stringify(callbackData, null, 2));

    const stkCallback = callbackData?.Body?.stkCallback;

    if (!stkCallback) {
      console.error("STK Callback data is missing or malformed");
      return NextResponse.json({ ResultCode: 1, ResultDesc: "Failed", ThirdPartyTransID: "" }, { status: 400 });
    }

    const merchantRequestID = stkCallback.MerchantRequestID;
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

    if (resultCode === 0) {
      const callbackMetadata = stkCallback.CallbackMetadata?.Item;
      let amount, mpesaReceiptNumber;

      if (callbackMetadata && Array.isArray(callbackMetadata)) {
        amount = callbackMetadata.find((item: any) => item.Name === 'Amount')?.Value;
        mpesaReceiptNumber = callbackMetadata.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;
      }

      await prisma.$transaction([
        prisma.booking.update({
          where: { id: booking.id },
          data: {
            paymentStatus: 'PAID',
            status: 'CONFIRMED',
          },
        }),
        prisma.transaction.create({
          data: {
            bookingId: booking.id,
            amount: Number(amount) || booking.service.price,
            currency: 'KES',
            paymentGateway: 'MPESA',
            gatewayTransactionId: mpesaReceiptNumber || checkoutRequestID,
            status: 'SUCCESS',
          },
        }),
      ]);

      console.log(`M-Pesa Payment SUCCESS for Booking ID ${booking.id}, CheckoutRequestID: ${checkoutRequestID}`);
    } else {
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          paymentStatus: 'FAILED',
        },
      });
      console.log(`M-Pesa Payment FAILED/CANCELLED for Booking ID ${booking.id}, CheckoutRequestID: ${checkoutRequestID}. ResultCode: ${resultCode}, Desc: ${resultDesc}`);
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted", ThirdPartyTransID: "" });

  } catch (error: any) {
    console.error("Error processing M-Pesa STK Callback:", error);
    return NextResponse.json({ ResultCode: 1, ResultDesc: "Failed", ThirdPartyTransID: "" }, { status: 500 });
  }
} 