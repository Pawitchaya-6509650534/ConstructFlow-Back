/*
  Warnings:

  - A unique constraint covering the columns `[project_id,date]` on the table `daily_updates` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "daily_updates_project_id_engineer_id_date_key";

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "budget_total" DECIMAL NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "daily_updates_project_id_date_key" ON "daily_updates"("project_id", "date");
