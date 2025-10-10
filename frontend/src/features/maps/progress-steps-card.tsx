'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressStep {
  id: number;
  title: string;
  description?: string;
}

interface ProgressStepsCardProps {
  steps: ProgressStep[];
  currentStep: number;
  className?: string;
}

export default function ProgressStepsCard({
  steps,
  currentStep,
  className
}: ProgressStepsCardProps) {
  const getStepStatus = (stepId: number) => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'current';
    return 'pending';
  };

  return (
    <Card className={cn('w-80', className)}>
      <CardHeader className='pb-3'>
        <CardTitle className='text-lg'>Processing Steps</CardTitle>
      </CardHeader>
      <CardContent className='space-y-1'>
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className='relative'>
              <div className='flex items-start gap-3 pb-4'>
                {/* Icon */}
                <div className='relative mt-0.5 flex-shrink-0'>
                  {status === 'completed' ? (
                    <CheckCircle2 className='h-5 w-5 text-green-500' />
                  ) : status === 'current' ? (
                    <Loader2 className='h-5 w-5 animate-spin text-blue-500' />
                  ) : (
                    <Circle className='h-5 w-5 text-muted-foreground/50' />
                  )}

                  {/* Connecting line */}
                  {!isLast && (
                    <div
                      className={cn(
                        'absolute left-[9px] top-6 w-0.5 h-[calc(100%)]',
                        status === 'completed'
                          ? 'bg-green-500'
                          : 'bg-muted-foreground/20'
                      )}
                    />
                  )}
                </div>

                {/* Content */}
                <div className='flex-1 min-w-0'>
                  <p
                    className={cn(
                      'text-sm font-medium leading-tight',
                      status === 'completed'
                        ? 'text-foreground'
                        : status === 'current'
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-muted-foreground/70'
                    )}
                  >
                    {step.title}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

