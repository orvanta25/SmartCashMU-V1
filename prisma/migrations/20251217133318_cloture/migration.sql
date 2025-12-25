-- CreateTable
CREATE TABLE "ClotureJour" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dateFermeture" DATETIME NOT NULL,
    "heureFermeture" TEXT,
    "caissierResponsable" TEXT NOT NULL,
    "chiffreAffaires" REAL NOT NULL DEFAULT 0,
    "totalEncaissements" REAL NOT NULL DEFAULT 0,
    "totalAchat" REAL NOT NULL DEFAULT 0,
    "totalCharge" REAL NOT NULL DEFAULT 0,
    "totalAcc" REAL NOT NULL DEFAULT 0,
    "totalRemises" REAL NOT NULL DEFAULT 0,
    "totalRetours" REAL NOT NULL DEFAULT 0,
    "totalNet" REAL NOT NULL DEFAULT 0,
    "nombreVentes" INTEGER NOT NULL DEFAULT 0,
    "tvaCollecte" REAL NOT NULL DEFAULT 0,
    "fondCaisseInitial" REAL NOT NULL DEFAULT 0,
    "totalEspecesEncaissées" REAL NOT NULL DEFAULT 0,
    "totalEspecesSorties" REAL NOT NULL DEFAULT 0,
    "totalEspecesEntree" REAL NOT NULL DEFAULT 0,
    "totalEspecesFinalAttendu" REAL NOT NULL DEFAULT 0,
    "statut" TEXT NOT NULL DEFAULT 'TERMINEE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "VenteCaissierCloture" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clotureId" INTEGER NOT NULL,
    "nomCaissier" TEXT NOT NULL,
    "nombreVentes" INTEGER NOT NULL DEFAULT 0,
    "montantTotal" REAL NOT NULL DEFAULT 0,
    "totalRetours" REAL NOT NULL DEFAULT 0,
    "fondCaisse" REAL NOT NULL DEFAULT 0,
    "totalRemises" REAL NOT NULL DEFAULT 0,
    "totalNet" REAL NOT NULL DEFAULT 0,
    "totalEncaissements" REAL NOT NULL DEFAULT 0,
    "paiementsEspeces" REAL NOT NULL DEFAULT 0,
    "paiementsCarte" REAL NOT NULL DEFAULT 0,
    "paiementsCheque" REAL NOT NULL DEFAULT 0,
    "paiementsTicket" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "VenteCaissierCloture_clotureId_fkey" FOREIGN KEY ("clotureId") REFERENCES "ClotureJour" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DetailPaiementCloture" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clotureId" INTEGER NOT NULL,
    "typePaiement" TEXT NOT NULL,
    "montant" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "DetailPaiementCloture_clotureId_fkey" FOREIGN KEY ("clotureId") REFERENCES "ClotureJour" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
    CONSTRAINT "Vente_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "Commande" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Vente_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Vente_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Vente" ("codeBarre", "commandeId", "createdAt", "designation", "entrepriseId", "id", "puht", "quantite", "remise", "retourQuantite", "totalHT", "totalTTC", "tva", "updatedAt", "userId") SELECT "codeBarre", "commandeId", "createdAt", "designation", "entrepriseId", "id", "puht", "quantite", "remise", "retourQuantite", "totalHT", "totalTTC", "tva", "updatedAt", "userId" FROM "Vente";
DROP TABLE "Vente";
ALTER TABLE "new_Vente" RENAME TO "Vente";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "ClotureJour_dateFermeture_idx" ON "ClotureJour"("dateFermeture");

-- CreateIndex
CREATE INDEX "ClotureJour_caissierResponsable_idx" ON "ClotureJour"("caissierResponsable");

-- CreateIndex
CREATE INDEX "VenteCaissierCloture_clotureId_idx" ON "VenteCaissierCloture"("clotureId");

-- CreateIndex
CREATE INDEX "VenteCaissierCloture_nomCaissier_idx" ON "VenteCaissierCloture"("nomCaissier");

-- CreateIndex
CREATE INDEX "DetailPaiementCloture_clotureId_idx" ON "DetailPaiementCloture"("clotureId");

-- CreateIndex
CREATE INDEX "DetailPaiementCloture_typePaiement_idx" ON "DetailPaiementCloture"("typePaiement");
