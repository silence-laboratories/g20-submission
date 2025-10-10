'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { IconExclamationMark } from '@tabler/icons-react';
import { TrendingUp, DollarSign, Shield, BarChart3, Users, Lock, CheckCircle, ShieldCheck } from 'lucide-react';    

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

const FirstStep = ({ startScene }: { startScene: () => void }) => {
    return <div className='space-y-8'>
        {/* Privacy Guarantees Section */}
        {/* <div>
            <Card className='border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20'>
                <CardContent className='px-4 py-4'>
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
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div> */}

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
            <p className='text-foreground'>
                Once the loan application is submitted, the following will happen behind the scenes:
            </p>

            <Button className='float-right cursor-pointer' onClick={startScene}>Proceed</Button>
    </div>;
};

export default FirstStep;