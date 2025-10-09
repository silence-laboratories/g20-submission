'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, FileText, Shield, Upload } from 'lucide-react';

interface StepOverviewProps {
  onProceed: () => void;
}

export default function StepOverview({ onProceed }: StepOverviewProps) {
  const steps = [
    {
      id: 1,
      title: 'Loan Details',
      description: 'Provide your loan requirements and financial information',
      icon: FileText,
      status: 'upcoming'
    },
    {
      id: 2,
      title: 'Consent',
      description: 'Review and provide consent for data access and processing',
      icon: Shield,
      status: 'upcoming'
    },
    {
      id: 3,
      title: 'Data Upload',
      description: 'Upload required documents and supporting materials',
      icon: Upload,
      status: 'upcoming'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Complete the following steps to submit your loan application. The process typically takes 10-15 minutes.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {steps.map((step, index) => {
          const IconComponent = step.icon;
          return (
            <Card key={step.id} className="relative">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <IconComponent className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">{step.title}</CardTitle>
                <CardDescription className="text-sm">
                  {step.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                    Step {step.id}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className='text-green-600'>Secure and encrypted data processing</span>
        </div>
        
        <Button 
          onClick={onProceed}
          className="cursor-pointer"
        >
          Start Application
        </Button>
        
        <p className="text-xs text-gray-400">
          You can save your progress and return later if needed
        </p>
      </div>
    </div>
  );
}
