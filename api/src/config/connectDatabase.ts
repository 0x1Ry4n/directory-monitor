import { PrismaClient } from "@prisma/client";
import { logger } from "./logger";

export class Prisma {
    public static Prisma: PrismaClient; 

    static getPrisma() {
        this.Prisma ||= new PrismaClient();

        return this.Prisma;
    }

    static async connectPrisma() {
        await this.Prisma.$connect();
    }

    static async disconnectPrisma() {
        await this.Prisma.$disconnect();
    }
}