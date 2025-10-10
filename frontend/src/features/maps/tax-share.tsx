'use client';

import React from 'react';
import TaxShareMap from './tax-share-map';
import ProgressStepsCard from './progress-steps-card';

const progressSteps = [
  {
    id: 1,
    title: 'Sharing Encrypted Consent',
    description: 'Approved consent is encrypted and shared from LoanConnect to SME bank'
  },
  {
    id: 2,
    title: 'Sharing Encrypted Financial Data',
    description: 'Encrypted financial data is shared from SME bank to LoanConnect'
  },
  {
    id: 3,
    title: 'Sharing Encrypted Tax Data',
    description: 'Encrypted tax data is shared from Tax Authorities to LoanConnect'
  },
  {
    id: 4,
    title: 'Sharing Encrypted Credit Data',
    description: 'Encrypted credit data is shared from Credit Bureaus to LoanConnect'
  },
  {
    id: 5,
    title: 'Computation of Encrypted data',
    description: 'Insights are generated on the encrypted data received from multiple data sources'
  }
];

export default function TaxShare() {
  return (
    <div className='flex gap-4'>
      <ProgressStepsCard steps={progressSteps} currentStep={3} />
      <div className='flex-1'>
        <TaxShareMap chartID='tax-share-map' />
      </div>
    </div>
  );
}
