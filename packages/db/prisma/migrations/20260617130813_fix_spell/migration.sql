/*
  Warnings:

  - The values [Merges] on the enum `OrderType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OrderType_new" AS ENUM ('Buy', 'Sell', 'Split', 'Merge');
ALTER TABLE "OrderHistory" ALTER COLUMN "orderType" TYPE "OrderType_new" USING ("orderType"::text::"OrderType_new");
ALTER TYPE "OrderType" RENAME TO "OrderType_old";
ALTER TYPE "OrderType_new" RENAME TO "OrderType";
DROP TYPE "public"."OrderType_old";
COMMIT;
