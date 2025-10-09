'use client';

import Link from 'next/link';
import GoogleLoginButton from '@/features/auth/components/google-auth-button';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import UserAuthForm from './user-auth-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, User as UserIcon, Landmark } from 'lucide-react';

export default function SignInViewPage() {
  const { user, isAuthenticated, isLoading, login } = useAuth();
  const router = useRouter();

  // Update userData when user changes from useAuth
  // useEffect(() => {
  //   if (user && isAuthenticated) {
  //     user.isFirstTime ? router.push("/register") : router.push("/dashboard");
  //   }
  // }, [isAuthenticated])

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='h-24 w-24 animate-spin rounded-full border-b-2 border-blue-600'></div>
      </div>
    );
  }
  return (
    <div className='relative h-screen flex-col items-center justify-center'>
      <div className='flex h-full items-center justify-center p-4 lg:p-8'>
        <div className='flex w-full max-w-md flex-col items-center justify-center space-y-4 sm:max-w-lg sm:space-y-6'>
          <h1 className='text-2xl font-bold sm:text-3xl'>LoanConnect</h1>

          <p className='mx-auto px-2 text-center text-sm leading-relaxed text-gray-600 sm:text-base dark:text-gray-300'>
            Connect customers with banks through our secure, intelligent
            platform. Fast approvals, transparent processes, and data-driven
            decisions.
          </p>

          {/* Role Selection Tabs */}
          <Tabs defaultValue={'sme'} className='w-full'>
            <TabsList className='bg-muted/50 grid h-12 w-full grid-cols-2 p-1 sm:h-14'>
              <TabsTrigger
                value='sme'
                className='data-[state=active]:bg-background flex cursor-pointer items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-all duration-200 data-[state=active]:shadow-sm sm:gap-2 sm:text-sm'
              >
                <UserIcon className='h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4' />
                <span className='hidden sm:inline'>Customer</span>
                <span className='sm:hidden'>Customer</span>
              </TabsTrigger>
              <TabsTrigger
                value='bank'
                className='data-[state=active]:bg-background flex cursor-pointer items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-all duration-200 data-[state=active]:shadow-sm sm:gap-2 sm:text-sm'
              >
                <Landmark className='h-3.5 w-3.5 flex-shrink-0 sm:h-4 sm:w-4' />
                <span className='hidden sm:inline'>Bank</span>
                <span className='sm:hidden'>Bank</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value='sme'
              className='mt-4 space-y-3 sm:mt-6 sm:space-y-4'
            >
              <div className='space-y-2 text-center'>
                <h3 className='text-foreground text-base font-semibold sm:text-lg'>
                  Customer Portal
                </h3>
                <p className='text-muted-foreground px-2 text-xs sm:px-0 sm:text-sm'>
                  Apply for loans, track loan application status, and manage
                  your financing needs.
                </p>
              </div>
              <GoogleLoginButton
                onSuccess={(userData: User) => {
                  // If returning user with preference, auto-redirect
                  userData.isFirstTime
                    ? router.push('/register')
                    : router.push('/dashboard');
                }}
                onLogin={login}
              />
            </TabsContent>

            <TabsContent
              value='bank'
              className='mt-4 space-y-3 sm:mt-6 sm:space-y-4'
            >
              <div className='space-y-2 text-center'>
                <h3 className='text-foreground text-base font-semibold sm:text-lg'>
                  Bank Portal
                </h3>
                <p className='text-muted-foreground px-2 text-xs sm:px-0 sm:text-sm'>
                  Review and manage loan approvals, and access analytics
                  dashboard securely.
                </p>
              </div>
              <UserAuthForm
                onSuccess={(userData: User) => {
                  // If returning user with preference, auto-redirect
                  userData.isFirstTime
                    ? router.push('/register')
                    : router.push('/dashboard');
                }}
                onLogin={login}
              />
            </TabsContent>
          </Tabs>

          <p className='text-muted-foreground px-4 text-center text-xs sm:px-8 sm:text-sm'>
            By clicking continue, you agree to our{' '}
            <Link
              href='/terms'
              className='hover:text-primary underline underline-offset-4'
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href='/privacy'
              className='hover:text-primary underline underline-offset-4'
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
