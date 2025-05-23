-- CreateTable
CREATE TABLE "Recorte" (
    "id" SERIAL NOT NULL,
    "sku" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "cutType" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "productType" TEXT NOT NULL,
    "material" TEXT NOT NULL,
    "materialColor" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recorte_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Recorte_sku_key" ON "Recorte"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Recorte_modelName_key" ON "Recorte"("modelName");
