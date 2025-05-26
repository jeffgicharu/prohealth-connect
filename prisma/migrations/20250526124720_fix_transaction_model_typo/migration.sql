/*
  Warnings:

  - You are about to drop the column `gatewayTransactonId` on the `Transaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "gatewayTransactonId",
ADD COLUMN     "gatewayTransactionId" TEXT,
ALTER COLUMN "paymentGateway" SET DEFAULT 'STRIPE';
