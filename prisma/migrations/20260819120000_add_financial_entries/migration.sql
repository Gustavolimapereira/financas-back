CREATE TYPE "FinancialEntryOrigin" AS ENUM ('FILE', 'MANUAL');

CREATE TABLE "FinancialEntry" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "place" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "origin" "FinancialEntryOrigin" NOT NULL,
    "sourceFileName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinancialEntry_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "FinancialEntry_userId_createdAt_idx" ON "FinancialEntry"("userId", "createdAt");
CREATE INDEX "FinancialEntry_origin_idx" ON "FinancialEntry"("origin");

ALTER TABLE "FinancialEntry"
ADD CONSTRAINT "FinancialEntry_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
