/**
 * Cliente para los endpoints del backend (scrapers, etc.).
 * La URL del backend es única: lib/backend.ts (NEXT_PUBLIC_KEPLER_BACKEND_URL).
 */

import { getBackendUrl } from '@/lib/backend';

export interface ScrapeResponse {
  success: boolean;
  data?: unknown;
  detail?: string;
  message?: string;
  debug?: unknown;
}

/**
 * POST /api/scrape/instagram
 */
export async function scrapeInstagram(
  username: string,
  signal?: AbortSignal
): Promise<ScrapeResponse> {
  const base = getBackendUrl();
  const res = await fetch(`${base}/api/scrape/instagram`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: username.trim().replace(/^@/, '') }),
    signal,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, detail: data?.detail ?? `Error ${res.status}` };
  }
  return data as ScrapeResponse;
}

/**
 * POST /api/scrape/company — páginas web / empresa
 */
export async function scrapeCompany(
  url: string,
  signal?: AbortSignal
): Promise<ScrapeResponse> {
  const base = getBackendUrl();
  const res = await fetch(`${base}/api/scrape/company`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: url.trim() }),
    signal,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, detail: data?.detail ?? `Error ${res.status}` };
  }
  return data as ScrapeResponse;
}

/**
 * POST /api/scrape/playstore
 */
export async function scrapePlayStore(
  appUrl: string,
  maxReviews?: number,
  signal?: AbortSignal
): Promise<ScrapeResponse> {
  const base = getBackendUrl();
  const body: { app_url: string; max_reviews?: number } = { app_url: appUrl.trim() };
  if (maxReviews != null) body.max_reviews = maxReviews;
  const res = await fetch(`${base}/api/scrape/playstore`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, detail: data?.detail ?? `Error ${res.status}` };
  }
  return data as ScrapeResponse;
}

/**
 * POST /api/scrape/appstore
 * appId: ID numérico o URL de la app
 */
export async function scrapeAppStore(
  appId: string,
  options?: { country?: string; maxReviews?: number },
  signal?: AbortSignal
): Promise<ScrapeResponse> {
  const base = getBackendUrl();
  const body: { app_id: string; country?: string; max_reviews?: number } = {
    app_id: appId.trim(),
  };
  if (options?.country) body.country = options.country;
  if (options?.maxReviews != null) body.max_reviews = options.maxReviews;
  const res = await fetch(`${base}/api/scrape/appstore`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { success: false, detail: data?.detail ?? `Error ${res.status}` };
  }
  return data as ScrapeResponse;
}
