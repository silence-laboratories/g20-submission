'use client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { IconCheck, IconCircleCheck, IconEye } from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

import {
  TrendingUp,
  DollarSign,
  Shield,
  BarChart3,
  Users,
  FileText,
  Lock,
  CheckCircle,
  ShieldCheck
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import InsightsRequest from '@/features/maps/insights-request';
import Computation from '@/features/maps/computation';
import InsightsSend from '@/features/maps/insights-send';

interface InsightCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  comingSoon?: boolean;
}

interface PrivacyGuarantee {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const insightCategories: InsightCategory[] = [
  {
    id: 'business-financial-health',
    title: 'Business Financial Health',
    description: 'Assessment of business financial stability and growth',
    icon: <TrendingUp className='text-primary h-4 w-4' />
  },
  {
    id: 'liquidity-repayment',
    title: 'Liquidity & Repayment',
    description: 'Analysis of liquidity position and repayment capacity',
    icon: <DollarSign className='text-primary h-4 w-4' />
  },
  {
    id: 'compliance-behavior',
    title: 'Compliance Behavior',
    description: 'Evaluation of regulatory compliance and adherence',
    icon: <Shield className='text-primary h-4 w-4' />
  },
  {
    id: 'operational-size-stability',
    title: 'Operational Size & Stability',
    description: 'Assessment of operational scale and business stability',
    icon: <BarChart3 className='text-primary h-4 w-4' />
  },
  {
    id: 'sme-rating',
    title: 'SME Rating',
    description: 'Comprehensive SME credit rating and assessment',
    icon: <Users className='text-primary h-4 w-4' />
  }
];

const privacyGuarantees: PrivacyGuarantee[] = [
  {
    id: 'no-raw-data',
    title: 'No raw data is shared with you',
    description: 'Only processed insights are provided',
    icon: <Lock className='h-4 w-4' />
  },
  {
    id: 'auditable-proofs',
    title: 'Auditable proofs of inference computation and correctness',
    description: 'Cryptographic proofs ensure data integrity',
    icon: <CheckCircle className='h-4 w-4' />
  },
  {
    id: 'customer-consent',
    title: 'Only customer consented inferences will be processed',
    description: 'Strict adherence to customer consent boundaries',
    icon: <ShieldCheck className='h-4 w-4' />
  }
];

const steps = [
  {
    id: 0,
    title: 'Request Inferences',
    description: 'Request Inferences about SME from the data received from multiple data sources'
  },
  {
    id: 1,
    title: 'Running computations on Encrypted data',
    description: 'Inferences are calculated by the computations performed on the encrypted data'
  },
  {
    id: 2,
    title: 'Sharing Encrypted Inferences',
    description: 'Encrypted inferences are shared from LoanConnect to Lender bank'
  }
];

export default function BankViewLoanDialog({ loan }: { loan: any }) {
  const [activeView, setActiveView] = useState('details');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const handleGenerateInsights = async () => {
    setIsLoading(true);
    setActiveView('scene');

    setTimeout(() => {
      setCurrentStep(1);
    }, 8500);

    setTimeout(() => {
      setCurrentStep(2);
    }, 13600);
  };

  const viewInferences = async (loan: any) => {
    try {
      let updatedLoan = await apiClient.loans.updateLoan(
        loan.id.split('-')[1],
        { insights_status: 'generated' }
      );
      setIsLoading(false);
      console.log(updatedLoan.data);

      // Refresh the server component data using router.refresh()
      router.refresh();

      // Alternative: Use server action to revalidate specific path
      // await refreshApplications();
    } catch (e) {
      console.log(e);
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Badge variant='outline' className='text-medium cursor-pointer'>
          <IconEye className='mr-1 h-3 w-3' />
          Review
        </Badge>
      </DialogTrigger>
      <DialogContent
        className={`sm:max-w-[625px] md:max-w-[700px] lg:max-w-[700px] ${activeView === 'details' ? '' : 'max-h-[90vh] overflow-y-auto sm:max-w-[800px] md:max-w-[900px] lg:max-w-[1000px]'}`}
      >
        <DialogHeader>
          <DialogTitle>
            {activeView === 'details'
              ? 'Loan application'
              : activeView === 'insights' ? 'Insights Configuration' : `${steps[currentStep].title}`}
          </DialogTitle>
          <DialogDescription>
            {activeView === 'details'
              ? 'Review the loan application and generate insights securely'
              : activeView === 'insights' ? 'Review the insights categories that will be generated by secure computation' : `${steps[currentStep].description}`}
          </DialogDescription>
        </DialogHeader>

        {loan &&
          (activeView === 'details' ? (
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <Card className='bg-muted/30'>
                <CardContent className='space-y-4'>
                  <div className='space-y-2'>
                    <h4 className='text-foreground font-medium'>
                      Organization:
                    </h4>
                    <p className='text-muted-foreground text-sm'>
                      {loan?.organization}
                    </p>
                  </div>

                  <div className='space-y-2'>
                    <h4 className='text-foreground font-medium'>
                      Registration number:
                    </h4>
                    <p className='text-muted-foreground text-sm'>
                      {loan?.registrationNumber}
                    </p>
                  </div>

                  <div className='space-y-2'>
                    <h4 className='text-foreground font-medium'>
                      Registered Mobile Number:
                    </h4>
                    <p className='text-muted-foreground text-sm'>
                      {loan?.phoneNumber}
                    </p>
                  </div>
                  <div className='space-y-2'>
                    <h4 className='text-foreground font-medium'>
                      Registered country:
                    </h4>
                    <p className='text-muted-foreground text-sm'>
                      {loan?.smeBankCountry}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className='bg-muted/30'>
                <CardContent className='space-y-4'>
                  <div className='space-y-2'>
                    <h4 className='text-foreground font-medium'>
                      Primary financial partner:
                    </h4>
                    <p className='text-muted-foreground text-sm'>
                      {loan?.smeBank}
                    </p>
                    <div className='flex items-center gap-2'>
                      <h4 className='text-sm text-green-500'>
                        Account verified
                      </h4>
                      <IconCircleCheck className='text-green-500' />
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <h4 className='text-foreground font-medium'>
                      Amount requested:
                    </h4>
                    <div className='text-muted-foreground flex items-center gap-1 text-sm'>
                      <DollarSign className='text-muted-foreground h-4 w-4' />
                      {loan?.amount}
                    </div>
                    {/* <p className="text-sm text-muted-foreground"><DollarSign className='h-4 w-4 text-muted-foreground' /> {amount}</p> */}
                  </div>
                  <div className='space-y-2'>
                    <h4 className='text-foreground font-medium'>
                      Purpose of Loan:
                    </h4>
                    <p className='text-muted-foreground text-sm'>
                      {loan?.purpose}
                    </p>
                  </div>

                  <div className='space-y-2'>
                    {loan.consentStatus === 'approved' ? (
                      <div className='flex items-center gap-2'>
                        <h4 className='text-foreground font-medium'>
                          {' '}
                          Consent Approved
                        </h4>
                        <IconCircleCheck className='text-green-500' />
                      </div>
                    ) : (
                      <h4 className='text-foreground font-medium'>
                        Consent Pending
                      </h4>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : activeView === "insights" ? (
            <div className='space-y-8'>
              {/* Privacy Guarantees Section */}
              <div>
                <Card className='border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20'>
                  <CardContent className='px-4'>
                    <h3 className='text-lg font-semibold text-green-100'>
                      Privacy Guarantees
                    </h3>
                    {privacyGuarantees.map((guarantee) => (
                      <div
                        className='my-2 flex items-center space-x-3'
                        key={guarantee.id}
                      >
                        <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50'>
                          <div className='text-green-600 dark:text-green-400'>
                            {guarantee.icon}
                          </div>
                        </div>
                        <div className='min-w-0 flex-1'>
                          <h3 className='text-sm text-green-300'>
                            {guarantee.title}
                          </h3>
                          {/* <p className="text-xs text-muted-background mt-1">
                                                    {guarantee.description}
                                                </p> */}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
              {/* Select Insights Categories Section */}
              <div>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                  {insightCategories.map((category) => (
                    <Card
                      key={category.id}
                      className={`bg-muted/30 cursor-pointer border hover:shadow-md`}
                    >
                      <CardContent className='px-4'>
                        <div className='flex items-start space-x-3'>
                          <div className='bg-primary/10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md'>
                            {category.icon}
                          </div>
                          <div className='min-w-0 flex-1'>
                            <div className='flex items-center justify-between'>
                              <h3 className='text-foreground text-sm font-semibold'>
                                {category.title}
                              </h3>
                            </div>
                            <p className='text-muted-foreground mt-1 text-xs'>
                              {category.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>) : (<div>{currentStep === 0 ? <InsightsRequest /> : currentStep === 1 ? <Computation /> : <InsightsSend />}</div>)
          )}
        {!(activeView === "scene") &&
          <DialogFooter className='flex justify-between'>
            {loan?.insightStatus === 'generating' ? (
              <Button
                variant='default'
                size='sm'
                className='cursor-pointer'
                disabled
              >
                Generating Insights...
              </Button>
            ) : activeView === 'details' ? (
              <Button
                variant='default'
                size='sm'
                className='cursor-pointer'
                onClick={() => setActiveView('insights')}
              >
                Review Insights
              </Button>
            ) : (
              <Button
                variant='default'
                size='sm'
                className='cursor-pointer'
                onClick={handleGenerateInsights}
              >
                {isLoading ? (
                  <div className='flex items-center justify-center'>
                    <div className='mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white'></div>
                    Submitting...{' '}
                  </div>
                ) : (
                  `Generate Insights`
                )}
              </Button>
            )}
          </DialogFooter>}

        {currentStep === 2 && <DialogFooter className='flex justify-between'>
          <DialogTrigger asChild>
            <Button variant='default' size='sm' className='cursor-pointer' onClick={() => viewInferences(loan)}>View Inferences</Button>
          </DialogTrigger>
        </DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}
