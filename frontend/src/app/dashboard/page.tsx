'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect after loading is complete
    if (!isLoading) {
      if (!user || !isAuthenticated) {
        router.push('/auth/sign-in');
      } else {
        router.push(user?.isFirstTime ? '/register' : '/dashboard/overview');
      }
    }
  }, [user, isAuthenticated, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='h-24 w-24 animate-spin rounded-full border-b-2 border-blue-600'></div>
      </div>
    );
  }

  // This should not render as we redirect in useEffect, but just in case
  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='h-24 w-24 animate-spin rounded-full border-b-2 border-blue-600'></div>
    </div>
  );
}
