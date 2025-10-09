'use client';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Column, ColumnDef } from '@tanstack/react-table';
import { CheckCircle2, Clock, Building, Shield } from 'lucide-react';
import { CellAction } from './cell-action';

// Application type definition
export type BankApplication = {
  id: string;
  organization: string;
  purpose: string;
  amount: number;
  consentStatus: 'pending' | 'approved' | 'rejected';
  applicationStatus: 'pending' | 'under_review' | 'approved' | 'rejected';
  insightStatus: 'pending' | 'generating' | 'generated' | 'failed';
  smeBank: string;
  smeBankCountry: string;
  phoneNumber: string;
  registrationNumber: string;
};

export const columns: ColumnDef<BankApplication>[] = [
  {
    id: 'id',
    accessorKey: 'id',
    header: ({ column }: { column: Column<BankApplication, unknown> }) => (
      <DataTableColumnHeader column={column} title='Application ID' />
    ),
    cell: ({ cell }) => (
      <div className='font-mono text-sm'>
        {cell.getValue<BankApplication['id']>()}
      </div>
    )
  },
  {
    id: 'organization',
    accessorKey: 'organization',
    header: ({ column }: { column: Column<BankApplication, unknown> }) => (
      <DataTableColumnHeader column={column} title='Organization' />
    ),
    cell: ({ cell }) => (
      <div className='flex items-center gap-2'>
        <Building className='text-muted-foreground h-4 w-4' />
        {cell.getValue<BankApplication['organization']>()}
      </div>
    ),
    enableColumnFilter: true,
    meta: {
      label: 'Organization',
      options: []
    },
  },
  {
    id: 'purpose',
    accessorKey: 'purpose',
    header: ({ column }: { column: Column<BankApplication, unknown> }) => (
      <DataTableColumnHeader column={column} title='Purpose' />
    ),
    cell: ({ cell }) => (
      <div className='max-w-[200px] truncate'>
        {cell.getValue<BankApplication['purpose']>()}
      </div>
    ),
    enableColumnFilter: true,
    meta: {
      label: 'Purpose',
      options: []
    }
  },
  {
    id: 'amount',
    accessorKey: 'amount',
    header: ({ column }: { column: Column<BankApplication, unknown> }) => (
      <DataTableColumnHeader column={column} title='Amount' />
    ),
    cell: ({ cell }) => {
      const amount = cell.getValue<BankApplication['amount']>();
      return (
        <div className='flex items-center gap-1 font-medium'>
          {/* <DollarSign className='h-4 w-4 text-muted-foreground' /> */}
          {amount.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD'
          })}
        </div>
      );
    },
    meta: {
      label: 'Amount',
      options: []
    }
  },
  {
    id: 'consentStatus',
    accessorKey: 'consentStatus',
    header: ({ column }: { column: Column<BankApplication, unknown> }) => (
      <DataTableColumnHeader column={column} title='Consent Status' />
    ),
    cell: ({ cell }) => {
      const status = cell.getValue<BankApplication['consentStatus']>();
      const variant =
        status === 'approved'
          ? 'success'
          : status === 'pending'
            ? 'secondary'
            : 'destructive';
      const icon =
        status === 'approved'
          ? CheckCircle2
          : status === 'pending'
            ? Clock
            : Shield;

      const Icon = icon;
      return (
        <Badge variant={variant} className='capitalize'>
          <Icon className='mr-1 h-3 w-3' />
          {status}
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: 'Consent Status',
      options: []
    }
  },
  {
    id: 'insightStatus',
    accessorKey: 'insightStatus',
    header: ({ column }: { column: Column<BankApplication, unknown> }) => (
      <DataTableColumnHeader column={column} title='Insight Status' />
    ),
    cell: ({ cell }) => {
      const status = cell.getValue<BankApplication['insightStatus']>();
      const variant =
        status === 'generated'
          ? 'success'
          : status === 'pending'
            ? 'secondary'
            : status === 'generating'
              ? 'tertiary'
              : 'destructive';
      const icon =
        status === 'generated'
          ? CheckCircle2
          : status === 'pending'
            ? Clock
            : status === 'generating'
              ? Clock
              : Shield;
      const Icon = icon;
      return (
        <Badge variant={variant} className='capitalize'>
          <Icon className='mr-1 h-3 w-3' />
          {status.replace('_', ' ')}
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: 'Insight Status',
      options: []
    }
  },
  {
    id: 'applicationStatus',
    accessorKey: 'applicationStatus',
    header: ({ column }: { column: Column<BankApplication, unknown> }) => (
      <DataTableColumnHeader column={column} title='Application Status' />
    ),
    cell: ({ cell }) => {
      const status = cell.getValue<BankApplication['applicationStatus']>();
      const variant =
        status === 'approved'
          ? 'success'
          : status === 'under_review'
            ? 'secondary'
            : status === 'pending'
              ? 'secondary'
              : 'destructive';
      const icon =
        status === 'approved'
          ? CheckCircle2
          : status === 'under_review'
            ? Clock
            : status === 'pending'
              ? Clock
              : Shield;

      const Icon = icon;
      return (
        <Badge variant={variant} className='capitalize'>
          <Icon className='mr-1 h-3 w-3' />
          {status.replace('_', ' ')}
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: 'Application Status',
      options: []
    }
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
