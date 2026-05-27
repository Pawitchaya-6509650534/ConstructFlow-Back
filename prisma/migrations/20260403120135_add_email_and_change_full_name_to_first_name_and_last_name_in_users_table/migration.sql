/*
  Warnings:

  - You are about to drop the column `full_name` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[project_id,engineer_id,date]` on the table `daily_updates` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "full_name",
ADD COLUMN     "email" VARCHAR NOT NULL,
ADD COLUMN     "first_name" VARCHAR,
ADD COLUMN     "last_name" VARCHAR,
ADD COLUMN     "refresh_token" VARCHAR;

-- CreateIndex
CREATE UNIQUE INDEX "daily_updates_project_id_engineer_id_date_key" ON "daily_updates"("project_id", "engineer_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
