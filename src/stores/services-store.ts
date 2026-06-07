// ─────────────────────────────────────────────────────────────
// Services Store — Zustand with localStorage persistence
// User's subscribed streaming service provider IDs
// ─────────────────────────────────────────────────────────────

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ServicesState {
  /** TMDB provider IDs the user subscribes to. */
  selectedProviders: number[];
  /** ISO 3166-1 alpha-2 country code for watch region. */
  country: string;

  /** Replace all selected providers. */
  setProviders: (ids: number[]) => void;
  /** Add if absent, remove if present. */
  toggleProvider: (id: number) => void;
  /** Add a provider (no-op if already selected). */
  addProvider: (id: number) => void;
  /** Remove a provider. */
  removeProvider: (id: number) => void;
  /** Set watch region country. */
  setCountry: (country: string) => void;
  /** Check if a provider is selected. */
  isSelected: (id: number) => boolean;
}

export const useServicesStore = create<ServicesState>()(
  persist(
    (set, get) => ({
      selectedProviders: [],
      country: "US",

      setProviders: (ids) => set({ selectedProviders: ids }),

      toggleProvider: (id) => {
        const { selectedProviders } = get();
        if (selectedProviders.includes(id)) {
          set({
            selectedProviders: selectedProviders.filter((pid) => pid !== id),
          });
        } else {
          set({ selectedProviders: [...selectedProviders, id] });
        }
      },

      addProvider: (id) => {
        const { selectedProviders } = get();
        if (!selectedProviders.includes(id)) {
          set({ selectedProviders: [...selectedProviders, id] });
        }
      },

      removeProvider: (id) => {
        const { selectedProviders } = get();
        set({
          selectedProviders: selectedProviders.filter((pid) => pid !== id),
        });
      },

      setCountry: (country) => set({ country }),

      isSelected: (id) => get().selectedProviders.includes(id),
    }),
    {
      name: "cinestack-services",
      partialize: (state) => ({
        selectedProviders: state.selectedProviders,
        country: state.country,
      }),
    },
  ),
);
