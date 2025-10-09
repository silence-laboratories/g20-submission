'use client';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

import { IconChartBar, IconCheck, IconCircleCheck, IconEye } from '@tabler/icons-react';
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
            let updatedLoan = await apiClient.loans.updateLoan(loan.id.split("-")[1], { status: "approved" })
            setIsLoading(false);
            console.log(updatedLoan.data);

            // Refresh the server component data using router.refresh()
            router.refresh();

            // Alternative: Use server action to revalidate specific path
            // await refreshApplications();
            setActionTaken('approved');
        }
        catch (e) {
            console.log(e);
            setIsLoading(false);
        }

    };

    const handleReject = async (loan: any) => {
        setIsLoading(true);
        // Add your rejection logic here
        try {
            let updatedLoan = await apiClient.loans.updateLoan(loan.id.split("-")[1], { status: "rejected" })
            setIsLoading(false);
            console.log(updatedLoan.data);
            router.refresh();
            setActionTaken('rejected');
        }
        catch (e) {
            console.log(e);
            setIsLoading(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Badge variant="default" className='cursor-pointer text-medium'><IconChartBar className='mr-1 h-3 w-3' />Dashboard</Badge>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[800px] md:max-w-[900px] lg:max-w-[95%] max-h-[95vh] overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle>Lender Assessment Dashboard</DialogTitle>
                    <DialogDescription>
                        Review financial data for loan decision
                    </DialogDescription>
                </DialogHeader>
                <div className="flex space-x-4 mt-4">
                    <DialogTrigger asChild>
                        <Button
                            className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white px-6 py-2 cursor-pointer"
                            onClick={() => handleApprove(loan)}
                            disabled={isLoading}
                        >
                            <Check className="h-4 w-4 mr-2" />
                            {actionTaken === 'approved' ? 'Loan Approved' : isLoading ? 'Submitting...' : 'Approve Loan'}
                        </Button>
                    </DialogTrigger>
                    <DialogTrigger asChild>
                        {actionTaken !== "approved" &&
                            <Button
                                className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white px-6 py-2 cursor-pointer"
                                onClick={() => handleReject(loan)}
                                disabled={isLoading}
                            >
                                <X className="h-4 w-4 mr-2" />
                                {actionTaken === 'rejected' ? 'Loan Rejected' : isLoading ? 'Submitting...' : 'Reject Loan'}
                            </Button>}
                    </DialogTrigger>
                </div>
                <LenderAssessmentDashboard loan={loan} />
            </DialogContent>
        </Dialog>
    );
}
