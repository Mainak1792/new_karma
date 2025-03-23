import { PrismaClient } from '@prisma/client';

async function testConnection() {
  const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

  try {
    console.log('Testing database connection...');
    
    // Test connection
    await prisma.$connect();
    console.log('Successfully connected to database');

    // Test query
    const result = await prisma.$queryRaw`SELECT 1`;
    console.log('Basic query test successful:', result);

    // Test user table
    const userCount = await prisma.user.count();
    console.log('Number of users:', userCount);

    // Test note table
    const noteCount = await prisma.note.count();
    console.log('Number of notes:', noteCount);

  } catch (error) {
    console.error('Database connection test failed:', error);
  } finally {
    await prisma.$disconnect();
    console.log('Disconnected from database');
  }
}

testConnection(); 