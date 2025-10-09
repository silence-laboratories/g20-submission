// Create a store middleware for sme

import { uuidv4 } from 'zod';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';


export type SME = {
    id: number;
    name: string;
    registration_number: string;
    country: string;
    director: string;
    din: string;
    registered_phone_number: string;
    bank_account_number: string;
    bank_id: number;
}

export type SMEState = {
    smes: SME[];
    selectedSME: SME | null;
}

export type SMEActions = {
    addSME: (sme: Omit<SME, 'id' | 'created_at' | 'updated_at'>) => void;
    setSMEs: (smes: SME[]) => void;
    setSelectedSME: (sme: SME | null) => void;
    getSMEs: () => SME[];
    getSME: (id: number) => SME | null;
}

export const useSMEStore = create<SMEState & SMEActions>()(
    persist((set, get) => ({
        smes: [],
        selectedSME: null,
        addSME: (smeData) => {
            const newSME: SME = {
              ...smeData,
              id: uuidv4(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            set((state) => ({
              smes: [...state.smes, newSME]
            }));
          },
        setSMEs: (smes) => set({ smes }),
        setSelectedSME: (sme) => set({ selectedSME: sme }),
        getSMEs: () => get().smes,
        getSME: (id: number) => get().smes.find((sme) => sme.id === id) || null,
    }), {
        name: 'sme-store',
    })
)

export const useSMEs = () => {
    return useSMEStore((state) => state.smes);
}

export const useSelectedSME = () => {
    return useSMEStore((state) => state.selectedSME);
}

export const useSMEActions = () => {
    return useSMEStore((state) => state);
}