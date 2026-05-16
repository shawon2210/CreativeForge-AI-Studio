import { create } from 'zustand';

interface UIState {
  sidebarCollapsed: boolean;
  sidebarOpen: boolean;
  activeSection: string;
  darkMode: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveSection: (section: string) => void;
  toggleDarkMode: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  sidebarOpen: true,
  activeSection: 'dashboard',
  darkMode: true,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActiveSection: (section) => set({ activeSection: section }),
  toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
}));
