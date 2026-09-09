CREATE TYPE "FinancialEntryType" AS ENUM ('ENTRADA', 'SAIDA');

ALTER TABLE "FinancialEntry"
ADD COLUMN "type" "FinancialEntryType" NOT NULL DEFAULT 'SAIDA';

CREATE INDEX "FinancialEntry_userId_referenceMonth_type_idx"
ON "FinancialEntry"("userId", "referenceMonth", "type");
