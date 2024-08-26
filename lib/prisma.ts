import { PrismaClient } from '@prisma/client'

/**
 * 1. PrismaClient is used to connect to the database.
 * 2. The globalForPrisma is used to store the PrismaClient instance in the global scope.
 * 3. The prisma instance is used to connect to the database.
 */
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma