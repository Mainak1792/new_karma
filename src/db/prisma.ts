import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'error', 'warn'],
  errorFormat: 'pretty',
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  // Add connection management for serverless
  connection: {
    pool: {
      min: 0,
      max: 1
    }
  }
})

// Function to test database connection with retries
async function testConnection(retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      await prisma.$connect();
      console.log('Successfully connected to the database');
      
      // Test the connection with a simple query
      await prisma.$queryRaw`SELECT 1`;
      console.log('Database connection test successful');
      return true;
    } catch (error) {
      console.error(`Connection attempt ${i + 1} failed:`, error);
      if (i < retries - 1) {
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  return false;
}

// Only test connection in development
if (process.env.NODE_ENV === 'development') {
  testConnection()
    .then(success => {
      if (!success) {
        console.error('Failed to connect to the database after multiple attempts');
      }
    })
    .catch((e) => {
      console.error('Critical database connection error:', e);
    });
}

// Store prisma instance in development
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma