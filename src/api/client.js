/**
 * CaBank API Client
 * Central HTTP client with JWT auth, token refresh, and error handling.
 *
 * Usage:
 *   import api from './client';
 *   const data = await api.get('/accounts');
 *   const data = await api.post('/auth/signin', { email, password });
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Config ──────────────────────────────────────────────────────────────────
// Change this to your deployed backend URL (Render, localhost, etc.)
export const BASE_URL = __DEV__
  ? 'http://10.0.2.2:8080/api' // Android emulator → localhost
  : 'https://your-cabank-backend.onrender.com/api';

// Keys used in AsyncStorage
const STORAGE_KEYS = {
  ACCESS_TOKEN: '@cabank/access_token',
  REFRESH_TOKEN: '@cabank/refresh_token',
  USER: '@cabank/user',
};

// ─── Token helpers ────────────────────────────────────────────────────────────
export const tokenStorage = {
  async getAccess() {
    return AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },
  async getRefresh() {
    return AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },
  async setTokens(accessToken, refreshToken) {
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
      refreshToken
        ? AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
        : Promise.resolve(),
    ]);
  },
  async setUser(user) {
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },
  async getUser() {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  },
  async clear() {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
      AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
      AsyncStorage.removeItem(STORAGE_KEYS.USER),
    ]);
  },
};

// ─── Request queue (deduplicate concurrent refresh attempts) ──────────────────
let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}
function onRefreshed(token) {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
async function request(method, endpoint, body, options = {}) {
  const {skipAuth = false, isRetry = false} = options;
  const url = `${BASE_URL}${endpoint}`;

  const headers = {'Content-Type': 'application/json'};

  if (!skipAuth) {
    const token = await tokenStorage.getAccess();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const config = {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  };

  let response;
  try {
    response = await fetch(url, config);
  } catch (networkError) {
    throw new ApiError('Network error — please check your connection', 0);
  }

  // Token expired → try refresh once
  if (response.status === 401 && !isRetry && !skipAuth) {
    if (isRefreshing) {
      // Another refresh is in flight; wait for it
      const newToken = await new Promise(resolve =>
        subscribeTokenRefresh(resolve),
      );
      headers['Authorization'] = `Bearer ${newToken}`;
      const retryResp = await fetch(url, {...config, headers});
      return handleResponse(retryResp);
    }

    isRefreshing = true;
    try {
      const refreshToken = await tokenStorage.getRefresh();
      if (!refreshToken) throw new ApiError('Session expired', 401);

      // Note: CaBank backend doesn't have a /auth/refresh endpoint yet.
      // When you add it, uncomment this block:
      // const refreshResp = await fetch(`${BASE_URL}/auth/refresh`, {
      //   method: 'POST',
      //   headers: {'Content-Type': 'application/json'},
      //   body: JSON.stringify({ refreshToken }),
      // });
      // if (!refreshResp.ok) throw new ApiError('Session expired', 401);
      // const { data } = await refreshResp.json();
      // await tokenStorage.setTokens(data.accessToken, data.refreshToken);
      // onRefreshed(data.accessToken);
      // headers['Authorization'] = `Bearer ${data.accessToken}`;

      // For now, propagate the 401 so the app can redirect to sign-in
      throw new ApiError('Session expired — please sign in again', 401);
    } finally {
      isRefreshing = false;
    }
  }

  return handleResponse(response);
}

async function handleResponse(response) {
  let json;
  const text = await response.text();
  try {
    json = JSON.parse(text);
  } catch {
    if (!response.ok) {
      throw new ApiError(`Server error (${response.status})`, response.status);
    }
    return text;
  }

  if (!response.ok) {
    // Backend wraps errors in { success: false, message: "..." }
    const message =
      json?.message || json?.error || `Request failed (${response.status})`;
    throw new ApiError(message, response.status, json);
  }

  // Backend wraps success in { success: true, message: "...", data: {...} }
  return json?.data !== undefined ? json.data : json;
}

// ─── Error class ──────────────────────────────────────────────────────────────
export class ApiError extends Error {
  constructor(message, status, raw) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.raw = raw;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────
const api = {
  get: (endpoint, options) => request('GET', endpoint, null, options),
  post: (endpoint, body, options) => request('POST', endpoint, body, options),
  put: (endpoint, body, options) => request('PUT', endpoint, body, options),
  patch: (endpoint, body, options) => request('PATCH', endpoint, body, options),
  delete: (endpoint, options) => request('DELETE', endpoint, null, options),
};

export default api;