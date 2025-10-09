import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import { persist } from 'zustand/middleware';

// Loan-related types
export type LoanStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'under_review'
  | 'completed'
  | 'cancelled'
  | 'pending_consent';

export type FinancingType = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

export type Bank = {
  id: string;
  name: string;
  description: string;
  logo: string;
  interest: string;
  interest_rate_min?: number;
  interest_rate_max?: number;
};

export type Loan = {
  id: string;
  type?: string; // financing type
  amount: string;
  purpose: string;
  status: string;
  consent_status?: string;
  insights_status?: string;
  interest_rate_min?: number;
  interest_rate_max?: number;
  duration: number;
  lending_bank_id?: number;
  sme_id?: number;
  country?: string;
  bank_name?: string;
  created_at?: string;
  updated_at?: string;
  application_date?: string;
  approval_date?: string;
  rejection_reason?: string;
  notes?: string;
};

export type LoanFilters = {
  status?: string[];
  country?: string[];
  bank?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  amountRange?: {
    min: number;
    max: number;
  };
};

export type LoanState = {
  loans: Loan[];
  selectedLoan: Loan | null;
  loanFilters: LoanFilters;
  isLoading: boolean;
  error: string | null;
};

export type LoanActions = {
  // Basic CRUD operations
  addLoan: (loan: Omit<Loan, 'id' | 'created_at' | 'updated_at'>) => void;
  updateLoan: (id: string, updates: Partial<Loan>) => void;
  deleteLoan: (id: string) => void;
  getLoans: () => Loan[];
  getLoan: (id: string) => Loan | undefined;
  setSelectedLoan: (loan: Loan | null) => void;
  setLoans: (loans: Loan[]) => void;
  clearLoans: () => void;

  // Loan filtering and search
  setLoanFilters: (filters: Partial<LoanFilters>) => void;
  clearLoanFilters: () => void;
  getFilteredLoans: () => Loan[];

  // Loan status management
  updateLoanStatus: (id: string, status: string, notes?: string) => void;
  updateConsentStatus: (id: string, status: string, notes?: string) => void;
  approveLoan: (id: string, approvalDate?: string) => void;
  rejectLoan: (id: string, reason: string) => void;

  // Loading and error states
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Bulk operations
  deleteMultipleLoans: (ids: string[]) => void;
  updateMultipleLoanStatus: (ids: string[], status: string) => void;

  // Statistics and analytics
  getLoanStats: () => {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    totalAmount: number;
    averageAmount: number;
  };

  // Search and sorting
  searchLoans: (query: string) => Loan[];

  // Export functionality
  exportLoans: (format: 'csv' | 'json') => string;

  // Loan application helpers
  createLoanFromApplication: (applicationData: {
    type: string;
    amount: string;
    country: string;
    bankName: string;
    smeId: number;
    bankId: number;
    interestRateMin: number;
    interestRateMax: number;
    duration: number;
  }) => void;
};

const initialLoans: Loan[] = [];

export const useLoanStore = create<LoanState & LoanActions>()(
  persist(
    (set, get) => ({
      loans: initialLoans,
      selectedLoan: null,
      loanFilters: {},
      isLoading: false,
      error: null,

      // Basic CRUD operations
      addLoan: (loanData) => {
        const newLoan: Loan = {
          ...loanData,
          id: uuid(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        set((state) => ({
          loans: [...state.loans, newLoan]
        }));
      },

      deleteLoan: (id: string) => {
        set((state) => ({
          loans: state.loans.filter((loan) => loan.id !== id),
          selectedLoan:
            state.selectedLoan?.id === id ? null : state.selectedLoan
        }));
      },

      getLoans() {
        const state = get();
        return state.loans;
      },

      getLoan: (id: string) => {
        const state = get();
        return state.loans.find((loan) => loan.id === id);
      },

      setSelectedLoan: (loan: Loan | null) => {
        set({ selectedLoan: loan });
      },

      setLoans: (loans: Loan[]) => {
        set({ loans });
      },

      clearLoans: () => {
        set({ loans: [], selectedLoan: null });
      },

      // Loan filtering and search
      setLoanFilters: (filters: Partial<LoanFilters>) => {
        set((state) => ({
          loanFilters: { ...state.loanFilters, ...filters }
        }));
      },

      clearLoanFilters: () => {
        set({ loanFilters: {} });
      },

      getFilteredLoans: () => {
        const state = get();
        let filteredLoans = state.loans;

        if (state.loanFilters.status && state.loanFilters.status.length > 0) {
          filteredLoans = filteredLoans.filter((loan) =>
            state.loanFilters.status!.includes(loan.status || '')
          );
        }

        if (state.loanFilters.country && state.loanFilters.country.length > 0) {
          filteredLoans = filteredLoans.filter((loan) =>
            state.loanFilters.country!.includes(loan.country || '')
          );
        }

        if (state.loanFilters.bank && state.loanFilters.bank.length > 0) {
          filteredLoans = filteredLoans.filter((loan) =>
            state.loanFilters.bank!.includes(loan.bank_name || '')
          );
        }

        if (state.loanFilters.dateRange) {
          const { start, end } = state.loanFilters.dateRange;
          filteredLoans = filteredLoans.filter((loan) => {
            const loanDate = new Date(
              loan.created_at || loan.application_date || ''
            );
            return loanDate >= new Date(start) && loanDate <= new Date(end);
          });
        }

        if (state.loanFilters.amountRange) {
          const { min, max } = state.loanFilters.amountRange;
          filteredLoans = filteredLoans.filter((loan) => {
            const amount = parseFloat(loan.amount);
            return amount >= min && amount <= max;
          });
        }

        return filteredLoans;
      },

      // Loan status management
      updateLoanStatus: (id: string, status: string, notes?: string) => {
        set((state) => ({
          loans: state.loans.map((loan) =>
            loan.id === id
              ? {
                  ...loan,
                  status,
                  notes: notes || loan.notes,
                  updated_at: new Date().toISOString()
                }
              : loan
          )
        }));
      },

      updateLoan: (id: string, updates: Partial<Loan>) => {
        set((state) => ({
          loans: state.loans.map((loan) =>
            loan.id === id
              ? { ...loan, ...updates, updated_at: new Date().toISOString() }
              : loan
          )
        }));
      },

      // updateConsentStatus: (id: string, status: string) => {
      //   set((state) => ({
      //     loans: state.loans.map((loan) =>
      //       loan.id === id
      //         ? {
      //             ...loan,
      //             consent_status: status,
      //             updated_at: new Date().toISOString(),
      //           }
      //         : loan
      //     )
      //   }));
      // },

      updateConsentStatus: (id: string, status: string, notes?: string) => {
        set((state) => ({
          loans: state.loans.map((loan) => {
            console.log(loan);
            return loan.id === id
              ? {
                  ...loan,
                  consent_status: status,
                  notes: notes || loan.notes,
                  updated_at: new Date().toISOString()
                }
              : loan;
          })
        }));
      },

      updateInsightsStatus: (id: string, status: string) => {
        set((state) => ({
          loans: state.loans.map((loan) =>
            loan.id === id
              ? {
                  ...loan,
                  insights_status: status,
                  updated_at: new Date().toISOString()
                }
              : loan
          )
        }));
      },

      approveLoan: (id: string, approvalDate?: string) => {
        set((state) => ({
          loans: state.loans.map((loan) =>
            loan.id === id
              ? {
                  ...loan,
                  status: 'approved',
                  approval_date: approvalDate || new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              : loan
          )
        }));
      },

      rejectLoan: (id: string, reason: string) => {
        set((state) => ({
          loans: state.loans.map((loan) =>
            loan.id === id
              ? {
                  ...loan,
                  status: 'rejected',
                  rejection_reason: reason,
                  updated_at: new Date().toISOString()
                }
              : loan
          )
        }));
      },

      // Loading and error states
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      // Bulk operations
      deleteMultipleLoans: (ids: string[]) => {
        set((state) => ({
          loans: state.loans.filter((loan) => !ids.includes(loan.id)),
          selectedLoan:
            state.selectedLoan && ids.includes(state.selectedLoan.id)
              ? null
              : state.selectedLoan
        }));
      },

      updateMultipleLoanStatus: (ids: string[], status: string) => {
        set((state) => ({
          loans: state.loans.map((loan) =>
            ids.includes(loan.id)
              ? {
                  ...loan,
                  status,
                  updated_at: new Date().toISOString()
                }
              : loan
          )
        }));
      },

      // Statistics and analytics
      getLoanStats: () => {
        const state = get();
        const loans = state.loans;

        const total = loans.length;
        const pending = loans.filter(
          (loan) => loan.status === 'pending'
        ).length;
        const approved = loans.filter(
          (loan) => loan.status === 'approved'
        ).length;
        const rejected = loans.filter(
          (loan) => loan.status === 'rejected'
        ).length;

        const totalAmount = loans.reduce(
          (sum, loan) => sum + parseFloat(loan.amount || '0'),
          0
        );
        const averageAmount = total > 0 ? totalAmount / total : 0;

        return {
          total,
          pending,
          approved,
          rejected,
          totalAmount,
          averageAmount
        };
      },

      // Search and sorting
      searchLoans: (query: string) => {
        const state = get();
        const lowercaseQuery = query.toLowerCase();

        return state.loans.filter(
          (loan) =>
            loan.type?.toLowerCase().includes(lowercaseQuery) ||
            loan.bank_name?.toLowerCase().includes(lowercaseQuery) ||
            loan.country?.toLowerCase().includes(lowercaseQuery) ||
            loan.amount.includes(query) ||
            loan.status?.toLowerCase().includes(lowercaseQuery)
        );
      },

      // Export functionality
      exportLoans: (format: 'csv' | 'json') => {
        const state = get();
        const loans = state.loans;

        if (format === 'json') {
          return JSON.stringify(loans, null, 2);
        }

        // CSV format
        if (loans.length === 0) return '';

        const headers = Object.keys(loans[0]).join(',');
        const rows = loans.map((loan) =>
          Object.values(loan)
            .map((value) =>
              typeof value === 'string' && value.includes(',')
                ? `"${value}"`
                : value
            )
            .join(',')
        );

        return [headers, ...rows].join('\n');
      },

      // Loan application helpers
      createLoanFromApplication: (applicationData) => {
        const newLoan: Omit<Loan, 'id' | 'created_at' | 'updated_at'> = {
          type: applicationData.type,
          amount: applicationData.amount,
          purpose: applicationData.type,
          status: 'pending',
          consent_status: 'pending',
          interest_rate_min: applicationData.interestRateMin,
          interest_rate_max: applicationData.interestRateMax,
          duration: applicationData.duration,
          lending_bank_id: applicationData.bankId,
          sme_id: applicationData.smeId,
          country: applicationData.country,
          bank_name: applicationData.bankName,
          application_date: new Date().toISOString()
        };

        get().addLoan(newLoan);
      }
    }),
    {
      name: 'loan-store',
      skipHydration: true,
      partialize: (state) => ({
        loans: state.loans,
        loanFilters: state.loanFilters
      })
    }
  )
);

// Helper hooks for common loan operations
export const useLoanActions = () => {
  const store = useLoanStore();

  return {
    // Quick access to common actions
    createLoan: store.addLoan,
    updateLoan: store.updateLoan,
    deleteLoan: store.deleteLoan,
    approveLoan: store.approveLoan,
    rejectLoan: store.rejectLoan,
    getLoan: store.getLoan,
    getLoans: store.getLoans,
    setLoans: store.setLoans,
    setSelectedLoan: store.setSelectedLoan,
    clearLoans: store.clearLoans,

    // Filtering
    setFilters: store.setLoanFilters,
    clearFilters: store.clearLoanFilters,
    getFiltered: store.getFilteredLoans,

    // Search and sort
    search: store.searchLoans,

    // Statistics
    getStats: store.getLoanStats,

    // Export
    export: store.exportLoans
  };
};

// Hook for loan statistics
export const useLoanStats = () => {
  return useLoanStore((state) => state.getLoanStats());
};

// Hook for filtered loans
export const useFilteredLoans = () => {
  return useLoanStore((state) => state.getFilteredLoans());
};

// Hook for selected loan
export const useSelectedLoan = () => {
  return useLoanStore((state) => state.selectedLoan);
};
