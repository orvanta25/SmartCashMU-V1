/*
  Warnings:

  - A unique constraint covering the columns `[codeBarre]` on the table `produits` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "produits_codeBarre_key" ON "produits"("codeBarre");
