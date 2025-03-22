'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import DarkModeToggle from '@/components/ui/DarkModeToggle';
import { createClient } from '@/lib/supabase-browser';
import { User } from '@supabase/supabase-js';
import Logoutbutton from '@/components/ui/Logoutbutton';

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  // Memoize the navigation callback
  const handleAuthChange = useCallback(
    (session: { user: User | null } | null) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      // If logged out and still on protected route, redirect to login
      if (!session?.user && pathname !== '/login' && pathname !== '/register') {
        router.push('/login');
      }
    },
    [router, pathname]
  );

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session);
      handleAuthChange(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', { event: _event, session });
      handleAuthChange(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [handleAuthChange]); // Only depend on the memoized callback

  // Debug log whenever user state changes
  useEffect(() => {
    console.log('User state changed:', { user, loading });
  }, [user, loading]);

  const logoContent = (
    <div className="flex items-end gap-2">
      <Image
        src="/logo.png"
        alt="logo"
        width={100}
        height={100}
        className="rounded-full"
        priority
      />
      <h1 className="flex flex-col pb-1 text-2xl font-semibold leading-6">
        Anahata <span className="text-primary"> </span>
      </h1>
    </div>
  );

  return (
    <header
      className="flex items-center justify-between bg-popover px-3 sm:px-8"
      style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
    >
      <div className="container flex items-center justify-between">
        {pathname === '/' ? logoContent : <Link href="/">{logoContent}</Link>}
        <div className="flex items-center gap-4">
          {loading ? null : user ? (
            <>
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <Logoutbutton />
            </>
          ) : (
            <div className="flex gap-4">
              <Button asChild variant="outline">
                <Link href="/login">Login</Link>
              </Button>
            </div>
          )}
          <DarkModeToggle />
        </div>
      </div>
    </header>
  );
}
