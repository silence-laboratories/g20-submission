// import { Loan, Product } from '@/constants/data';
import { ProductTable } from '../sme/sme-tables';
import { BankApplication, columns as bankColumns } from './bank-tables/columns'; 1
import { apiClient } from '@/lib/api';
import { User } from '@/types/index';
import { cookies } from 'next/headers';
import axios from 'axios';
import { redirect } from 'next/navigation';
import { Loan } from "@/store/loan-store";
import { v4 as uuid } from 'uuid';

type BankApplicationListingPage = {};

export default async function BankApplicationListingPage({ user }: { user: User }) {
  const getSME = async (sme_id?: number) => {
    try {
      const cookieStore = await cookies()
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/v1/sme/${sme_id}`,
        {
          withCredentials: true,
          headers: {
            'Cookie': cookieStore.toString(),
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      );
      return response.data
    } catch (error) {
      // Authentication failed, redirect to sign-in
      redirect('/auth/sign-in');
    }
  }

  const getBank = async (bank_id: number) => {
    try {
      const cookieStore = await cookies()
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/v1/bank/${bank_id}`,
        {
          withCredentials: true,
          headers: {
            'Cookie': cookieStore.toString(),
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      );
      return response.data
    } catch (error) {
      // Authentication failed, redirect to sign-in
      redirect('/auth/sign-in');
    }
  }

  const response = await apiClient.loans.getByBank(user?.entityId || 0);
  const loanData = response.data;
  const totalProducts = loanData.length;
  const bankApplications: BankApplication[] = await Promise.all(
    loanData.map(async (loan: Loan) => {

      const sme = await getSME(loan.sme_id);

      const smeBank = await getBank(sme.bank_id);

      return {
        id: uuid().slice(0,9) + loan.id.toString(),
        organization: sme.name,
        purpose: loan.purpose,
        amount: loan.amount,
        consentStatus: loan.consent_status,
        applicationStatus: loan.status,
        insightStatus: loan.insights_status,
        smeBank: smeBank.name,
        smeBankCountry: smeBank.country,
        phoneNumber: sme.registered_phone_number,
        registrationNumber: sme.registration_number
      }
    })
  );

  return (
    <ProductTable
      data={bankApplications}
      totalItems={totalProducts}
      columns={bankColumns}
    />
  );
}
