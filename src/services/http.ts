const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

const ACCESS_KEY = "hc_access_token";
const REFRESH_KEY = "hc_refresh_token";

type RequestOptions = RequestInit & {
  skipAuth?: boolean;
  json?: any;
};

let accessToken = localStorage.getItem(ACCESS_KEY) || "";
let refreshToken = localStorage.getItem(REFRESH_KEY) || "";
let unauthorizedHandlers: Array<() => void> = [];

const notifyUnauthorized = () => {
  unauthorizedHandlers.forEach((handler) => handler());
};

const updateTokens = (access: string, refresh: string) => {
  accessToken = access;
  refreshToken = refresh;
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
};

const clearTokens = () => {
  accessToken = "";
  refreshToken = "";
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  notifyUnauthorized();
};

const refreshTokens = async () => {
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) {
      clearTokens();
      return false;
    }
    const data = await res.json();
    updateTokens(data.accessToken, data.refreshToken || refreshToken);
    return true;
  } catch {
    clearTokens();
    return false;
  }
};

const buildHeaders = (options: RequestOptions) => {
  const headers = new Headers(options.headers || {});
  if (options.json !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  if (!options.skipAuth && accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }
  return headers;
};

const send = async (path: string, options: RequestOptions = {}) => {
  const headers = buildHeaders(options);
  const body =
    options.json !== undefined ? JSON.stringify(options.json) : options.body;

  let response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    body,
    credentials: "include",
  });

  if (response.status === 401 && !options.skipAuth) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      const retryHeaders = buildHeaders(options);
      response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: retryHeaders,
        body,
        credentials: "include",
      });
    } else {
      throw new Error("Unauthorized");
    }
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || response.statusText);
  }

  if (response.status === 204) return undefined;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
};

export const http = {
  request: async <T = any>(
    path: string,
    options: RequestOptions = {}
  ): Promise<T> => {
    const headers = buildHeaders(options);
    const body =
      options.json !== undefined ? JSON.stringify(options.json) : options.body;

    let response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      body,
      credentials: "include",
    });

    if (response.status === 401 && !options.skipAuth) {
      const refreshed = await refreshTokens();
      if (refreshed) {
        const retryHeaders = buildHeaders(options);
        response = await fetch(`${API_URL}${path}`, {
          ...options,
          headers: retryHeaders,
          body,
          credentials: "include",
        });
      } else {
        throw new Error("Unauthorized");
      }
    }

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || response.statusText);
    }

    if (response.status === 204) return undefined as T;

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return response.json() as Promise<T>;
    }
    return response.text() as Promise<T>;
  },

  get<T = any>(path: string, options?: RequestOptions) {
    return this.request<T>(path, { ...options, method: "GET" });
  },

  post<T = any>(path: string, body?: any, options?: RequestOptions) {
    return this.request<T>(path, {
      ...options,
      method: "POST",
      json: body,
    });
  },

  put<T = any>(path: string, body?: any, options?: RequestOptions) {
    return this.request<T>(path, {
      ...options,
      method: "PUT",
      json: body,
    });
  },

  delete<T = any>(path: string, options?: RequestOptions) {
    return this.request<T>(path, { ...options, method: "DELETE" });
  },

  setTokens: updateTokens,
  clearTokens,
  getAccessToken: () => accessToken,
  getRefreshToken: () => refreshToken,
  onUnauthorized(handler: () => void) {
    unauthorizedHandlers.push(handler);
    return () => {
      unauthorizedHandlers = unauthorizedHandlers.filter((h) => h !== handler);
    };
  },
};
