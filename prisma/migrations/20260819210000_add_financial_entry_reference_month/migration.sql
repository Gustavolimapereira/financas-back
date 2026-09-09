-- Existing entries use the import date and do not have a trustworthy reference month.
-- The user explicitly authorized clearing only the financial entries table.
TRUNCATE TABLE "FinancialEntry";

ALTER TABLE "FinancialEntry"
ADD COLUMN "referenceMonth" DATE NOT NULL;

CREATE INDEX "FinancialEntry_userId_referenceMonth_idx"
ON "FinancialEntry"("userId", "referenceMonth");
