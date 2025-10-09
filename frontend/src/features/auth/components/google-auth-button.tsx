'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface GoogleLoginButtonProps {
  onSuccess: (user: any) => void;
  onLogin?: (user: any) => void;
}

declare global {
  interface Window {
    google: any;
  }
}

export default function GoogleLoginButton({
  onSuccess,
  onLogin
}: GoogleLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  // Wait for Google Identity Services to load
  useEffect(() => {
    const checkGoogleLoaded = () => {
      if (window.google && window.google.accounts) {
        setIsGoogleLoaded(true);
      } else {
        // Retry after a short delay
        setTimeout(checkGoogleLoaded, 100);
      }
    };

    checkGoogleLoaded();
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Check if Google Identity Services is loaded
      if (!isGoogleLoaded || !window.google || !window.google.accounts) {
        throw new Error(
          'Google Identity Services not loaded. Please refresh the page and try again.'
        );
      }

      const { google } = window;

      // Configure OAuth for authorization code flow
      google.accounts.oauth2
        .initCodeClient({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          scope: 'openid email profile',
          ux_mode: 'popup',
          callback: async (response: any) => {
            if (response.code) {
              try {
                // Send authorization code to backend using the secure API client
                const backendResponse = await apiClient.auth.googleCallback(
                  response.code
                );

                const authData = backendResponse.data;
                toast.success('Signed In successfully!');
                // Update auth state if callback provided
                if (onLogin) {
                  onLogin(authData);
                }
                // Pass authentication data to parent component
                onSuccess(authData);
              } catch (error: any) {
                console.error('Backend authentication error:', error);
                console.error('Error details:', error.response?.data);
                toast.error(
                  error.response?.data?.detail || 'Authentication failed'
                );
              }
            } else {
              console.error(
                'Google authentication failed - no authorization code received'
              );
              toast.error(
                'Google authentication failed - no authorization code received'
              );
            }
          },
          error_callback: (error: any) => {
            if (error.type === 'popup_closed') {
              toast.error('Sign-in was cancelled. Please try again.');
            } else {
              console.error('Google OAuth error:', error);
              toast.error(
                error.error_description || 'Google authentication failed'
              );
            }
            setIsLoading(false);
          }
        })
        .requestCode();
    } catch (error: any) {
      console.error('Google login error:', error);
      toast.error(error.message || 'Failed to initialize Google login');
      setIsLoading(false);
    }
  };

  return (
    <div className='cursor-pointer space-y-4'>
      <Button
        className='mt-2 ml-auto w-full transform cursor-pointer border border-neutral-500 bg-white transition-all duration-300 hover:scale-105 disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-900'
        onClick={handleGoogleLogin}
        disabled={isLoading || !isGoogleLoaded}
      >
        {isLoading ? (
          <div className='flex items-center space-x-3'>
            <div className='h-5 w-5 animate-spin rounded-full border-b-2 border-blue-600'></div>
            <span className='font-medium text-gray-700 dark:text-gray-300'>
              Signing in...
            </span>
          </div>
        ) : !isGoogleLoaded ? (
          <div className='flex items-center space-x-3'>
            <div className='h-5 w-5 animate-spin rounded-full border-b-2 border-gray-400'></div>
            <span className='font-medium text-gray-700 dark:text-gray-300'>
              Loading Google...
            </span>
          </div>
        ) : (
          <div className='flex items-center space-x-3'>
            <svg className='h-5 w-5' viewBox='0 0 24 24'>
              <path
                fill='#4285F4'
                d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
              />
              <path
                fill='#34A853'
                d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
              />
              <path
                fill='#FBBC05'
                d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
              />
              <path
                fill='#EA4335'
                d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
              />
            </svg>
            <span>Continue with Google</span>
          </div>
        )}
      </Button>

      {/* {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2">
          <p className="text-red-600 dark:text-red-400 text-sm text-center">
            {error}
          </p>
        </div>
      )} */}
    </div>
  );
}
