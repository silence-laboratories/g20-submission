'use client'

import Link from 'next/link';
import GoogleLoginButton from '@/features/auth/components/google-auth-button';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import UserAuthForm from './user-auth-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Building2, User as UserIcon, Landmark } from 'lucide-react'

export default function SignInViewPage() {
  const { user, isAuthenticated, isLoading, login } = useAuth()
  const router = useRouter();

  // Update userData when user changes from useAuth
  // useEffect(() => {
  //   if (user && isAuthenticated) {
  //     user.isFirstTime ? router.push("/register") : router.push("/dashboard");
  //   }
  // }, [isAuthenticated])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  return (
    <div className='relative h-screen flex-col items-center justify-center'>
      <div className='flex h-full items-center justify-center p-4 lg:p-8'>
        <div className='flex w-full max-w-md sm:max-w-lg flex-col items-center justify-center space-y-4 sm:space-y-6'>

          <h1 className='text-2xl sm:text-3xl font-bold'>LoanConnect</h1>

          <p className="text-gray-600 dark:text-gray-300 mx-auto leading-relaxed text-center text-sm sm:text-base px-2">
            Connect customers with banks through our secure, intelligent platform.
            Fast approvals, transparent processes, and data-driven decisions.
          </p>

          {/* Role Selection Tabs */}
          <Tabs
            defaultValue={"sme"}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 h-12 sm:h-14">
              <TabsTrigger
                value="sme"
                className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200 rounded-md cursor-pointer"
              >
                <UserIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="hidden sm:inline">Customer</span>
                <span className="sm:hidden">Customer</span>
              </TabsTrigger>
              <TabsTrigger
                value="bank"
                className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200 rounded-md cursor-pointer"
              >
                <Landmark className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="hidden sm:inline">Bank</span>
                <span className="sm:hidden">Bank</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sme" className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
              <div className="text-center space-y-2">
                <h3 className="text-base sm:text-lg font-semibold text-foreground">Customer Portal</h3>
                <p className="text-xs sm:text-sm text-muted-foreground px-2 sm:px-0">
                  Apply for loans, track loan application status, and manage your financing needs.
                </p>
              </div>
              <GoogleLoginButton
                onSuccess={(userData: User) => {
                  // If returning user with preference, auto-redirect
                  userData.isFirstTime ? router.push("/register") : router.push("/dashboard");
                }}
                onLogin={login}
              />
            </TabsContent>

            <TabsContent value="bank" className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
              <div className="text-center space-y-2">
                <h3 className="text-base sm:text-lg font-semibold text-foreground">Bank Portal</h3>
                <p className="text-xs sm:text-sm text-muted-foreground px-2 sm:px-0">
                  Review and manage loan approvals, and access analytics dashboard securely.
                </p>
              </div>
              <UserAuthForm onSuccess={(userData: User) => {
                // If returning user with preference, auto-redirect
                userData.isFirstTime ? router.push("/register") : router.push("/dashboard");
              }}
                onLogin={login} />
            </TabsContent>
          </Tabs>

          <p className='text-muted-foreground px-4 sm:px-8 text-center text-xs sm:text-sm'>
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
