-- CreateTable
CREATE TABLE "ReviewAccess" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "surveyId" INTEGER NOT NULL,
    "password" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ReviewAccess_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ReviewAccess_surveyId_idx" ON "ReviewAccess"("surveyId");

-- CreateIndex
CREATE INDEX "ReviewAccess_expiresAt_idx" ON "ReviewAccess"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewAccess_surveyId_key" ON "ReviewAccess"("surveyId");
