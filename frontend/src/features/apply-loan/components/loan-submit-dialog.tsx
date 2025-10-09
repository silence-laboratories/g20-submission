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

const steps = [
    {
        id: 1,
        title: 'Sharing Consent',
        description: 'Sharing approved consent by user from LoanConnect to SME bank',
    },
    {
        id: 2,
        title: 'Consent',
        description: 'Review and provide consent for data access and processing',
    },
    {
        id: 3,
        title: 'Data Upload',
        description: 'Upload required documents and supporting materials',
    }
]


export default function LoanSubmitDialog({ canProceed }: { canProceed: boolean }) {
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [loan, setLoan] = useState<Loan | null>(null);
    const { getLoans, clearLoans } = useLoanActions();
    const [currentStep, setCurrentStep] = useState<number>(1);
    const loans = getLoans();

    useEffect(() => {
        if (loans.length > 0) {
            setLoan(loans[0]);
        }

    }, [loans]);
    const router = useRouter();


    const handleSubmit = async (loan: Loan) => {
        setIsSubmitting(true)
        setTimeout(() => {
            setCurrentStep(2);
        }, 8000);

        // try {
        //     const requestData = {
        //         type: loan.type,
        //         amount: loan.amount,
        //         purpose: loan.type,
        //         status: "pending",
        //         interest_rate_min: loan.interest_rate_min,
        //         interest_rate_max: loan.interest_rate_max,
        //         duration: 24.0,
        //         lending_bank_id: loan.lending_bank_id,
        //         sme_id: loan.sme_id,
        //         consent_status: loan.consent_status,
        //         insights_status: loan.insights_status
        //     }


        //     const response = await apiClient.loans.create(requestData)
        //     // Show success message briefly
        //     setTimeout(() => {
        //         toast.success("Application submitted successfully!")
        //         // Redirect to appropriate portal
        //         router.push("/dashboard/applications");
        //     }, 2000)

        // } catch (error: any) {
        //     if (error.status === 401) {
        //         toast.error("Session expired! Please sign in again");
        //         router.push("/auth/sign-in");
        //         setIsSubmitting(false)
        //     }
        //     else {
        //         toast.error("Something went wrong! Please try again");
        //         setIsSubmitting(false)
        //     }
        // }
    };

    // Create a multi step dialog with change in state for a custom interval


    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="cursor-pointer" disabled={!canProceed}>
                    Submit Application
                </Button>
            </DialogTrigger>
            <DialogContent className={`sm:max-w-[425px] ${!isSubmitting ? '' : 'sm:max-w-[800px] md:max-w-[900px] lg:max-w-[1000px] max-h-[90vh]'}`}>

                <DialogHeader>
                    <DialogTitle>{!isSubmitting ? 'Submit Application' : `${steps[currentStep - 1].title}`}</DialogTitle>
                    <DialogDescription>
                        {!isSubmitting ? 'Review loan application details below' : `${steps[currentStep - 1].description}`}
                    </DialogDescription>
                </DialogHeader>

                {loan &&
                    !isSubmitting ? <>
                    <Card className="bg-muted/30">
                        {/* <CardHeader>
                        <CardTitle className="text-xl font-semibold">Loan Details</CardTitle>
                    </CardHeader> */}
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <h4 className="font-medium text-foreground">Selected Institution for Loan:</h4>
                                <p className="text-sm text-muted-foreground">{loan?.bank_name}</p>
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
                                <p className="text-sm text-muted-foreground">{loan?.type}</p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-medium text-foreground">Country of selected Institution:</h4>
                                <p className="text-sm text-muted-foreground">{loan?.country}</p>
                            </div>

                            <div className="space-y-2">
                                {loan.consent_status === "approved" ? <div className='flex items-center gap-2'><h4 className="font-medium text-foreground"> Consent Approved</h4><IconCircleCheck className='text-green-500' /></div> : <h4 className="font-medium text-foreground">Consent Pending</h4>}
                            </div>

                            <div className="space-y-2">
                                <div className='flex items-center gap-2'><h4 className="font-medium text-foreground">Data uploaded</h4><IconCircleCheck className='text-green-500' /></div>
                            </div>
                        </CardContent>
                    </Card>

                    <p className="text-sm text-muted-foreground">Are you sure you want to submit?</p>
                    <DialogFooter>
                        <Button size='sm' className='cursor-pointer' onClick={() => handleSubmit(loan)} disabled={isSubmitting}>
                            {isSubmitting ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Submitting application...
                                </div>
                            ) : (
                                `Yes`
                            )}
                        </Button>
                    </DialogFooter>
                </> : currentStep === 1 ? <ConsentShare /> : <DataShare />}
            </DialogContent>
        </Dialog>
    );
}
