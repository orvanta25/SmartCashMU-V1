-- CreateTable
CREATE TABLE "variant_families" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "code" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "variant_values" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "value" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "variantFamilyId" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "variant_values_variantFamilyId_fkey" FOREIGN KEY ("variantFamilyId") REFERENCES "variant_families" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "product_variants" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" TEXT NOT NULL,
    "sku" TEXT,
    "name" TEXT,
    "priceAdjustment" REAL NOT NULL DEFAULT 0,
    "costAdjustment" REAL NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "product_variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Produit" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "product_variant_stocks" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productVariantId" INTEGER NOT NULL,
    "magasinId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "minStock" INTEGER NOT NULL DEFAULT 0,
    "maxStock" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "product_variant_stocks_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "product_variants" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "product_variant_stocks_magasinId_fkey" FOREIGN KEY ("magasinId") REFERENCES "Magasin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_variant_values" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_variant_values_A_fkey" FOREIGN KEY ("A") REFERENCES "product_variants" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_variant_values_B_fkey" FOREIGN KEY ("B") REFERENCES "variant_values" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Produit" (
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
    "hasVariants" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Produit_categorieId_fkey" FOREIGN KEY ("categorieId") REFERENCES "Categorie" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Produit_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Produit" ("active", "categorieId", "codeBarre", "createdAt", "dateDebutRemise", "dateFinRemise", "designation", "entrepriseId", "featuredOnPos", "id", "imagePath", "isDefaultOperator", "puht", "quantite", "remise", "stockInitial", "stockSecurite", "tva", "type", "updatedAt") SELECT "active", "categorieId", "codeBarre", "createdAt", "dateDebutRemise", "dateFinRemise", "designation", "entrepriseId", "featuredOnPos", "id", "imagePath", "isDefaultOperator", "puht", "quantite", "remise", "stockInitial", "stockSecurite", "tva", "type", "updatedAt" FROM "Produit";
DROP TABLE "Produit";
ALTER TABLE "new_Produit" RENAME TO "Produit";
CREATE UNIQUE INDEX "Produit_codeBarre_key" ON "Produit"("codeBarre");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "variant_families_name_key" ON "variant_families"("name");

-- CreateIndex
CREATE UNIQUE INDEX "variant_families_code_key" ON "variant_families"("code");

-- CreateIndex
CREATE UNIQUE INDEX "variant_values_variantFamilyId_value_key" ON "variant_values"("variantFamilyId", "value");

-- CreateIndex
CREATE UNIQUE INDEX "variant_values_variantFamilyId_code_key" ON "variant_values"("variantFamilyId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_sku_key" ON "product_variants"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "product_variant_stocks_productVariantId_magasinId_key" ON "product_variant_stocks"("productVariantId", "magasinId");

-- CreateIndex
CREATE UNIQUE INDEX "_variant_values_AB_unique" ON "_variant_values"("A", "B");

-- CreateIndex
CREATE INDEX "_variant_values_B_index" ON "_variant_values"("B");
