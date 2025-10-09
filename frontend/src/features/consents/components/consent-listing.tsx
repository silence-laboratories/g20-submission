import { Loan, Product } from '@/constants/data';
import { fakeProducts } from '@/constants/mock-api';
import { searchParamsCache } from '@/lib/searchparams';
import { ProductTable } from './product-tables';
import { Application, columns } from './product-tables/columns';
import { apiClient } from '@/lib/api';

type ConsentListingPage = {};

export default async function ConsentListingPage({}: ConsentListingPage) {
  // Showcasing the use of search params cache in nested RSCs
  const page = searchParamsCache.get('page');
  const search = searchParamsCache.get('name');
  const pageLimit = searchParamsCache.get('perPage');
  const categories = searchParamsCache.get('category');

  const filters = {
    page,
    limit: pageLimit,
    ...(search && { search }),
    ...(categories && { categories: categories })
  };

  const response = await apiClient.loans.getAll();
  const loanData = response.data.data;
  const totalProducts = loanData.length;

  // Convert loan data to application data
  const applications: Application[] = loanData.map((loan : Loan) => ({
    id: loan.id.toString(),
    financial_institution: "ICICI Bank",
    purpose: loan.purpose,
    amount: loan.amount,
    consent_status: 'pending',
    application_status: 'pending',
  }));

  return (
    <ProductTable
      data={applications}
      totalItems={totalProducts}
      columns={columns}
    />
  );
}
