-- CreateTable
CREATE TABLE "AIInteractionLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIInteractionLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AIInteractionLog_userId_idx" ON "AIInteractionLog"("userId");

-- CreateIndex
CREATE INDEX "AIInteractionLog_createdAt_idx" ON "AIInteractionLog"("createdAt");

-- AddForeignKey
ALTER TABLE "AIInteractionLog" ADD CONSTRAINT "AIInteractionLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
