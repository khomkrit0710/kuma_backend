/*
  Warnings:

  - The primary key for the `product` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `product_set` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `product_type` on the `product` table. All the data in the column will be lost.
  - The required column `uuid` was added to the `product` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "product" DROP CONSTRAINT "product_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "name",
DROP COLUMN "price",
DROP COLUMN "product_set",
DROP COLUMN "product_type",
ADD COLUMN     "catagory" TEXT,
ADD COLUMN     "collaction" TEXT,
ADD COLUMN     "create_Date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "group_name" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "img_url" TEXT,
ADD COLUMN     "make_price" INTEGER,
ADD COLUMN     "name_sku" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "price_origin" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "product_heigth" INTEGER,
ADD COLUMN     "product_length" INTEGER,
ADD COLUMN     "product_weight" INTEGER,
ADD COLUMN     "product_width" INTEGER,
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "uuid" TEXT NOT NULL,
ALTER COLUMN "sku" SET DEFAULT '',
ADD CONSTRAINT "product_pkey" PRIMARY KEY ("id", "sku");
