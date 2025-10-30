const API_BASE_URL = "https://savings-ms-client-api.onrender.com/api/v1";

export interface LoginResponse {
  message: string;
  accessToken: string;
  admin: {
    _id: string;
    fullName: string;
    email: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export async function login(
  credentials: LoginCredentials
): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Login failed");
  }

  return response.json();
}

export function storeToken(token: string) {
  localStorage.setItem("accessToken", token);
  if (typeof document !== "undefined") {
    document.cookie = `accessToken=${token}; path=/; max-age=2592000; sameSite=strict`;
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

export function clearToken() {
  localStorage.removeItem("accessToken");
  if (typeof document !== "undefined") {
    document.cookie = "accessToken=; path=/; max-age=0; sameSite=strict";
  }
}

// Simple in-memory response cache with TTL (per-tab)
type CacheEntry = { expiresAt: number; data: unknown };
const responseCache = new Map<string, CacheEntry>();

function makeCacheKey(endpoint: string, options: RequestInit): string {
  const method = (options.method || "GET").toUpperCase();
  const body = options.body ? String(options.body) : "";
  return `${method} ${endpoint} :: ${body}`;
}

function getFromCache<T>(key: string): T | null {
  const entry = responseCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    responseCache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache<T>(key: string, data: T, ttlSeconds: number) {
  if (ttlSeconds <= 0) return;
  responseCache.set(key, { expiresAt: Date.now() + ttlSeconds * 1000, data });
}

export function clearAllCache() {
  responseCache.clear();
}

export function invalidateCacheByPrefix(prefix: string) {
  for (const key of responseCache.keys()) {
    if (key.includes(prefix)) responseCache.delete(key);
  }
}

// Admin profile helpers
export interface AdminInfo {
  _id: string;
  fullName: string;
  email: string;
}

export function storeAdmin(admin: AdminInfo) {
  try {
    localStorage.setItem("admin", JSON.stringify(admin));
  } catch {}
}

export function getAdmin(): AdminInfo | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("admin");
    return raw ? (JSON.parse(raw) as AdminInfo) : null;
  } catch {
    return null;
  }
}

export function clearAdmin() {
  localStorage.removeItem("admin");
}

// Helper to make authenticated requests
async function authenticatedRequest(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = getToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (response.status === 401) {
    clearToken();
    clearAllCache();
    if (typeof window !== "undefined") {
      // Force redirect to login on session expiry
      window.location.href = "/";
    }
    throw new Error("Session expired. Please login again.");
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Request failed");
  }

  return response.json();
}

async function cachedAuthenticatedRequest<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
  ttlSeconds = 0
): Promise<T> {
  const method = (options.method || "GET").toUpperCase();
  if (method !== "GET" || ttlSeconds <= 0) {
    return authenticatedRequest(endpoint, options) as Promise<T>;
  }
  const key = makeCacheKey(endpoint, options);
  const cached = getFromCache<T>(key);
  if (cached) return cached;
  const data = (await authenticatedRequest(endpoint, options)) as T;
  setCache(key, data, ttlSeconds);
  return data;
}

// Dashboard Stats
export interface DashboardStats {
  totalUsers: number;
  verifiedUsers: number;
  totalBalance: number;
  totalTransactions: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return cachedAuthenticatedRequest("/admin/stats", {}, 30);
}

// Users
export interface User {
  _id: string;
  fullName: string;
  email: string;
  balance: number;
  deviceVerified: boolean;
  deviceId: string;
  createdAt: string;
}

export interface UsersResponse {
  users: User[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export async function getUsers(
  page = 1,
  limit = 20,
  search = ""
): Promise<UsersResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
  });
  return cachedAuthenticatedRequest(`/admin/users?${params}`, {}, 20);
}

export interface UserDetailResponse {
  user: User;
}

export async function getUser(userId: string): Promise<UserDetailResponse> {
  return cachedAuthenticatedRequest(`/admin/users/${userId}`, {}, 30);
}

export async function verifyUserDevice(
  userId: string
): Promise<UserDetailResponse> {
  const res = await authenticatedRequest(
    `/admin/users/${userId}/verify-device`,
    {
      method: "POST",
    }
  );
  // Invalidate cached user lists and stats
  invalidateCacheByPrefix("/admin/users");
  invalidateCacheByPrefix("/admin/stats");
  return res;
}

// Transactions
export interface Transaction {
  _id: string;
  userId: {
    _id: string;
    fullName: string;
    email: string;
  };
  type: "deposit" | "withdraw";
  amount: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export async function getTransactions(
  page = 1,
  limit = 20,
  userId?: string
): Promise<TransactionsResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(userId && { userId }),
  });
  return cachedAuthenticatedRequest(`/admin/transactions?${params}`, {}, 15);
}
