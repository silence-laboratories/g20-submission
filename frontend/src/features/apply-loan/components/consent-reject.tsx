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
import { useLoanStore } from '@/store/loan-store';

export default function ConsentRejectDialog({
  onReject,
  disabled,
  loanId
}: {
  onReject: () => void;
  disabled: boolean;
  loanId: string | undefined;
}) {
  const { updateConsentStatus } = useLoanStore();

  console.log(loanId);

  const handleReject = () => {
    loanId && updateConsentStatus(loanId, 'rejected');
    onReject();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant='secondary'
          className='text-background cursor-pointer bg-red-400 hover:bg-red-500'
          disabled={disabled}
        >
          Reject Consent
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Reject Consent</DialogTitle>
          <DialogDescription>
            Are you sure you want to reject consent?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogTrigger asChild>
            <Button size='sm' className='cursor-pointer' onClick={handleReject}>
              Yes
            </Button>
          </DialogTrigger>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
