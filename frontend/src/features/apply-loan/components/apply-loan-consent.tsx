'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import {
  IconFileText,
  IconCurrencyDollar,
  IconCheck,
  IconChartLine,
  IconShield,
  IconExclamationMark,
  IconBuilding,
  IconBuildingBank,
  IconCrossFilled,
  IconXboxX,
  IconX
} from '@tabler/icons-react';
import ConsentOTPDialog from './consent-otp';
import { DollarSign } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Loan, useLoanActions } from '@/store/loan-store';
import ConsentRejectDialog from './consent-reject';

interface InferenceRequest {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
}

const inferenceRequests: InferenceRequest[] = [
  {
    id: 'financial-health',
    title: 'Financial health metrics',
    description: 'Overall business financial performance indicators',
    icon: IconChartLine
  },
  {
    id: 'liquidity',
    title: 'Liquidity and repayment metrics',
    description: 'Cash flow analysis and debt servicing capability',
    icon: IconCurrencyDollar
  },
  {
    id: 'compliance',
    title: 'Compliance behavior',
    description: 'Regulatory compliance and tax payment patterns',
    icon: IconCheck
  },
  {
    id: 'operational',
    title: 'Operational size & scalability',
    description: 'Business scale assessment and growth potential',
    icon: IconChartLine
  }
];

const securityPoints = [
  'Requestor will only access inferences from your banking data, not raw statements',
  'You can cancel all permissions whenever you want',
  'Data processed securely using cryptographic tools to prevent misuse'
];

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  icon: React.ComponentType<any>;
}

const bankAccounts: BankAccount[] = [
  {
    id: 'hsbc-3456',
    bankName: 'HSBC UK',
    accountNumber: '3456',
    icon: IconBuilding
  },
  {
    id: 'barclays-7890',
    bankName: 'Barclays',
    accountNumber: '7890',
    icon: IconBuildingBank
  },
  {
    id: 'lloyds-2468',
    bankName: 'Lloyds Bank',
    accountNumber: '2468',
    icon: IconBuilding
  }
];

interface DataAccessConsentProps {
  onReject?: () => void;
  onOTPSubmit?: () => void;
  bankName?: string;
  selectedFinancingType?: string;
  selectedCountry?: string;
  selectedBank?: string;
  amount?: string;
}

export default function DataAccessConsent({
  onReject,
  onOTPSubmit
}: DataAccessConsentProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const { user, isLoading } = useAuth();
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loan, setLoan] = useState<Loan>();

  const { getLoans } = useLoanActions();

  const handleAccountToggle = (accountId: string) => {
    setSelectedAccountIds((prev) =>
      prev.includes(accountId)
        ? prev.filter((id) => id !== accountId)
        : [...prev, accountId]
    );
  };

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // Optional: for a smooth scrolling animation
    });
  }, []);

  useEffect(() => {
    if (user && user.entityId) {
      const getBanks = async (entityId: number) => {
        try {
          const smeResponse = await apiClient.sme.get(entityId);
          let sme = smeResponse.data;
          const bankResponse = await apiClient.bank.get(sme.bank_id);
          let bank = bankResponse.data;
          setBankAccounts([
            {
              id: bank.id,
              bankName: bank.name,
              accountNumber: sme.bank_account_number,
              icon: IconBuildingBank
            }
          ]);
          setLoan(getLoans()[0]);
        } catch (e) {
          console.log(e);
        }
      };
      getBanks(user.entityId);
    }
  }, [user, isLoading, onOTPSubmit, onReject, getLoans]);

  return (
    <div className='max-w-5xl space-y-8 p-6'>
      {/* Header */}
      <div className='space-y-2'>
        <h1 className='text-foreground text-2xl font-bold'>Consent Request</h1>
        <p className='text-muted-foreground text-sm'>
          Review and approve data sharing permissions.
        </p>
      </div>

      <Card className='border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20'>
        <CardContent>
          <div>
            <div className='mb-4 flex items-center'>
              <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/50'>
                <IconShield className='h-5 w-5 text-green-600 dark:text-green-400' />
              </div>
              <h3 className='ml-2 font-semibold text-green-900 dark:text-green-100'>
                Data Security & Privacy
              </h3>
            </div>
            <div className='flex-1'>
              <div className='space-y-3'>
                {securityPoints.map((point, index) => (
                  <div key={index} className='flex items-start space-x-3'>
                    <div className='mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-200 dark:bg-green-800'>
                      <IconExclamationMark className='h-3 w-3 text-green-600 dark:text-green-400' />
                    </div>
                    <p className='text-sm text-green-800 dark:text-green-200'>
                      {point}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {/* Left Panel - Consent Terms */}
        <Card className='bg-muted/30'>
          <CardHeader>
            <CardTitle className='text-xl font-semibold'>
              Consent Terms
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <h4 className='text-foreground font-medium'>Purpose of Fetch:</h4>
              <p className='text-muted-foreground text-sm'>{loan?.type}</p>
            </div>

            {/* One year from today */}
            <div className='space-y-2'>
              <h4 className='text-foreground font-medium'>Consent Expiry:</h4>
              <p className='text-muted-foreground text-sm'>
                {new Date(
                  Date.now() + 365 * 24 * 60 * 60 * 1000
                ).toLocaleDateString()}
              </p>
            </div>

            <div className='space-y-2'>
              <h4 className='text-foreground font-medium'>
                Validity of Consent:
              </h4>
              <p className='text-muted-foreground text-sm'>
                Valid until{' '}
                {new Date(
                  Date.now() + 365 * 24 * 60 * 60 * 1000
                ).toLocaleDateString()}{' '}
                or consent withdrawal
              </p>
            </div>

            <div className='space-y-2'>
              <h4 className='text-foreground font-medium'>
                Frequency of Fetch:
              </h4>
              <p className='text-muted-foreground text-sm'>
                One-time during application process, periodic updates if loan
                approved
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Right Panel - Inferences Request */}
        <Card className='bg-muted/30'>
          <CardHeader>
            <CardTitle className='text-xl font-semibold'>
              Loan Details
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <h4 className='text-foreground font-medium'>
                Selected Institution for Loan:
              </h4>
              <p className='text-muted-foreground text-sm'>{loan?.bank_name}</p>
            </div>
            <div className='space-y-2'>
              <h4 className='text-foreground font-medium'>Amount requested:</h4>
              <div className='text-muted-foreground flex items-center gap-1 text-sm'>
                <DollarSign className='text-muted-foreground h-4 w-4' />
                {loan?.amount}
              </div>
              {/* <p className="text-sm text-muted-foreground"><DollarSign className='h-4 w-4 text-muted-foreground' /> {amount}</p> */}
            </div>
            <div className='space-y-2'>
              <h4 className='text-foreground font-medium'>Purpose of Loan:</h4>
              <p className='text-muted-foreground text-sm'>{loan?.type}</p>
            </div>
            <div className='space-y-2'>
              <h4 className='text-foreground font-medium'>
                Selected Country of Institution:
              </h4>
              <p className='text-muted-foreground text-sm'>{loan?.country}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {/* Left Panel - Consent Terms */}
        <Card className='bg-muted/30'>
          <CardHeader>
            <CardTitle className='text-xl font-semibold'>
              Inferences Request
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-muted-foreground mb-6 text-sm'>
              {loan?.bank_name} is requesting access to following insights:
            </p>

            <div className='grid grid-cols-1 gap-4'>
              {inferenceRequests.map((request) => {
                const IconComponent = request.icon;
                return (
                  <div
                    key={request.id}
                    className='bg-background border-border flex items-start space-x-3 rounded-lg border p-4'
                  >
                    <div className='bg-primary/10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md'>
                      <IconComponent className='text-primary h-4 w-4' />
                    </div>
                    <div className='flex-1'>
                      <h4 className='text-foreground text-sm font-medium'>
                        {request.title}:
                      </h4>
                      <p className='text-muted-foreground mt-1 text-xs'>
                        {request.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Right Panel - Inferences Request */}
        <Card className='bg-muted/30'>
          <CardHeader>
            <div className='space-y-2'>
              <CardTitle className='text-xl font-semibold'>
                Select Accounts
              </CardTitle>
              <Card className='mt-4 mb-4 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20'>
                <CardContent>
                  <div>
                    <div className='flex-1'>
                      <div className='space-y-3'>
                        <div className='flex items-start space-x-3'>
                          <div className='mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-200 dark:bg-green-800'>
                            <IconExclamationMark className='h-3 w-3 text-green-600 dark:text-green-400' />
                          </div>
                          <p className='text-sm text-green-800 dark:text-green-200'>
                            Requested insights will be generated from financial
                            data soruces like Banks, Tax Authorities, Credit
                            Bureaus etc
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <p className='text-muted-foreground text-sm'>
                Choose which accounts to share insights from
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <div className='flex items-center justify-between'>
                <h4 className='text-foreground font-medium'>
                  Available Accounts
                </h4>
                {selectedAccountIds.length > 0 && (
                  <span className='text-primary text-sm font-medium'>
                    {selectedAccountIds.length} account
                    {selectedAccountIds.length > 1 ? 's' : ''} selected
                  </span>
                )}
              </div>
              <div className='space-y-3'>
                {bankAccounts.length > 0 ? (
                  bankAccounts.map((account) => {
                    const IconComponent = account.icon;
                    const isSelected = selectedAccountIds.includes(account.id);
                    return (
                      <div
                        key={account.id}
                        className={cn(
                          'flex cursor-pointer items-center space-x-3 rounded-lg border p-4 transition-colors',
                          isSelected
                            ? 'border-primary bg-primary/5 hover:bg-primary/10'
                            : 'border-border bg-background hover:bg-muted/50'
                        )}
                        onClick={() =>
                          loan?.consent_status === 'pending' &&
                          handleAccountToggle(account.id)
                        }
                      >
                        <div className='bg-primary/10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md'>
                          <IconComponent className='text-primary h-4 w-4' />
                        </div>
                        <div className='flex-1'>
                          <div className='flex items-center justify-between'>
                            <div>
                              <h5 className='text-foreground font-medium'>
                                {account.bankName}
                              </h5>
                              <p className='text-muted-foreground text-sm'>
                                Account ending in{' '}
                                {account.accountNumber.slice(-4)}.
                              </p>
                            </div>
                            {loan?.consent_status === 'pending' && (
                              <Checkbox
                                checked={isSelected}
                                onChange={() => handleAccountToggle(account.id)}
                                className='data-[state=checked]:bg-primary data-[state=checked]:border-primary'
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className='flex items-center space-x-2'>
                    <div className='border-primary h-4 w-4 animate-spin rounded-full border-b-2'></div>
                    <span>Fetching accounts...</span>
                  </div>
                )}
              </div>
              {loan?.consent_status === 'approved' ? (
                <div className='flex items-start space-x-3'>
                  <div className='mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-200 dark:bg-green-800'>
                    <IconCheck className='h-3 w-3 text-green-600 dark:text-green-400' />
                  </div>
                  <p className='text-sm text-white'>Consent approved</p>
                </div>
              ) : loan?.consent_status === 'rejected' ? (
                <div className='flex items-start space-x-3'>
                  <div className='mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-200 dark:bg-red-800'>
                    <IconX className='h-3 w-3 text-white' />
                  </div>
                  <p className='text-sm text-red-800 dark:text-red-200'>
                    Consent rejected
                  </p>
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className='flex justify-center space-x-4 pt-6'>
        <Button
          className='mr-4 cursor-pointer'
          variant='outline'
          onClick={onReject}
        >
          Back
        </Button>

        {loan?.consent_status === 'pending' ? (
          <>
            <ConsentRejectDialog
              onReject={onReject || (() => {})}
              disabled={false}
              loanId={loan?.id}
            />
            {bankAccounts.length > 0 && (
              <ConsentOTPDialog
                onSubmit={onOTPSubmit || (() => {})}
                disabled={selectedAccountIds.length === 0}
                bankName={bankAccounts[0].bankName}
                loanId={loan?.id}
              />
            )}
          </>
        ) : (
          <Button
            className='mr-4 cursor-pointer'
            variant='default'
            onClick={onOTPSubmit}
          >
            Next step
          </Button>
        )}
      </div>
    </div>
  );
}
