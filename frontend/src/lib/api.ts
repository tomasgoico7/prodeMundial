'use client';

/**
 * Cliente fetch tipado para la API.
 *
 * - Prefixes every request with NEXT_PUBLIC_API_URL + /api
 * - Attaches the bearer token from localStorage
 * - Unwraps the { success, data } response envelope
 * - Normalizes errors into a thrown ApiError
 */
/**
 * Resuelve la base de la API.
 *
 * Prioridad:
 *  1) NEXT_PUBLIC_API_URL si apunta a un host "real" (ej. un dominio en prod).
 *  2) En el navegador: el MISMO host desde el que se abrió la página, puerto 4000.
 *     Así funciona igual desde la PC (localhost) que desde el celular en la
 *     misma red WiFi (ej. http://192.168.x.x:3100 → API en http://192.168.x.x:4000)
 *     sin tener que reconstruir cuando cambia la IP.
 *  3) Fallback a localhost (SSR / build).
 */
function resolveBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  const isLocalEnv = !envUrl || /localhost|127\.0\.0\.1/.test(envUrl);

  if (envUrl && !isLocalEnv) return envUrl.replace(/\/$/, '') + '/api';

  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:4000/api`;
  }

  return (envUrl ?? 'http://localhost:4000') + '/api';
}

export const TOKEN_KEY = 'mundialeros_token';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${resolveBaseUrl()}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: 'no-store',
  });

  const text = await res.text();
  const json = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const message =
      (json && (Array.isArray(json.message) ? json.message.join(', ') : json.message)) ||
      'Request failed';
    if (res.status === 401 && typeof window !== 'undefined') {
      setToken(null);
    }
    throw new ApiError(message, res.status);
  }

  return (json?.data ?? json) as T;
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: 'POST', body }),
  put: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: 'PATCH', body }),
};
