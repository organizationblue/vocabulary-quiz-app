-- AlterTable
ALTER TABLE "User"
ADD COLUMN "username" TEXT,
ADD COLUMN "displayName" TEXT,
ADD COLUMN "passwordHash" TEXT;

-- Backfill display names for existing nickname-based users
UPDATE "User"
SET "displayName" = "nickname"
WHERE "displayName" IS NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
