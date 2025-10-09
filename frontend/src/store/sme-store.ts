// Create a store middleware for sme

import { v4 as uuid } from 'uuid';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SME = {
  id: string;
  name: string;
  registration_number: string;
  country: string;
  director: string;
  din: string;
  registered_phone_number: string;
  bank_account_number: string;
  bank_id: number;
};

export type SMEState = {
  smes: SME[];
  selectedSME: SME | null;
};

export type SMEActions = {
  addSME: (sme: Omit<SME, 'id'>) => void;
  setSMEs: (smes: SME[]) => void;
  setSelectedSME: (sme: SME | null) => void;
  getSMEs: () => SME[];
  getSME: (id: string) => SME | null;
};

export const useSMEStore = create<SMEState & SMEActions>()(
  persist(
    (set, get) => ({
      smes: [],
      selectedSME: null,
      addSME: (smeData) => {
        const newSME: SME = {
          ...smeData,
          id: uuid(),
        };
        set((state) => ({
          smes: [...state.smes, newSME]
        }));
      },
      setSMEs: (smes) => set({ smes }),
      setSelectedSME: (sme) => set({ selectedSME: sme }),
      getSMEs: () => get().smes,
      getSME: (id: string) => get().smes.find((sme) => sme.id === id) || null
    }),
    {
      name: 'sme-store'
    }
  )
);

export const useSMEs = () => {
  return useSMEStore((state) => state.smes);
};

export const useSelectedSME = () => {
  return useSMEStore((state) => state.selectedSME);
};

export const useSMEActions = () => {
  return useSMEStore((state) => state);
};
