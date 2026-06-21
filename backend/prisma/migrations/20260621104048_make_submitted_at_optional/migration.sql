-- AlterTable
ALTER TABLE "Assignment" ALTER COLUMN "submittedAt" DROP NOT NULL,
ALTER COLUMN "submittedAt" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "Assignment_submittedAt_idx" ON "Assignment"("submittedAt");
