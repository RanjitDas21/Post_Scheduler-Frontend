import { create } from "zustand";
import { aiApi } from "../api/endpoints.js";

export const useAIStore = create((set, get) => ({
  generations: [],
  loading: false,
  generating: false,

  fetchGenerations: async () => {
    set({ loading: true });
    try {
      const { data } = await aiApi.generations();
      set({ generations: data.generations, loading: false });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  generate: async ({ prompt, tone, withImage }) => {
    set({ generating: true });
    try {
      const { data } = await aiApi.generate({ prompt, tone, withImage });
      set((state) => ({ generations: [data.generation, ...state.generations], generating: false }));
      return data.generation;
    } catch (err) {
      set({ generating: false });
      throw err;
    }
  },
}));
