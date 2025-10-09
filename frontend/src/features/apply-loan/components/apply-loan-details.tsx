'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';
import DataAccessConsent from './apply-loan-consent';
import { Separator } from '@/components/ui/separator';
import { useLoanActions } from '@/store/loan-store';
import MapDemo from '@/features/maps/map-demo';

interface FinancingType {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface Bank {
  id: string;
  name: string;
  description: string;
  logo: string;
  interest_min: number;
  interest_max: number
}

interface CountryBanks {
  [country: string]: Bank[];
}

const financingTypes: FinancingType[] = [
  {
    id: 'working-capital',
    title: 'Working Capital Loan',
    description: 'Short-term financing for operational needs',
    icon: '💰'
  },
  {
    id: 'equipment',
    title: 'Equipment/Machinery Loan',
    description: 'Funding for business equipment and machinery',
    icon: '⚙️'
  },
  {
    id: 'trade',
    title: 'Trade Financing',
    description: 'Import/export and trade finance solutions',
    icon: '🚢'
  },
  {
    id: 'other',
    title: 'Other',
    description: 'Other business financing requirements',
    icon: '📋'
  }
];

const countries = [
  'India',
  'United States',
  'United Kingdom',
  'Singapore'
];

// const countryBanks: CountryBanks = {
//   'India': [
//     { id: 'sbi', name: 'State Bank of India', description: 'Public sector banking', logo: '🏦', interest: "8.5% - 11.5%" },
//     { id: 'hdfc', name: 'HDFC Bank', description: 'Private sector banking', logo: '🏛️', interest: "8.5% - 11.5%" },
//     { id: 'icici', name: 'ICICI Bank', description: 'Corporate banking services', logo: '🏪', interest: "8.5% - 11.5%" },
//   ],
//   'United States': [
//     { id: 'chase', name: 'JPMorgan Chase', description: 'Leading commercial banking services', logo: '🏦', interest: "8.5% - 11.5%" },
//     { id: 'bofa', name: 'Bank of America', description: 'Comprehensive business solutions', logo: '🏛️', interest: "8.5% - 11.5%" },
//     { id: 'wells', name: 'Wells Fargo', description: 'Business banking and lending', logo: '🏪', interest: "8.5% - 11.5%" },
//     { id: 'citi', name: 'Citibank', description: 'Global commercial banking', logo: '🏢', interest: "8.5% - 11.5%" }
//   ],
//   'United Kingdom': [
//     { id: 'hsbc', name: 'HSBC', description: 'International banking solutions', logo: '🏦', interest: "8.5% - 11.5%" },
//     { id: 'barclays', name: 'Barclays', description: 'Business and corporate banking', logo: '🏛️', interest: "8.5% - 11.5%" },
//     { id: 'lloyds', name: 'Lloyds Bank', description: 'Commercial banking services', logo: '🏪', interest: "8.5% - 11.5%" },
//     { id: 'rbs', name: 'Royal Bank of Scotland', description: 'Business lending solutions', logo: '🏢', interest: "8.5% - 11.5%" }
//   ],
//   'Singapore': [
//     { id: 'dbs', name: 'DBS Bank', description: 'SME banking solutions', logo: '🏦', interest: "8.5% - 11.5%" },
//     { id: 'ocbc', name: 'OCBC Bank', description: 'Business banking services', logo: '🏛️', interest: "8.5% - 11.5%" },
//     { id: 'uob', name: 'UOB Bank', description: 'Commercial banking solutions', logo: '🏪', interest: "8.5% - 11.5%" }
//   ]
// };

export default function ApplyLoanDetails({ setCurrentStep }: { setCurrentStep: (step: string) => void }) {
  const { createLoan, getLoans, updateLoan } = useLoanActions();
  const [selectedFinancingType, setSelectedFinancingType] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [amount, setAmount] = useState<string>('');
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [banks, setBanks] = useState<Bank[]>([]);

  useEffect(() => {
    if (user) {
      const loans = getLoans();
      if (loans.length > 0) {
        setSelectedFinancingType(loans[0].type || '');
        countrySelect(loans[0].country || '');
        setSelectedBank({ id: loans[0].lending_bank_id?.toString() || '', name: loans[0].bank_name || '', description: 'Public sector banking', logo: '🏦', interest_min: loans[0].interest_rate_min || 0, interest_max: loans[0].interest_rate_max || 0 });
        setAmount(loans[0].amount || '');
      }
    }
  }, [user, isLoading, getLoans])

  const saveLoanState = () => {
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true);

    try {
      const requestData = {
        type: selectedFinancingType,
        amount: amount,
        purpose: selectedFinancingType,
        status: "pending",
        interest_rate_min: selectedBank?.interest_min,
        interest_rate_max: selectedBank?.interest_max,
        duration: 24.0,
        lending_bank_id: selectedBank?.id ? parseInt(selectedBank.id) : undefined,
        sme_id: user?.entityId,
        consent_status : "pending",
        insights_status : "pending"
      }

      // const response = await apiClient.loans.create(requestData)
      const loans = getLoans();
      if (loans.length > 0) {
        updateLoan(loans[0].id, { ...loans[0], bank_name: selectedBank?.name || '', country: selectedCountry });
      }
      else {
        createLoan({ ...requestData, bank_name: selectedBank?.name || '', country: selectedCountry });
      }
      // Show success message briefly
      setTimeout(() => {
        // Redirect to appropriate portal
        setIsSubmitting(false)
      }, 2000)

    } catch (error: any) {
      setIsSubmitting(false)
    }

  }

  const countrySelect = async (value: string) => {
    setSelectedCountry(value);
    setSelectedBank(null); // Reset bank selection when country changes

    try {
      let bankResponse = await apiClient.bank.getByCountry(value);
      let bankData = bankResponse.data;
      bankData = bankData.map((bank: any) => ({
        id: bank.id,
        name: bank.name,
        description: "",
        logo: "🏛️",
        interest_min: bank.interest_rate_min,
        interest_max: bank.interest_rate_max,
      }));

      setBanks(bankData);
    }
    catch (e) {
      console.log(e);
      setBanks([]);
    }
  }

  const validateForm = (): boolean => {
    let valid = selectedFinancingType.length > 0 && selectedCountry.length > 0 && selectedBank && amount.length > 0;

    return valid ? true : false;
  }
  return (
    <div className="max-w-6xl p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Loan details</h1>
        <p className="text-sm text-muted-foreground">Complete the loan application form</p>
      </div>
      {/* Section 1: Financing Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Select Financing Type</CardTitle>
          <p className="text-muted-foreground">Choose the type of business financing you need</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {financingTypes.map((type) => (
              <div
                key={type.id}
                className={cn(
                  'border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md',
                  selectedFinancingType === type.title
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50'
                )}
                onClick={() => setSelectedFinancingType(type.title)}
              >
                <div className="flex items-start space-x-3">
                  {/* <div className="text-2xl">{type.icon}</div> */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{type.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                  </div>
                  {selectedFinancingType === type.title && (
                    <div className="text-primary">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Country Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Select a country</CardTitle>
          <p className="text-muted-foreground">Choose a country to see available lenders</p>
        </CardHeader>
        <CardContent>
          <div className='flex w-full'>
          {/* <Select value={selectedCountry} onValueChange={countrySelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select your country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select> */}

          <MapDemo getSelectedCountry={countrySelect}/>
          </div>

          {/* Section 3: Bank Selection */}
          {selectedCountry && (
            <Card className='mt-8'>
              <CardHeader>
                <CardTitle className="text-xl">Select Financial Institution</CardTitle>
                <p className="text-muted-foreground">Select your preferred lender for the loan application from {selectedCountry}</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {banks.length > 0 ? banks.map((bank) => (
                    <div
                      key={bank.id}
                      className={cn(
                        'border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md',
                        selectedBank?.name === bank.name
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                          : 'border-border hover:border-primary/50'
                      )}
                      onClick={() => setSelectedBank(bank)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{bank.logo}</div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{bank.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">Interest range: {bank.interest_min}% - {bank.interest_max}%</p>
                        </div>
                        {selectedBank?.name === bank.name && (
                          <div className="text-primary">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  )) : (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span>Fetching banks for {selectedCountry}...</span>
                    </div>
                  )}
                </div>
                {banks.length > 0 &&
                  <>
                    <Separator className='my-8' />
                    <div className="space-y-2">
                      <label htmlFor="amount" className="text-sm font-medium text-foreground">
                        Requested Amount ($) *
                      </label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="Enter loan amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full"
                        min="0"
                        step="1000"
                      />
                    </div>
                  </>}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      {/* <div className="flex justify-center pt-6">
          <Button type="submit" disabled={isSubmitting && validateForm()} className='cursor-pointer'>
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting application...
              </div>
            ) : (
              `Submit Application`
            )}
          </Button>
        </div> */}

      <div className="flex justify-center pt-6">
        <Button className='cursor-pointer mr-4' variant="outline" onClick={() => setCurrentStep("start")}>
          Back
        </Button>
        <Button className='cursor-pointer' disabled={!validateForm()} onClick={() => { setCurrentStep("consent"); saveLoanState(); }}>
          Next step
        </Button>
      </div>
    </div>
  )
}