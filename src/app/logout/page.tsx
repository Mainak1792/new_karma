'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-browser';
import { toast } from 'sonner';

export default function LogoutPage() {
  const router = useRouter();
  
  useEffect(() => {
    async function signOut() {
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
        toast.success('Logged out successfully');
        router.push('/login');
      } catch (error) {
        console.error('Error signing out:', error);
        toast.error('Failed to logout');
        // Redirect anyway
        router.push('/login');
      }
    }
    
    signOut();
  }, [router]);
  
  return (
    <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Logging out...</h1>
        <p className="text-muted-foreground">Please wait while we sign you out.</p>
      </div>
    </div>
  );
} 