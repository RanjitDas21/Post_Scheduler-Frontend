import { create } from "zustand";
import { accountsApi } from "../api/endpoints.js";

export const useAccountsStore = create((set, get) => ({
  accounts: [],
  platforms: [],
  loading: false,
  loaded: false,

  fetchAccounts: async (force = false) => {
    if (get().loaded && !force) return;
    set({ loading: true });
    try {
      const { data } = await accountsApi.list();
      set({ accounts: data.accounts || [], platforms: data.platforms || [], loading: false, loaded: true });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  connectAccount: async (platform) => {
    const { data } = await accountsApi.connect(platform);
    if (data.authUrl) {
      window.location.assign(data.authUrl);
      return { redirecting: true };
    }
    await get().fetchAccounts(true);
    return { redirecting: false, account: data.account };
  },

  disconnectAccount: async (id) => {
    await accountsApi.disconnect(id);
    await get().fetchAccounts(true);
  },

  connectedPlatforms: () => [...new Set(get().accounts.filter((a) => a.status === "connected").map((a) => a.platform))],
}));
