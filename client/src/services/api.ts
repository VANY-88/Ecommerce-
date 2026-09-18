import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getAccessToken, getRefreshToken, saveTokens, clearSession } from "./session";
import { showToast } from "../utils/toast";
import { ApiResponse } from "../types/api";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let refreshPromise: Promise<string | null> | null = null;

function forceLogout() {
  clearSession();
  showToast("Your session has expired. Please log in again.", "warn");
  if (window.location.pathname !== "/login") {
    // Give the toast a moment to render before the full-page navigation
    // tears the React tree down.
    setTimeout(() => {
      window.location.href = "/login";
    }, 1200);
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await axios.post<ApiResponse<object>>(
      `${process.env.REACT_APP_API_URL}/users/refresh`,
      { refreshToken }
    );
    const { token, refreshToken: newRefreshToken } = response.data;
    if (!token || !newRefreshToken) {
      return null;
    }
    saveTokens(token, newRefreshToken);
    return token;
  } catch {
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableConfig | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/users/refresh")
    ) {
      originalRequest._retry = true;

      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }
      const newToken = await refreshPromise;

      if (newToken) {
        originalRequest.headers = originalRequest.headers ?? ({} as any);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      }

      forceLogout();
    }

    return Promise.reject(error);
  }
);

export default api;
