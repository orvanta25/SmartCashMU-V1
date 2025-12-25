-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT,
    "prenom" TEXT,
    "telephone" TEXT,
    "pin" TEXT NOT NULL DEFAULT '0000',
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "magasinId" TEXT,
    "fondcaisse" DECIMAL,
    "email" TEXT,
    "entrepriseId" TEXT,
    "isBootstrap" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "permissions" TEXT NOT NULL DEFAULT '',
    "isDefaultAdmin" BOOLEAN DEFAULT false,
    CONSTRAINT "User_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_magasinId_fkey" FOREIGN KEY ("magasinId") REFERENCES "Magasin" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Entreprise" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT,
    "denomination" TEXT,
    "matriculeFiscale" TEXT,
    "adresse" TEXT,
    "telephone" TEXT,
    "logo" TEXT,
    "email" TEXT,
    "region" TEXT,
    "ville" TEXT,
    "pays" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'FOURNISSEUR',
    "hasEpicerieModule" BOOLEAN NOT NULL DEFAULT false,
    "hasRestaurantModule" BOOLEAN NOT NULL DEFAULT false,
    "secteurActivite" TEXT
);

-- CreateTable
CREATE TABLE "Categorie" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "showInPos" BOOLEAN NOT NULL DEFAULT false,
    "isDefaultOperator" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,
    "entrepriseId" TEXT NOT NULL,
    CONSTRAINT "Categorie_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Categorie_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Categorie_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Lot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quantite" REAL NOT NULL,
    "price" DECIMAL NOT NULL,
    "produitId" TEXT NOT NULL,
    CONSTRAINT "Lot_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "Produit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Produit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codeBarre" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "categorieId" TEXT NOT NULL,
    "entrepriseId" TEXT NOT NULL,
    "puht" DECIMAL NOT NULL,
    "tva" DECIMAL NOT NULL DEFAULT 0,
    "remise" DECIMAL NOT NULL DEFAULT 0,
    "dateDebutRemise" DATETIME,
    "dateFinRemise" DATETIME,
    "stockInitial" REAL NOT NULL,
    "quantite" REAL NOT NULL DEFAULT 1,
    "featuredOnPos" BOOLEAN NOT NULL DEFAULT false,
    "stockSecurite" REAL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "isDefaultOperator" BOOLEAN NOT NULL DEFAULT false,
    "type" TEXT NOT NULL DEFAULT 'MAGASIN',
    "imagePath" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Produit_categorieId_fkey" FOREIGN KEY ("categorieId") REFERENCES "Categorie" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Produit_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Magasin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "adresse" TEXT,
    "secteurActivite" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "ville" TEXT NOT NULL,
    "pays" TEXT NOT NULL,
    "responsableId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "entrepriseId" TEXT,
    CONSTRAINT "Magasin_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Magasin_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MagasinProduit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "produitId" TEXT NOT NULL,
    "magasinId" TEXT NOT NULL,
    "quantite" REAL NOT NULL,
    "stockInitial" REAL NOT NULL,
    "stockSecurite" REAL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "entrepriseId" TEXT NOT NULL,
    CONSTRAINT "MagasinProduit_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "Produit" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MagasinProduit_magasinId_fkey" FOREIGN KEY ("magasinId") REFERENCES "Magasin" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MagasinProduit_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Inventaire" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codeBarre" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "quantite" REAL NOT NULL,
    "responsable" TEXT NOT NULL,
    "entrepriseId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Inventaire_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Acc" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codeBarre" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "quantite" REAL NOT NULL,
    "responsable" TEXT NOT NULL,
    "remarque" TEXT,
    "entrepriseId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Acc_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MouvementStock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "codeBarre" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "stockInitial" REAL NOT NULL,
    "stockSecurite" REAL,
    "achats" REAL NOT NULL,
    "ventes" REAL NOT NULL,
    "acc" REAL NOT NULL,
    "retour" REAL NOT NULL DEFAULT 0,
    "stockFinalTheoric" REAL NOT NULL,
    "stockFinalReal" REAL,
    "ecart" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "entrepriseId" TEXT NOT NULL,
    CONSTRAINT "MouvementStock_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TypeCharge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "entrepriseId" TEXT NOT NULL,
    CONSTRAINT "TypeCharge_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Charge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "typeChargeId" TEXT NOT NULL,
    "montant" DECIMAL NOT NULL,
    "dateEcheance" DATETIME NOT NULL,
    "datePaiement" DATETIME,
    "dateDebutRepartition" DATETIME NOT NULL,
    "dateFinRepartition" DATETIME NOT NULL,
    "paye" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "entrepriseId" TEXT NOT NULL,
    CONSTRAINT "Charge_typeChargeId_fkey" FOREIGN KEY ("typeChargeId") REFERENCES "TypeCharge" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Charge_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Facture" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "num" TEXT NOT NULL,
    "dateEmission" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateEcheance" DATETIME NOT NULL,
    "denominationClient" TEXT NOT NULL,
    "matriculeFiscaleClient" TEXT,
    "adresseClient" TEXT NOT NULL,
    "clientTelephone" TEXT,
    "totalHT" DECIMAL NOT NULL,
    "totalTVA" DECIMAL NOT NULL,
    "timbreFiscal" DECIMAL,
    "remise" DECIMAL DEFAULT 0,
    "totalNet" DECIMAL NOT NULL,
    "denomination" TEXT NOT NULL,
    "matriculeFiscale" TEXT NOT NULL,
    "banque" TEXT NOT NULL,
    "rib" TEXT NOT NULL,
    "logo" TEXT,
    "entrepriseId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Facture_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VentesFacture" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "factureId" TEXT NOT NULL,
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
    "entrepriseId" TEXT NOT NULL,
    CONSTRAINT "VentesFacture_factureId_fkey" FOREIGN KEY ("factureId") REFERENCES "Facture" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VentesFacture_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AchatFournisseur" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numeroFacture" TEXT NOT NULL,
    "fournisseur" TEXT NOT NULL,
    "dateEcheance" DATETIME NOT NULL,
    "datePaiement" DATETIME,
    "pieceJointe" TEXT,
    "montantTotal" DECIMAL NOT NULL,
    "montantComptant" DECIMAL,
    "montantRestant" DECIMAL,
    "remise" DECIMAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "entrepriseId" TEXT NOT NULL,
    CONSTRAINT "AchatFournisseur_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Entree" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codeBarre" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "quantite" REAL NOT NULL,
    "puht" DECIMAL NOT NULL,
    "tva" DECIMAL NOT NULL,
    "prixUnitaireTTC" DECIMAL NOT NULL,
    "prixTotalTTC" DECIMAL NOT NULL,
    "achatFournisseurId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "entrepriseId" TEXT NOT NULL,
    CONSTRAINT "Entree_achatFournisseurId_fkey" FOREIGN KEY ("achatFournisseurId") REFERENCES "AchatFournisseur" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Entree_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MyFacture" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "denomination" TEXT NOT NULL,
    "matriculeFiscale" TEXT NOT NULL,
    "banque" TEXT NOT NULL,
    "rib" TEXT NOT NULL,
    "logo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "entrepriseId" TEXT NOT NULL,
    CONSTRAINT "MyFacture_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MyFactureAdresse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adresse" TEXT NOT NULL,
    "myFactureId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "entrepriseId" TEXT NOT NULL,
    CONSTRAINT "MyFactureAdresse_myFactureId_fkey" FOREIGN KEY ("myFactureId") REFERENCES "MyFacture" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MyFactureAdresse_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MyFactureEmail" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "myFactureId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "entrepriseId" TEXT NOT NULL,
    CONSTRAINT "MyFactureEmail_myFactureId_fkey" FOREIGN KEY ("myFactureId") REFERENCES "MyFacture" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MyFactureEmail_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MyFactureTelephone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numTel" TEXT NOT NULL,
    "myFactureId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "entrepriseId" TEXT NOT NULL,
    CONSTRAINT "MyFactureTelephone_myFactureId_fkey" FOREIGN KEY ("myFactureId") REFERENCES "MyFacture" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MyFactureTelephone_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MyFactureMobile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numMobile" TEXT NOT NULL,
    "myFactureId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "entrepriseId" TEXT NOT NULL,
    CONSTRAINT "MyFactureMobile_myFactureId_fkey" FOREIGN KEY ("myFactureId") REFERENCES "MyFacture" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MyFactureMobile_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BalanceConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "barcodeLength" INTEGER NOT NULL,
    "balanceCode" TEXT NOT NULL,
    "productCodeStart" INTEGER NOT NULL,
    "productCodeLength" INTEGER NOT NULL,
    "priceStart" INTEGER NOT NULL,
    "priceLength" INTEGER NOT NULL,
    "sellerStart" INTEGER,
    "sellerLength" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "entrepriseId" TEXT NOT NULL,
    CONSTRAINT "BalanceConfig_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Printer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "entrepriseId" TEXT NOT NULL,
    CONSTRAINT "Printer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Printer_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Commande" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total" DECIMAL NOT NULL,
    "userId" TEXT NOT NULL,
    "isWaiting" BOOLEAN NOT NULL DEFAULT false,
    "tpeAmount" DECIMAL NOT NULL DEFAULT 0.000,
    "especeAmount" DECIMAL NOT NULL DEFAULT 0.000,
    "ticketAmount" DECIMAL NOT NULL DEFAULT 0.000,
    "ticketNumber" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tableId" TEXT,
    "remise" DECIMAL DEFAULT 0,
    "chequeAmount" DECIMAL NOT NULL DEFAULT 0.000,
    "entrepriseId" TEXT NOT NULL,
    "annule" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Commande_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Commande_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Commande_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Vente" (
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
    "userId" TEXT,
    CONSTRAINT "Vente_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "Commande" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Vente_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Vente_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Retour" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "commandeId" TEXT NOT NULL,
    "totalRetour" REAL NOT NULL,
    "entrepriseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Retour_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "Commande" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Retour_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Retour_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RetourLigne" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "venteId" TEXT NOT NULL,
    "quantite" REAL NOT NULL,
    "montant" DECIMAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entrepriseId" TEXT NOT NULL,
    "retourId" TEXT,
    CONSTRAINT "RetourLigne_venteId_fkey" FOREIGN KEY ("venteId") REFERENCES "Vente" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RetourLigne_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RetourLigne_retourId_fkey" FOREIGN KEY ("retourId") REFERENCES "Retour" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Table" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" TEXT NOT NULL,
    "serverId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "floorPlanId" TEXT,
    "entrepriseId" TEXT NOT NULL,
    CONSTRAINT "Table_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Table_floorPlanId_fkey" FOREIGN KEY ("floorPlanId") REFERENCES "FloorPlan" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Table_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FloorPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "elements" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "entrepriseId" TEXT NOT NULL,
    CONSTRAINT "FloorPlan_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TicketResto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fournisseur" TEXT NOT NULL,
    "codeInterne" TEXT NOT NULL,
    "pourcentage" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "entrepriseId" TEXT NOT NULL,
    CONSTRAINT "TicketResto_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UsedTicketResto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codeBarre" TEXT NOT NULL,
    "entrepriseId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    CONSTRAINT "UsedTicketResto_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UsedTicketResto_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Fournisseur" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mails" TEXT NOT NULL,
    "fixedTel" TEXT NOT NULL,
    "mobileTel" TEXT NOT NULL,
    "denomination" TEXT NOT NULL,
    "matricule" TEXT NOT NULL,
    "secteur" TEXT NOT NULL,
    "rib" TEXT NOT NULL,
    "addresses" TEXT NOT NULL,
    "entrepriseId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Fournisseur_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "cin" INTEGER NOT NULL,
    "email" TEXT,
    "address" TEXT,
    "tel" TEXT NOT NULL,
    "credit" REAL NOT NULL DEFAULT 0,
    "entrepriseId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Client_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_pin_key" ON "User"("pin");

-- CreateIndex
CREATE UNIQUE INDEX "Categorie_nom_key" ON "Categorie"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "Produit_codeBarre_key" ON "Produit"("codeBarre");

-- CreateIndex
CREATE UNIQUE INDEX "Magasin_nom_key" ON "Magasin"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "MagasinProduit_produitId_magasinId_key" ON "MagasinProduit"("produitId", "magasinId");

-- CreateIndex
CREATE UNIQUE INDEX "MouvementStock_date_codeBarre_key" ON "MouvementStock"("date", "codeBarre");

-- CreateIndex
CREATE UNIQUE INDEX "TypeCharge_nom_key" ON "TypeCharge"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "UniqueFactureNum" ON "Facture"("num");

-- CreateIndex
CREATE UNIQUE INDEX "MyFacture_denomination_key" ON "MyFacture"("denomination");

-- CreateIndex
CREATE UNIQUE INDEX "MyFactureAdresse_adresse_myFactureId_key" ON "MyFactureAdresse"("adresse", "myFactureId");

-- CreateIndex
CREATE UNIQUE INDEX "MyFactureEmail_email_myFactureId_key" ON "MyFactureEmail"("email", "myFactureId");

-- CreateIndex
CREATE UNIQUE INDEX "MyFactureTelephone_numTel_myFactureId_key" ON "MyFactureTelephone"("numTel", "myFactureId");

-- CreateIndex
CREATE UNIQUE INDEX "MyFactureMobile_numMobile_myFactureId_key" ON "MyFactureMobile"("numMobile", "myFactureId");

-- CreateIndex
CREATE UNIQUE INDEX "Printer_userId_key" ON "Printer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Printer_name_key" ON "Printer"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Commande_ticketNumber_key" ON "Commande"("ticketNumber");

-- CreateIndex
CREATE INDEX "Retour_commandeId_idx" ON "Retour"("commandeId");

-- CreateIndex
CREATE INDEX "Retour_entrepriseId_idx" ON "Retour"("entrepriseId");

-- CreateIndex
CREATE INDEX "Retour_userId_idx" ON "Retour"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Table_number_key" ON "Table"("number");

-- CreateIndex
CREATE UNIQUE INDEX "FloorPlan_name_key" ON "FloorPlan"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TicketResto_codeInterne_key" ON "TicketResto"("codeInterne");

-- CreateIndex
CREATE UNIQUE INDEX "UsedTicketResto_codeBarre_key" ON "UsedTicketResto"("codeBarre");

-- CreateIndex
CREATE UNIQUE INDEX "Fournisseur_denomination_key" ON "Fournisseur"("denomination");

-- CreateIndex
CREATE UNIQUE INDEX "Client_tel_key" ON "Client"("tel");
