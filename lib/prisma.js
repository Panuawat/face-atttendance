import { PrismaClient } from '@prisma/client';

// Create a singleton instance of PrismaClient for Prisma 7
const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
