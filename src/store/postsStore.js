import { create } from "zustand";
import { postsApi } from "../api/endpoints.js";

const normalizeError = (err) => err?.response?.data?.message || err?.message || "Request failed.";

export const usePostsStore = create((set, get) => ({
  upcoming: [],
  published: [],
  partial: [],
  failed: [],
  cancelled: [],
  loading: false,

  fetchPosts: async () => {
    set({ loading: true });
    try {
      const statuses = ["scheduled", "publishing", "published", "partial", "failed", "cancelled"];
      const responses = await Promise.all(statuses.map((status) => postsApi.list({ status, limit: 100 })));
      const groups = Object.fromEntries(statuses.map((status, i) => [status, responses[i].data.posts || []]));
      set({
        upcoming: [...groups.scheduled, ...groups.publishing].sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt)),
        published: groups.published,
        partial: groups.partial,
        failed: groups.failed,
        cancelled: groups.cancelled,
        loading: false,
      });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  createPost: async (formData, requestId = (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`)) => {
    // Check FormData contents
    // for (const [key, value] of formData.entries()) {
    //   console.log(key, value);
    // }
    const { data } = await postsApi.create(formData, requestId);

    console.log(data);
    await get().fetchPosts();
    return data.post;
  },

  updatePost: async (id, data) => {
    const response = await postsApi.update(id, data);
    await get().fetchPosts();
    return response.data.post;
  },

  publishNow: async (id) => {
    const { data } = await postsApi.publishNow(id);
    await get().fetchPosts();
    return data.post;
  },

  cancelPost: async (id) => {
    const { data } = await postsApi.cancel(id);
    await get().fetchPosts();
    return data.post;
  },

  retryPost: async (id) => {
    const { data } = await postsApi.retry(id);
    await get().fetchPosts();
    return data.post;
  },

  removePost: async (id) => {
    const { data } = await postsApi.remove(id);
    await get().fetchPosts();
    return data.post;
  },

  getError: normalizeError,
}));
