'use client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';

import {
  IconChartBar,
  IconCheck,
  IconCircleCheck,
  IconEye
} from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';

import LenderAssessmentDashboard from './insights-view';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ViewInsightsDialog({ loan }: { loan: any }) {
  const [actionTaken, setActionTaken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleApprove = async (loan: any) => {
    setIsLoading(true);
    try {
      let updatedLoan = await apiClient.loans.updateLoan(
        loan.id.split('-')[1],
        { status: 'approved' }
      );
      setIsLoading(false);

      // Refresh the server component data using router.refresh()
      router.refresh();

      // Alternative: Use server action to revalidate specific path
      // await refreshApplications();
      setActionTaken('approved');
    } catch (e) {
      console.log(e);
      setIsLoading(false);
    }
  };

  const handleReject = async (loan: any) => {
    setIsLoading(true);
    // Add your rejection logic here
    try {
      let updatedLoan = await apiClient.loans.updateLoan(
        loan.id.split('-')[1],
        { status: 'rejected' }
      );
      setIsLoading(false);
      router.refresh();
      setActionTaken('rejected');
    } catch (e) {
      console.log(e);
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Badge variant='default' className='text-medium cursor-pointer'>
          <IconChartBar className='mr-1 h-3 w-3' />
          Dashboard
        </Badge>
      </DialogTrigger>
      <DialogContent className='max-h-[95vh] overflow-y-auto sm:max-w-[800px] md:max-w-[900px] lg:max-w-[95%]'>
        <DialogHeader>
          <DialogTitle>Lender Assessment Dashboard</DialogTitle>
          <DialogDescription>
            Review financial data for loan decision
          </DialogDescription>
        </DialogHeader>
        <div className='mt-4 flex space-x-4'>
          {loan.applicationStatus === "pending" ?
            (
              <>
                <DialogTrigger asChild>
                  <Button
                    className='cursor-pointer bg-green-600 px-6 py-2 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600'
                    onClick={() => handleApprove(loan)}
                    disabled={isLoading}
                  >
                    <Check className='mr-2 h-4 w-4' />
                    {actionTaken === 'approved'
                      ? 'Loan Approved'
                      : isLoading
                        ? 'Submitting...'
                        : 'Approve Loan'}
                  </Button>
                </DialogTrigger>
                <DialogTrigger asChild>
                  {actionTaken !== 'approved' && (
                    <Button
                      className='cursor-pointer bg-red-600 px-6 py-2 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600'
                      onClick={() => handleReject(loan)}
                      disabled={isLoading}
                    >
                      <X className='mr-2 h-4 w-4' />
                      {actionTaken === 'rejected'
                        ? 'Loan Rejected'
                        : isLoading
                          ? 'Submitting...'
                          : 'Reject Loan'}
                    </Button>
                  )}
                </DialogTrigger>
              </>
            ) : loan.applicationStatus === "approved" ? (
              <Button
                className='bg-green-600 px-6 py-2 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600'
              >
                <Check className='mr-2 h-4 w-4' />
                Loan Approved
              </Button>
            ) : (
              <Button
                className='bg-red-600 px-6 py-2 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600'
              >
                <X className='mr-2 h-4 w-4' />
                Loan Rejected
              </Button>
            )}
        </div>
        <LenderAssessmentDashboard loan={loan} />
      </DialogContent>
    </Dialog>
  );
}
