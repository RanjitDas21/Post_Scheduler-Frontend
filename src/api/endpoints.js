import api from "./client.js";

export const authApi = {
  signup: (data) => api.post("/auth/signup", data),
  login: (data) => api.post("/auth/login", data),
  me: () => api.get("/auth/me"),
};

export const dashboardApi = {
  get: () => api.get("/dashboard"),
};

export const accountsApi = {
  list: () => api.get("/accounts"),
  connect: (platform) => api.post("/accounts/connect", { platform }),
  disconnect: (id) => api.delete(`/accounts/${id}`),
};

export const postsApi = {
  list: (params = {}) => api.get("/posts", { params }),
  create: (formData, requestId) =>
    api.post("/posts", formData, {
      headers: {
        ...(requestId ? { "Idempotency-Key": requestId } : {}),
      },
    }),
  update: (id, data) => api.patch(`/posts/${id}`, data),
  publishNow: (id) => api.post(`/posts/${id}/publish`),
  cancel: (id) => api.post(`/posts/${id}/cancel`),
  retry: (id) => api.post(`/posts/${id}/retry`),
  remove: (id) => api.delete(`/posts/${id}`),
};

export const aiApi = {
  generate: (data) => api.post("/ai/generate", data),
  generations: () => api.get("/ai/generations"),
};
