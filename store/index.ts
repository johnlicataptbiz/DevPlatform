import { create } from 'zustand';

export type SiteType = 'existing' | 'reference' | null;

interface AppState {
  url: string;
  siteType: SiteType;
  items: string[];
  setUrl: (url: string) => void;
  setSiteType: (type: SiteType) => void;
  addItem: (item: string) => void;
  clearItems: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  url: '',
  siteType: null,
  items: [
    'Analyze existing architecture',
    'Synthesize motion primitives',
    'Generate atomic components',
    'Compile Zenith stack',
  ],
  setUrl: (url) => set({ url }),
  setSiteType: (siteType) => set({ siteType }),
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  clearItems: () => set({ items: [] }),
}));
