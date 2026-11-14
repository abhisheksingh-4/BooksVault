import axios from "axios";

const baseURL = (import.meta.env.VITE_API_URL || "http://localhost:8000/api").replace(/\/+$/, "");

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

export const publicApi = axios.create({
  baseURL: new URL(baseURL).origin,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

const inFlightGets = new Map();

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("libraflow_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function unwrapResponse(response) {
  const envelope = response.data;
  if (!envelope || typeof envelope !== "object" || !("success" in envelope)) {
    return Promise.reject(new Error("The server returned an unexpected response."));
  }
  if (!envelope.success) {
    return Promise.reject(new Error(envelope.message || "The request could not be completed."));
  }
  response.data = envelope.data;
  response.message = envelope.message;
  return response;
}

function handleResponseError(error) {
  if (error.response?.status === 401 && !error.config?.url?.includes("/auth/login")) {
    sessionStorage.removeItem("libraflow_token");
    sessionStorage.removeItem("libraflow_user");
    if (window.location.pathname !== "/") window.location.assign("/");
  }
  const detail = error.response?.data?.message || error.message || "Unable to reach BooksVault.";
  return Promise.reject(new Error(detail));
}

api.interceptors.response.use(unwrapResponse, handleResponseError);
publicApi.interceptors.response.use(unwrapResponse, handleResponseError);

function getKey(base, url, params, token = "") {
  const sortedParams = Object.entries(params || {}).sort(([left], [right]) => left.localeCompare(right));
  return `${base}${url}?${JSON.stringify(sortedParams)}:${token}`;
}

function deduplicatedGet(client, base, url, config = {}, token = "") {
  const key = getKey(base, url, config.params, token);
  if (inFlightGets.has(key)) return inFlightGets.get(key);
  const request = client.get(url, config).finally(() => inFlightGets.delete(key));
  inFlightGets.set(key, request);
  return request;
}

export const apiGet = (url, config = {}) => (
  deduplicatedGet(api, baseURL, url, config, sessionStorage.getItem("libraflow_token") || "")
);
export const publicGet = (url, config = {}) => deduplicatedGet(publicApi, new URL(baseURL).origin, url, config);
export const getData = (promise) => promise.then((response) => response.data);
