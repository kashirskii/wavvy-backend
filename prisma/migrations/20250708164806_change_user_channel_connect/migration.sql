/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `Channel` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Channel_user_id_key" ON "Channel"("user_id");
