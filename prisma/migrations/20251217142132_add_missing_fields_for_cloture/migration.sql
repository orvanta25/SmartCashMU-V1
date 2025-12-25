-- CreateTable
CREATE TABLE "Paiement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "montant" DECIMAL NOT NULL,
    "venteId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Paiement_venteId_fkey" FOREIGN KEY ("venteId") REFERENCES "Vente" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Vente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codeBarre" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "puht" DECIMAL NOT NULL,
    "tva" DECIMAL NOT NULL DEFAULT 0,
    "remise" DECIMAL NOT NULL DEFAULT 0,
    "quantite" REAL NOT NULL,
    "totalHT" DECIMAL NOT NULL,
    "totalTTC" DECIMAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "commandeId" TEXT NOT NULL,
    "entrepriseId" TEXT NOT NULL,
    "retourQuantite" REAL NOT NULL DEFAULT 0,
    "cloturee" BOOLEAN NOT NULL DEFAULT false,
    "clotureId" INTEGER,
    "userId" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'PAYEE',
    "caissier" TEXT,
    CONSTRAINT "Vente_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "Commande" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Vente_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Vente_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Vente" ("clotureId", "cloturee", "codeBarre", "commandeId", "createdAt", "designation", "entrepriseId", "id", "puht", "quantite", "remise", "retourQuantite", "totalHT", "totalTTC", "tva", "updatedAt", "userId") SELECT "clotureId", "cloturee", "codeBarre", "commandeId", "createdAt", "designation", "entrepriseId", "id", "puht", "quantite", "remise", "retourQuantite", "totalHT", "totalTTC", "tva", "updatedAt", "userId" FROM "Vente";
DROP TABLE "Vente";
ALTER TABLE "new_Vente" RENAME TO "Vente";
CREATE INDEX "Vente_caissier_idx" ON "Vente"("caissier");
CREATE INDEX "Vente_statut_idx" ON "Vente"("statut");
CREATE INDEX "Vente_createdAt_idx" ON "Vente"("createdAt");
CREATE INDEX "Vente_cloturee_idx" ON "Vente"("cloturee");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Paiement_venteId_idx" ON "Paiement"("venteId");

-- CreateIndex
CREATE INDEX "Paiement_type_idx" ON "Paiement"("type");
