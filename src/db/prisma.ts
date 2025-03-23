import { PrismaClient } from '@prisma/client'

// Use a single PrismaClient instance across the entire app
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['error', 'warn'],
})

// Keep connection alive in production
if (process.env.NODE_ENV === 'production') {
  // Prisma recommends not explicitly connecting/disconnecting in serverless
  // Let Prisma handle connections automatically
  console.log('Prisma client initialized in production mode')
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma