-- CreateTable
CREATE TABLE "group_product" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "create_Date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "group_name" TEXT NOT NULL DEFAULT '',
    "sku" TEXT[],
    "main_img_url" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "description" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "group_product_pkey" PRIMARY KEY ("id")
);
