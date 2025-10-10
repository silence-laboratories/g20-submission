'use client';

import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  IconUser,
  IconShield,
  IconPlus,
  IconDots,
  IconBrandGoogleFilled,
  IconBuilding,
  IconMapPin,
  IconPhone,
  IconId,
  IconUserCheck,
  IconCreditCard,
  IconBuildingBank
} from '@tabler/icons-react';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { SME } from '@/types';
import PageContainer from '@/components/layout/page-container';
import { Bank } from '@/store/loan-store';

export default function ProfileViewPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [sme, setSme] = useState<SME | null>(null);
  const [bank, setBank] = useState<Bank | null>(null);

  const getBank = async () => {
    if (user?.entityId) {
      const response = await apiClient.bank.get(user?.entityId);
      setBank({
        id: response.data.id,
        name: response.data.name,
        country: response.data.country,
        interest_rate_min: response.data.interest_rate_min,
        interest_rate_max: response.data.interest_rate_max,
        description: "Corporate Banking services",
        logo: '🏦',
        interest: `${response.data.interest_rate_min} - ${response.data.interest_rate_max}%`
      });

    }
  };

  const getSME = async () => {
    if (user?.entityId) {
      const response = await apiClient.sme.get(user?.entityId);
      setSme({
        name: response.data.name,
        registrationNumber: response.data.registration_number,
        country: response.data.country,
        director: response.data.director,
        din: response.data.din,
        registeredPhoneNumber: response.data.registered_phone_number
      });
    }
  };

  useEffect(() => {
    user?.entityType === "sme" ? getSME() : getBank();
  }, [user, getSME, getBank]);

  return (
    <PageContainer scrollable>
      <div className='flex h-full flex-col gap-6 lg:flex-row'>
        {/* Sidebar */}
        <div className='bg-card w-full rounded-lg border p-6 lg:sticky lg:top-6 lg:h-fit lg:w-64'>
          <div className='space-y-6'>
            <div>
              <h1 className='text-foreground text-xl font-semibold'>Account</h1>
              <p className='text-muted-foreground mt-1 text-sm'>
                Manage your account info.
              </p>
            </div>

            <nav className='flex gap-2 lg:flex-col'>
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex w-full flex-1 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors lg:flex-none ${activeTab === 'profile'
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
              >
                <IconUser className='h-4 w-4' />
                <span className='sm:inline'>Profile</span>
              </button>

              <button
                onClick={() => setActiveTab('security')}
                className={`flex w-full flex-1 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors lg:flex-none ${activeTab === 'security'
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
              >
                <IconBuilding className='h-4 w-4' />
                <span className='sm:inline'>{user?.entityType === "sme" ? "SME details" : "Bank details"}</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className='min-w-0 flex-1 p-4 lg:p-6'>
          <div className='max-w-full lg:max-w-2xl xl:max-w-4xl'>
            <h2 className='text-foreground mb-4 text-xl font-semibold sm:mb-6 sm:text-2xl'>
              Profile details
            </h2>

            {user && activeTab === 'profile' ? (
              <div className='space-y-6 sm:space-y-8'>
                {/* Profile Section */}
                <div className='space-y-4'>
                  <div className='flex items-center gap-3 sm:gap-4'>
                    <Avatar className='h-12 w-12 sm:h-16 sm:w-16'>
                      <AvatarImage
                        src={user?.picture}
                        alt='User avatar'
                        referrerPolicy='no-referrer'
                      />
                    </Avatar>
                    <div>
                      <p className='text-foreground text-sm font-medium sm:text-base'>
                        {user?.name}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Connected Accounts Section */}
                <div className='space-y-4'>
                  <h3 className='text-foreground text-base font-medium sm:text-lg'>
                    Connected accounts
                  </h3>

                  <div className='space-y-3'>
                    <div className='border-border flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between'>
                      <div className='flex items-center gap-3'>
                        <div className='flex flex-wrap items-center gap-2'>
                          <IconBrandGoogleFilled className='h-4 w-4 text-blue-600' />
                          <span className='text-foreground text-xs break-all sm:text-sm'>
                            Google • {user?.email}
                          </span>
                          <Badge variant='secondary' className='text-xs'>
                            Primary
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className='space-y-6 sm:space-y-8'>
                {/* SME Profile Header */}
                <div className='space-y-6'>
                  <div className='bg-card border-border flex flex-col items-start gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:gap-4'>
                    <div className='bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full sm:h-16 sm:w-16'>
                      <IconBuilding className='text-primary h-6 w-6 sm:h-8 sm:w-8' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <h3 className='text-foreground truncate text-lg font-semibold sm:text-xl'>
                        {user?.entityType === "sme" ? sme?.name : bank?.name || 'Company Name'}
                      </h3>
                      <p className='text-muted-foreground text-xs sm:text-sm'>
                        {user?.entityType === "sme" ? "SME Business Profile" : "Bank Profile"}
                      </p>
                    </div>
                    <Badge
                      variant='secondary'
                      className='self-start sm:ml-auto sm:self-auto'
                    >
                      Active
                    </Badge>
                  </div>
                </div>



                {/* Company Information */}
                {user?.entityType === "sme" && (
                  <>
                    <Separator />
                    <div className='space-y-4 sm:space-y-6'>
                      <h3 className='text-foreground text-base font-semibold sm:text-lg'>
                        {user?.entityType === "sme" ? "Company Information" : "Bank Information"}
                      </h3>


                      <div className='grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2'>
                        {/* Company Details */}
                        <div className='space-y-4'>
                          <div className='border-border bg-card rounded-lg border p-4'>
                            <div className='mb-3 flex items-center gap-3'>
                              <IconId className='text-primary h-5 w-5' />
                              <h4 className='text-foreground font-medium'>
                                Registration Details
                              </h4>
                            </div>
                            <div className='space-y-2'>
                              <div>
                                <p className='text-muted-foreground text-sm'>
                                  Registration Number
                                </p>
                                <p className='text-foreground text-sm font-medium'>
                                  {sme?.registrationNumber || 'Not provided'}
                                </p>
                              </div>
                              {sme?.din && (
                                <div>
                                  <p className='text-muted-foreground text-sm'>
                                    Director Identification Number
                                  </p>
                                  <p className='text-foreground text-sm font-medium'>
                                    {sme.din}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className='border-border bg-card rounded-lg border p-4'>
                            <div className='mb-3 flex items-center gap-3'>
                              <IconUserCheck className='text-primary h-5 w-5' />
                              <h4 className='text-foreground font-medium'>
                                Director Information
                              </h4>
                            </div>
                            <div className='space-y-2'>
                              <div>
                                <p className='text-muted-foreground text-sm'>
                                  Director Name
                                </p>
                                <p className='text-foreground text-sm font-medium'>
                                  {sme?.director || 'Not provided'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Contact & Location */}
                        <div className='space-y-4'>
                          <div className='border-border bg-card rounded-lg border p-4'>
                            <div className='mb-3 flex items-center gap-3'>
                              <IconMapPin className='text-primary h-5 w-5' />
                              <h4 className='text-foreground font-medium'>
                                Location
                              </h4>
                            </div>
                            <div className='space-y-2'>
                              <div>
                                <p className='text-muted-foreground text-sm'>
                                  Country
                                </p>
                                <p className='text-foreground text-sm font-medium'>
                                  {sme?.country || 'Not specified'}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className='border-border bg-card rounded-lg border p-4'>
                            <div className='mb-3 flex items-center gap-3'>
                              <IconPhone className='text-primary h-5 w-5' />
                              <h4 className='text-foreground font-medium'>
                                Contact Information
                              </h4>
                            </div>
                            <div className='space-y-2'>
                              <div>
                                <p className='text-muted-foreground text-sm'>
                                  Registered Phone
                                </p>
                                <p className='text-foreground text-sm font-medium'>
                                  {sme?.registeredPhoneNumber
                                    ? `${sme.countryCode || ''}${sme.registeredPhoneNumber}`
                                    : 'Not provided'}
                                </p>
                              </div>
                              {sme?.phoneNumber && (
                                <div>
                                  <p className='text-muted-foreground text-sm'>
                                    Alternative Phone
                                  </p>
                                  <p className='text-foreground text-sm font-medium'>
                                    {sme.countryCode || ''}
                                    {sme.phoneNumber}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </>
                )}

                {user?.entityType === "sme" && (sme?.bankAccountNumber || sme?.bankId) && (
                  <>
                    <Separator />
                    <div className='space-y-4 sm:space-y-6'>
                      <h3 className='text-foreground text-base font-semibold sm:text-lg'>
                        Banking Information
                      </h3>

                      <div className='border-border bg-card rounded-lg border p-4'>
                        <div className='mb-3 flex items-center gap-3'>
                          <IconBuildingBank className='text-primary h-5 w-5' />
                          <h4 className='text-foreground text-sm font-medium sm:text-base'>
                            Account Details
                          </h4>
                        </div>
                        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                          {sme?.bankAccountNumber && (
                            <div>
                              <p className='text-muted-foreground text-sm'>
                                Account Number
                              </p>
                              <p className='text-foreground font-mono text-sm font-medium'>
                                {sme.bankAccountNumber}
                              </p>
                            </div>
                          )}
                          {sme?.bankId && (
                            <div>
                              <p className='text-muted-foreground text-sm'>
                                Bank ID
                              </p>
                              <p className='text-foreground text-sm font-medium'>
                                {sme.bankId}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Connected Accounts Section */}
                <Separator />
                <div className='space-y-4'>
                  <h3 className='text-foreground text-base font-semibold sm:text-lg'>
                    Connected Accounts
                  </h3>

                  <div className='space-y-3'>
                    <div className='border-border flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between'>
                      <div className='flex items-center gap-3'>
                        <div className='flex flex-wrap items-center gap-2'>
                          <IconBrandGoogleFilled className='h-4 w-4 text-blue-600' />
                          <span className='text-foreground text-xs break-all sm:text-sm'>
                            Google • {user?.email}
                          </span>
                          <Badge variant='secondary' className='text-xs'>
                            Primary
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
