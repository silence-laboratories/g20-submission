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
import { IconCheck, IconCircleCheck, IconEye } from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';



export default function ViewLoanDialog({ loan }: { loan: any }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Badge variant="default" className='cursor-pointer text-medium'><IconEye className='mr-1 h-3 w-3' /> View Loan</Badge>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[425px]'>
                <DialogHeader>
                    <DialogTitle>Loan application</DialogTitle>
                    <DialogDescription>
                        Review the loan application details below
                    </DialogDescription>
                </DialogHeader>

                {loan &&
                    <>
                        <Card className="bg-muted/30">
                            {/* <CardHeader>
                        <CardTitle className="text-xl font-semibold">Loan Details</CardTitle>
                    </CardHeader> */}
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <h4 className="font-medium text-foreground">Selected Institution for Loan:</h4>
                                    <p className="text-sm text-muted-foreground">{loan?.financial_institution}</p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-medium text-foreground">Amount requested:</h4>
                                    <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                                        <DollarSign className='h-4 w-4 text-muted-foreground' />
                                        {loan?.amount}
                                    </div>
                                    {/* <p className="text-sm text-muted-foreground"><DollarSign className='h-4 w-4 text-muted-foreground' /> {amount}</p> */}
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-medium text-foreground">Purpose of Loan:</h4>
                                    <p className="text-sm text-muted-foreground">{loan?.purpose}</p>
                                </div>

                                <div className="space-y-2">
                                    {loan.consent_status === "approved" ? <div className='flex items-center gap-2'><h4 className="font-medium text-foreground"> Consent Approved</h4><IconCircleCheck className='text-green-500' /></div> : <h4 className="font-medium text-foreground">Consent Pending</h4>}
                                </div>
                            </CardContent>
                        </Card>
                    </>}
            </DialogContent>
        </Dialog>
    );
}
