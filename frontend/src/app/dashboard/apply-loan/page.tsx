import ApplyLoanView from '@/features/apply-loan/components/apply-loan-view';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata = {
  title: 'Dashboard : Apply for Loan'
};

export default function page() {
  return (
    <PageContainer scrollable>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Apply for a Loan'
            description='Provide application details and consent to share data with the bank'
          />
        </div>
        <Separator />
        <Suspense
          // key={key}
          fallback={<Skeleton />}
        >
          <ApplyLoanView />
        </Suspense>
      </div>
    </PageContainer>
  );
}
