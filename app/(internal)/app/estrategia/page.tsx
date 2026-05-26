'use client'

import { useEffect, useRef, useState } from 'react'
import {
  api,
  type FunnelStep,
  type CampaignSummary,
  type StrategyResult,
  type StrategyAction,
  type StrategyNode,
  type SafetyStatus,
  type SyncResult,
  type ExecuteResult,
  type SystemContext,
  type FunnelStepRaw,
  type CampaignCacheRaw,
  type CioEvent,
  type CioAttribute,
  type KnowledgeBaseEntry,
} from '@/lib/api'

// ─── Canvas types ─────────────────────────────────────────────────────────────

interface NodeCopies {
  subject:    string  // Liquid expression
  preheader?: string  // Liquid expression (email only)
  cuerpo:     string  // Liquid expression
}
interface ActionEdit {
  included:  boolean
  nodeEdits: Record<number, NodeCopies>
}

// Normaliza nodo legacy {conservador/moderado/arriesgado} a Liquid string
function toLiquid(v: string | { conservador?: string; moderado?: string; arriesgado?: string } | undefined | null): string {
  if (!v) return ''
  if (typeof v === 'string') return v
  const c = v.conservador ?? ''
  const m = v.moderado ?? v.arriesgado ?? ''
  const a = v.arriesgado ?? ''
  return `{% if customer.Perfil_de_riesgo == '1. Conservador' -%}${c}{%- elsif customer.Perfil_de_riesgo == '2. Moderado' or customer.Perfil_de_riesgo == '3. Arriesgado' -%}${m}{%- else -%}${a}{%- endif %}`
}

// ─── Mini helpers ─────────────────────────────────────────────────────────────

function Sparkline({ data }: { data: number[] }) {
  const raw = data.slice(0, -1)
  const values = raw.slice(-6)
  if (values.length < 2 || values.every(v => v === 0)) {
    return <span className="text-neutral-700 text-xs">—</span>
  }
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = max - min || 1
  const W = 64, H = 22, pad = 2
  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (W - pad * 2)
    const y = H - pad - ((v - min) / range) * (H - pad * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const rising = values[values.length - 1] >= values[values.length - 2]
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="shrink-0 opacity-80">
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke={rising ? '#34d399' : '#f87171'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MetricBar({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = Math.min(100, Math.round(value * 100))
  return (
    <div className="flex items-center gap-2">
      <span className="text-neutral-500 text-xs w-16 shrink-0">{label}</span>
      <div className="flex-1 h-1 bg-neutral-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-neutral-300 text-xs w-9 text-right tabular-nums">{pct}%</span>
    </div>
  )
}

type Health = FunnelStep['health']
const H_STYLES: Record<Health, { dot: string; text: string; ring: string }> = {
  verde:    { dot: 'bg-emerald-400', text: 'text-emerald-400', ring: 'border-emerald-500/25' },
  amarillo: { dot: 'bg-amber-400',   text: 'text-amber-400',   ring: 'border-amber-500/25' },
  rojo:     { dot: 'bg-neutral-600', text: 'text-neutral-500', ring: 'border-neutral-800' },
  spike:    { dot: 'bg-orange-400',  text: 'text-orange-400',  ring: 'border-orange-500/30' },
}

const H_LEGEND: Record<Health, string> = {
  verde:    'Funcionando bien',
  amarillo: 'Atención',
  rojo:     'Sin campaña',
  spike:    'Tráfico inusual',
}

const STATUS_LABELS: Record<string, string> = {
  running:  'activa',
  paused:   'pausada',
  draft:    'borrador',
  stopped:  'detenida',
  archived: 'archivada',
}

const GOAL_LABELS: Record<string, string> = {
  BeCashIn:                              'depositaron',
  Risk_Profile_Completed:                'completaron perfil de riesgo',
  Basic_Data_Completed:                  'completaron datos básicos',
  BeFullUserCreated:                     'completaron cuenta (Full)',
  Data_Validation_Information_Completed: 'completaron validación de datos',
  front_photo_completed:                 'subieron foto frontal',
  back_photo_completed:                  'subieron foto reverso',
  video_recording_completed:             'grabaron video liveness',
  befullusercreated:                     'completaron cuenta (Full)',
}

function goalLabel(goalEvent: string | null | undefined): string {
  if (!goalEvent) return 'convirtieron'
  const key = Object.keys(GOAL_LABELS).find(k => k.toLowerCase() === goalEvent.toLowerCase())
  return key ? GOAL_LABELS[key] : goalEvent.replace(/_/g, ' ').toLowerCase()
}

function HealthDot({ health }: { health: Health }) {
  const s = H_STYLES[health]
  return (
    <span className="relative flex items-center justify-center w-2 h-2 shrink-0 mt-0.5">
      {health === 'verde' && (
        <span className="absolute w-full h-full rounded-full bg-emerald-400 opacity-30 animate-ping" />
      )}
      <span className={`w-2 h-2 rounded-full ${s.dot}`} />
    </span>
  )
}

// ─── Campaign-centric diagnostic ─────────────────────────────────────────────

interface CampaignView {
  cid: string
  campaign: CampaignSummary
  step: FunnelStep
  coveredSteps: FunnelStep[]
  stepRangeLabel: string
  health: Health
}

function buildCampaignViews(health: FunnelStep[]): { campaignViews: CampaignView[]; trueGaps: FunnelStep[] } {
  const sortedSteps = [...health].sort((a, b) => a.step_order - b.step_order)

  const eventToOrder = new Map<string, number>()
  for (const s of sortedSteps) {
    if (s.entry_event) eventToOrder.set(s.entry_event.toLowerCase(), s.step_order)
    if (s.exit_event)  eventToOrder.set(s.exit_event.toLowerCase(),  s.step_order)
  }
  eventToOrder.set('photo_validation_completed', 6)

  const seen = new Set<string>()
  const campaignViews: CampaignView[] = []

  for (const step of sortedSteps) {
    for (const c of step.campaigns) {
      if (seen.has(c.cio_campaign_id)) continue
      seen.add(c.cio_campaign_id)

      const startOrder = step.step_order + 1  // +1: la campaña atrapa usuarios DESPUÉS de completar el trigger step
      const goalOrder  = c.goal_event
        ? (eventToOrder.get(c.goal_event.toLowerCase()) ?? startOrder)
        : startOrder

      const lo = Math.min(startOrder, goalOrder)
      const hi = Math.max(startOrder, goalOrder)
      const coveredSteps = sortedSteps.filter(s => s.step_order >= lo && s.step_order <= hi)
      const stepRangeLabel = lo === hi ? `Paso ${lo}` : `Pasos ${lo} → ${hi}`

      campaignViews.push({ cid: c.cio_campaign_id, campaign: c, step, coveredSteps, stepRangeLabel, health: step.health })
    }
  }

  const coveredOrders = new Set(campaignViews.flatMap(v => v.coveredSteps.map(s => s.step_order)))
  const trueGaps = sortedSteps.filter(s => s.health === 'rojo' && !coveredOrders.has(s.step_order))

  return { campaignViews, trueGaps }
}

// ─── Funnel Step Card ─────────────────────────────────────────────────────────

function CampaignBlock({ c }: { c: CampaignSummary }) {
  const cr = c.conversion_rate
  const crPct = (cr * 100).toFixed(1)
  const sparkData = c.metrics_weekly_json?.series?.converted ?? []

  const [crColor, crBadgeCls, crLabel] =
    cr >= 0.07 ? ['text-emerald-400', 'bg-emerald-500/12 border-emerald-500/20', 'Convirtiendo bien']  :
    cr >= 0.03 ? ['text-amber-400',   'bg-amber-500/12 border-amber-500/20',   'Puede mejorar']        :
                 ['text-red-400',     'bg-red-500/12 border-red-500/20',        'Bajo — necesita atención']

  const statusLabel = c.status ? (STATUS_LABELS[c.status] ?? c.status) : '—'
  const isActive    = c.status === 'running'

  const nToques = c.n_nodos ?? null

  return (
    <div className="px-4 py-3 flex flex-col gap-2">
      {/* Name + status + estructura del journey */}
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-neutral-300 font-medium leading-snug" title={c.name}>{c.name}</p>
          {nToques !== null && nToques > 0 && (
            <p className="text-[10px] text-neutral-600 mt-0.5">
              Secuencia de {nToques} mensajes programados (push + email)
            </p>
          )}
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 border ${
          isActive ? 'bg-emerald-500/12 text-emerald-400 border-emerald-500/20' : 'bg-neutral-800 text-neutral-500 border-neutral-700'
        }`}>
          {statusLabel}
        </span>
      </div>

      {/* CR badge + trend + métricas del último mes */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${crBadgeCls}`}>
          <span className={`text-sm font-bold tabular-nums leading-none ${crColor}`}>{crPct}%</span>
          <span className={`text-[10px] font-medium ${crColor}`}>{crLabel}</span>
        </div>
        {sparkData.length > 3 && <Sparkline data={sparkData} />}
        <span className="text-neutral-600 text-[10px] tabular-nums ml-auto">
          {c.total_sent > c.delivered
            ? <>{c.total_sent.toLocaleString('es-CO')} env. → {c.delivered.toLocaleString('es-CO')} llegaron</>
            : <>{c.delivered.toLocaleString('es-CO')} llegaron</>
          }
          {' · '}{c.converted.toLocaleString('es-CO')} {goalLabel(c.goal_event)}
          <span className="text-neutral-700"> · últ. 4 sem.</span>
        </span>
      </div>

      {/* Warnings específicos de esta campaña */}
      {c.warnings && c.warnings.length > 0 && (
        <div className="space-y-1">
          {c.warnings.map((w, i) => (
            <p key={i} className="text-[11px] text-amber-400 bg-amber-500/8 border border-amber-500/15 rounded-md px-2.5 py-1.5 leading-relaxed">
              ⚠ {w}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

function FunnelStepCard({ step }: { step: FunnelStep }) {
  const s = H_STYLES[step.health]
  const isGap = step.health === 'rojo'

  const healthBadgeCls =
    step.health === 'verde'    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
    step.health === 'amarillo' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'       :
    step.health === 'spike'    ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'    :
                                 'bg-neutral-800 text-neutral-500 border-neutral-700'

  return (
    <div className={`bg-neutral-900 border rounded-xl overflow-hidden ${s.ring} ${isGap ? 'opacity-60' : ''}`}>

      {/* ── Header ── */}
      <div className={`px-4 py-3 flex items-center justify-between gap-3 ${!isGap ? 'border-b border-neutral-800/70' : ''}`}>
        <div className="flex items-center gap-2 min-w-0">
          <HealthDot health={step.health} />
          <p className="text-white text-sm font-semibold leading-tight truncate">
            <span className={`${s.text} font-mono mr-1`}>{step.step_order}.</span>
            {step.step_name}
          </p>
        </div>
        <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-medium shrink-0 ${healthBadgeCls}`}>
          {H_LEGEND[step.health]}
        </span>
      </div>

      {/* ── Body ── */}
      {isGap ? (
        <div className="px-4 py-4 space-y-2.5">
          <p className="text-neutral-400 text-sm">
            Los usuarios que pasan por aquí no reciben ningún mensaje.
          </p>
          {step.entry_event && (
            <div className="flex items-center gap-2">
              <span className="text-neutral-600 text-[10px] uppercase tracking-wider">Trigger disponible</span>
              <span className="text-neutral-500 text-[10px] font-mono bg-neutral-800 px-2 py-0.5 rounded">
                {step.entry_event}
              </span>
            </div>
          )}
        </div>
      ) : step.campaigns.length > 0 ? (
        <div className="divide-y divide-neutral-800/50">
          {step.campaigns.map(c => <CampaignBlock key={c.cio_campaign_id} c={c} />)}
        </div>
      ) : (
        <div className="px-4 py-4">
          <p className="text-neutral-600 text-xs">Corré el diagnóstico para ver las métricas de esta semana</p>
        </div>
      )}

    </div>
  )
}

// ─── Campaign Diagnostic Card ─────────────────────────────────────────────────

function CampaignDiagnosticCard({ view }: { view: CampaignView }) {
  const { campaign: c, coveredSteps, stepRangeLabel, health } = view
  const s = H_STYLES[health]

  const healthBadgeCls =
    health === 'verde'    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
    health === 'amarillo' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'       :
    health === 'spike'    ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'    :
                           'bg-neutral-800 text-neutral-500 border-neutral-700'

  const cr = c.conversion_rate
  const crPct = (cr * 100).toFixed(1)
  const sparkData = c.metrics_weekly_json?.series?.converted ?? []

  const [crColor, crBadgeCls, crLabel] =
    cr >= 0.07 ? ['text-emerald-400', 'bg-emerald-500/12 border-emerald-500/20', 'Convirtiendo bien'] :
    cr >= 0.03 ? ['text-amber-400',   'bg-amber-500/12 border-amber-500/20',   'Puede mejorar']       :
                 ['text-red-400',     'bg-red-500/12 border-red-500/20',        'Bajo — atención']

  const isActive    = c.status === 'running'
  const statusLabel = c.status ? (STATUS_LABELS[c.status] ?? c.status) : '—'

  return (
    <div className={`bg-neutral-900 border rounded-xl overflow-hidden ${s.ring}`}>

      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-800/70 flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 min-w-0">
          <HealthDot health={health} />
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold leading-tight truncate">{c.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span className="text-neutral-600 text-[10px] font-mono shrink-0">{stepRangeLabel}</span>
              {coveredSteps.map(cs => (
                <span key={cs.step_code} className="text-[10px] text-neutral-700 bg-neutral-800/80 px-1.5 py-0.5 rounded leading-none">
                  {cs.step_name}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
            isActive ? 'bg-emerald-500/12 text-emerald-400 border-emerald-500/20' : 'bg-neutral-800 text-neutral-500 border-neutral-700'
          }`}>
            {statusLabel}
          </span>
          <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-medium ${healthBadgeCls}`}>
            {H_LEGEND[health]}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-2">
        <div className="flex items-center gap-3 flex-wrap">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${crBadgeCls}`}>
            <span className={`text-sm font-bold tabular-nums leading-none ${crColor}`}>{crPct}%</span>
            <span className={`text-[10px] font-medium ${crColor}`}>{crLabel}</span>
          </div>
          {sparkData.length > 3 && <Sparkline data={sparkData} />}
          <span className="text-neutral-600 text-[10px] tabular-nums ml-auto">
            {c.total_sent > c.delivered
              ? <>{c.total_sent.toLocaleString('es-CO')} env. → {c.delivered.toLocaleString('es-CO')} llegaron</>
              : <>{c.delivered.toLocaleString('es-CO')} llegaron</>
            }
            {' · '}{c.converted.toLocaleString('es-CO')} {goalLabel(c.goal_event)}
            <span className="text-neutral-700"> · últ. 4 sem.</span>
          </span>
        </div>
        {c.warnings && c.warnings.length > 0 && (
          <div className="space-y-1">
            {c.warnings.map((w, i) => (
              <p key={i} className="text-[11px] text-amber-400 bg-amber-500/8 border border-amber-500/15 rounded-md px-2.5 py-1.5 leading-relaxed">
                ⚠ {w}
              </p>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

// ─── Canvas components ────────────────────────────────────────────────────────

const TIPO_CFG: Record<string, { label: string; cls: string }> = {
  optimizar:  { label: 'OPTIMIZAR', cls: 'bg-amber-500/12 text-amber-400 border-amber-500/25' },
  reforzar:   { label: 'REFORZAR',  cls: 'bg-purple-500/12 text-purple-400 border-purple-500/25' },
  alerta_gap: { label: 'GAP',       cls: 'bg-neutral-500/12 text-neutral-400 border-neutral-600/40' },
  crear:      { label: 'CREAR',     cls: 'bg-sky-500/12 text-sky-400 border-sky-500/25' },
}

function LiquidField({
  label,
  hint,
  value,
  rows,
  onChange,
}: {
  label: string
  hint?: string
  value: string
  rows: number
  onChange: (v: string) => void
}) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-neutral-600 uppercase tracking-wider font-medium">{label}</span>
          {hint && <span className="text-[10px] text-neutral-700">{hint}</span>}
        </div>
        <button
          onClick={handleCopy}
          title="Copiar Liquid para pegar en CIO"
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border transition-all ${
            copied
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
              : 'bg-neutral-800 text-neutral-500 border-neutral-700 hover:text-neutral-300 hover:border-neutral-600'
          }`}
        >
          {copied ? '✓ Copiado' : '📋 Copiar'}
        </button>
      </div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        spellCheck={false}
        className="w-full bg-neutral-800 border border-neutral-700 rounded-md px-2.5 py-2 text-xs text-neutral-300 font-mono resize-none focus:outline-none focus:ring-1 focus:ring-neutral-500/30 hover:border-neutral-600 transition-colors leading-relaxed"
      />
    </div>
  )
}

function NodeLiquidEditor({
  nodo,
  copies,
  onChange,
}: {
  nodo: StrategyNode
  copies: NodeCopies
  onChange: (c: NodeCopies) => void
}) {
  const isPush = nodo.tipo === 'push'
  return (
    <div className="space-y-3">
      <LiquidField
        label={isPush ? 'Título (subject)' : 'Asunto (subject)'}
        hint={isPush ? '≤60 chars por rama' : '≤50 chars por rama'}
        value={copies.subject}
        rows={4}
        onChange={v => onChange({ ...copies, subject: v })}
      />
      {!isPush && (
        <LiquidField
          label="Preheader"
          hint="≤85 chars por rama"
          value={copies.preheader ?? ''}
          rows={4}
          onChange={v => onChange({ ...copies, preheader: v })}
        />
      )}
      <LiquidField
        label={isPush ? 'Cuerpo (body)' : 'Cuerpo email'}
        hint={isPush ? '≤180 chars por rama' : '≤500 chars por rama'}
        value={copies.cuerpo}
        rows={isPush ? 6 : 8}
        onChange={v => onChange({ ...copies, cuerpo: v })}
      />
    </div>
  )
}

// ─── NodeColumnsEditor — wrapper para NodeLiquidEditor con header ─────────────

function NodeColumnsEditor({
  nodo,
  copies,
  onChange,
}: {
  nodo: StrategyNode
  copies: NodeCopies
  onChange: (c: NodeCopies) => void
}) {
  const isPush = nodo.tipo === 'push'
  const delayLabel =
    nodo.orden === 1
      ? 'Al entrar al journey'
      : nodo.delay_desde_anterior_horas < 24
        ? `+${nodo.delay_desde_anterior_horas}h desde el mensaje anterior`
        : `+${Math.round(nodo.delay_desde_anterior_horas / 24)} día${Math.round(nodo.delay_desde_anterior_horas / 24) !== 1 ? 's' : ''} desde el mensaje anterior`

  return (
    <div className="bg-neutral-800/40 rounded-xl border border-neutral-800 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base leading-none">{isPush ? '🔔' : '📧'}</span>
          <span className="text-white text-sm font-semibold">
            {nodo.nombre ?? `${isPush ? 'Push' : 'Email'} ${nodo.orden}`}
          </span>
          <span className="text-neutral-600 text-xs">· {delayLabel}</span>
        </div>
        <span className="text-neutral-700 text-[10px]">
          Liquid — 3 ramas: Conservador · Moderado+Arriesgado · sin perfil
        </span>
      </div>
      <div className="p-4">
        <NodeLiquidEditor nodo={nodo} copies={copies} onChange={onChange} />
      </div>
    </div>
  )
}

// ─── NodeTimeline — timeline horizontal + panel por nodo seleccionado ─────────

function NodeTimeline({
  nodos,
  selectedOrden,
  edits,
  onSelect,
  onNodeEdit,
}: {
  nodos: StrategyNode[]
  selectedOrden: number | null
  edits: ActionEdit
  onSelect: (orden: number | null) => void
  onNodeEdit: (nodeOrden: number, copies: NodeCopies) => void
}) {
  const selectedNodo = nodos.find(n => n.orden === selectedOrden) ?? null

  return (
    <div>
      <div className="flex items-center overflow-x-auto py-1 gap-0">
        {nodos.map((nodo, i) => {
          const isSelected = nodo.orden === selectedOrden
          const delayShort =
            nodo.delay_desde_anterior_horas < 24
              ? `${nodo.delay_desde_anterior_horas}h`
              : `${Math.round(nodo.delay_desde_anterior_horas / 24)}d`

          return (
            <div key={nodo.orden} className="flex items-center shrink-0">
              {i > 0 && (
                <div className="flex items-center shrink-0">
                  <div className="w-4 h-px bg-neutral-700" />
                  <span className="text-[10px] text-neutral-600 px-1 whitespace-nowrap">{delayShort}</span>
                  <div className="w-4 h-px bg-neutral-700" />
                </div>
              )}
              <button
                onClick={() => onSelect(isSelected ? null : nodo.orden)}
                title={isSelected ? 'Cerrar' : `Editar ${nodo.nombre ?? `${nodo.tipo === 'push' ? 'Push' : 'Email'} ${nodo.orden}`}`}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-sm shadow-amber-500/10'
                    : 'bg-neutral-800/50 border-neutral-700/40 text-neutral-400 hover:text-neutral-200 hover:border-neutral-600'
                }`}
              >
                <span className="text-sm leading-none">{nodo.tipo === 'push' ? '🔔' : '📧'}</span>
                <span>{nodo.nombre ?? `${nodo.tipo === 'push' ? 'Push' : 'Email'} ${nodo.orden}`}</span>
              </button>
            </div>
          )
        })}
        <span className="text-[10px] text-neutral-700 ml-4 shrink-0 whitespace-nowrap">
          {nodos.length} mensaje{nodos.length !== 1 ? 's' : ''} · clic para editar
        </span>
      </div>

      {selectedNodo && (
        <div className="mt-3">
          <NodeColumnsEditor
            nodo={selectedNodo}
            copies={
              edits.nodeEdits[selectedNodo.orden] ?? {
                subject:   toLiquid(selectedNodo.subject as Parameters<typeof toLiquid>[0]),
                preheader: selectedNodo.preheader ? toLiquid(selectedNodo.preheader as Parameters<typeof toLiquid>[0]) : undefined,
                cuerpo:    toLiquid(selectedNodo.cuerpo as Parameters<typeof toLiquid>[0]),
              }
            }
            onChange={c => onNodeEdit(selectedNodo.orden, c)}
          />
        </div>
      )}
    </div>
  )
}

function StrategyCanvasCard({
  action,
  actionIndex,
  edits,
  onToggle,
  onNodeEdit,
}: {
  action: StrategyAction
  actionIndex: number
  edits: ActionEdit
  onToggle: () => void
  onNodeEdit: (nodeOrden: number, copies: NodeCopies) => void
}) {
  const [selectedNodeOrden, setSelectedNodeOrden] = useState<number | null>(null)
  const tipo    = TIPO_CFG[action.tipo_accion]
  const isAlta  = action.prioridad === 'alta'
  const { included } = edits

  return (
    <div className={`bg-neutral-900 border rounded-xl overflow-hidden transition-opacity duration-200 ${
      included
        ? isAlta ? 'border-red-500/25' : 'border-amber-500/20'
        : 'border-neutral-800 opacity-40'
    }`}>
      {/* Header */}
      <div className={`px-5 py-2.5 flex items-center justify-between gap-3 border-b ${
        included
          ? isAlta ? 'bg-red-500/5 border-red-500/15' : 'bg-amber-500/5 border-amber-500/10'
          : 'bg-neutral-800/30 border-neutral-800'
      }`}>
        <div className="flex items-center gap-3">
          {/* Checkbox */}
          <button
            onClick={onToggle}
            title={included ? 'Descartar esta acción' : 'Incluir esta acción'}
            className={`w-4 h-4 rounded flex items-center justify-center border transition-all shrink-0 ${
              included
                ? 'bg-amber-500 border-amber-500 shadow-sm shadow-amber-500/30'
                : 'bg-transparent border-neutral-600 hover:border-neutral-400'
            }`}
          >
            {included && <span className="text-neutral-950 text-[10px] font-bold leading-none">✓</span>}
          </button>

          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
              included
                ? isAlta
                  ? 'bg-red-500/15 text-red-400 border-red-500/25'
                  : 'bg-amber-500/15 text-amber-400 border-amber-500/25'
                : 'bg-neutral-800 text-neutral-600 border-neutral-700'
            }`}>
              {action.prioridad.toUpperCase()}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${tipo.cls}`}>
              {tipo.label}
            </span>
          </div>
        </div>

        {action.shap_contribucion != null && (
          <span className={`text-sm font-semibold tabular-nums shrink-0 ${action.shap_contribucion >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {action.shap_contribucion >= 0 ? '+' : ''}{action.shap_contribucion.toFixed(0)} dep.
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        <h3 className="text-white font-semibold mb-0.5">{action.step_name}</h3>
        <p className="text-neutral-600 text-xs mb-3">{action.step_code}</p>

        {/* Razón */}
        <p className="text-neutral-400 text-sm leading-relaxed mb-4">{action.razon}</p>

        {/* Campaign metadata */}
        <div className="bg-neutral-800/60 rounded-lg p-3.5 space-y-2 mb-4 text-xs">
          <Row label="Journey"      value={<span className="font-mono text-neutral-200">{action.propuesta.nombre_campaña}</span>} />
          <Row label="Entra cuando" value={<span className="font-mono text-sky-400">{action.propuesta.trigger_event}</span>} />
          <Row label="Convierte en" value={<span className="font-mono text-emerald-400">{action.propuesta.conversion_event}</span>} />
          {action.campaña_existente_nombre && (
            <Row label="Optimizando" value={<span className="text-amber-400">{action.campaña_existente_nombre} #{action.campaña_existente_id}</span>} />
          )}
        </div>

        {/* Cambios de estructura — visible cuando Claude detecta problema estructural */}
        {action.propuesta.cambios_estructura?.descripcion && (
          <div className="bg-blue-500/6 border border-blue-500/20 rounded-lg p-3.5 mb-4">
            <p className="text-[10px] text-blue-400 uppercase tracking-wider font-semibold mb-2">
              Cambios de estructura recomendados
            </p>
            <p className="text-blue-200 text-xs leading-relaxed mb-2">
              {action.propuesta.cambios_estructura.descripcion}
            </p>
            {action.propuesta.cambios_estructura.delays_propuestos && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {action.propuesta.cambios_estructura.delays_propuestos.map(d => (
                  <span key={d.nodo} className="text-[10px] bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/20">
                    Nodo {d.nodo}: +{d.delay_horas}h
                  </span>
                ))}
              </div>
            )}
            {action.propuesta.cambios_estructura.secuencia_canales && (
              <p className="text-blue-400/60 text-[10px] mt-2 font-mono">
                Secuencia propuesta: {action.propuesta.cambios_estructura.secuencia_canales}
              </p>
            )}
            {action.propuesta.cambios_estructura.nodos_adicionales && (
              <p className="text-blue-400/60 text-xs mt-1">
                Nodos adicionales: {action.propuesta.cambios_estructura.nodos_adicionales}
              </p>
            )}
          </div>
        )}

        {/* alerta_gap — no hay nodos que editar */}
        {action.tipo_accion === 'alerta_gap' ? (
          <div className="border border-dashed border-neutral-700 rounded-lg p-4 text-center">
            <p className="text-neutral-500 text-xs">Sin campaña activa en este paso</p>
            <p className="text-neutral-600 text-[10px] mt-1">
              Creá la campaña en CIO con el trigger/goal indicados, o usá la herramienta Crear Campaña.
            </p>
          </div>
        ) : action.propuesta.nodos.length > 0 ? (
          <NodeTimeline
            nodos={action.propuesta.nodos}
            selectedOrden={selectedNodeOrden}
            edits={edits}
            onSelect={setSelectedNodeOrden}
            onNodeEdit={onNodeEdit}
          />
        ) : null}
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="text-neutral-500 min-w-[80px] shrink-0">{label}</span>
      <span className="flex-1 min-w-0">{value}</span>
    </div>
  )
}

// ─── Execution Preview ────────────────────────────────────────────────────────

function ExecutionPreview({
  strategy,
  actionEdits,
  safety,
  executing,
  onExecute,
}: {
  strategy: StrategyResult
  actionEdits: Record<number, ActionEdit>
  safety: SafetyStatus | null
  executing: boolean
  onExecute: () => void
}) {
  const included = strategy.acciones.filter((_, i) => actionEdits[i]?.included !== false)
  const discarded = strategy.acciones.length - included.length

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-white font-semibold mb-1">Ejecutar en Customer.io</h2>
          <div className="flex items-center gap-3 text-xs mb-2">
            <span className={included.length > 0 ? 'text-neutral-400' : 'text-neutral-600'}>
              {included.length} de {strategy.acciones.length} acción(es) incluida(s)
            </span>
            {discarded > 0 && (
              <span className="text-neutral-600">{discarded} descartada(s)</span>
            )}
          </div>
          {included.length > 0 && (
            <ul className="space-y-1">
              {included.map((a, i) => (
                <li key={i} className="flex items-center gap-1.5 text-xs text-neutral-500">
                  <span className="text-amber-500 shrink-0">→</span>
                  <span className="capitalize text-neutral-400">{a.tipo_accion}</span>
                  <span className="font-mono text-neutral-600 shrink-0">{a.step_code}</span>
                  <span className="text-neutral-700">·</span>
                  <span className="truncate">{a.propuesta.nombre_campaña}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="shrink-0 text-right">
          {safety?.cio_dry_run ? (
            <>
              <button
                disabled
                className="flex items-center gap-2 px-5 py-2.5 bg-neutral-800 text-neutral-500 font-semibold text-sm rounded-lg cursor-not-allowed border border-neutral-700"
              >
                🔒 Ejecutar
              </button>
              <p className="text-xs text-neutral-600 mt-1.5">CIO_DRY_RUN=true · bloqueado</p>
            </>
          ) : included.length === 0 ? (
            <button disabled className="px-5 py-2.5 bg-neutral-800 text-neutral-600 font-semibold text-sm rounded-lg cursor-not-allowed">
              Sin acciones incluidas
            </button>
          ) : (
            <button
              onClick={onExecute}
              disabled={executing}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-sm rounded-lg transition-colors disabled:opacity-50"
            >
              {executing ? (
                <>
                  <span className="w-4 h-4 border-2 border-neutral-800 border-t-transparent rounded-full animate-spin" />
                  Ejecutando…
                </>
              ) : (
                `⚡ Ejecutar ${included.length} acción${included.length !== 1 ? 'es' : ''}`
              )}
            </button>
          )}
        </div>
      </div>

      {safety?.cio_dry_run && (
        <div className="mt-4 bg-neutral-800/50 rounded-lg px-4 py-3 text-xs text-neutral-500">
          Para activar: cambia{' '}
          <code className="text-neutral-300 bg-neutral-700 px-1 rounded">CIO_DRY_RUN=false</code>{' '}
          en <code className="text-neutral-300 bg-neutral-700 px-1 rounded">.env</code> y reinicia el backend.
          <span className="text-amber-500/70 ml-2">⚠ Revisa el diagnóstico antes de activar escrituras.</span>
        </div>
      )}
    </div>
  )
}

// ─── Strategy Historial Selector ─────────────────────────────────────────────

function StrategyHistorialSelector({
  history,
  current,
  onSelect,
}: {
  history: StrategyResult[]
  current: StrategyResult
  onSelect: (r: StrategyResult) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  if (history.length <= 1) return null

  const estadoColor = (e: string) =>
    e === 'anomalia_critica' ? 'text-red-400' :
    e === 'anomalia_leve'    ? 'text-amber-400' : 'text-emerald-400'

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg px-3 py-2 transition-colors"
      >
        Historial
        <span className="text-xs bg-neutral-700 text-neutral-300 rounded px-1.5 py-0.5">
          {history.length}
        </span>
        <span className="text-xs">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-80 bg-neutral-800 border border-neutral-700 rounded-xl shadow-xl z-10 overflow-hidden">
          {history.map((item, i) => {
            const isActive = item._id
              ? item._id === current._id
              : item.semana_label === current.semana_label
            return (
              <button
                key={item._id ?? i}
                onClick={() => { onSelect(item); setOpen(false) }}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-300'
                    : 'text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                <span className="text-left min-w-0 flex-1 mr-2">
                  <span className="block truncate text-sm">{item.semana_label ?? 'Sin semana'}</span>
                  <span className={`block text-xs mt-0.5 ${estadoColor(item.estado_funnel)}`}>
                    {item.estado_funnel === 'anomalia_critica' ? 'Anomalía crítica' :
                     item.estado_funnel === 'anomalia_leve'    ? 'Anomalía leve'    : 'Estable'}
                  </span>
                </span>
                {i === 0 && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-400 rounded px-1.5 py-0.5 shrink-0">
                    última
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Estado Funnel Badge ──────────────────────────────────────────────────────

const ESTADO_CFG = {
  estable:          { label: 'Estable',           cls: 'bg-emerald-500/12 text-emerald-400 border-emerald-500/25' },
  anomalia_leve:    { label: 'Anomalía leve',     cls: 'bg-amber-500/12 text-amber-400 border-amber-500/25' },
  anomalia_critica: { label: 'Anomalía crítica',  cls: 'bg-red-500/12 text-red-400 border-red-500/25' },
}

// ─── System Context Panel ─────────────────────────────────────────────────────

type SysTab = 'funnel' | 'eventos' | 'atributos' | 'campañas' | 'kb'

const SYS_TABS: { id: SysTab; label: string; countKey: keyof SystemContext }[] = [
  { id: 'funnel',    label: 'Pasos del Funnel', countKey: 'funnel_steps' },
  { id: 'eventos',   label: 'Eventos CIO',       countKey: 'events' },
  { id: 'atributos', label: 'Atributos CIO',     countKey: 'attributes' },
  { id: 'campañas',  label: 'Campañas Caché',    countKey: 'campaigns_cache' },
  { id: 'kb',        label: 'Knowledge Base',    countKey: 'knowledge_base' },
]

const ROLE_CFG: Record<string, string> = {
  trigger: 'bg-sky-500/12 text-sky-400 border-sky-500/25',
  goal:    'bg-emerald-500/12 text-emerald-400 border-emerald-500/25',
  signal:  'bg-purple-500/12 text-purple-400 border-purple-500/25',
  both:    'bg-amber-500/12 text-amber-400 border-amber-500/25',
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-3 py-2 text-left text-xs text-neutral-500 font-medium uppercase tracking-wider whitespace-nowrap">
      {children}
    </th>
  )
}
function Td({ children, mono }: { children: React.ReactNode; mono?: boolean }) {
  return (
    <td className={`px-3 py-2.5 text-xs border-t border-neutral-800/60 ${mono ? 'font-mono text-neutral-300' : 'text-neutral-400'}`}>
      {children}
    </td>
  )
}

function FunnelStepsTable({ rows }: { rows: FunnelStepRaw[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="bg-neutral-800/40">
          <tr><Th>#</Th><Th>Código</Th><Th>Nombre</Th><Th>Entry event</Th><Th>Exit event</Th></tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.step_code} className="hover:bg-neutral-800/30 transition-colors">
              <Td><span className="text-neutral-600">{r.step_order}</span></Td>
              <Td mono>{r.step_code}</Td>
              <Td>{r.step_name}</Td>
              <Td mono>{r.entry_event ?? <span className="text-neutral-700">—</span>}</Td>
              <Td mono>{r.exit_event  ?? <span className="text-neutral-700">—</span>}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function EventsTable({ rows }: { rows: CioEvent[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="bg-neutral-800/40">
          <tr><Th>Activo</Th><Th>Nombre</Th><Th>Rol</Th><Th>Paso</Th><Th>Descripción</Th></tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.name + i} className="hover:bg-neutral-800/30 transition-colors">
              <Td>
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${r.active ? 'bg-emerald-400' : 'bg-neutral-700'}`} />
              </Td>
              <Td mono>{r.name}</Td>
              <Td>
                {r.event_role ? (
                  <span className={`px-1.5 py-0.5 rounded border text-[10px] font-medium ${ROLE_CFG[r.event_role] ?? 'bg-neutral-800 text-neutral-400 border-neutral-700'}`}>
                    {r.event_role}
                  </span>
                ) : <span className="text-neutral-700">—</span>}
              </Td>
              <Td mono>{r.funnel_step_code ?? <span className="text-neutral-700">—</span>}</Td>
              <Td>{r.description ?? <span className="text-neutral-700">—</span>}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AttributesTable({ rows }: { rows: CioAttribute[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="bg-neutral-800/40">
          <tr><Th>Activo</Th><Th>Nombre</Th><Th>Descripción</Th><Th>Valores posibles</Th></tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.name + i} className="hover:bg-neutral-800/30 transition-colors">
              <Td>
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${r.active ? 'bg-emerald-400' : 'bg-neutral-700'}`} />
              </Td>
              <Td mono>{r.name}</Td>
              <Td>{r.description ?? <span className="text-neutral-700">—</span>}</Td>
              <Td>
                {r.possible_values ? (
                  <span className="text-neutral-500 italic">{r.possible_values}</span>
                ) : <span className="text-neutral-700">—</span>}
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CampaignsTable({ rows }: { rows: CampaignCacheRaw[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="bg-neutral-800/40">
          <tr>
            <Th>ID</Th><Th>Nombre</Th><Th>Status</Th><Th>Paso</Th>
            <Th>Trigger</Th><Th>Goal</Th>
            <Th>Entrega</Th><Th>Apertura</Th><Th>CR</Th>
            <Th>Enviados</Th><Th>Spike</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => {
            const dr = r.delivery_rate
            const or_ = r.open_rate
            const cr = r.conversion_rate
            const drCls = dr >= 0.7 ? 'text-emerald-400' : dr >= 0.5 ? 'text-amber-400' : 'text-red-400'
            const orCls = or_ >= 0.08 ? 'text-emerald-400' : or_ >= 0.04 ? 'text-amber-400' : 'text-neutral-500'
            const crCls = cr >= 0.07 ? 'text-emerald-400' : cr >= 0.02 ? 'text-amber-400' : 'text-red-400'
            return (
              <tr key={r.cio_campaign_id} className="hover:bg-neutral-800/30 transition-colors">
                <Td mono>{r.cio_campaign_id}</Td>
                <Td><span className="max-w-[180px] truncate block" title={r.name}>{r.name}</span></Td>
                <Td>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                    r.status === 'running' ? 'bg-emerald-500/12 text-emerald-400' : 'bg-neutral-800 text-neutral-500'
                  }`}>
                    {r.status ?? '—'}
                  </span>
                </Td>
                <Td mono>{r.funnel_step_mapped ?? <span className="text-neutral-700">—</span>}</Td>
                <Td mono>{r.trigger_event ?? <span className="text-neutral-700">—</span>}</Td>
                <Td mono>{r.goal_event    ?? <span className="text-neutral-700">—</span>}</Td>
                <Td><span className={`tabular-nums ${drCls}`}>{(dr * 100).toFixed(0)}%</span></Td>
                <Td><span className={`tabular-nums ${orCls}`}>{(or_ * 100).toFixed(0)}%</span></Td>
                <Td><span className={`tabular-nums font-medium ${crCls}`}>{(cr * 100).toFixed(1)}%</span></Td>
                <Td><span className="tabular-nums text-neutral-500">{r.total_sent.toLocaleString('es-CO')}</span></Td>
                <Td>
                  {r.spike_alert
                    ? <span className="text-orange-400 font-medium">⚠ spike</span>
                    : <span className="text-neutral-700">—</span>}
                </Td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function KnowledgeBaseList({ rows }: { rows: KnowledgeBaseEntry[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null)
  const byTipo = rows.reduce<Record<string, KnowledgeBaseEntry[]>>((acc, r) => {
    ;(acc[r.tipo] ??= []).push(r)
    return acc
  }, {})

  return (
    <div className="space-y-4 p-1">
      {Object.entries(byTipo).map(([tipo, entries]) => (
        <div key={tipo}>
          <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-semibold mb-2 px-2">{tipo}</p>
          <div className="space-y-1">
            {entries.map((e, i) => {
              const globalIdx = rows.indexOf(e)
              const isOpen = openIdx === globalIdx
              return (
                <div key={i} className="bg-neutral-800/50 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setOpenIdx(isOpen ? null : globalIdx)}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-neutral-800 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${e.activo ? 'bg-emerald-400' : 'bg-neutral-700'}`} />
                      <span className="text-xs text-neutral-300 font-medium">{e.titulo}</span>
                    </div>
                    <span className={`text-[10px] text-neutral-600 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-3 pt-0">
                      <p className="text-xs text-neutral-500 leading-relaxed whitespace-pre-wrap">{e.contenido}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

function SystemContextPanel({ ctx }: { ctx: SystemContext }) {
  const [tab, setTab] = useState<SysTab>('funnel')

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
      <div className="flex items-center gap-0 border-b border-neutral-800 overflow-x-auto">
        {SYS_TABS.map(t => {
          const count = (ctx[t.countKey] as unknown[]).length
          const active = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                active
                  ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                  : 'border-transparent text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50'
              }`}
            >
              {t.label}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                active ? 'bg-amber-500/20 text-amber-400' : 'bg-neutral-800 text-neutral-600'
              }`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      <div className="max-h-[420px] overflow-auto">
        {tab === 'funnel'    && <FunnelStepsTable rows={ctx.funnel_steps} />}
        {tab === 'eventos'   && <EventsTable      rows={ctx.events} />}
        {tab === 'atributos' && <AttributesTable  rows={ctx.attributes} />}
        {tab === 'campañas'  && <CampaignsTable   rows={ctx.campaigns_cache} />}
        {tab === 'kb'        && <KnowledgeBaseList rows={ctx.knowledge_base} />}
      </div>

      <div className="border-t border-neutral-800 px-4 py-2 flex items-center gap-4 bg-neutral-900/50">
        <span className="text-[10px] text-neutral-600 tabular-nums">
          {ctx.funnel_steps.length} pasos · {ctx.events.length} eventos · {ctx.attributes.length} atributos · {ctx.campaigns_cache.length} campañas · {ctx.knowledge_base.length} entradas KB
        </span>
        <span className="text-[10px] text-neutral-700">Estos son los datos que Claude recibe al generar la estrategia</span>
      </div>
    </div>
  )
}

// ─── Canvas helpers ───────────────────────────────────────────────────────────

function initEdits(s: StrategyResult): Record<number, ActionEdit> {
  const edits: Record<number, ActionEdit> = {}
  s.acciones.forEach((a, i) => {
    const nodeEdits: Record<number, NodeCopies> = {}
    a.propuesta.nodos.forEach(n => {
      nodeEdits[n.orden] = {
        subject:   toLiquid(n.subject as Parameters<typeof toLiquid>[0]),
        preheader: n.preheader ? toLiquid(n.preheader as Parameters<typeof toLiquid>[0]) : undefined,
        cuerpo:    toLiquid(n.cuerpo as Parameters<typeof toLiquid>[0]),
      }
    })
    edits[i] = { included: true, nodeEdits }
  })
  return edits
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function EstrategiaPage() {
  const [health, setHealth]               = useState<FunnelStep[] | null>(null)
  const [healthLoading, setHealthLoading] = useState(true)
  const [safety, setSafety]               = useState<SafetyStatus | null>(null)
  const [syncing, setSyncing]             = useState(false)
  const [syncResult, setSyncResult]       = useState<SyncResult | null>(null)
  const [generating, setGenerating]       = useState(false)
  const [awaitingMcp, setAwaitingMcp]     = useState(false)
  const [phase1Result, setPhase1Result]   = useState<StrategyResult | null>(null)
  const [contextoAdicional, setContextoAdicional] = useState('')
  const [estructuraCampana, setEstructuraCampana] = useState('')
  const [strategy, setStrategy]           = useState<StrategyResult | null>(null)
  const [history, setHistory]             = useState<StrategyResult[]>([])
  const [actionEdits, setActionEdits]     = useState<Record<number, ActionEdit>>({})
  const [executing, setExecuting]         = useState(false)
  const [executed, setExecuted]           = useState<ExecuteResult | null>(null)
  const [error, setError]                 = useState<string | null>(null)
  const [genError, setGenError]           = useState<string | null>(null)
  const [sysCtx, setSysCtx]               = useState<SystemContext | null>(null)
  const [sysLoading, setSysLoading]       = useState(false)
  const [sysOpen, setSysOpen]             = useState(false)
  const [sysError, setSysError]           = useState<string | null>(null)
  // ── Fase 2B: optimización estructural ──────────────────────────────────────
  const [structuralResult, setStructuralResult]       = useState<StrategyResult | null>(null)
  const [structuralGenerating, setStructuralGenerating] = useState(false)
  const [structuralError, setStructuralError]         = useState<string | null>(null)
  const [structuralEdits, setStructuralEdits]         = useState<Record<number, ActionEdit>>({})
  const [detallesCampanas, setDetallesCampanas]       = useState('')
  const [latestPredLabel, setLatestPredLabel]         = useState<string | null>(null)

  useEffect(() => {
    // Signal 1: localStorage flag set explicitly by ingresar page after nueva proyección
    const flagReset = localStorage.getItem('kepler-projection-reset') === '1'
    if (flagReset) localStorage.removeItem('kepler-projection-reset')

    api.getSafetyStatus().then(setSafety).catch(() => {})

    Promise.all([
      api.getStrategyHistory().catch((): StrategyResult[] => []),
      api.getUltimaSemana().catch((): Record<string, unknown> => ({})),
      api.latestPrediction().catch((): Record<string, unknown> => ({})),
    ]).then(([histData, ultimaSemana, latestPred]) => {
      // Signal 2: ultima_semana is empty → nueva proyección ran, new week not filled yet
      const ultimaWeek = ultimaSemana['semana'] as string | undefined

      // Signal 3: semana_label of latest prediction differs from semana_label of latest strategy
      // (semana_label = the predicted week, e.g. "25 al 31 de mayo 2026")
      // Both come from the same prediction → if they differ, the strategy is from a past cycle
      const latestStrat = histData[0] ?? null
      const predLabel  = latestPred['semana_label'] as string | undefined
      const stratLabel = latestStrat?.semana_label ?? null
      const stratIsStale = !!(predLabel && stratLabel && predLabel !== stratLabel)

      if (predLabel) setLatestPredLabel(predLabel)

      if (flagReset || !ultimaWeek || stratIsStale) {
        // New projection cycle — start completely fresh
        setHealthLoading(false)
        return
      }

      setHistory(histData)
      if (latestStrat) {
        setStrategy(latestStrat)
        setActionEdits(initEdits(latestStrat))
      }

      api.getLatestStructural()
        .then(r => {
          // Solo usar si corresponde a la misma semana que la estrategia Modo 1
          if (latestStrat?.semana_label && r.semana_label && r.semana_label === latestStrat.semana_label) {
            setStructuralResult(r)
            setStructuralEdits(initEdits(r))
          }
        })
        .catch(() => {})

      api.getFunnelHealth().then(setHealth).catch(() => setHealth([])).finally(() => setHealthLoading(false))
    }).catch(() => setHealthLoading(false))
  }, [])

  // Build executable strategy: apply edits, filter to included-only
  function buildExecutableStrategy(): StrategyResult {
    if (!strategy) throw new Error('No strategy')
    const acciones = strategy.acciones
      .map((a, i) => ({ a, i }))
      .filter(({ i }) => actionEdits[i]?.included !== false)
      .map(({ a, i }) => {
        const edits = actionEdits[i]
        if (!edits) return a
        return {
          ...a,
          propuesta: {
            ...a.propuesta,
            nodos: a.propuesta.nodos.map(n => {
              const ne = edits.nodeEdits[n.orden]
              if (!ne) return n
              return {
                ...n,
                subject:   ne.subject,
                preheader: ne.preheader ?? (n.preheader ? toLiquid(n.preheader as Parameters<typeof toLiquid>[0]) : undefined),
                cuerpo:    ne.cuerpo,
              }
            }),
          },
        }
      })
    return { ...strategy, acciones }
  }

  async function handleLoadSysCtx() {
    if (sysCtx && sysOpen) { setSysOpen(false); return }
    setSysOpen(true)
    if (sysCtx) return
    setSysLoading(true)
    setSysError(null)
    try {
      setSysCtx(await api.getSystemContext())
    } catch (e) {
      setSysError(e instanceof Error ? e.message : 'Error al cargar contexto')
    } finally {
      setSysLoading(false)
    }
  }

  async function handleSync() {
    setSyncing(true)
    setError(null)
    setSyncResult(null)
    try {
      const r = await api.syncCampaigns()
      setSyncResult(r)
      setHealth(await api.getFunnelHealth())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al sincronizar')
    } finally {
      setSyncing(false)
    }
  }

  // Fase 1: analiza SHAP + campañas, determina qué info de campaña necesita
  async function handleStartAnalysis() {
    setGenerating(true)
    setGenError(null)
    setStrategy(null)
    setPhase1Result(null)
    setAwaitingMcp(false)
    setEstructuraCampana('')
    setExecuted(null)
    setStructuralResult(null)
    setStructuralEdits({})
    setDetallesCampanas('')
    setStructuralError(null)
    try {
      const s = await api.generateStrategy(contextoAdicional.trim() || undefined, undefined)
      const needsEnrich = s.acciones.some(
        a => ['optimizar', 'reforzar'].includes(a.tipo_accion) && a.campaña_existente_id
      )
      if (needsEnrich) {
        setPhase1Result(s)
        setAwaitingMcp(true)
      } else {
        // Solo gaps / crear — no hay campañas existentes que enriquecer, mostrar directo
        setStrategy(s)
        setActionEdits(initEdits(s))
        setHistory(prev => [s, ...prev])
      }
    } catch (e) {
      setGenError(e instanceof Error ? e.message : 'Error al analizar')
    } finally {
      setGenerating(false)
    }
  }

  // Fase 2: genera la estrategia final con los datos de campaña provistos
  async function handleGenerateStrategy() {
    setGenerating(true)
    setGenError(null)
    try {
      const s = await api.generateStrategy(
        contextoAdicional.trim() || undefined,
        estructuraCampana.trim() || undefined,
      )
      setStrategy(s)
      setActionEdits(initEdits(s))
      setHistory(prev => [s, ...prev])
      setAwaitingMcp(false)
      setPhase1Result(null)
    } catch (e) {
      setGenError(e instanceof Error ? e.message : 'Error al generar estrategia')
    } finally {
      setGenerating(false)
    }
  }

  async function handleExecute() {
    if (!strategy) return
    const executableStrategy = buildExecutableStrategy()
    if (executableStrategy.acciones.length === 0) return
    setExecuting(true)
    try {
      setExecuted(await api.executeStrategy(executableStrategy))
    } catch (e) {
      setGenError(e instanceof Error ? e.message : 'Error al ejecutar')
    } finally {
      setExecuting(false)
    }
  }

  async function handleGenerateStructural() {
    if (!strategy) return
    setStructuralGenerating(true)
    setStructuralError(null)
    setStructuralResult(null)
    try {
      const r = await api.generateStructural(detallesCampanas.trim(), strategy, contextoAdicional.trim() || undefined)
      setStructuralResult(r)
      setStructuralEdits(initEdits(r))
    } catch (e) {
      setStructuralError(e instanceof Error ? e.message : 'Error al analizar')
    } finally {
      setStructuralGenerating(false)
    }
  }

  function handleSelectHistory(s: StrategyResult) {
    setStrategy(s)
    setActionEdits(initEdits(s))
    setExecuted(null)
  }

  function toggleAction(i: number) {
    setActionEdits(prev => ({
      ...prev,
      [i]: { ...prev[i], included: !(prev[i]?.included ?? true) },
    }))
  }

  function editNode(actionIdx: number, nodeOrden: number, copies: NodeCopies) {
    setActionEdits(prev => ({
      ...prev,
      [actionIdx]: {
        ...prev[actionIdx],
        nodeEdits: { ...prev[actionIdx]?.nodeEdits, [nodeOrden]: copies },
      },
    }))
  }

  const { campaignViews, trueGaps } = health ? buildCampaignViews(health) : { campaignViews: [], trueGaps: [] }
  const actionsCount = (strategy?.acciones ?? []).length

  return (
    <div className="flex-1 overflow-auto bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {/* ── Page header ──────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-white text-2xl font-bold">Estrategia Semanal</h1>
            <p className="text-neutral-500 text-sm mt-1">
              {strategy?.semana_label
                ? `Semana ${strategy.semana_label}`
                : latestPredLabel
                ? `Proyección semana ${latestPredLabel} · sin estrategia generada`
                : 'Diagnóstico Customer.io · Generación con Claude'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {safety && (
              <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                safety.cio_dry_run
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}>
                {safety.cio_dry_run ? '🔒 Modo seguro' : '⚡ Escrituras activas'}
              </span>
            )}
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 rounded-lg transition-colors disabled:opacity-40"
            >
              {syncing ? (
                <>
                  <span className="w-3.5 h-3.5 border border-neutral-400 border-t-transparent rounded-full animate-spin" />
                  Corriendo diagnóstico…
                </>
              ) : '↻ Correr diagnóstico'}
            </button>
          </div>
        </div>

        {/* Feedback */}
        {error && (
          <div className="bg-red-500/8 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400">{error}</div>
        )}
        {syncResult && (
          <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-lg px-4 py-3 text-sm text-emerald-400 flex items-center justify-between">
            <span>
              ✓ Diagnóstico actualizado — {syncResult.total_synced} campañas cargadas · {syncResult.mapped_to_funnel} mapeadas al funnel
              {syncResult.unmapped > 0 && ` · ${syncResult.unmapped} sin mapear al funnel`}
            </span>
            {syncResult.spike_alerts.length > 0 && (
              <span className="text-orange-400 text-xs">⚠ {syncResult.spike_alerts.length} spike(s)</span>
            )}
          </div>
        )}

        {/* ── Funnel Diagnostic ─────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-white font-semibold text-lg">Diagnóstico del Funnel</h2>
              <p className="text-neutral-500 text-xs mt-0.5">
                {healthLoading
                  ? 'Cargando…'
                  : health
                  ? `${campaignViews.length} campañas activas · ${trueGaps.length} pasos sin cobertura`
                  : 'Corré el diagnóstico para ver el estado del funnel'}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-xs text-neutral-500">
              {(['verde', 'amarillo', 'rojo', 'spike'] as const).map(h => (
                <div key={h} className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${H_STYLES[h].dot}`} />
                  <span>{H_LEGEND[h]}</span>
                </div>
              ))}
            </div>
          </div>

          {healthLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-neutral-900 border border-neutral-800 rounded-xl h-32 animate-pulse" />
              ))}
            </div>
          ) : health && health.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {campaignViews.map(v => <CampaignDiagnosticCard key={v.cid} view={v} />)}
            </div>
          ) : (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 text-center">
              <p className="text-neutral-400 mb-1">No hay datos del diagnóstico todavía</p>
              <p className="text-neutral-600 text-sm">Hacé clic en "Correr diagnóstico" para cargar el estado de tus campañas</p>
            </div>
          )}
        </section>

        {/* ── Strategy Generation ───────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-white font-semibold text-lg">Estrategia con Claude</h2>
              <p className="text-neutral-500 text-xs mt-0.5">
                Genera la propuesta basada en SHAP del modelo + diagnóstico CIO + mercado
              </p>
            </div>
            {strategy && (
              <StrategyHistorialSelector
                history={history}
                current={strategy}
                onSelect={handleSelectHistory}
              />
            )}
          </div>

          {/* ── Paso 1: formulario inicial ── */}
          {!strategy && !generating && !awaitingMcp && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xl">⚡</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-1">Análisis semanal con Claude</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed">
                    Claude analiza el SHAP del modelo, el estado de tus campañas en CIO,
                    el contexto de mercado y el catálogo de productos Trii.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs text-neutral-500 uppercase tracking-wider font-medium mb-2">
                  Contexto de mercado <span className="text-neutral-700 normal-case">(opcional)</span>
                </label>
                <textarea
                  value={contextoAdicional}
                  onChange={e => setContextoAdicional(e.target.value)}
                  rows={3}
                  placeholder={`Noticias, eventos, situaciones internas, competencia...\n\nEj: "Esta semana lanzamos la jornada sin comisiones el martes 13. TRM en máximos históricos."`}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3.5 py-3 text-sm text-neutral-200 placeholder:text-neutral-600 resize-none focus:outline-none focus:ring-1 focus:ring-amber-500/40 hover:border-neutral-600 transition-colors leading-relaxed"
                />
                <p className="text-neutral-700 text-xs mt-1.5">
                  Tiene peso especial en el copy y en el análisis de la semana.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-neutral-600">
                  <span>~30–60 seg</span>
                  <span>·</span>
                  <span>~$0.01 USD</span>
                  <span>·</span>
                  <span>Sin escrituras en CIO</span>
                </div>
                <button
                  onClick={handleStartAnalysis}
                  className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-sm rounded-lg transition-colors"
                >
                  ⚡ Iniciar análisis
                </button>
              </div>
            </div>
          )}

          {/* ── Loading ── */}
          {generating && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <span className={`w-5 h-5 border-2 border-t-transparent rounded-full animate-spin ${awaitingMcp ? 'border-violet-500' : 'border-amber-500'}`} />
                <p className="text-white font-medium">
                  {awaitingMcp ? 'Generando estrategia con datos completos…' : 'Analizando campañas y modelo…'}
                </p>
              </div>
              <p className="text-neutral-500 text-sm">
                {awaitingMcp
                  ? 'Claude procesa los datos reales de las campañas para generar diffs específicos · ~60–120s'
                  : 'Procesando SHAP + diagnóstico CIO + contexto de mercado · ~30–60s'}
              </p>
              <div className="flex items-center justify-center gap-1.5 mt-4">
                {(awaitingMcp
                  ? ['Datos CIO', 'SHAP', 'Campañas', 'Diffs', 'Estrategia']
                  : ['SHAP', 'Campañas', 'Contexto', 'Diagnóstico', 'Análisis']
                ).map((label, i) => (
                  <span key={label} className="text-xs text-neutral-600 animate-pulse" style={{ animationDelay: `${i * 0.3}s` }}>
                    {label}{i < 4 ? ' →' : ''}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── Paso 2: datos de campañas (intermedio) ── */}
          {awaitingMcp && !generating && phase1Result && (() => {
            const allFlagged = phase1Result.acciones.filter(
              a => ['optimizar', 'reforzar'].includes(a.tipo_accion) && a.campaña_existente_id
            )
            // Máximo 2 campañas — priorizamos las de prioridad alta primero
            const flagged = allFlagged
              .sort((a, b) => (a.prioridad === 'alta' ? -1 : 1) - (b.prioridad === 'alta' ? -1 : 1))
              .slice(0, 2)
            return (
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-lg">🔍</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1">Necesito los datos actuales de estas campañas</h3>
                    <p className="text-neutral-400 text-sm leading-relaxed">
                      {allFlagged.length > 2
                        ? <>El modelo señaló {allFlagged.length} campañas — te pido las <strong className="text-white">2 de mayor prioridad</strong> para evitar confusiones en el análisis.</>
                        : <>Detecté {flagged.length} campaña{flagged.length !== 1 ? 's' : ''} que necesitan optimización.</>
                      }
                      {' '}Pegá el contenido desde Claude.ai con el MCP de CIO.
                    </p>
                  </div>
                </div>

                {/* Campañas marcadas */}
                <div className="space-y-2">
                  <p className="text-xs text-neutral-500 uppercase tracking-wider font-medium">
                    Campañas a incluir{allFlagged.length > 2 && <span className="ml-1 text-violet-500/70 font-normal normal-case tracking-normal">(top 2 de {allFlagged.length})</span>}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {flagged.map(a => (
                      <div key={a.campaña_existente_id} className="flex items-center gap-2 px-3 py-1.5 bg-violet-500/8 border border-violet-500/20 rounded-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                        <span className="text-violet-200 text-xs font-medium">{a.campaña_existente_nombre ?? a.campaña_existente_id}</span>
                        <span className="text-violet-600 text-[10px] font-mono">#{a.campaña_existente_id}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Textarea MCP */}
                <div>
                  <label className="block text-xs text-neutral-500 uppercase tracking-wider font-medium mb-2">
                    Contenido de las campañas <span className="text-red-500/70">*</span>
                    <span className="ml-2 text-neutral-600 normal-case tracking-normal font-normal">— máx. 2 campañas</span>
                  </label>
                  <textarea
                    value={estructuraCampana}
                    onChange={e => setEstructuraCampana(e.target.value)}
                    rows={6}
                    placeholder={`Formato por sección (máx. 2 campañas):\n\n## C4 — Fotos KYC | ID: 4403\nTrigger: data_validation_information_completed\nGoal: photo_validation_completed\n\nPush 1 (0.25h): subject · body\n...`}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3.5 py-3 text-sm text-neutral-200 placeholder:text-neutral-600 resize-none focus:outline-none focus:ring-1 focus:ring-violet-500/40 hover:border-neutral-600 transition-colors leading-relaxed font-mono"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => { setAwaitingMcp(false); setPhase1Result(null) }}
                    className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors"
                  >
                    ← Volver al inicio
                  </button>
                  <button
                    onClick={handleGenerateStrategy}
                    disabled={!estructuraCampana.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg transition-colors"
                  >
                    Generar estrategia
                  </button>
                </div>
              </div>
            )
          })()}

          {/* ── Error ── */}
          {genError && !generating && (
            <div className="bg-red-500/8 border border-red-500/20 rounded-xl px-5 py-4">
              <p className="text-red-400 text-sm font-medium mb-1">Error al generar</p>
              <p className="text-red-400/70 text-xs">{genError}</p>
              <button
                onClick={awaitingMcp ? handleGenerateStrategy : handleStartAnalysis}
                className="mt-3 text-xs text-red-400 underline"
              >
                Reintentar
              </button>
            </div>
          )}

          {strategy && !generating && (
            <div className="space-y-4">
              {/* Summary card */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="text-white font-semibold">Qué está pasando esta semana</h3>
                  <div className="flex items-center gap-2 shrink-0">
                    {strategy.estado_funnel && (
                      <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${ESTADO_CFG[strategy.estado_funnel]?.cls}`}>
                        {ESTADO_CFG[strategy.estado_funnel]?.label}
                      </span>
                    )}
                    {actionsCount > 0 && (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700">
                        {actionsCount} acción{actionsCount !== 1 ? 'es' : ''}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-neutral-300 text-sm leading-relaxed">{strategy.resumen}</p>

              </div>

              {/* Canvas: action cards with checkboxes + editable copies */}
              {strategy.acciones.length > 0 ? (
                <>
                  <div className="flex items-center gap-2">
                    <p className="text-neutral-400 text-sm font-medium">Acciones propuestas</p>
                    <div className="flex-1 h-px bg-neutral-800" />
                    <p className="text-xs text-neutral-600">
                      Marcá ✓ las que querés ejecutar · expandí ✏ para editar copies
                    </p>
                  </div>
                  {strategy.acciones.map((action, i) => (
                    <StrategyCanvasCard
                      key={i}
                      action={action}
                      actionIndex={i}
                      edits={actionEdits[i] ?? { included: true, nodeEdits: {} }}
                      onToggle={() => toggleAction(i)}
                      onNodeEdit={(nodeOrden, copies) => editNode(i, nodeOrden, copies)}
                    />
                  ))}
                </>
              ) : (
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 text-center">
                  <p className="text-neutral-400 text-sm">✓ No hay acciones requeridas esta semana — el funnel está estable</p>
                </div>
              )}


              <button
                onClick={handleStartAnalysis}
                className="text-xs text-neutral-500 hover:text-neutral-300 underline transition-colors"
              >
                Regenerar análisis
              </button>
            </div>
          )}
        </section>

        {/* ── Execution Preview ─────────────────────────────────────────────── */}
        {strategy && strategy.acciones.length > 0 && !executed && !generating && (
          <section>
            <ExecutionPreview
              strategy={strategy}
              actionEdits={actionEdits}
              safety={safety}
              executing={executing}
              onExecute={handleExecute}
            />
          </section>
        )}

        {/* ── Fase 2B: Revisión de todas las campañas ────────────────────────── */}
        {strategy && !generating && (
          <section>
            <div className="flex items-center gap-3 mb-1">
              <div>
                <h2 className="text-white font-semibold text-lg">Revisión del resto de campañas</h2>
                <p className="text-neutral-500 text-xs mt-0.5">
                  Las campañas que el modelo no priorizó esta semana — entrega, cadencia y copy de forma independiente
                </p>
              </div>
              <div className="flex-1 h-px bg-neutral-800" />
            </div>

            <div className="mb-4 mt-4 bg-neutral-900/50 border border-neutral-800 rounded-xl px-4 py-3">
              <p className="text-neutral-500 text-xs leading-relaxed">
                <span className="text-neutral-300 font-medium">Por qué existe esta sección:</span>{' '}
                el análisis principal actúa donde el modelo detectó presión esta semana.
                Acá revisás el resto — campañas que no tuvieron señal del modelo pero pueden tener
                problemas de entrega, mensajes insuficientes o copy que se puede mejorar con el contexto actual.
              </p>
            </div>

            {/* Campañas ya cubiertas por el análisis principal */}
            {strategy.acciones.filter(a => a.campaña_existente_id).length > 0 && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 mb-4">
                <p className="text-[10px] text-neutral-600 uppercase tracking-wider font-medium mb-2">
                  Ya cubiertas en el análisis principal — no se repiten acá
                </p>
                <div className="flex flex-wrap gap-2">
                  {strategy.acciones
                    .filter(a => a.campaña_existente_id)
                    .map(a => (
                      <span
                        key={a.campaña_existente_id}
                        className="text-[10px] bg-neutral-800 text-neutral-500 border border-neutral-700 px-2.5 py-1 rounded-full"
                      >
                        {a.campaña_existente_nombre ?? a.campaña_existente_id}
                      </span>
                    ))}
                </div>
              </div>
            )}

            {/* Formulario — muestra si no hay resultado O si el usuario quiere reanalizat */}
            {!structuralResult && !structuralGenerating && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-lg">🔍</span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold mb-0.5">Pegá el detalle de las campañas restantes</p>
                    <p className="text-neutral-500 text-xs leading-relaxed">
                      Copiá desde el panel de CIO (o Claude.ai) los nodos, subjects y estructura de cada campaña
                      que no aparece en el análisis principal. Esto es provisional — cuando tengamos
                      acceso completo a la API de CIO se cargará automáticamente.
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 uppercase tracking-wider font-medium mb-2">
                    Estructura y contenido de las campañas
                  </label>
                  <textarea
                    value={detallesCampanas}
                    onChange={e => setDetallesCampanas(e.target.value)}
                    rows={7}
                    placeholder={`Ej:\nCampaña: "R23.01_Onboarding_Initial_Info_Completed"\nNodo 1 (Push, día 0): subject "Completá tu perfil" · body "Solo te falta un paso..."\nNodo 2 (Email, +24h): subject "Tu cuenta te espera" · body "Abrí la app y..."\n\nCampaña: "CO_Onboarding_Photo_Validation_Completed"\n...`}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3.5 py-3 text-sm text-neutral-200 placeholder:text-neutral-600 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500/40 hover:border-neutral-600 transition-colors leading-relaxed font-mono"
                  />
                  <p className="text-neutral-700 text-xs mt-1.5">
                    Cuanto más detalle des (subjects, bodies, delays entre nodos), más precisas serán las recomendaciones.
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-neutral-600">
                    <span>~30–60 seg</span>
                    <span>·</span>
                    <span>~$0.01 USD</span>
                    <span>·</span>
                    <span>Resultado guardado para la semana</span>
                  </div>
                  <button
                    onClick={handleGenerateStructural}
                    disabled={!detallesCampanas.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg transition-colors"
                  >
                    Revisar campañas
                  </button>
                </div>
              </div>
            )}

            {/* Loading */}
            {structuralGenerating && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 text-center">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <span className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-white font-medium">Revisando campañas…</p>
                </div>
                <p className="text-neutral-500 text-sm">
                  Analizando entrega, cadencia y copy de forma independiente al modelo · ~30–60s
                </p>
                <div className="flex items-center justify-center gap-1.5 mt-4">
                  {['Métricas', 'Cadencia', 'Copy', 'Contexto', 'Recomendaciones'].map((label, i) => (
                    <span key={label} className="text-xs text-neutral-600 animate-pulse" style={{ animationDelay: `${i * 0.3}s` }}>
                      {label}{i < 4 ? ' →' : ''}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Error */}
            {structuralError && !structuralGenerating && (
              <div className="bg-red-500/8 border border-red-500/20 rounded-xl px-5 py-4">
                <p className="text-red-400 text-sm font-medium mb-1">Error al revisar</p>
                <p className="text-red-400/70 text-xs">{structuralError}</p>
                <button onClick={handleGenerateStructural} className="mt-3 text-xs text-red-400 underline">
                  Reintentar
                </button>
              </div>
            )}

            {/* Resultados */}
            {structuralResult && !structuralGenerating && (
              <div className="space-y-4">
                <div className="bg-neutral-900 border border-blue-500/15 rounded-xl p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-white font-semibold">Qué encontramos en el resto de campañas</h3>
                      {structuralResult.semana_label && (
                        <p className="text-neutral-600 text-xs mt-0.5">Semana {structuralResult.semana_label}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {structuralResult.estado_funnel && (
                        <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${ESTADO_CFG[structuralResult.estado_funnel]?.cls}`}>
                          {ESTADO_CFG[structuralResult.estado_funnel]?.label}
                        </span>
                      )}
                      {structuralResult.acciones.length > 0 && (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {structuralResult.acciones.length} mejora{structuralResult.acciones.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-neutral-300 text-sm leading-relaxed">{structuralResult.resumen}</p>
                </div>

                {structuralResult.acciones.length > 0 ? (
                  <>
                    <div className="flex items-center gap-2">
                      <p className="text-neutral-400 text-sm font-medium">Campañas con oportunidad de mejora</p>
                      <div className="flex-1 h-px bg-neutral-800" />
                      <p className="text-xs text-neutral-600">
                        Basado en salud estructural, no en señal del modelo
                      </p>
                    </div>
                    {structuralResult.acciones.map((action, i) => (
                      <StrategyCanvasCard
                        key={i}
                        action={action}
                        actionIndex={i}
                        edits={structuralEdits[i] ?? { included: true, nodeEdits: {} }}
                        onToggle={() => setStructuralEdits(prev => ({
                          ...prev,
                          [i]: { ...prev[i], included: !(prev[i]?.included ?? true) },
                        }))}
                        onNodeEdit={(nodeOrden, copies) => setStructuralEdits(prev => ({
                          ...prev,
                          [i]: {
                            ...prev[i],
                            nodeEdits: { ...(prev[i]?.nodeEdits ?? {}), [nodeOrden]: copies },
                          },
                        }))}
                      />
                    ))}
                  </>
                ) : (
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 text-center">
                    <p className="text-neutral-400 text-sm">
                      ✓ Todas las campañas revisadas están en buen estado — entrega, cadencia y copy correctos
                    </p>
                  </div>
                )}

                <button
                  onClick={() => { setStructuralResult(null); setDetallesCampanas('') }}
                  className="text-xs text-neutral-500 hover:text-neutral-300 underline transition-colors"
                >
                  Actualizar revisión
                </button>
              </div>
            )}
          </section>
        )}

        {/* ── Execution result ──────────────────────────────────────────────── */}
        {executed && (
          <section>
            <div className={`border rounded-xl p-5 ${executed.total_errores === 0 ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-amber-500/5 border-amber-500/20'}`}>
              <h2 className={`font-semibold mb-3 ${executed.total_errores === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {executed.total_errores === 0
                  ? `✓ ${executed.total_ejecutadas} acción(es) ejecutadas correctamente`
                  : `⚠ ${executed.total_ejecutadas} ejecutadas · ${executed.total_errores} error(es)`}
              </h2>
              {executed.executed.length > 0 && (
                <div className="space-y-1.5 mb-3">
                  {executed.executed.map((e, i) => (
                    <div key={i} className="text-sm text-neutral-300 flex items-center gap-2">
                      <span className="text-emerald-500 text-xs">✓</span>
                      <span className="font-medium capitalize">{e.tipo}</span>
                      <span className="text-neutral-500">·</span>
                      <span>{e.step_code}</span>
                      {e.nombre && <span className="text-neutral-400 text-xs">"{e.nombre}"</span>}
                      {e.campaign_id && <span className="text-neutral-600 text-xs font-mono">#{e.campaign_id}</span>}
                    </div>
                  ))}
                </div>
              )}
              {executed.errors.length > 0 && (
                <div className="space-y-1">
                  {executed.errors.map((e, i) => (
                    <p key={i} className="text-xs text-red-400">✗ {e.step_code} · {e.error}</p>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Datos activos en el sistema ───────────────────────────────────── */}
        <section>
          <button
            onClick={handleLoadSysCtx}
            className="w-full flex items-center justify-between px-4 py-3 bg-neutral-900 hover:bg-neutral-800/70 border border-neutral-800 rounded-xl transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-neutral-500 text-sm">🔍</span>
              <div className="text-left">
                <p className="text-neutral-300 text-sm font-medium group-hover:text-white transition-colors">
                  Datos activos en el sistema
                </p>
                <p className="text-neutral-600 text-xs">
                  Pasos del funnel · Eventos CIO · Atributos · Campañas en caché · Knowledge Base
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {sysCtx && (
                <span className="text-[10px] text-neutral-600 tabular-nums">
                  {sysCtx.funnel_steps.length} pasos · {sysCtx.events.length} eventos · {sysCtx.attributes.length} atrib · {sysCtx.campaigns_cache.length} camp · {sysCtx.knowledge_base.length} KB
                </span>
              )}
              <span className={`text-xs text-neutral-600 transition-transform duration-200 ${sysOpen ? 'rotate-180' : ''}`}>▼</span>
            </div>
          </button>

          {sysOpen && (
            <div className="mt-2">
              {sysLoading && (
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-neutral-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-neutral-500 text-sm">Cargando contexto del sistema…</span>
                </div>
              )}
              {sysError && !sysLoading && (
                <div className="bg-red-500/8 border border-red-500/20 rounded-xl px-5 py-4">
                  <p className="text-red-400 text-sm">{sysError}</p>
                  <button
                    onClick={() => { setSysCtx(null); setSysError(null); handleLoadSysCtx() }}
                    className="mt-2 text-xs text-red-400 underline"
                  >
                    Reintentar
                  </button>
                </div>
              )}
              {sysCtx && !sysLoading && <SystemContextPanel ctx={sysCtx} />}
            </div>
          )}
        </section>

      </div>
    </div>
  )
}
