'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';
import DataAccessConsent from './apply-loan-consent';
import ApplyLoanDetails from './apply-loan-details';
import StepOverview from './step-overview';
import ApplyLoanUpload from './apply-loan-upload';

export default function ApplyLoanView() {
  const [selectedFinancingType, setSelectedFinancingType] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [purpose, setPurpose] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const { user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [currentStep, setCurrentStep] = useState<string>("start");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log({
      financingType: selectedFinancingType,
      country: selectedCountry,
      bank: selectedBank,
      amount
    });

    e.preventDefault()

    console.log(validateForm());

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const requestData = {
        type: selectedFinancingType,
        amount: amount,
        purpose: selectedFinancingType,
        status: "pending",
        interest_rate_min: 3.0,
        interest_rate_max: 10.0,
        duration: 24.0,
        lending_bank_id: 2,
        sme_id: user?.entityId
      }

      const response = await apiClient.loans.create(requestData)

      // Show success message briefly
      setTimeout(() => {
        // Redirect to appropriate portal
        router.push("/dashboard/applications");
      }, 2000)

    } catch (error: any) {
      setIsSubmitting(false)
    }
  };

  const validateForm = (): boolean => {
    let valid = selectedFinancingType && selectedCountry && selectedBank && purpose && amount;

    return valid ? true : false;
  }

  const handleProceedToLoanDetails = () => {
    setCurrentStep("loanDetails");
  };

  return (
    <>
      {currentStep === "start" ? (
        <StepOverview onProceed={handleProceedToLoanDetails} />
      ) : currentStep === "loanDetails" ? (
        <ApplyLoanDetails setCurrentStep={setCurrentStep} />
      ) :
        currentStep === "consent" ? (
          <DataAccessConsent
            onReject={() => setCurrentStep("loanDetails")}
            onOTPSubmit={() => setCurrentStep("uploadDocuments")}
          />
        ) :
          <ApplyLoanUpload
            onBack={() => setCurrentStep("consent")}
            onNext={() => {
              // Create a synthetic event for handleSubmit
              const syntheticEvent = {
                preventDefault: () => { },
              } as React.FormEvent;
              handleSubmit(syntheticEvent);
            }}
            onFilesChange={(files) => {
              console.log('Uploaded files:', files);
              // Handle file upload logic here if needed
            }}
          />}
    </>
  );
}
