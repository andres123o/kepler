/**
 * Cliente para el backend. POST /api/analyze (análisis completo).
 * La URL del backend es única: ver lib/backend.ts (NEXT_PUBLIC_KEPLER_BACKEND_URL).
 */

import { getBackendUrl } from '@/lib/backend';

export interface KeplerAnalyzeContext {
  rawScrapedData?: Record<string, unknown>;
  parsedFileData?: Record<string, unknown>;
  rawFileData?: Record<string, unknown>;
  businessContexts?: unknown[];
  teamContexts?: unknown[];
}

export interface KeplerAnalyzeResponse {
  final_report?: string;
  plan?: string;
  code_output?: string;
  execution_success?: boolean;
  generated_images?: string[];
  success?: boolean;
  insight_id?: string;
}

/** Timeout para el primer reporte (scrapers + Gemini). Objetivo: < 30s. */
const FIRST_REPORT_TIMEOUT_MS = 35_000;

/**
 * POST /api/analyze con solo datos de scrapers (primer reporte).
 * Body JSON: { organization_id, scraped_data }.
 * Timeout 35s para que el usuario sienta respuesta rápida.
 */
export async function postFirstReportAnalyze(
  organizationId: string,
  scrapedData: Record<string, unknown>,
  signal?: AbortSignal
): Promise<KeplerAnalyzeResponse> {
  const base = getBackendUrl();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FIRST_REPORT_TIMEOUT_MS);
  if (signal) {
    signal.addEventListener('abort', () => controller.abort());
  }
  let res: Response;
  try {
    res = await fetch(`${base}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ organization_id: organizationId, scraped_data: scrapedData }),
      signal: controller.signal,
    });
  } catch (e: unknown) {
    clearTimeout(timeoutId);
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes('abort') || msg.includes('AbortError')) {
      throw new Error(
        `El reporte tardó más de ${FIRST_REPORT_TIMEOUT_MS / 1000}s. Revisa tu conexión o intenta de nuevo.`
      );
    }
    throw e;
  }
  clearTimeout(timeoutId);
  if (!res.ok) {
    const text = await res.text();
    let err: unknown;
    try {
      err = JSON.parse(text);
    } catch {
      err = { detail: text || `Error ${res.status}` };
    }
    const detail = (err as { detail?: string })?.detail ?? (err as { error?: string })?.error ?? `Error ${res.status}`;
    throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
  }
  return res.json() as Promise<KeplerAnalyzeResponse>;
}

/** Timeout en ms para POST /api/analyze (desarrollo: backend puede tardar 1–3 min). Por defecto 5 min. */
const getAnalyzeTimeoutMs = (): number => {
  const env = process.env.KEPLER_ANALYZE_TIMEOUT_MS ?? process.env.NEXT_PUBLIC_KEPLER_ANALYZE_TIMEOUT_MS;
  if (env != null && env !== '') {
    const n = parseInt(env, 10);
    if (!Number.isNaN(n) && n > 0) return n;
  }
  return 5 * 60 * 1000; // 5 minutos por defecto
};

/**
 * POST al endpoint /api/analyze del kepler-backend.
 * multipart/form-data: context (string JSON con los datos para el agente).
 * Opcionalmente: files (archivos binarios).
 * Timeout por defecto 5 min (configurable con KEPLER_ANALYZE_TIMEOUT_MS).
 */
export async function postKeplerAnalyze(
  context: KeplerAnalyzeContext,
  files?: File[],
  signal?: AbortSignal
): Promise<KeplerAnalyzeResponse> {
  const base = getBackendUrl();
  const formData = new FormData();
  formData.append('context', JSON.stringify(context));
  if (files?.length) {
    for (const f of files) {
      formData.append('files', f);
    }
  }
  const timeoutMs = getAnalyzeTimeoutMs();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  if (signal) {
    signal.addEventListener('abort', () => controller.abort());
  }
  let res: Response;
  try {
    res = await fetch(`${base}/api/analyze`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    const isNetwork =
      msg === 'fetch failed' ||
      /network|ECONNREFUSED|ETIMEDOUT|Failed to fetch/i.test(msg);
    if (isNetwork) {
      throw new Error(
        `No se pudo conectar con el servidor de análisis (${base}). Verifica que el backend esté en ejecución (ej. uvicorn en el puerto 8000). Error: ${msg}`
      );
    }
    if (msg.includes('abort') || msg.includes('AbortError')) {
      throw new Error(
        `El análisis tardó más de ${timeoutMs / 1000}s y se canceló. Para desarrollo puedes subir el tiempo con KEPLER_ANALYZE_TIMEOUT_MS (ms).`
      );
    }
    throw e;
  } finally {
    clearTimeout(timeoutId);
  }
  if (!res.ok) {
    const text = await res.text();
    let err: unknown;
    try {
      err = JSON.parse(text);
    } catch {
      err = { error: text || `Error ${res.status}` };
    }
    throw new Error((err as { error?: string })?.error ?? `Error ${res.status}`);
  }
  return res.json() as Promise<KeplerAnalyzeResponse>;
}
