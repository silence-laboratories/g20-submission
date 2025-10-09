'use client';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTransition, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { FormInput } from '@/components/forms/form-input';
import { Card } from '@/components/ui/card';
import { IconExclamationMark } from '@tabler/icons-react';
import { CardContent } from '@/components/ui/card';
import { apiClient } from '@/lib/api';

interface LoginProps {
  onSuccess: (user: any) => void;
  onLogin?: (user: any) => void;
}

const formSchema = z.object({
  email: z.email({ message: 'Enter a valid email address' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
});

type UserFormValue = z.infer<typeof formSchema>;

export default function UserAuthForm({ onSuccess, onLogin }: LoginProps) {
  const [_, startTransition] = useTransition();

  const [isLoading, setIsLoading] = useState(false);

  const defaultValues = {
    email: 'admin@bank.com',
    password: ''
  };
  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const onSubmit = async (data: UserFormValue) => {
    setIsLoading(true);
    if (data.email === defaultValues.email && data.password === 'bankadmin') {
      try {
        const backendResponse =
          await apiClient.auth.googleCallback('MOCK_LOGIN_CODE');

        const authData = backendResponse.data;
        console.log('Backend response:', authData);

        // Update auth state if callback provided
        if (onLogin) {
          onLogin(authData);
        }

        // Pass authentication data to parent component
        onSuccess(authData);

        setTimeout(() => {
          startTransition(() => {
            console.log('continue with email clicked');
            toast.success('Signed In successfully!');
          });
        }, 1500);
      } catch (error) {
        setIsLoading(false);
        toast.error('Invalid email or password');
      }
    } else {
      setIsLoading(false);
      toast.error('Invalid email or password');
    }
  };

  return (
    <>
      <Card className='border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20'>
        <CardContent>
          <div className='flex-1'>
            <div className='space-y-3'>
              <div className='flex items-start space-x-3'>
                <div className='mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-200 dark:bg-green-800'>
                  <IconExclamationMark className='h-3 w-3 text-green-600 dark:text-green-400' />
                </div>
                <p className='text-sm text-green-800 dark:text-green-200'>
                  <strong>Demo purpose:</strong> Use <code>admin@bank.com</code>{' '}
                  and <code>bankadmin</code> as email and password
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Form
        form={form}
        onSubmit={form.handleSubmit(onSubmit)}
        className='w-full space-y-2'
      >
        <FormInput
          control={form.control}
          name='email'
          label='Email'
          placeholder='Enter your email...'
          disabled={isLoading}
          className='mb-4'
        />
        <FormInput
          control={form.control}
          name='password'
          label='Password'
          type='password'
          placeholder='Enter your password...'
          disabled={isLoading}
        />
        <Button
          disabled={isLoading}
          className='mt-2 ml-auto w-full cursor-pointer'
          type='submit'
        >
          {isLoading ? (
            <div className='flex items-center space-x-3'>
              <div className='h-5 w-5 animate-spin rounded-full border-b-2 border-blue-600'></div>
              <span className='font-medium text-gray-700 dark:text-gray-300'>
                Signing in...
              </span>
            </div>
          ) : (
            <span>Sign In</span>
          )}
        </Button>
      </Form>
    </>
  );
}
