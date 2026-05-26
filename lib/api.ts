const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000'

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BACKEND}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`${res.status}: ${text}`)
  }
  return res.json() as Promise<T>
}

export const api = {
  // ── Fase 1: ML ──────────────────────────────────────────────────────────
  getUltimaSemana: () =>
    apiFetch<Record<string, unknown>>('/api/data/ultima-semana'),
  saveUltimaSemana: (data: Record<string, unknown>) =>
    apiFetch<Record<string, unknown>>('/api/data/ultima-semana', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  nuevaProyeccion: () =>
    apiFetch<{ ok: boolean; semana_archivada: string }>('/api/data/nueva-proyeccion', {
      method: 'POST',
    }),
  predict: () => apiFetch<PredictionResult>('/api/ml/predict', { method: 'POST' }),
  latestPrediction: () => apiFetch<PredictionResult | Record<string, never>>('/api/ml/latest-prediction'),
  predictionHistory: () => apiFetch<PredictionResult[]>('/api/ml/prediction-history'),
  trainingStatus: () => apiFetch<TrainingStatus>('/api/ml/training-status'),
  train: () => apiFetch<Record<string, unknown>>('/api/ml/train', { method: 'POST' }),

  // ── Fase 2: Estrategia ───────────────────────────────────────────────────
  getFunnelHealth: () => apiFetch<FunnelStep[]>('/api/strategy/funnel-health'),
  syncCampaigns: () => apiFetch<SyncResult>('/api/strategy/sync', { method: 'POST' }),
  getSafetyStatus: () => apiFetch<SafetyStatus>('/api/strategy/safety-status'),
  generateStrategy: (contextoAdicional?: string, estructuraCampana?: string) =>
    apiFetch<StrategyResult>('/api/strategy/generate', {
      method: 'POST',
      body: JSON.stringify({
        contexto_adicional: contextoAdicional ?? null,
        estructura_campana: estructuraCampana ?? null,
      }),
    }),
  executeStrategy: (strategy: StrategyResult) =>
    apiFetch<ExecuteResult>('/api/strategy/execute', {
      method: 'POST',
      body: JSON.stringify({ strategy }),
    }),
  getSystemContext: () => apiFetch<SystemContext>('/api/strategy/system-context'),
  getLatestStrategy: () => apiFetch<StrategyResult>('/api/strategy/latest'),
  getStrategyHistory: () => apiFetch<StrategyResult[]>('/api/strategy/history'),
  getLatestStructural: () => apiFetch<StrategyResult>('/api/strategy/latest-structural'),
  generateStructural: (detallesCampanas: string, phase2Strategy: StrategyResult, contextoAdicional?: string) =>
    apiFetch<StrategyResult>('/api/strategy/generate-structural', {
      method: 'POST',
      body: JSON.stringify({
        detalle_campanas: detallesCampanas,
        phase2_strategy: phase2Strategy,
        contexto_adicional: contextoAdicional ?? null,
      }),
    }),

  // ── Configuración ────────────────────────────────────────────────────────
  getTrackedCampaigns: () =>
    apiFetch<TrackedCampaign[]>('/api/config/tracked-campaigns'),
  addTrackedCampaign: (cio_campaign_id: string) =>
    apiFetch<TrackedCampaign>('/api/config/tracked-campaigns', {
      method: 'POST',
      body: JSON.stringify({ cio_campaign_id }),
    }),
  deleteTrackedCampaign: (campaign_id: string) =>
    apiFetch<{ ok: boolean; deleted: string }>(`/api/config/tracked-campaigns/${campaign_id}`, {
      method: 'DELETE',
    }),
  getConfigKnowledgeBase: () =>
    apiFetch<KnowledgeBaseEntry[]>('/api/config/knowledge-base'),
  updateKnowledgeBaseEntry: (id: string, updates: Partial<KnowledgeBaseEntry>) =>
    apiFetch<KnowledgeBaseEntry>(`/api/config/knowledge-base/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  addKnowledgeBaseEntry: (entry: { tipo: string; titulo: string; contenido: string }) =>
    apiFetch<KnowledgeBaseEntry>('/api/config/knowledge-base', {
      method: 'POST',
      body: JSON.stringify(entry),
    }),

  // ── Monitor Fase 3 ───────────────────────────────────────────────────────
  runWeeklyCheck: () => apiFetch<MonitorReport>('/api/monitor/check'),

  // ── Medición Fase 4 ─────────────────────────────────────────────────────
  bqStatus: () => apiFetch<{ configured: boolean; message: string }>('/api/measure/status'),
  runMeasurement: (body: MeasurementRequest) =>
    apiFetch<MeasurementReport>('/api/measure/run', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  // ── Snapshots manuales (HTML de Claude) ──────────────────────────────────
  saveSnapshot: (body: {
    semana_label: string
    inicio_semana?: string
    fin_semana?: string
    model_version?: string
    html_content: string
  }) =>
    apiFetch<MeasurementSnapshot>('/api/measure/save-snapshot', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  listSnapshots: () => apiFetch<MeasurementSnapshot[]>('/api/measure/snapshots'),
  getSnapshot: (id: string) => apiFetch<MeasurementSnapshot>(`/api/measure/snapshots/${id}`),
}

export interface ShapItem {
  feature: string
  value: number | null
  contribution: number
}

export interface ContextoItem {
  feature: string
  current_value: number | null
  trailing_12w_mean: number
  z_score: number | null
  shap_contribution: number
}

export interface PrescripcionItem {
  variable: string
  z_score: number
  contribucion_depositos: number
  direccion: string
  severidad: string
  tipo_accion: string
}

export interface PredictionResult {
  semana_datos: string
  semana_label?: string        // "6 al 12 de marzo 2026"
  prediccion_siguiente_semana: number
  target_name: string
  modelo_version: string
  mae_modelo: number | null
  baseline_12w: number
  brecha_vs_baseline: number
  shap_top: ShapItem[]
  contexto_historico_top_features: ContextoItem[]
  prescripcion: PrescripcionItem[]
  _id?: string
}

export interface TrainingStatus {
  has_model: boolean
  version?: number
  mae_walk_forward?: number
  r2_train?: number
  mae_train?: number
  ratio_wf_train?: number
  overfitting_flag?: string
  n_samples?: number
  n_features?: number
  message?: string
}

// ── Fase 2: Estrategia ─────────────────────────────────────────────────────

export interface WeeklySeries {
  delivered: number[]
  sent: number[]
  human_opened: number[]
  clicked: number[]
  converted: number[]
  bounced: number[]
  undeliverable: number[]
  created: number[]
}

export interface MetricsWeeklyJson {
  period: string
  start: string
  end: string
  series: WeeklySeries
}

export interface CampaignSummary {
  cio_campaign_id: string
  name: string
  status: string | null
  goal_event?: string | null
  delivery_rate: number
  open_rate: number
  conversion_rate: number
  delivered: number
  total_sent: number
  converted: number
  undeliverable: number
  metrics_weekly_json: MetricsWeeklyJson | null
  n_nodos?: number | null
  warnings?: string[]
}

export interface FunnelMetrics {
  delivered: number
  total_sent: number
  converted: number
  human_opened: number
  undeliverable: number
  delivery_rate: number
  open_rate: number
  conversion_rate: number
  delivery_delta: number
}

export interface FunnelStep {
  step_order: number
  step_code: string
  step_name: string
  health: 'verde' | 'amarillo' | 'rojo' | 'spike'
  label: string
  warnings: string[]
  metrics: FunnelMetrics
  campaigns: CampaignSummary[]
  entry_event: string | null
  exit_event: string | null
}

export interface StrategyNode {
  orden: number
  nombre?: string  // nombre EXACTO del nodo en CIO (ej: "Push 3 (Beneficios)", "Email 1 – Educación & transparencia")
  tipo: 'push' | 'email'
  delay_desde_anterior_horas: number
  subject:   string  // Liquid expression con ramas por Perfil_de_riesgo
  preheader?: string // Liquid expression (solo email)
  cuerpo:    string  // Liquid expression con ramas por Perfil_de_riesgo
}

export interface CambiosEstructura {
  descripcion: string | null
  delays_propuestos?: { nodo: number; delay_horas: number }[]
  secuencia_canales?: string | null
  nodos_adicionales?: string | null
}

export interface StrategyAction {
  step_code: string
  step_name: string
  shap_z: number
  shap_contribucion?: number
  prioridad: 'alta' | 'media'
  tipo_accion: 'optimizar' | 'reforzar' | 'alerta_gap' | 'crear'
  campaña_existente_id: string | null
  campaña_existente_nombre: string | null
  razon: string
  propuesta: {
    nombre_campaña: string
    trigger_event: string
    conversion_event: string
    cambios_estructura?: CambiosEstructura
    nodos: StrategyNode[]
  }
}

export interface StrategyResult {
  resumen: string
  estado_funnel: 'estable' | 'anomalia_leve' | 'anomalia_critica'
  semana_label?: string
  acciones: StrategyAction[]
  _id?: string
  _created_at?: string
}

export interface SafetyStatus {
  cio_dry_run: boolean
  max_campaigns_per_execute: number
  cio_key_configured: boolean
  escrituras_bloqueadas: boolean
  mensaje: string
}

export interface SyncResult {
  total_synced: number
  mapped_to_funnel: number
  unmapped: number
  spike_alerts: string[]
  errors: string[]
}

export interface FunnelStepRaw {
  id?: string
  step_order: number
  step_code: string
  step_name: string
  entry_event: string | null
  exit_event: string | null
}

export interface CampaignCacheRaw {
  cio_campaign_id: string
  name: string
  campaign_type: string | null
  status: string | null
  trigger_event: string | null
  goal_event: string | null
  country: string | null
  funnel_step_mapped: string | null
  delivered: number
  total_sent: number
  opened: number
  human_opened: number
  clicked: number
  converted: number
  bounced: number
  undeliverable: number
  delivery_rate: number
  open_rate: number
  conversion_rate: number
  undeliverable_rate: number
  metrics_weeks_covered: number
  spike_alert: boolean
  last_synced_at: string | null
}

export interface CioEvent {
  id?: string
  name: string
  record_type: 'event'
  event_role: 'trigger' | 'goal' | 'signal' | 'both' | null
  funnel_step_code: string | null
  description: string | null
  active: boolean
}

export interface CioAttribute {
  id?: string
  name: string
  record_type: 'attribute'
  description: string | null
  possible_values: string | null
  active: boolean
}

export interface KnowledgeBaseEntry {
  id?: string
  tipo: string
  titulo: string
  contenido: string
  activo: boolean
}

export interface SystemContext {
  funnel_steps: FunnelStepRaw[]
  campaigns_cache: CampaignCacheRaw[]
  events: CioEvent[]
  attributes: CioAttribute[]
  knowledge_base: KnowledgeBaseEntry[]
}

// ── Fase 3: Monitor ───────────────────────────────────────────────────────────

export type MonitorHealth = 'ok' | 'alerta' | 'critico' | 'sin_datos'

export interface CampaignTrend {
  last_week: number
  prior_avg: number
  change_pct: number
}

export interface CampaignCheckResult {
  cio_campaign_id: string
  name: string
  status_campaign: string | null
  funnel_step_mapped: string | null
  health: MonitorHealth
  label: string
  issues: string[]
  metrics: {
    delivery_rate: number
    open_rate: number
    conversion_rate: number
    delivered: number
    total_sent: number
    converted: number
  }
  trends: {
    delivered?: CampaignTrend
    converted?: CampaignTrend
    human_opened?: CampaignTrend
  }
}

export interface MonitorReport {
  checked_at: string
  overall_health: MonitorHealth
  total_campaigns: number
  ok: number
  alertas: number
  criticas: number
  sin_datos: number
  campaigns: CampaignCheckResult[]
}

export interface TrackedCampaign {
  cio_campaign_id: string
  name: string
  status: string | null
  funnel_step_mapped: string | null
  trigger_event: string | null
  delivery_rate: number
  open_rate: number
  conversion_rate: number
  total_sent: number
  last_synced_at: string | null
  unmapped_warning: boolean
}

export interface ExecuteResult {
  executed: Array<{
    step_code: string
    tipo: string
    campaign_id?: string
    nombre?: string
    nodos_actualizados?: number
  }>
  errors: Array<{ step_code: string; tipo: string; error: string }>
  total_ejecutadas: number
  total_errores: number
}

// ── Fase 4: Medición ──────────────────────────────────────────────────────────

export interface MeasurementSnapshot {
  id: string
  created_at: string
  semana_label: string
  inicio_semana: string | null
  fin_semana: string | null
  model_version: string
  html_content?: string
}

export interface MeasurementRequest {
  campaign_name?: string
  test_user_ids: string[]
  start_date: string  // YYYY-MM-DD
  end_date: string    // YYYY-MM-DD
}

export interface MeasurementGroupStats {
  n: number
  conversiones: number
  conversion_rate: number
  total_cashin_usd: number
  avg_cashin_convertidos_usd: number
  total_aum_usd: number
}

export interface MeasurementReport {
  campaign_name: string
  window: { start: string; end: string }
  n_test_ids_provided: number
  n_test_ids_matched: number
  groups: {
    test: MeasurementGroupStats
    control: MeasurementGroupStats
  }
  uplift: {
    absolute: number
    pct: number | null
    significant: boolean
    direction: 'positivo' | 'negativo' | 'neutro'
  }
  profile_breakdown: Record<string, Array<{
    perfil: string
    n: number
    conversiones: number
    conversion_rate: number
  }>>
  weekly_trend: Array<{
    semana: string
    test?: { n: number; conversiones: number; conversion_rate: number }
    control?: { n: number; conversiones: number; conversion_rate: number }
  }>
}
