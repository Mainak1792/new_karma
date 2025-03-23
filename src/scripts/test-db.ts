import { PrismaClient } from '@prisma/client';

async function testConnection() {
  const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

  try {
    console.log('Attempting to connect to database...');
    await prisma.$connect();
    console.log('Successfully connected to database!');

    // Test query
    const userCount = await prisma.user.count();
    console.log('Number of users in database:', userCount);

    // Test note query
    const noteCount = await prisma.note.count();
    console.log('Number of notes in database:', noteCount);

  } catch (error) {
    console.error('Failed to connect to database:', error);
  } finally {
    await prisma.$disconnect();
    console.log('Disconnected from database');
  }
}

testConnection(); 