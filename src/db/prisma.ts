import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['error', 'warn'],
  errorFormat: 'pretty',
})

// Connect to the database on startup to detect issues early
if (process.env.NODE_ENV === 'production') {
  prisma.$connect()
    .then(() => {
      console.log('Successfully connected to the database');
      // Verify we can query the database
      return prisma.$queryRaw`SELECT 1`;
    })
    .then(() => console.log('Database connection verified'))
    .catch((e) => {
      console.error('Failed to connect to the database:', {
        error: e.message,
        code: e.code,
        meta: e.meta,
        timestamp: new Date().toISOString()
      });
      // Don't exit the process as it would crash the server
    })
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma