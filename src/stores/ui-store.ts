import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface UIStore {
  isSidebarOpen: boolean;
  activeTab: string;
  isRefreshing: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveTab: (tab: string) => void;
  setRefreshing: (refreshing: boolean) => void;
}

export const useUIStore = create<UIStore>()(
  devtools(
    (set) => ({
      isSidebarOpen: false,
      activeTab: 'overview',
      isRefreshing: false,

      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen }), false, 'toggleSidebar'),

      setSidebarOpen: (open: boolean) => set({ isSidebarOpen: open }, false, 'setSidebarOpen'),

      setActiveTab: (tab: string) => set({ activeTab: tab }, false, 'setActiveTab'),

      setRefreshing: (refreshing: boolean) =>
        set({ isRefreshing: refreshing }, false, 'setRefreshing'),
    }),
    { name: 'UIStore' }
  )
);
