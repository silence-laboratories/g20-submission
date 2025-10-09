import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { Suspense } from 'react';
import { cookies } from 'next/headers';
import axios from 'axios';
import { redirect } from 'next/navigation';
import SMEApplicationListingPage from '@/features/applications/components/sme/sme-application-listing';
import BankApplicationListingPage from '@/features/applications/components/bank/bank-application-listing';

export const metadata = {
  title: 'Dashboard: Applications'
};

export default async function Page() {
  const getUser = async () => {
    try {
      const cookieStore = await cookies();
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/v1/auth/me`,
        {
          withCredentials: true,
          headers: {
            Cookie: cookieStore.toString(),
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
            Expires: '0'
          }
        }
      );
      return response.data;
    } catch (error) {
      // Authentication failed, redirect to sign-in
      redirect('/auth/sign-in');
    }
  };

  let user = await getUser();

  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Applications'
            description={
              user.entityType === 'sme'
                ? 'Manage your Loan Applications'
                : 'Review loan applications from SMEs'
            }
          />
        </div>
        <Separator />
        <Suspense
          // key={key}
          fallback={
            <DataTableSkeleton columnCount={5} rowCount={8} filterCount={2} />
          }
        >
          {user.entityType === 'sme' ? (
            <SMEApplicationListingPage user={user} />
          ) : (
            <BankApplicationListingPage user={user} />
          )}
        </Suspense>
      </div>
    </PageContainer>
  );
}
