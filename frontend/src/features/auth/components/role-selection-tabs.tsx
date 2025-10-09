'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, User, Landmark } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoleSelectionTabsProps {
  onRoleSelect?: (role: 'sme' | 'bank') => void;
  defaultRole?: 'sme' | 'bank';
  className?: string;
}

export default function RoleSelectionTabs({
  onRoleSelect,
  defaultRole = 'sme',
  className
}: RoleSelectionTabsProps) {
  const handleValueChange = (value: string) => {
    if (onRoleSelect && (value === 'sme' || value === 'bank')) {
      onRoleSelect(value);
    }
  };

  return <div className={cn('w-full', className)}></div>;
}
