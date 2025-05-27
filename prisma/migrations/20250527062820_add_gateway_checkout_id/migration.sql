/*
  Warnings:

  - A unique constraint covering the columns `[gatewayCheckoutId]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "gatewayCheckoutId" TEXT;

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "paymentGateway" SET DEFAULT 'MPESA';

-- CreateIndex
CREATE UNIQUE INDEX "Booking_gatewayCheckoutId_key" ON "Booking"("gatewayCheckoutId");
