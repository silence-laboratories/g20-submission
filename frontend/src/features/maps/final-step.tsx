'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { IconExclamationMark } from '@tabler/icons-react';
import { TrendingUp, DollarSign, Shield, BarChart3, Users, Lock, CheckCircle, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
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

const FinalStep = () => {
    const router = useRouter();
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
        
        <div>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {insightCategories.map((category: any) => (
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

            <Button className='mt-8 float-right cursor-pointer' onClick={() => router.push('/dashboard/applications')}>Proceed to Applications</Button>
        </div>
    </div>;
};

export default FinalStep;