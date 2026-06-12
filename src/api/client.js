/**
 * CaBank API Client
 * Central HTTP client with JWT auth, token refresh, and error handling.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

export const BASE_URL = __DEV__
  ? 'http://10.0.2.2:8080/api'
  : 'https://your-cabank-backend.onrender.com/api';

const STORAGE_KEYS = {
  ACCESS_TOKEN: '@cabank/access_token',
  REFRESH_TOKEN: '@cabank/refresh_token',
  USER: '@cabank/user',
};

// ─────────────────────────────────────────────────────────────────────────────
// Token Storage
// ─────────────────────────────────────────────────────────────────────────────

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
    await AsyncStorage.setItem(
      STORAGE_KEYS.USER,
      JSON.stringify(user),
    );
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

// ─────────────────────────────────────────────────────────────────────────────
// Refresh Queue
// ─────────────────────────────────────────────────────────────────────────────

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(callback) {
  refreshSubscribers.push(callback);
}

function onRefreshed(token) {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
}

// ─────────────────────────────────────────────────────────────────────────────
// API Error
// ─────────────────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(message, status, raw) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.raw = raw;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Response Handler
// ─────────────────────────────────────────────────────────────────────────────

async function handleResponse(response) {
  let json;

  const text = await response.text();

  try {
    json = JSON.parse(text);
  } catch {
    if (!response.ok) {
      throw new ApiError(
        `Server error (${response.status})`,
        response.status,
      );
    }

    return text;
  }

  if (!response.ok) {
    const message =
      json?.message ||
      json?.error ||
      `Request failed (${response.status})`;

    throw new ApiError(message, response.status, json);
  }

  return json?.data !== undefined ? json.data : json;
}

// ─────────────────────────────────────────────────────────────────────────────
// Core Request Method
// ─────────────────────────────────────────────────────────────────────────────

async function request(
  method,
  endpoint,
  body = null,
  options = {},
) {
  const {skipAuth = false, isRetry = false} = options;

  const url = `${BASE_URL}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
  };

  if (!skipAuth) {
    const accessToken = await tokenStorage.getAccess();

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
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
  } catch {
    throw new ApiError(
      'Network error — please check your connection',
      0,
    );
  }

  // Handle expired access token
  if (
    response.status === 401 &&
    !skipAuth &&
    !isRetry
  ) {
    if (isRefreshing) {
      const newToken = await new Promise(resolve =>
        subscribeTokenRefresh(resolve),
      );

      headers.Authorization = `Bearer ${newToken}`;

      const retryResponse = await fetch(url, {
        ...config,
        headers,
      });

      return handleResponse(retryResponse);
    }

    isRefreshing = true;

    try {
      const refreshToken =
        await tokenStorage.getRefresh();

      if (!refreshToken) {
        await tokenStorage.clear();
        throw new ApiError('Session expired', 401);
      }

      const refreshResponse = await fetch(
        `${BASE_URL}/auth/refresh`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refreshToken,
          }),
        },
      );

      if (!refreshResponse.ok) {
        await tokenStorage.clear();
        throw new ApiError('Session expired', 401);
      }

      const refreshJson =
        await refreshResponse.json();

      const data = refreshJson.data;

      await tokenStorage.setTokens(
        data.accessToken,
        data.refreshToken,
      );

      onRefreshed(data.accessToken);

      headers.Authorization = `Bearer ${data.accessToken}`;

      const retryResponse = await fetch(url, {
        ...config,
        headers,
      });

      return handleResponse(retryResponse);
    } catch (error) {
      await tokenStorage.clear();
      throw error;
    } finally {
      isRefreshing = false;
    }
  }

  return handleResponse(response);
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

const api = {
  get(endpoint, options) {
    return request('GET', endpoint, null, options);
  },

  post(endpoint, body, options) {
    return request('POST', endpoint, body, options);
  },

  put(endpoint, body, options) {
    return request('PUT', endpoint, body, options);
  },

  patch(endpoint, body, options) {
    return request('PATCH', endpoint, body, options);
  },

  delete(endpoint, options) {
    return request('DELETE', endpoint, null, options);
  },
};

export default api;