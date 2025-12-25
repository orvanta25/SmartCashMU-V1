/*
  Warnings:

  - You are about to drop the `Produit` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `variantFamilyId` on table `variant_values` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Produit_codeBarre_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Produit";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "produits" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codeBarre" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "parentId" TEXT,
    "categorieId" TEXT NOT NULL,
    "entrepriseId" TEXT NOT NULL,
    "puht" DECIMAL NOT NULL,
    "tva" DECIMAL NOT NULL DEFAULT 0,
    "remise" DECIMAL NOT NULL DEFAULT 0,
    "dateDebutRemise" DATETIME,
    "dateFinRemise" DATETIME,
    "stock" REAL NOT NULL DEFAULT 0,
    "stockSecurite" REAL,
    "featuredOnPos" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "isDefaultOperator" BOOLEAN NOT NULL DEFAULT false,
    "type" TEXT NOT NULL DEFAULT 'MAGASIN',
    "imagePath" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "produits_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "produits" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "produits_categorieId_fkey" FOREIGN KEY ("categorieId") REFERENCES "Categorie" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "produits_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Lot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quantite" REAL NOT NULL,
    "price" DECIMAL NOT NULL,
    "produitId" TEXT NOT NULL,
    CONSTRAINT "Lot_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "produits" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Lot" ("id", "price", "produitId", "quantite") SELECT "id", "price", "produitId", "quantite" FROM "Lot";
DROP TABLE "Lot";
ALTER TABLE "new_Lot" RENAME TO "Lot";
CREATE TABLE "new_MagasinProduit" (
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
    CONSTRAINT "MagasinProduit_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "produits" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MagasinProduit_magasinId_fkey" FOREIGN KEY ("magasinId") REFERENCES "Magasin" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MagasinProduit_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MagasinProduit" ("active", "createdAt", "entrepriseId", "id", "magasinId", "produitId", "quantite", "stockInitial", "stockSecurite", "updatedAt") SELECT "active", "createdAt", "entrepriseId", "id", "magasinId", "produitId", "quantite", "stockInitial", "stockSecurite", "updatedAt" FROM "MagasinProduit";
DROP TABLE "MagasinProduit";
ALTER TABLE "new_MagasinProduit" RENAME TO "MagasinProduit";
CREATE UNIQUE INDEX "MagasinProduit_produitId_magasinId_key" ON "MagasinProduit"("produitId", "magasinId");
CREATE TABLE "new_product_variants" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" TEXT NOT NULL,
    "sku" TEXT,
    "name" TEXT,
    "priceAdjustment" REAL NOT NULL DEFAULT 0,
    "costAdjustment" REAL NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "product_variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES "produits" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_product_variants" ("costAdjustment", "createdAt", "id", "isActive", "name", "priceAdjustment", "productId", "sku", "updatedAt") SELECT "costAdjustment", "createdAt", "id", "isActive", "name", "priceAdjustment", "productId", "sku", "updatedAt" FROM "product_variants";
DROP TABLE "product_variants";
ALTER TABLE "new_product_variants" RENAME TO "product_variants";
CREATE UNIQUE INDEX "product_variants_sku_key" ON "product_variants"("sku");
CREATE TABLE "new_variant_values" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "value" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "variantFamilyId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "variant_values_variantFamilyId_fkey" FOREIGN KEY ("variantFamilyId") REFERENCES "variant_families" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_variant_values" ("createdAt", "id", "sortOrder", "updatedAt", "value", "variantFamilyId") SELECT "createdAt", "id", "sortOrder", "updatedAt", "value", "variantFamilyId" FROM "variant_values";
DROP TABLE "variant_values";
ALTER TABLE "new_variant_values" RENAME TO "variant_values";
CREATE UNIQUE INDEX "variant_values_variantFamilyId_value_key" ON "variant_values"("variantFamilyId", "value");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "produits_codeBarre_key" ON "produits"("codeBarre");
