-- AlterTable
ALTER TABLE "User" ADD COLUMN "planEndDate" DATETIME;
ALTER TABLE "User" ADD COLUMN "planStartDate" DATETIME;

-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "PlanLimit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "plan" TEXT NOT NULL,
    "maxLinks" INTEGER NOT NULL,
    "linkDurationHours" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Case" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT,
    "memo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" DATETIME,
    "isExpired" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,
    CONSTRAINT "Case_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Case" ("createdAt", "expiryDate", "id", "memo", "title", "userId") SELECT "createdAt", "expiryDate", "id", "memo", "title", "userId" FROM "Case";
DROP TABLE "Case";
ALTER TABLE "new_Case" RENAME TO "Case";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Setting_key_key" ON "Setting"("key");

-- CreateIndex
CREATE UNIQUE INDEX "PlanLimit_plan_key" ON "PlanLimit"("plan");
