/**
 * Tipos para el flujo de análisis.
 * Misma forma que antes: se usan para armar el payload al backend y para parsear archivos en la UI.
 */

export interface NPSSurvey {
  id: string;
  score: number;
  comment?: string;
  timestamp: string;
  source: string;
}

export interface Ticket {
  id: string;
  ticket_number?: string;
  subject: string;
  description: string;
  status: string;
  priority?: string;
  created_at: string;
  source: string;
}

export type InternalDataRow = Record<string, string>;

/** Respuesta del endpoint de análisis (mismo formato que la lógica anterior) */
export interface AnalysisResult {
  success: boolean;
  insightId?: string;
  error?: string;
  metadata?: {
    filesProcessed?: number;
    scrapersExecuted?: number;
    itemsAnalyzed?: number;
    clustersDetected?: number;
    processingTime: number;
  };
}

/** Fuente de datos mínima para que el backend sepa qué scrapear (Instagram, web, etc.) */
export interface DataSourceRef {
  id: string;
  source_type: string;
  social_platform?: string;
  social_username?: string;
  app_url?: string;
  app_store_type?: string;
  website_url?: string;
}

/** Payload para análisis (dashboard, manual) */
export interface RunAnalysisPayload {
  organizationId: string;
  parsedFileData?: {
    nps?: NPSSurvey[];
    tickets?: Ticket[];
    internal_data?: InternalDataRow[];
  };
  rawFileData?: {
    nps?: Record<string, string>[];
    tickets?: Record<string, string>[];
    internal_data?: Record<string, any>[];
  };
  /** Datos ya scrapeados (de la organización en sesión) para enviar al agente */
  rawScrapedData?: {
    instagram?: Array<{ sourceId: string; username: string; success: boolean; data?: unknown }>;
    company?: Array<{ sourceId: string; url: string; success: boolean; data?: unknown }>;
    playstore?: Array<{ sourceId: string; app_url: string; success: boolean; data?: unknown }>;
    appstore?: Array<{ sourceId: string; app_id: string; success: boolean; data?: unknown }>;
  };
}
