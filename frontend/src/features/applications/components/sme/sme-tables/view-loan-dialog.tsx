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
import { IconCheck, IconCircleCheck, IconCircleX, IconEye } from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';

export default function ViewLoanDialog({ loan }: { loan: any }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline' size="sm" className='text-sm cursor-pointer'>
          <IconEye className='mr-1 h-3 w-3' /> View
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Loan application</DialogTitle>
          <DialogDescription>
            Review the loan application details below
          </DialogDescription>
        </DialogHeader>

        {loan && (
          <>
            <Card className='bg-muted/30'>
              {/* <CardHeader>
                        <CardTitle className="text-xl font-semibold">Loan Details</CardTitle>
                    </CardHeader> */}
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <h4 className='text-foreground font-medium'>
                    Application ID:
                  </h4>
                  <p className='text-muted-foreground text-sm'>
                    {loan?.id}
                  </p>
                </div>
                <div className='space-y-2'>
                  <h4 className='text-foreground font-medium'>
                    Selected Institution for Loan:
                  </h4>
                  <p className='text-muted-foreground text-sm'>
                    {loan?.financial_institution}
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
                  <p className='text-muted-foreground text-sm'>
                    {loan?.purpose}
                  </p>
                </div>

                <div className='space-y-2'>
                  {loan.consent_status === 'approved' ? (
                    <div className='flex items-center gap-2'>
                      <h4 className='text-green-500 font-medium'>
                        Consent Approved
                      </h4>
                      <IconCircleCheck className='text-green-500' />
                    </div>
                  ) : (
                    <h4 className='text-yellow-500 font-medium'>
                      Consent Pending
                    </h4>
                  )}
                </div>

                <div className='space-y-2'>
                  {loan.application_status === "approved" ? (
                    <div className='flex items-center gap-2'>
                      <h4 className='text-green-500 font-medium'>
                        Loan Approved
                      </h4>
                      <IconCircleCheck className='text-green-500' />
                    </div>
                  ) : loan.application_status === "rejected" ? (
                    <div className='flex items-center gap-2'>
                      <h4 className='text-red-500 font-medium'>
                        Loan Rejected
                      </h4>
                      <IconCircleX className='text-red-500' />
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
