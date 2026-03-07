/**
 * Primer reporte: ejecuta scrapers (Instagram, web, Play Store, App Store) en paralelo
 * y envía los datos a POST /api/analyze. El backend usa Gemini y guarda el insight en Supabase.
 */

'use server';

import { postFirstReportAnalyze } from '@/lib/api/analysis';
import { scrapeInstagram, scrapeCompany, scrapePlayStore, scrapeAppStore } from '@/lib/api/scrapers';
import type { AnalysisResult, DataSourceRef } from '@/lib/types/analysis';
import type { NPSSurvey, Ticket, InternalDataRow } from '@/lib/types/analysis';

export type { AnalysisResult };

type RawScraped = {
  instagram?: Array<{ sourceId: string; username: string; success: boolean; data?: unknown }>;
  company?: Array<{ sourceId: string; url: string; success: boolean; data?: unknown }>;
  playstore?: Array<{ sourceId: string; app_url: string; success: boolean; data?: unknown }>;
  appstore?: Array<{ sourceId: string; app_id: string; success: boolean; data?: unknown }>;
};

async function runAllScrapers(
  dataSources: DataSourceRef[],
  signal?: AbortSignal
): Promise<RawScraped> {
  const out: RawScraped = {};
  const instagramSources = dataSources.filter(
    (s) => s.source_type === 'social' && s.social_platform === 'instagram' && s.social_username?.trim()
  );
  const websiteSources = dataSources.filter(
    (s) => s.source_type === 'website' && s.website_url?.trim()
  );
  const playStoreSources = dataSources.filter(
    (s) => s.source_type === 'app_store' && s.app_store_type === 'play_store' && s.app_url?.trim()
  );
  const appStoreSources = dataSources.filter(
    (s) => s.source_type === 'app_store' && s.app_store_type === 'app_store' && s.app_url?.trim()
  );

  const websiteUrl = (s: DataSourceRef) => (s.website_url ?? '').trim();

  const promises: Promise<void>[] = [];

  instagramSources.forEach((source) => {
    const username = source.social_username!.trim();
    promises.push(
      scrapeInstagram(username, signal)
        .then((result) => {
          if (!out.instagram) out.instagram = [];
          out.instagram.push({ sourceId: source.id, username, success: result.success, data: result.data });
        })
        .catch(() => {
          if (!out.instagram) out.instagram = [];
          out.instagram.push({ sourceId: source.id, username, success: false, data: undefined });
        })
    );
  });

  websiteSources.forEach((source) => {
    const targetUrl = websiteUrl(source);
    if (!targetUrl) return;
    promises.push(
      scrapeCompany(targetUrl, signal)
        .then((result) => {
          if (!out.company) out.company = [];
          out.company.push({ sourceId: source.id, url: targetUrl, success: result.success, data: result.data });
        })
        .catch(() => {
          if (!out.company) out.company = [];
          out.company.push({ sourceId: source.id, url: targetUrl, success: false, data: undefined });
        })
    );
  });

  playStoreSources.forEach((source) => {
    const appUrl = source.app_url!.trim();
    promises.push(
      scrapePlayStore(appUrl, 100, signal)
        .then((result) => {
          if (!out.playstore) out.playstore = [];
          out.playstore.push({ sourceId: source.id, app_url: appUrl, success: result.success, data: result.data });
        })
        .catch(() => {
          if (!out.playstore) out.playstore = [];
          out.playstore.push({ sourceId: source.id, app_url: appUrl, success: false, data: undefined });
        })
    );
  });

  appStoreSources.forEach((source) => {
    const appId = source.app_url!.trim();
    promises.push(
      scrapeAppStore(appId, { country: 'us', maxReviews: 100 }, signal)
        .then((result) => {
          if (!out.appstore) out.appstore = [];
          out.appstore.push({ sourceId: source.id, app_id: appId, success: result.success, data: result.data });
        })
        .catch(() => {
          if (!out.appstore) out.appstore = [];
          out.appstore.push({ sourceId: source.id, app_id: appId, success: false, data: undefined });
        })
    );
  });

  await Promise.all(promises);
  return out;
}

export async function runCompleteAnalysis(
  organizationId: string,
  _parsedFileData?: { nps?: NPSSurvey[]; tickets?: Ticket[]; internal_data?: InternalDataRow[] },
  _rawFileData?: { nps?: Record<string, string>[]; tickets?: Record<string, string>[]; internal_data?: Record<string, any>[] },
  options?: {
    dataSources?: DataSourceRef[];
    rawScrapedData?: RawScraped;
    signal?: AbortSignal;
    businessContexts?: unknown[];
    teamContexts?: unknown[];
  }
): Promise<AnalysisResult> {
  const signal = options?.signal;
  const dataSources = options?.dataSources ?? [];

  const rawScrapedData = options?.rawScrapedData ?? await runAllScrapers(dataSources, signal);

  try {
    const response = await postFirstReportAnalyze(organizationId, rawScrapedData as Record<string, unknown>, signal);
    return {
      success: response.success === true,
      insightId: response.insight_id,
      metadata: { processingTime: 0 },
    };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return {
      success: false,
      error: message,
      metadata: { processingTime: 0 },
    };
  }
}

/** Ejecuta solo los scrapers (Instagram, Company, Play Store, App Store) y devuelve los resultados. */
export async function runScrapersOnly(dataSources: DataSourceRef[]): Promise<RawScraped> {
  try {
    const out = await runAllScrapers(dataSources);
    return JSON.parse(JSON.stringify(out)) as RawScraped;
  } catch (e: any) {
    return { error: e?.message ?? String(e) } as RawScraped & { error: string };
  }
}
