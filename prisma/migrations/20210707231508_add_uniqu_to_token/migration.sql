/*
  Warnings:

  - The migration will add a unique constraint covering the columns `[token]` on the table `ClientSignupToken`. If there are existing duplicate values, the migration will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `ClientSignupToken.token_unique` ON `ClientSignupToken`(`token`);
