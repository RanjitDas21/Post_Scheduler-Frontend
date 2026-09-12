import { create } from "zustand";
import { dashboardApi } from "../api/endpoints.js";

export const useDashboardStore = create((set) => ({
  stats: null,
  recentActivity: [],
  loading: false,

  fetchDashboard: async () => {
    set({ loading: true });
    try {
      const { data } = await dashboardApi.get();
      set({ stats: data.stats, recentActivity: data.recentActivity, loading: false });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },
}));
