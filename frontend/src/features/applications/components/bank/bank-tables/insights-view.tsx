'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  TrendingUp,
  DollarSign,
  Shield,
  Building,
  CheckCircle
} from 'lucide-react';

// Mock data - replace with actual API data
const mockData = {
  applicationId: 'LOAN-705668',
  category: 'SME Application',
  entityName: 'Kumar Electronics Pvt Ltd',
  amount: '₹50,000',
  purpose: 'Working Capital',
  date: '16/09/2025',
  tier: 'B',
  riskScore: 68,
  riskDescription: 'Lending with collateral or limits',
  profitMargin: '15.2%',
  emiCoverageRatio: '2.1x',
  bouncedCheques: '2',
  annualUtilityBill: '₹180,000',
  entityId: 'BANK-B-67329',
  dataCustodian: 'Bank B (Data Custodian)'
};

// Bar chart component for trends
const BarChart: React.FC<{ data: number[]; years: string[] }> = ({
  data,
  years
}) => {
  const maxValue = Math.max(...data);

  return (
    <div className='flex h-12 items-end space-x-1'>
      {data.map((value, index) => (
        <div key={index} className='flex flex-col items-center space-y-1'>
          <div
            className='bg-foreground w-3 rounded-sm'
            style={{ height: `${(value / maxValue) * 40}px` }}
          />
          <span className='text-foreground text-xs'>{years[index]}</span>
        </div>
      ))}
    </div>
  );
};

// Donut chart component for risk score
const DonutChart: React.FC<{ score: number }> = ({ score }) => {
  const circumference = 2 * Math.PI * 20; // radius = 20
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className='relative h-16 w-16'>
      <svg className='h-16 w-16 -rotate-90 transform' viewBox='0 0 48 48'>
        <circle
          cx='24'
          cy='24'
          r='20'
          stroke='#e5e7eb'
          strokeWidth='4'
          fill='none'
        />
        <circle
          cx='24'
          cy='24'
          r='20'
          stroke='#374151'
          strokeWidth='4'
          fill='none'
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap='round'
        />
      </svg>
      <div className='absolute inset-0 flex items-center justify-center'>
        <span className='text-foreground text-xs font-medium'>{score}%</span>
      </div>
    </div>
  );
};

export default function LenderAssessmentDashboard({ loan }: { loan: any }) {
  return (
    <div className='bg-background min-h-screen p-6'>
      {/* Main Content Grid */}
      <div className='mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Row 1 */}
        <Card className='lg:col-span-1'>
          <CardHeader>
            <CardTitle className='text-foreground text-lg font-bold'>
              Lender
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Application ID:</span>
              <span className='text-foreground font-medium'>{loan.id}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Purpose:</span>
              <span className='text-foreground font-medium'>
                {loan.purpose}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className='lg:col-span-2'>
          <CardHeader>
            <CardTitle className='text-foreground text-lg font-bold'>
              SME Rating & Recommendation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center justify-between'>
              <div className='space-y-3'>
                <div className='flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100 dark:bg-amber-200'>
                  <span className='text-muted text-xl font-bold'>
                    Tier {mockData.tier}
                  </span>
                </div>
                <div>
                  <div className='text-foreground text-sm'>
                    Risk Score: {mockData.riskScore}
                  </div>
                  <div className='text-muted-foreground text-sm'>
                    {mockData.riskDescription}
                  </div>
                </div>
              </div>
              <DonutChart score={mockData.riskScore} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2 */}
      <div className='mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3'>
        <Card>
          <CardHeader>
            <CardTitle className='text-foreground text-lg font-bold'>
              Application Details
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='flex justify-between'>
              <span className='text-foreground'>Entity Name:</span>
              <span className='font-medium'>{mockData.entityName}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-foreground'>Amount:</span>
              <span className='font-medium'>{mockData.amount}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-foreground'>Purpose:</span>
              <span className='font-medium'>{mockData.purpose}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-foreground'>Date:</span>
              <span className='font-medium'>{mockData.date}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-foreground flex items-center text-lg font-bold'>
              <TrendingUp className='mr-2 h-4 w-4' />
              Financial Health
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between'>
              <span className='text-foreground'>Profit Margin (2024)</span>
              <span className='text-foreground text-2xl font-bold'>
                {mockData.profitMargin}
              </span>
            </div>
            <div className='space-y-3'>
              <div className='text-foreground text-sm'>5-Year Trends:</div>
              <div className='space-y-2'>
                <div>
                  <div className='text-foreground mb-8 text-xs'>
                    Debt-to-Equity
                  </div>
                  <BarChart
                    data={[1.2, 1.1, 0.9, 0.8, 0.7]}
                    years={['2020', '2021', '2022', '2023', '2024']}
                  />
                </div>
                <div>
                  <div className='text-foreground mb-8 text-xs'>
                    Revenue Growth
                  </div>
                  <BarChart
                    data={[5, 8, 12, 15, 18]}
                    years={['2020', '2021', '2022', '2023', '2024']}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-foreground flex items-center text-lg font-bold'>
              <DollarSign className='mr-2 h-4 w-4' />
              Liquidity & Repayment
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex justify-between'>
              <span className='text-foreground'>EMI Coverage Ratio</span>
              <span className='font-medium'>{mockData.emiCoverageRatio}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-foreground'>Bounced Cheques</span>
              <span className='font-medium'>{mockData.bouncedCheques}</span>
            </div>
            <div className='space-y-2'>
              <div className='text-foreground mb-4 text-sm'>
                Avg Monthly Balance (5 years):
              </div>
              <BarChart
                data={[45000, 52000, 58000, 62000, 68000]}
                years={['2020', '2021', '2022', '2023', '2024']}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3 */}
      <div className='mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3'>
        <Card>
          <CardHeader>
            <CardTitle className='text-foreground flex items-center text-lg font-bold'>
              <Shield className='mr-2 h-4 w-4' />
              Compliance Behavior
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='flex items-center justify-between'>
              <span className='text-foreground'>Tax Return Filed</span>
              <CheckCircle className='h-5 w-5 text-green-600' />
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-foreground'>GST Filing History</span>
              <div className='flex items-center space-x-2'>
                <span className='font-medium'>95%</span>
                <CheckCircle className='h-5 w-5 text-green-600' />
              </div>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-foreground'>Loan Default Count</span>
              <div className='flex items-center space-x-2'>
                <span className='font-medium'>0</span>
                <CheckCircle className='h-5 w-5 text-green-600' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='lg:col-span-2'>
          <CardHeader>
            <CardTitle className='text-foreground flex items-center text-lg font-bold'>
              <Building className='mr-2 h-4 w-4' />
              Operational Size & Stability
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex justify-between'>
              <span className='text-foreground'>Annual Utility Bill</span>
              <span className='font-medium'>{mockData.annualUtilityBill}</span>
            </div>
            <div className='space-y-3'>
              <div className='text-foreground text-sm'>
                5-Year Growth Trends:
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <div className='text-foreground mb-1 text-xs'>Employees</div>
                  <BarChart
                    data={[12, 15, 18, 22, 25]}
                    years={['2020', '2021', '2022', '2023', '2024']}
                  />
                </div>
                <div>
                  <div className='text-foreground mb-1 text-xs'>
                    POS Transactions
                  </div>
                  <BarChart
                    data={[1200, 1450, 1680, 1920, 2150]}
                    years={['2020', '2021', '2022', '2023', '2024']}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Source Card */}
      <Card className='bg-gray-600 text-white'>
        <CardHeader>
          <CardTitle className='text-lg font-bold text-white'>
            Data Source
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-2'>
          <div>{mockData.dataCustodian}</div>
          <div>Entity ID: {mockData.entityId}</div>
          <div>
            Data processing performed via secure, privacy-preserving computation
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
