/*
  Warnings:

  - You are about to drop the column `poster` on the `Movie` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Actor" ADD COLUMN     "image" TEXT;

-- AlterTable
ALTER TABLE "Director" ADD COLUMN     "image" TEXT;

-- AlterTable
ALTER TABLE "Movie" DROP COLUMN "poster",
ADD COLUMN     "image" TEXT;
