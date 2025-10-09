'use client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useLoanStore } from '@/store/loan-store';
import { useState } from 'react';
import { toast } from 'sonner';



export default function ConsentOTPDialog({ onSubmit, disabled, bankName, loanId }: { onSubmit: () => void, disabled: boolean, bankName: string | undefined, loanId: string | undefined }) {

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otp, setOtp] = useState('');
  const {updateConsentStatus} = useLoanStore();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const { otp } = Object.fromEntries(formData);

    if (typeof otp !== 'string') return;


    loanId && updateConsentStatus(loanId, "approved");

    setTimeout(() => {
      toast.success("Consent approved!")
      onSubmit();
      setIsSubmitting(false);
    }, 2000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='secondary' className="bg-green-400 text-background hover:bg-green-500 cursor-pointer" disabled={disabled}>
          Approve Consent
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>{bankName} OTP</DialogTitle>
          <DialogDescription>
            Please enter the OTP sent to your registered phone number from {bankName} to approve consent
          </DialogDescription>
        </DialogHeader>
        <form
          id='todo-form'
          className='grid gap-4 py-4'
          onSubmit={handleSubmit}
        >
          <div className='grid grid-cols-4 items-center gap-4'>
            <Input
              id='otp'
              name='otp'
              placeholder='Enter OTP'
              className='col-span-4'
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>
        </form>
        <DialogFooter>
          <Button type='submit' form='todo-form' size='sm' className='cursor-pointer' disabled={isSubmitting || otp.length !== 6}>
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Approving consent...
              </div>
            ) : (
              `Submit`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
