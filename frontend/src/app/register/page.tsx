'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RegisterUserNav } from '@/components/layout/registerUserNav';
import { SME } from '@/types';
import { apiClient } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { IconInfoCircle } from '@tabler/icons-react';
import { toast } from 'sonner';
import MapDemo from '@/features/maps/map-demo';

export default function Register() {
  const { user, isLoading } = useAuth();
  const [entityType, setEntityType] = useState<
    'sme' | 'bank' | 'individual' | null
  >(null);
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [formValidated, setFormValidated] = useState<boolean>(false);
  const router = useRouter();

  const [formData, setFormData] = useState<SME>({
    name: '',
    registrationNumber: '',
    country: '',
    director: 'default',
    din: 'default',
    registeredPhoneNumber: '',
    countryCode: '+27',
    phoneNumber: '',
    bankAccountNumber: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [banks, setBanks] = useState<Bank[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!isVerified) {
      setErrors((prev) => ({
        ...prev,
        bankAccountNumber: 'Bank account number is not verified'
      }));
      return;
    }

    setIsSubmitting(true);

    try {
      const requestData = {
        name: formData.name,
        registration_number: formData.registrationNumber,
        country: formData.country,
        director: formData.director,
        din: formData.din,
        registered_phone_number: `${formData.countryCode}${formData.phoneNumber}`,
        bank_account_number: formData.bankAccountNumber,
        bank_id: parseInt(selectedBank)
      };
      await apiClient.sme.create(requestData);

      // Show success message briefly
      setTimeout(() => {
        toast.success('Account created successfully!');
        // Redirect to appropriate portal
        router.push('/dashboard');
      }, 2000);
    } catch (error: any) {
      if (error.response.status === 401) {
        router.push('/auth/sign-in');
        return;
      }
      toast.error('Failed to create account');
      setErrors(error.response.data || 'Failed to create account');
      setIsSubmitting(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (entityType === 'sme') {
      if (!formData.name?.trim()) newErrors.name = 'Company name is required';
      if (!formData.registrationNumber?.trim())
        newErrors.registrationNumber = 'Registration number is required';
      if (!formData.country?.trim()) newErrors.country = 'Country is required';
      if (!formData.director?.trim())
        newErrors.director = 'Director is required';
      if (!formData.din?.trim()) newErrors.din = 'Director DIN is required';
      if (!formData.phoneNumber?.trim())
        newErrors.phoneNumber = 'Phone number is required';
      if (!(formData.phoneNumber?.trim().length === 10))
        newErrors.phoneNumber = 'Phone number must be 10 digits';
      if (!formData.countryCode?.trim())
        newErrors.countryCode = 'Country code is required';
      if (!formData.bankAccountNumber?.trim())
        newErrors.bankAccountNumber = 'Bank account number is required';
      if (!(formData.bankAccountNumber?.trim().length === 10))
        newErrors.bankAccountNumber = 'Bank account number must be 10 digits';
    }
    setErrors(newErrors);
    setFormValidated(Object.keys(newErrors).length === 0);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
    // Reset verification status when bank account number changes
    if (field === 'bankAccountNumber') {
      setIsVerified(false);
    }
    setFormValidated(true);
  };

  const handleVerifyAccount = async () => {
    if (!formData.bankAccountNumber?.trim()) {
      setFormValidated(false);
      setErrors((prev) => ({
        ...prev,
        bankAccountNumber: 'Bank account number is required for verification'
      }));
      return;
    }

    if (!(formData.bankAccountNumber?.trim().length === 10)) {
      setFormValidated(false);
      setErrors((prev) => ({
        ...prev,
        bankAccountNumber: 'Bank account number must be 10 digits'
      }));
      return;
    }

    setIsVerifying(true);
    setErrors((prev) => ({ ...prev, bankAccountNumber: '' }));

    // Simulate verification process with 3-4 second delay
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
      setFormValidated(validateForm());
    }, 3500);
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='h-24 w-24 animate-spin rounded-full border-b-2 border-blue-600'></div>
      </div>
    );
  }

  interface Bank {
    id: string;
    name: string;
    description: string;
    logo: string;
    interest_min: number;
    interest_max: number;
  }

  const countryCodes = [
    { code: '+27', country: 'South Africa', flag: 'fi fi-za' },
    { code: '+91', country: 'India', flag: 'fi fi-in' },
    { code: '+1', country: 'United States', flag: 'fi fi-us' },
    { code: '+44', country: 'United Kingdom', flag: 'fi fi-gb' },
    { code: '+65', country: 'Singapore', flag: 'fi fi-sg' }
  ];

  const countrySelect = async (value: string) => {
    handleInputChange('country', value);

    try {
      let bankResponse = await apiClient.bank.getByCountry(value);
      let bankData = bankResponse.data;
      bankData = bankData.map((bank: any) => ({
        id: bank.id,
        name: bank.name,
        description: 'Corporate Banking Services',
        logo: '🏛️',
        interest_min: bank.interest_rate_min,
        interest_max: bank.interest_rate_max
      }));

      setBanks(bankData);
    } catch (e) {
      setBanks([]);
    }
  };

  // This should not render as we redirect in useEffect, but just in case
  return (
    <>
      {user && !user?.entityId ? (
        <>
          <header className='flex h-16 shrink-0 justify-end'>
            <div className='flex items-center gap-2 px-4'>
              <RegisterUserNav />
            </div>
          </header>
          <PageContainer scrollable>
            <div className='flex-1 space-y-4 md:px-24'>
              <Card className='mx-auto w-full'>
                <CardHeader>
                  <CardTitle className='text-left text-2xl font-bold'>
                    Account details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid gap-6 md:grid-cols-2'>
                    <div>
                      <label className='mb-1 block text-sm text-gray-200'>
                        Full Name
                      </label>
                      <div className='rounded-lg py-2 font-bold text-white'>
                        {user?.name || 'Not provided'}
                      </div>
                    </div>
                    <div>
                      <label className='mb-1 block text-sm text-gray-200'>
                        Email Address
                      </label>
                      <div className='rounded-lg py-2 font-bold text-white'>
                        {user?.email}
                      </div>
                    </div>
                  </div>
                  <div className='mt-4 rounded-lg border border-green-200 p-4 dark:border-green-800 dark:bg-green-950/20'>
                    <div className='flex items-center'>
                      <div className='mr-4 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/50'>
                        <IconInfoCircle className='h-4 w-4 text-green-600 dark:text-green-400' />
                      </div>
                      <p className='text-sm text-green-600'>
                        These details are automatically filled from your Google
                        account and cannot be changed here.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className='mx-auto mb-4 w-full'>
                <CardHeader>
                  <CardTitle className='text-left text-2xl font-bold'>
                    Select your Entity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!entityType && (
                    <div className='grid gap-6 md:grid-cols-2'>
                      <div
                        className='cursor-pointer rounded-xl border border-gray-500 p-6 transition-all hover:border-blue-500 hover:shadow-lg'
                        onClick={() => {
                          setEntityType('sme');
                        }}
                      >
                        <div className='mb-4 flex items-center'>
                          <div className='bg-primary/10 mr-4 flex h-12 w-12 items-center justify-center rounded-lg'>
                            <svg
                              className='text-primary h-6 w-6'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
                              />
                            </svg>
                          </div>
                          <h3 className='text-xl font-semibold text-white'>
                            SME (Small & Medium Enterprise)
                          </h3>
                        </div>
                        <p className='text-gray-200'>
                          Register as a small or medium enterprise to apply for
                          loans and manage your business financing.
                        </p>
                      </div>

                      <div className='relative'>
                        <div className='absolute right-0 bottom-0 left-0 z-10 rounded-b-xl bg-orange-300 px-2 py-2 text-center text-sm font-medium text-black'>
                          Coming Soon
                        </div>
                        <div className='relative cursor-not-allowed rounded-xl border border-gray-500 p-6 opacity-50 transition-all'>
                          <div className='mb-4 flex items-center'>
                            <div className='bg-primary/10 mr-4 flex h-12 w-12 items-center justify-center rounded-lg'>
                              <svg
                                className='text-primary h-6 w-6'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2}
                                  d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                                />
                              </svg>
                            </div>
                            <h3 className='text-xl font-semibold text-white'>
                              Individual
                            </h3>
                          </div>
                          <p className='mb-4 text-gray-200'>
                            Register as an individual to apply for loans and
                            manage your personal financing.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {entityType && (
                    <>
                      <div className='mb-6 flex items-center justify-between'>
                        <h2 className='text-2xl font-bold text-white'>
                          {entityType === 'sme'
                            ? 'SME Registration'
                            : 'Bank Registration'}
                        </h2>
                        <Button
                          variant='ghost'
                          onClick={() => setEntityType(null)}
                          className='cursor-pointer'
                        >
                          Change Entity
                        </Button>
                      </div>

                      <div className='flex'>
                        <form
                          onSubmit={handleSubmit}
                          className='w-full space-y-6'
                        >
                          <div>
                            <label className='mb-2 block text-sm font-medium text-gray-200'>
                              Company Name *
                            </label>
                            <input
                              type='text'
                              required
                              value={formData.name || ''}
                              onChange={(e) =>
                                handleInputChange('name', e.target.value)
                              }
                              className={cn(
                                'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                                'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                                'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive'
                              )}
                              placeholder='Enter your company name'
                            />
                            {errors.name && (
                              <p className='mt-1 text-sm text-red-600'>
                                {errors.name}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className='mb-2 block text-sm font-medium text-gray-200'>
                              Registration Number *
                            </label>
                            <input
                              type='text'
                              required
                              value={formData.registrationNumber || ''}
                              onChange={(e) =>
                                handleInputChange(
                                  'registrationNumber',
                                  e.target.value
                                )
                              }
                              className={cn(
                                'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                                'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                                'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive'
                              )}
                              placeholder='Enter your registration number'
                            />
                            {errors.registrationNumber && (
                              <p className='mt-1 text-sm text-red-600'>
                                {errors.registrationNumber}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className='mb-2 block text-sm font-medium text-gray-200'>
                              Registered Phone Number *
                            </label>
                            <div className='flex gap-2'>
                              <div className='w-32'>
                                <Select
                                  value={formData.countryCode}
                                  onValueChange={(value) => {
                                    handleInputChange('countryCode', value);
                                  }}
                                >
                                  <SelectTrigger className='h-9'>
                                    <SelectValue placeholder='Code' />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {countryCodes.map((item) => (
                                      <SelectItem
                                        key={`${item.code}-${item.country}`}
                                        value={item.code}
                                      >
                                        <div className='flex items-center gap-2'>
                                          <span className={item.flag}></span>
                                          <span>{item.code}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {errors.countryCode && (
                                  <p className='mt-1 text-sm text-red-600'>
                                    {errors.countryCode}
                                  </p>
                                )}
                              </div>
                              <div className='flex-1'>
                                <input
                                  type='tel'
                                  required
                                  value={formData.phoneNumber || ''}
                                  onChange={(e) =>
                                    handleInputChange(
                                      'phoneNumber',
                                      e.target.value
                                    )
                                  }
                                  className={cn(
                                    'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                                    'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                                    'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive'
                                  )}
                                  placeholder='Phone number'
                                />
                                {errors.phoneNumber && (
                                  <p className='mt-1 text-sm text-red-600'>
                                    {errors.phoneNumber}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className='mb-2 block text-sm font-medium text-gray-200'>
                              Country *
                            </label>
                            {errors.country && (
                              <p className='mt-1 text-sm text-red-600'>
                                {errors.country}
                              </p>
                            )}

                            <input
                              type='tel'
                              required
                              value={formData.country || ''}
                              className={cn(
                                'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                                'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                                'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive'
                              )}
                              placeholder='Country of Incorporation'
                              disabled
                            />
                          </div>

                          <div>
                            {formData.country && (
                              <Card>
                                <CardHeader>
                                  <CardTitle className='text-xl'>
                                    Select your Primary Banking Partner
                                  </CardTitle>
                                  <p className='text-muted-foreground'>
                                    Choose the bank where you maintain your
                                    primary business account in{' '}
                                    {formData.country}
                                  </p>
                                </CardHeader>
                                <CardContent>
                                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                                    {banks.length > 0 ? (
                                      banks?.map((bank) => (
                                        <div
                                          key={bank.id}
                                          className={cn(
                                            'cursor-pointer rounded-lg border p-4 transition-all hover:shadow-md',
                                            selectedBank === bank.id
                                              ? 'border-primary bg-primary/5 ring-primary/20 ring-2'
                                              : 'border-border hover:border-primary/50'
                                          )}
                                          onClick={() =>
                                            setSelectedBank(bank.id)
                                          }
                                        >
                                          <div className='flex items-start space-x-3'>
                                            <div className='text-2xl'>
                                              {bank.logo}
                                            </div>
                                            <div className='flex-1'>
                                              <h3 className='text-foreground font-semibold'>
                                                {bank.name}
                                              </h3>
                                              <p className='text-muted-foreground mt-1 text-sm'>
                                                {bank.description}
                                              </p>
                                            </div>
                                            {selectedBank === bank.id && (
                                              <div className='text-primary'>
                                                <svg
                                                  className='h-5 w-5'
                                                  fill='currentColor'
                                                  viewBox='0 0 20 20'
                                                >
                                                  <path
                                                    fillRule='evenodd'
                                                    d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                                                    clipRule='evenodd'
                                                  />
                                                </svg>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      ))
                                    ) : (
                                      <div className='flex items-center space-x-2'>
                                        <div className='border-primary h-4 w-4 animate-spin rounded-full border-b-2'></div>
                                        <span>
                                          Fetching banks for {formData.country}
                                          ...
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {selectedBank && (
                                    <div className='mt-4'>
                                      <label className='mb-2 block text-sm font-medium text-gray-200'>
                                        Bank account number *
                                      </label>
                                      <div className='flex gap-2'>
                                        <input
                                          type='text'
                                          required
                                          value={
                                            formData.bankAccountNumber || ''
                                          }
                                          onChange={(e) =>
                                            handleInputChange(
                                              'bankAccountNumber',
                                              e.target.value
                                            )
                                          }
                                          className={cn(
                                            'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                                            'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                                            'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive'
                                          )}
                                          placeholder='Enter your bank account number'
                                        />
                                        {!isVerified ? (
                                          <Button
                                            type='button'
                                            onClick={handleVerifyAccount}
                                            disabled={
                                              isVerifying ||
                                              !formData.bankAccountNumber?.trim()
                                            }
                                            className={cn(
                                              'h-9 px-4 whitespace-nowrap',
                                              isVerifying
                                                ? 'cursor-not-allowed opacity-50'
                                                : ''
                                            )}
                                          >
                                            {isVerifying ? (
                                              <div className='flex items-center gap-2'>
                                                <div className='h-4 w-4 animate-spin rounded-full border-b-2 border-white'></div>
                                                Verifying...
                                              </div>
                                            ) : (
                                              'Verify'
                                            )}
                                          </Button>
                                        ) : (
                                          <div className='flex h-9 items-center gap-2 rounded-md border border-green-200 bg-green-100 px-4 text-green-700 dark:border-green-800 dark:bg-green-900/50 dark:text-green-400'>
                                            <svg
                                              className='h-4 w-4'
                                              fill='currentColor'
                                              viewBox='0 0 20 20'
                                            >
                                              <path
                                                fillRule='evenodd'
                                                d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                                                clipRule='evenodd'
                                              />
                                            </svg>
                                            <span className='text-sm font-medium'>
                                              Verified
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                      {errors.bankAccountNumber && (
                                        <p className='mt-1 text-sm text-red-600'>
                                          {errors.bankAccountNumber}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            )}
                          </div>

                          <div className='flex space-x-4 pt-6'>
                            <Button
                              type='submit'
                              disabled={isSubmitting || !formValidated}
                              className='cursor-pointer'
                            >
                              {isSubmitting ? (
                                <div className='flex items-center justify-center'>
                                  <div className='mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white'></div>
                                  Creating Account...
                                </div>
                              ) : (
                                `Create ${entityType === 'sme' ? 'SME' : 'Bank'} Account`
                              )}
                            </Button>
                            <Button
                              variant='secondary'
                              onClick={() => setEntityType(null)}
                              className='cursor-pointer'
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>

                        <MapDemo
                          getSelectedCountry={countrySelect}
                          title='Country of Incorporation *'
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </PageContainer>
        </>
      ) : (
        <div className='flex min-h-screen items-center justify-center'>
          <div className='h-24 w-24 animate-spin rounded-full border-b-2 border-blue-600'></div>
        </div>
      )}
    </>
  );
}
