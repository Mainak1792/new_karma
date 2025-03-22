import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
})

// Connect to the database on startup to detect issues early
if (process.env.NODE_ENV === 'production') {
  prisma.$connect()
    .then(() => console.log('Successfully connected to the database'))
    .catch((e) => {
      console.error('Failed to connect to the database:', e)
      // Don't exit the process as it would crash the server
    })
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma