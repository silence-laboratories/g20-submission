'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { IconCircle, IconExclamationMark } from '@tabler/icons-react';
import { Lock, CheckCircle, ShieldCheck } from 'lucide-react';
import ProgressStepsCard from './progress-steps-card';

interface PrivacyGuarantee {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
}

const privacyGuarantees: PrivacyGuarantee[] = [
    {
        id: 'no-raw-data',
        title: 'No raw data is shared with LoanConnect',
        description: 'Inference is computed on the encrypted data received from multiple data sources',
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

const progressSteps = [
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
        description: 'Insights are generated on the encrypted data received from multiple data sources'
    }
];

const FirstStep = ({ startScene }: { startScene: () => void }) => {
    return <div className='space-y-8'>
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
                                    Loan application submitted successfully
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Write a good copy to say to user this what will happen behind the scenes once lona application is submitted */}
        <p className='text-foreground mb-6'>
            Once the loan application is submitted, the following will happen behind the scenes:
        </p>

        <div className='flex items-center gap-2 mb-4'>
            <IconCircle className='text-primary' />
            <h4 className='text-foreground font-medium'>
                Sharing Encrypted Consent
            </h4>
        </div>
        <div className='flex items-center gap-2 mb-4'>
            <IconCircle className='text-primary' />
            <h4 className='text-foreground font-medium'>
                Sharing Encrypted Financial Data
            </h4>
        </div>

        <div className='flex items-center gap-2 mb-4'>
            <IconCircle className='text-primary' />
            <h4 className='text-foreground font-medium'>
                Sharing Encrypted Tax Data
            </h4>
        </div>
        <div className='flex items-center gap-2 mb-2'>
            <IconCircle className='text-primary' />
            <h4 className='text-foreground font-sm'>
                Sharing Encrypted Credit Data
            </h4>

        </div>

        <Button className='float-right cursor-pointer' onClick={() => startScene()}>Proceed</Button>
    </div>;
};

export default FirstStep;