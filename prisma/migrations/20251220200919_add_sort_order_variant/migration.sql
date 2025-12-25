/*
  Warnings:

  - You are about to drop the column `code` on the `variant_values` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_variant_values" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "value" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "variantFamilyId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "variant_values_variantFamilyId_fkey" FOREIGN KEY ("variantFamilyId") REFERENCES "variant_families" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_variant_values" ("createdAt", "id", "sortOrder", "updatedAt", "value", "variantFamilyId") SELECT "createdAt", "id", "sortOrder", "updatedAt", "value", "variantFamilyId" FROM "variant_values";
DROP TABLE "variant_values";
ALTER TABLE "new_variant_values" RENAME TO "variant_values";
CREATE UNIQUE INDEX "variant_values_variantFamilyId_value_key" ON "variant_values"("variantFamilyId", "value");
CREATE UNIQUE INDEX "variant_values_value_key" ON "variant_values"("value");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
