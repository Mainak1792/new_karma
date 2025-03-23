import { PrismaClient } from '@prisma/client';

async function testConnection() {
  const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

  try {
    console.log('Attempting to connect to database...');
    await prisma.$connect();
    console.log('Successfully connected to database!');

    // Test database connection with a simple query
    const result = await prisma.$queryRaw`SELECT 1`;
    console.log('Database connection test successful:', result);

    // Test User model
    try {
      const userCount = await prisma.user.count();
      console.log('Number of users in database:', userCount);
    } catch (userError) {
      console.error('Error querying users:', userError);
    }

    // Test Note model
    try {
      const noteCount = await prisma.note.count();
      console.log('Number of notes in database:', noteCount);
    } catch (noteError) {
      console.error('Error querying notes:', noteError);
    }

  } catch (error) {
    console.error('Failed to connect to database:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
  } finally {
    await prisma.$disconnect();
    console.log('Disconnected from database');
  }
}

testConnection(); 