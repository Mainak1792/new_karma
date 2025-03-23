import { PrismaClient } from '@prisma/client'

// Use a single PrismaClient instance across the entire app
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Database connection error retry logic
const prismaClientSingleton = () => {
  console.log('Initializing PrismaClient with the following environment variables:');
  console.log('DATABASE_URL present:', !!process.env.DATABASE_URL);
  console.log('DIRECT_URL present:', !!process.env.DIRECT_URL);
  
  try {
    return new PrismaClient({
      log: ['error', 'warn'],
      datasources: {
        db: {
          url: process.env.DIRECT_URL || process.env.DATABASE_URL,
        },
      },
    });
  } catch (error) {
    console.error('Failed to initialize PrismaClient:', error);
    throw error;
  }
}

// Use existing client if available to avoid too many connections
export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

// Keep connection alive in production
if (process.env.NODE_ENV === 'production') {
  // Warm up the connection pool
  prisma.$connect()
    .then(() => console.log('Connected to the database'))
    .catch(e => console.error('Failed to connect to the database:', e))
}

// In development, set global prisma for hot reloading
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Handle connection in a way that doesn't block startup
export async function testDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('Database connection test successful');
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}