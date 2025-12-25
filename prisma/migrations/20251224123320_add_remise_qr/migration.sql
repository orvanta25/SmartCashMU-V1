-- CreateTable
CREATE TABLE "remise_qr_configs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entrepriseId" TEXT NOT NULL,
    "pourcentage" REAL NOT NULL,
    "joursValidite" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "message" TEXT DEFAULT 'Revenez prochainement pour bénéficier d''une remise!',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "remise_qr_configs_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ticket_remise_qr" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "venteId" TEXT,
    "pourcentage" REAL NOT NULL,
    "dateExpiration" DATETIME NOT NULL,
    "dateUtilisation" DATETIME,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ticket_remise_qr_configId_fkey" FOREIGN KEY ("configId") REFERENCES "remise_qr_configs" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ticket_remise_qr_venteId_fkey" FOREIGN KEY ("venteId") REFERENCES "Vente" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "remise_qr_configs_entrepriseId_isActive_key" ON "remise_qr_configs"("entrepriseId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_remise_qr_code_key" ON "ticket_remise_qr"("code");

-- CreateIndex
CREATE INDEX "ticket_remise_qr_code_idx" ON "ticket_remise_qr"("code");

-- CreateIndex
CREATE INDEX "ticket_remise_qr_venteId_idx" ON "ticket_remise_qr"("venteId");

-- CreateIndex
CREATE INDEX "ticket_remise_qr_dateExpiration_idx" ON "ticket_remise_qr"("dateExpiration");

-- CreateIndex
CREATE INDEX "ticket_remise_qr_isUsed_idx" ON "ticket_remise_qr"("isUsed");
