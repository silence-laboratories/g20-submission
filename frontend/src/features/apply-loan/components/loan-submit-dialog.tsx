'use client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';
import { Loan, useLoanActions } from '@/store/loan-store';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { IconCheck, IconCircleCheck } from '@tabler/icons-react';
import { toast } from 'sonner';
import ConsentShare from '@/features/maps/consent-share';
import DataShare from '@/features/maps/data-share';
import FinanceShare from '@/features/maps/finance-share';
import TaxShare from '@/features/maps/tax-share';
import CreditShare from '@/features/maps/credit-share';
import Computation from '@/features/maps/computation';
import FinalStep from '@/features/maps/final-step';
import FirstStep from '@/features/maps/first-step';

const steps = [
  {
    id: 0,
    title: 'Loan Application',
    description: 'Review loan application status'
  },
  {
    id: 1,
    title: 'Sharing Encrypted Consent',
    description: 'Approved consent is encrypted and shared from LoanConnect to SME bank'
  },
  {
    id: 2,
    title: 'Sharing Encrypted Financial Data',
    description: 'Encrypted financial data is shared from SME bank to LoanConnect'
  },
  {
    id: 3,
    title: 'Sharing Encrypted Tax Data',
    description: 'Encrypted tax data is shared from Tax Authorities to LoanConnect'
  },
  {
    id: 4,
    title: 'Sharing Encrypted Credit Data',
    description: 'Encrypted credit data is shared from Credit Bureaus to LoanConnect'
  },
  {
    id: 5,
    title: 'Computation of Encrypted data',
    description: 'Below Insights are generated on the encrypted data received from multiple data sources'
  }
];

export default function LoanSubmitDialog({
  canProceed
}: {
  canProceed: boolean;
}) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [loan, setLoan] = useState<Loan | null>(null);
  const { getLoans, clearLoans } = useLoanActions();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const loans = getLoans();

  const [loanStatus, setLoanStatus] = useState<string>('pending');

  useEffect(() => {
    if (loans.length > 0) {
      setLoan(loans[0]);
    }
  }, [loans]);
  const router = useRouter();

  const handleSubmit = async (loan: Loan) => {
    setIsSubmitting(true);

    setTimeout(async () => {
      try {
        const requestData = {
          type: loan.type,
          amount: loan.amount,
          purpose: loan.type,
          status: "pending",
          interest_rate_min: loan.interest_rate_min,
          interest_rate_max: loan.interest_rate_max,
          duration: 24.0,
          lending_bank_id: loan.lending_bank_id,
          sme_id: loan.sme_id,
          consent_status: loan.consent_status,
          insights_status: loan.insights_status
        }

        const response = await apiClient.loans.create(requestData)

        setLoanStatus('submitted');
        // // Show success message briefly
        // setTimeout(() => {
        //     toast.success("Application submitted successfully!")
        //     // Redirect to appropriate portal
        //     router.push("/dashboard/applications");
        // }, 2000)

      } catch (error: any) {
        if (error.status === 401) {
          toast.error("Session expired! Please sign in again");
          router.push("/auth/sign-in");
          setIsSubmitting(false)
        }
        else {
          toast.error("Something went wrong! Please try again");
          setIsSubmitting(false)
        }
      }
    }, 2000)

  };

  const startScene = () => {
    setCurrentStep(1);
    setTimeout(() => {
      setCurrentStep(2);
    }, 7500);

    setTimeout(() => {
      setCurrentStep(3);
    }, 15000);

    setTimeout(() => {
      setCurrentStep(4);
    }, 22500);

    setTimeout(() => {
      setCurrentStep(5);
    }, 30000);
  }

  // Create a multi step dialog with change in state for a custom interval

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className='cursor-pointer' disabled={!canProceed}>
          Submit Application
        </Button>
      </DialogTrigger>
      <DialogContent
        className={`sm:max-w-[425px] ${!isSubmitting ? '' : 'max-h-[90vh] sm:max-w-[800px] md:max-w-[900px] lg:max-w-[1000px]'}`}
      >
        <DialogHeader>
          <DialogTitle>
            {!isSubmitting
              ? 'Submit Application'
              : `${steps[currentStep].title}`}
          </DialogTitle>
          <DialogDescription>
            {!isSubmitting
              ? 'Review loan application details below'
              : `${steps[currentStep].description}`}
          </DialogDescription>
        </DialogHeader>

        {loan && !isSubmitting ? (
          <>
            <Card className='bg-muted/30'>
              {/* <CardHeader>
                        <CardTitle className="text-xl font-semibold">Loan Details</CardTitle>
                    </CardHeader> */}
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <h4 className='text-foreground font-medium'>
                    Selected Institution for Loan:
                  </h4>
                  <p className='text-muted-foreground text-sm'>
                    {loan?.bank_name}
                  </p>
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
                  <p className='text-muted-foreground text-sm'>{loan?.type}</p>
                </div>
                <div className='space-y-2'>
                  <h4 className='text-foreground font-medium'>
                    Country of selected Institution:
                  </h4>
                  <p className='text-muted-foreground text-sm'>
                    {loan?.country}
                  </p>
                </div>

                <div className='space-y-2'>
                  {loan.consent_status === 'approved' ? (
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

                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <h4 className='text-foreground font-medium'>
                      Data uploaded
                    </h4>
                    <IconCircleCheck className='text-green-500' />
                  </div>
                </div>
              </CardContent>
            </Card>

            <p className='text-muted-foreground text-sm'>
              Are you sure you want to submit?
            </p>
            <DialogFooter>
              <Button
                size='sm'
                className='cursor-pointer'
                onClick={() => handleSubmit(loan)}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className='flex items-center justify-center'>
                    <div className='mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white'></div>
                    Submitting application...
                  </div>
                ) : (
                  `Yes`
                )}
              </Button>
            </DialogFooter>
          </>
        ) :
          currentStep === 0 ? (
            <FirstStep startScene={startScene} />
          ) :
            currentStep === 1 ? (
              <ConsentShare />
            ) : currentStep === 2 ? (
              <FinanceShare />
            ) : currentStep === 3 ? (
              <TaxShare />
            ) : currentStep === 4 ? (
              <CreditShare />
            ) : (
              <FinalStep />
            )}
      </DialogContent>
    </Dialog>
  );
}