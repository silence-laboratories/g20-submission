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

export default function ProfileViewPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  const [sme, setSme] = useState<SME | null>(null);

  const getSME = async () => {
    if (user?.entityId) {
      const response = await apiClient.sme.get(user?.entityId);
      setSme({
        name: response.data.name,
        registrationNumber: response.data.registration_number,
        country: response.data.country,
        director: response.data.director,
        din: response.data.din,
        registeredPhoneNumber: response.data.registered_phone_number,
      });
    }
  }

  useEffect(() => {
    getSME();
  }, [user, getSME]);

  return (
    <PageContainer scrollable>
      <div className='flex flex-col lg:flex-row gap-6 h-full'>
        {/* Sidebar */}
        <div className='w-full lg:w-64 lg:h-fit lg:sticky lg:top-6 border bg-card p-6 rounded-lg'>
          <div className='space-y-6'>
            <div>
              <h1 className='text-xl font-semibold text-foreground'>Account</h1>
              <p className='text-sm text-muted-foreground mt-1'>
                Manage your account info.
              </p>
            </div>

            <nav className='flex lg:flex-col gap-2'>
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 lg:flex-none w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'profile'
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
              >
                <IconUser className='h-4 w-4' />
                <span className='sm:inline'>Profile</span>
              </button>

              <button
                onClick={() => setActiveTab('security')}
                className={`flex-1 lg:flex-none w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'security'
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
              >
                <IconBuilding className='h-4 w-4' />
                <span className='sm:inline'>SME details</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className='flex-1 min-w-0 p-4 lg:p-6'>
          <div className='max-w-full lg:max-w-2xl xl:max-w-4xl'>
            <h2 className='text-xl sm:text-2xl font-semibold text-foreground mb-4 sm:mb-6'>
              Profile details
            </h2>

          {user &&
            activeTab === 'profile' ?
            <div className='space-y-6 sm:space-y-8'>
              {/* Profile Section */}
              <div className='space-y-4'>
                <div className='flex items-center gap-3 sm:gap-4'>
                  <Avatar className='h-12 w-12 sm:h-16 sm:w-16'>
                    <AvatarImage src={user?.picture} alt='User avatar' referrerPolicy="no-referrer" />
                  </Avatar>
                  <div>
                    <p className='text-sm sm:text-base font-medium text-foreground'>
                      {user?.name}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Connected Accounts Section */}
              <div className='space-y-4'>
                <h3 className='text-base sm:text-lg font-medium text-foreground'>
                  Connected accounts
                </h3>

                <div className='space-y-3'>
                  <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border border-border rounded-md gap-2'>
                    <div className='flex items-center gap-3'>
                      <div className='flex items-center flex-wrap gap-2'>
                        <IconBrandGoogleFilled className='h-4 w-4 text-blue-600' />
                        <span className='text-xs sm:text-sm text-foreground break-all'>
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
            </div> : <div className='space-y-6 sm:space-y-8'>
              {/* SME Profile Header */}
              <div className='space-y-6'>
                <div className='flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 bg-card border border-border rounded-lg'>
                  <div className='flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full'>
                    <IconBuilding className='h-6 w-6 sm:h-8 sm:w-8 text-primary' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <h3 className='text-lg sm:text-xl font-semibold text-foreground truncate'>
                      {sme?.name || 'Company Name'}
                    </h3>
                    <p className='text-xs sm:text-sm text-muted-foreground'>
                      SME Business Profile
                    </p>
                  </div>
                  <Badge variant='secondary' className='self-start sm:self-auto sm:ml-auto'>
                    Active
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Company Information */}
              <div className='space-y-4 sm:space-y-6'>
                <h3 className='text-base sm:text-lg font-semibold text-foreground'>
                  Company Information
                </h3>

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6'>
                  {/* Company Details */}
                  <div className='space-y-4'>
                    <div className='p-4 border border-border rounded-lg bg-card'>
                      <div className='flex items-center gap-3 mb-3'>
                        <IconId className='h-5 w-5 text-primary' />
                        <h4 className='font-medium text-foreground'>Registration Details</h4>
                      </div>
                      <div className='space-y-2'>
                        <div>
                          <p className='text-sm text-muted-foreground'>Registration Number</p>
                          <p className='text-sm font-medium text-foreground'>
                            {sme?.registrationNumber || 'Not provided'}
                          </p>
                        </div>
                        {sme?.din && (
                          <div>
                            <p className='text-sm text-muted-foreground'>Director Identification Number</p>
                            <p className='text-sm font-medium text-foreground'>{sme.din}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className='p-4 border border-border rounded-lg bg-card'>
                      <div className='flex items-center gap-3 mb-3'>
                        <IconUserCheck className='h-5 w-5 text-primary' />
                        <h4 className='font-medium text-foreground'>Director Information</h4>
                      </div>
                      <div className='space-y-2'>
                        <div>
                          <p className='text-sm text-muted-foreground'>Director Name</p>
                          <p className='text-sm font-medium text-foreground'>
                            {sme?.director || 'Not provided'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact & Location */}
                  <div className='space-y-4'>
                    <div className='p-4 border border-border rounded-lg bg-card'>
                      <div className='flex items-center gap-3 mb-3'>
                        <IconMapPin className='h-5 w-5 text-primary' />
                        <h4 className='font-medium text-foreground'>Location</h4>
                      </div>
                      <div className='space-y-2'>
                        <div>
                          <p className='text-sm text-muted-foreground'>Country</p>
                          <p className='text-sm font-medium text-foreground'>
                            {sme?.country || 'Not specified'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className='p-4 border border-border rounded-lg bg-card'>
                      <div className='flex items-center gap-3 mb-3'>
                        <IconPhone className='h-5 w-5 text-primary' />
                        <h4 className='font-medium text-foreground'>Contact Information</h4>
                      </div>
                      <div className='space-y-2'>
                        <div>
                          <p className='text-sm text-muted-foreground'>Registered Phone</p>
                          <p className='text-sm font-medium text-foreground'>
                            {sme?.registeredPhoneNumber ?
                              `${sme.countryCode || ''}${sme.registeredPhoneNumber}` :
                              'Not provided'
                            }
                          </p>
                        </div>
                        {sme?.phoneNumber && (
                          <div>
                            <p className='text-sm text-muted-foreground'>Alternative Phone</p>
                            <p className='text-sm font-medium text-foreground'>
                              {sme.countryCode || ''}{sme.phoneNumber}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Banking Information */}
              {(sme?.bankAccountNumber || sme?.bankId) && (
                <>
                  <Separator />
                  <div className='space-y-4 sm:space-y-6'>
                    <h3 className='text-base sm:text-lg font-semibold text-foreground'>
                      Banking Information
                    </h3>

                    <div className='p-4 border border-border rounded-lg bg-card'>
                      <div className='flex items-center gap-3 mb-3'>
                        <IconBuildingBank className='h-5 w-5 text-primary' />
                        <h4 className='text-sm sm:text-base font-medium text-foreground'>Account Details</h4>
                      </div>
                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        {sme?.bankAccountNumber && (
                          <div>
                            <p className='text-sm text-muted-foreground'>Account Number</p>
                            <p className='text-sm font-medium text-foreground font-mono'>
                              {sme.bankAccountNumber}
                            </p>
                          </div>
                        )}
                        {sme?.bankId && (
                          <div>
                            <p className='text-sm text-muted-foreground'>Bank ID</p>
                            <p className='text-sm font-medium text-foreground'>
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
                <h3 className='text-base sm:text-lg font-semibold text-foreground'>
                  Connected Accounts
                </h3>

                <div className='space-y-3'>
                  <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border border-border rounded-md gap-2'>
                    <div className='flex items-center gap-3'>
                      <div className='flex items-center flex-wrap gap-2'>
                        <IconBrandGoogleFilled className='h-4 w-4 text-blue-600' />
                        <span className='text-xs sm:text-sm text-foreground break-all'>
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
            </div>}
        </div>
        </div>
      </div>
    </PageContainer>
  );
}
