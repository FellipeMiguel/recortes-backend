-- CreateEnum
CREATE TYPE "RecortesStatus" AS ENUM ('ATIVO', 'EXPIRADO', 'PENDENTE');

-- AlterTable
ALTER TABLE "Recorte" ADD COLUMN     "status" "RecortesStatus" NOT NULL DEFAULT 'ATIVO';
