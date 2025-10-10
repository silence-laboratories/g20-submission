'use client';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Column, ColumnDef } from '@tanstack/react-table';
import {
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Building,
  Calendar,
  Shield
} from 'lucide-react';
import { CellAction } from './cell-action';
import { Button } from '@/components/ui/button';
import { IconEye } from '@tabler/icons-react';
import ViewLoanDialog from './view-loan-dialog';

// Application type definition
export type Application = {
  id: string;
  financial_institution: string;
  purpose: string;
  amount: number;
  consent_status: 'pending' | 'approved' | 'rejected';
  application_status: 'pending' | 'under_review' | 'approved' | 'rejected';
};

export const columns: ColumnDef<Application>[] = [
  {
    id: 'id',
    accessorKey: 'id',
    header: ({ column }: { column: Column<Application, unknown> }) => (
      <DataTableColumnHeader column={column} title='Application ID' />
    ),
    cell: ({ cell }) => (
      <div className='font-mono text-sm'>
        {cell.getValue<Application['id']>()}
      </div>
    ),
    meta: {
      label: 'ID'
    }
  },
  {
    id: 'financial_institution',
    accessorKey: 'financial_institution',
    header: ({ column }: { column: Column<Application, unknown> }) => (
      <DataTableColumnHeader column={column} title='Financial Institution' />
    ),
    cell: ({ cell }) => (
      <div className='flex items-center gap-2'>
        <Building className='text-muted-foreground h-4 w-4' />
        {cell.getValue<Application['financial_institution']>()}
      </div>
    ),
    enableColumnFilter: true,
    meta: {
      label: 'Financial Institution'
    }
  },
  {
    id: 'purpose',
    accessorKey: 'purpose',
    header: ({ column }: { column: Column<Application, unknown> }) => (
      <DataTableColumnHeader column={column} title='Purpose' />
    ),
    cell: ({ cell }) => (
      <div className='max-w-[200px] truncate'>
        {cell.getValue<Application['purpose']>()}
      </div>
    ),
    enableColumnFilter: true,
    meta: {
      label: 'Purpose'
    }
  },
  {
    id: 'amount',
    accessorKey: 'amount',
    header: ({ column }: { column: Column<Application, unknown> }) => (
      <DataTableColumnHeader column={column} title='Amount' />
    ),
    cell: ({ cell }) => {
      const amount = cell.getValue<Application['amount']>();
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
      label: 'Amount'
    }
  },
  {
    id: 'consent_status',
    accessorKey: 'consent_status',
    header: ({ column }: { column: Column<Application, unknown> }) => (
      <DataTableColumnHeader column={column} title='Consent Status' />
    ),
    cell: ({ cell }) => {
      const status = cell.getValue<Application['consent_status']>();
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
      label: 'Consent Status'
    }
  },
  {
    id: 'application_status',
    accessorKey: 'application_status',
    header: ({ column }: { column: Column<Application, unknown> }) => (
      <DataTableColumnHeader column={column} title='Application Status' />
    ),
    cell: ({ cell }) => {
      const status = cell.getValue<Application['application_status']>();
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
      label: 'Application Status'
    }
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <ViewLoanDialog loan={row.original} />
  }
];
