// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
  },
  USERS: {
    LIST: "/users",
    DETAIL: "/users/:id",
    CREATE: "/users",
    UPDATE: "/users/:id",
    DELETE: "/users/:id",
  },
  TRANSACTIONS: {
    LIST: "/transactions",
    DETAIL: "/transactions/:id",
  },
  WALLETS: {
    LIST: "/wallets",
    DETAIL: "/wallets/:id",
  },
} as const;

// Application Constants
export const APP_CONSTANTS = {
  APP_NAME: "TagPay Admin",
  VERSION: "1.0.0",
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "authToken",
  REFRESH_TOKEN: "refreshToken",
  USER_DATA: "userData",
  THEME: "theme",
} as const;

// Route Paths
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  USERS: "/users",
  TRANSACTIONS: "/transactions",
  WALLETS: "/wallets",
  SETTINGS: "/settings",
} as const;
