import axios from "axios";

const baseURL = "/api";
let csrfToken = null;
let csrfPromise = null;

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const unsafeMethods = new Set(["post", "put", "patch", "delete"]);

export async function refreshCsrf() {
  if (!csrfPromise) {
    csrfPromise = api.get("/auth/csrf", { skipCsrf: true }).then((response) => {
      csrfToken = response.data.data.csrfToken;
      return csrfToken;
    });
  }
  try {
    return await csrfPromise;
  } finally {
    csrfPromise = null;
  }
}

api.interceptors.request.use(async (config) => {
  const method = (config.method || "get").toLowerCase();
  if (unsafeMethods.has(method) && !config.skipCsrf) {
    if (!csrfToken) {
      await refreshCsrf();
    }
    config.headers["x-csrf-token"] = csrfToken;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 403 && /csrf/i.test(error.response.data?.message || "")) {
      csrfToken = null;
    }
    return Promise.reject(error);
  },
);

export function setCsrfToken(token) {
  csrfToken = token;
}

export function clearCsrfToken() {
  csrfToken = null;
}

export function apiErrorMessage(error) {
  return error.response?.data?.message || error.message || "Request failed";
}

export function unwrap(response) {
  return response.data?.data;
}
