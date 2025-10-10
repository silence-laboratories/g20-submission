import { Loan, Product } from '@/constants/data';
import { ProductTable } from './sme-tables';
import { Application, columns as smeColumns } from './sme-tables/columns';
import { apiClient } from '@/lib/api';
import { User } from '@/types/index';
import axios from 'axios';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { v4 as uuid } from 'uuid';

type SMEApplicationListingPage = {};

export default async function SMEApplicationListingPage({
  user
}: {
  user: User;
}) {

  let loanData = [];
  let totalProducts = 0;

  if (user.entityId) {
    try {
      const response = await apiClient.loans.getBySME(user.entityId);
      loanData = response.data;
      totalProducts = loanData.length;
    } catch (e) {
      loanData = [];
      totalProducts = 0;
    }
  }

  const getBank = async (bank_id: number) => {
    try {
      const cookieStore = await cookies();
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/v1/bank/${bank_id}`,
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
      console.log('Authentication failed:', error);
      redirect('/auth/sign-in');
    }
  };

  // Convert loan data to application data
  const applications: Application[] = await Promise.all(
    loanData.map(async (loan: Loan) => {
      const bank = await getBank(loan.lending_bank_id);

      return {
        id: uuid().slice(0, 9) + loan.id.toString(),
        financial_institution: bank.name,
        purpose: loan.purpose,
        amount: loan.amount,
        consent_status: loan.consent_status,
        application_status: loan.status
      };
    })
  );

  return (
    <ProductTable
      data={applications}
      totalItems={totalProducts}
      columns={smeColumns}
    />
  );
}
