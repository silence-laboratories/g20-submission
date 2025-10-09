import { Metadata } from 'next';
import SignInViewPage from '@/features/auth/components/sign-in-view';
// import PageContainer from '@/components/layout/page-container';
// import ConsentShare from '@/features/auth/components/maps/consent-share';

export const metadata: Metadata = {
  title: 'Authentication | Sign In',
  description: 'Sign In page for authentication.'
};

export default async function Page() {
  // return <PageContainer scrollable><div><ConsentShare /></div></PageContainer>;
  return <SignInViewPage />;
}
