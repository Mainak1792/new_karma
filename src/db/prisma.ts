import { PrismaClient } from '@prisma/client'

// Use a single PrismaClient instance across the entire app
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Initialize client with native connection pooling
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['error', 'warn'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

// Keep connection alive in production
if (process.env.NODE_ENV === 'production') {
  // Warm up the connection pool
  prisma.$connect()
    .then(() => console.log('Connected to the database'))
    .catch(e => console.error('Failed to connect to the database:', e))
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma