/*
  Warnings:

  - You are about to drop the column `prixVente` on the `produits` table. All the data in the column will be lost.
  - Added the required column `puht` to the `produits` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_produits" (
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
    "stockInitial" REAL NOT NULL,
    "quantite" REAL NOT NULL DEFAULT 1,
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
INSERT INTO "new_produits" ("active", "categorieId", "codeBarre", "createdAt", "dateDebutRemise", "dateFinRemise", "designation", "entrepriseId", "featuredOnPos", "id", "imagePath", "isDefaultOperator", "parentId", "quantite", "remise", "stockInitial", "stockSecurite", "tva", "type", "updatedAt") SELECT "active", "categorieId", "codeBarre", "createdAt", "dateDebutRemise", "dateFinRemise", "designation", "entrepriseId", "featuredOnPos", "id", "imagePath", "isDefaultOperator", "parentId", "quantite", "remise", "stockInitial", "stockSecurite", "tva", "type", "updatedAt" FROM "produits";
DROP TABLE "produits";
ALTER TABLE "new_produits" RENAME TO "produits";
CREATE UNIQUE INDEX "produits_codeBarre_key" ON "produits"("codeBarre");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
