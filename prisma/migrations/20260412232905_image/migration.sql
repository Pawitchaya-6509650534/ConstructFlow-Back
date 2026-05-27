/*
  Warnings:

  - You are about to drop the column `image_url` on the `checkpoint_logs` table. All the data in the column will be lost.
  - You are about to drop the column `image_url` on the `daily_updates` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "checkpoint_logs" DROP COLUMN "image_url";

-- AlterTable
ALTER TABLE "daily_updates" DROP COLUMN "image_url";

-- CreateTable
CREATE TABLE "checkpoint_log_images" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "log_id" UUID NOT NULL,
    "url" VARCHAR NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,

    CONSTRAINT "checkpoint_log_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_update_images" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "daily_update_id" UUID NOT NULL,
    "url" VARCHAR NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,

    CONSTRAINT "daily_update_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_documents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "expense_request_id" UUID NOT NULL,
    "name" VARCHAR NOT NULL,
    "url" VARCHAR NOT NULL,
    "size" VARCHAR,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,

    CONSTRAINT "expense_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_images" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "expense_request_id" UUID NOT NULL,
    "url" VARCHAR NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,

    CONSTRAINT "expense_images_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "checkpoint_log_images" ADD CONSTRAINT "checkpoint_log_images_log_id_fkey" FOREIGN KEY ("log_id") REFERENCES "checkpoint_logs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_update_images" ADD CONSTRAINT "daily_update_images_daily_update_id_fkey" FOREIGN KEY ("daily_update_id") REFERENCES "daily_updates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_documents" ADD CONSTRAINT "expense_documents_expense_request_id_fkey" FOREIGN KEY ("expense_request_id") REFERENCES "expense_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_images" ADD CONSTRAINT "expense_images_expense_request_id_fkey" FOREIGN KEY ("expense_request_id") REFERENCES "expense_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
