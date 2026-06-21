-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Course_featured_idx" ON "Course"("featured");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");
