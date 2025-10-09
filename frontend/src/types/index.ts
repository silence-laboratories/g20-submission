import { Icons } from '@/components/icons';

export interface User {
  id: number;
  email: string;
  name: string;
  isFirstTime: boolean;
  picture: string | undefined;
  entityId?: number;
  entityType: string | null;
}

export interface SME {
  name?: string;
  registrationNumber?: string;
  country?: string;
  director?: string;
  din?: string;
  registeredPhoneNumber?: string;
  countryCode?: string;
  phoneNumber?: string;
  bankAccountNumber?: string;
  bankId?: number;
}

export interface NavItem {
  title: string;
  url: string;
  disabled?: boolean;
  external?: boolean;
  shortcut?: [string, string];
  icon?: keyof typeof Icons;
  label?: string;
  description?: string;
  isActive?: boolean;
  items?: NavItem[];
}

export interface NavItemWithChildren extends NavItem {
  items: NavItemWithChildren[];
}

export interface NavItemWithOptionalChildren extends NavItem {
  items?: NavItemWithChildren[];
}

export interface FooterItem {
  title: string;
  items: {
    title: string;
    href: string;
    external?: boolean;
  }[];
}

export type MainNavItem = NavItemWithOptionalChildren;

export type SidebarNavItem = NavItemWithChildren;
