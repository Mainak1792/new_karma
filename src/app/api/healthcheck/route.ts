import { NextResponse } from 'next/server';
import { testDatabaseConnection } from '@/db/prisma';

export const maxDuration = 10; // 10 second max duration

export async function GET() {
  try {
    // Test database connectivity
    const dbConnected = await testDatabaseConnection();
    
    if (!dbConnected) {
      return NextResponse.json({ 
        status: 'error',
        error: 'Database connection failed',
        database: false,
        timestamp: new Date().toISOString()
      }, { status: 503 });
    }
    
    // Check Supabase URL is configured
    const supabaseConfigured = 
      !!process.env.NEXT_PUBLIC_SUPABASE_URL && 
      !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    return NextResponse.json({
      status: 'ok',
      database: true, 
      auth: supabaseConfigured,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'error',
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 