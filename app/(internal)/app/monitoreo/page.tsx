'use client'

import { useState } from 'react'
import { api, type CampaignCheckResult, type MonitorHealth, type MonitorReport } from '@/lib/api'

// ─── Health config ────────────────────────────────────────────────────────────

const H: Record<MonitorHealth, { dot: string; text: string; ring: string; label: string }> = {
  ok:        { dot: 'bg-emerald-400', text: 'text-emerald-400', ring: 'border-emerald-500/20', label: 'OK' },
  alerta:    { dot: 'bg-amber-400',   text: 'text-amber-400',   ring: 'border-amber-500/25',   label: 'Alerta' },
  critico:   { dot: 'bg-red-400',     text: 'text-red-400',     ring: 'border-red-500/25',     label: 'Crítico' },
  sin_datos: { dot: 'bg-neutral-600', text: 'text-neutral-500', ring: 'border-neutral-800',    label: 'Sin datos' },
}

function HealthDot({ health }: { health: MonitorHealth }) {
  const s = H[health]
  return (
    <span className="relative flex items-center justify-center w-2 h-2 shrink-0">
      {health === 'ok' && (
        <span className="absolute w-full h-full rounded-full bg-emerald-400 opacity-30 animate-ping" />
      )}
      <span className={`w-2 h-2 rounded-full ${s.dot}`} />
    </span>
  )
}

// ─── Trend badge ──────────────────────────────────────────────────────────────

function TrendBadge({ pct, label }: { pct: number; label: string }) {
  const rising = pct >= 0
  const cls = pct > 5 ? 'text-emerald-400' : pct < -20 ? 'text-red-400' : pct < -5 ? 'text-amber-400' : 'text-neutral-500'
  return (
    <div className="flex flex-col items-center">
      <span className={`text-xs font-medium tabular-nums ${cls}`}>
        {rising ? '+' : ''}{pct.toFixed(0)}%
      </span>
      <span className="text-[10px] text-neutral-600">{label}</span>
    </div>
  )
}

// ─── Campaign card ────────────────────────────────────────────────────────────

function CampaignCard({ c }: { c: CampaignCheckResult }) {
  const [open, setOpen] = useState(false)
  const s = H[c.health]
  const m = c.metrics

  const drCls = m.delivery_rate >= 0.7 ? 'text-emerald-400' : m.delivery_rate >= 0.5 ? 'text-amber-400' : 'text-red-400'
  const orCls = m.open_rate >= 0.08 ? 'text-emerald-400' : m.open_rate >= 0.04 ? 'text-amber-400' : 'text-neutral-500'
  const crCls = m.conversion_rate >= 0.05 ? 'text-emerald-400' : m.conversion_rate >= 0.01 ? 'text-amber-400' : 'text-red-400'

  const hasData = m.total_sent >= 50
  const tConv = c.trends.converted
  const tDel  = c.trends.delivered
  const tOpen = c.trends.human_opened

  return (
    <div className={`bg-neutral-900 border rounded-xl overflow-hidden ${s.ring}`}>
      {/* Header */}
      <div className="px-4 py-3 flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 min-w-0">
          <HealthDot health={c.health} />
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold leading-tight truncate" title={c.name}>
              {c.name}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-neutral-600 text-xs font-mono">#{c.cio_campaign_id}</span>
              {c.funnel_step_mapped
                ? <span className="text-neutral-600 text-xs font-mono">{c.funnel_step_mapped}</span>
                : <span className="text-amber-500/70 text-xs">⚠ sin mapear</span>}
            </div>
          </div>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
          c.status_campaign === 'running'
            ? 'bg-emerald-500/10 text-emerald-400'
            : 'bg-neutral-800 text-neutral-500'
        }`}>
          {c.status_campaign ?? '—'}
        </span>
      </div>

      {/* Health label */}
      <div className={`px-4 py-2 border-t border-neutral-800/60 ${
        c.health === 'critico' ? 'bg-red-500/5' :
        c.health === 'alerta'  ? 'bg-amber-500/5' : ''
      }`}>
        <p className={`text-xs ${s.text}`}>{c.label}</p>
      </div>

      {/* Metrics row */}
      {hasData && (
        <div className="px-4 py-3 border-t border-neutral-800/60 flex items-center gap-4 flex-wrap">
          <div className="flex flex-col">
            <span className={`text-sm font-semibold tabular-nums ${drCls}`}>{(m.delivery_rate * 100).toFixed(0)}%</span>
            <span className="text-[10px] text-neutral-600">Entrega</span>
          </div>
          <div className="flex flex-col">
            <span className={`text-sm font-semibold tabular-nums ${orCls}`}>{(m.open_rate * 100).toFixed(0)}%</span>
            <span className="text-[10px] text-neutral-600">Apertura</span>
          </div>
          <div className="flex flex-col">
            <span className={`text-sm font-semibold tabular-nums ${crCls}`}>{(m.conversion_rate * 100).toFixed(1)}%</span>
            <span className="text-[10px] text-neutral-600">Conversión</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tabular-nums text-neutral-300">{m.converted.toLocaleString('es-CO')}</span>
            <span className="text-[10px] text-neutral-600">Convertidos</span>
          </div>
          <div className="flex flex-col">
            <span className="text-neutral-500 text-xs tabular-nums">{m.total_sent.toLocaleString('es-CO')} sent</span>
          </div>

          {/* Trends */}
          {(tConv || tDel || tOpen) && (
            <div className="ml-auto flex items-center gap-3 border-l border-neutral-800 pl-4">
              {tDel  && <TrendBadge pct={tDel.change_pct}  label="Entregas" />}
              {tOpen && <TrendBadge pct={tOpen.change_pct} label="Aperturas" />}
              {tConv && <TrendBadge pct={tConv.change_pct} label="Conversiones" />}
            </div>
          )}
        </div>
      )}

      {/* Issues */}
      {c.issues.length > 0 && (
        <div className="px-4 pb-3 border-t border-neutral-800/60 pt-2.5 space-y-1.5">
          {c.issues.map((issue, i) => (
            <p key={i} className={`text-xs px-2.5 py-1.5 rounded-md border ${
              c.health === 'critico'
                ? 'text-red-400 bg-red-500/8 border-red-500/15'
                : 'text-amber-400 bg-amber-500/8 border-amber-500/15'
            }`}>
              {c.health === 'critico' ? '✗' : '⚠'} {issue}
            </p>
          ))}
        </div>
      )}

      {/* Sin datos detail */}
      {c.health === 'sin_datos' && (
        <div className="px-4 pb-3 border-t border-neutral-800/60 pt-2.5">
          <p className="text-xs text-neutral-600">
            Sin suficientes datos para analizar. Sincroniza las campañas para obtener métricas.
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Summary bar ─────────────────────────────────────────────────────────────

function SummaryBar({ report }: { report: MonitorReport }) {
  const overall = H[report.overall_health]
  const ts = new Date(report.checked_at).toLocaleString('es-CO', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl px-5 py-4 flex items-center gap-6 flex-wrap">
      <div className="flex items-center gap-2">
        <HealthDot health={report.overall_health} />
        <span className={`text-sm font-semibold ${overall.text}`}>
          {report.overall_health === 'ok' ? 'Todo en orden' :
           report.overall_health === 'alerta' ? 'Hay alertas' : 'Atención requerida'}
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs">
        <span className="text-neutral-500">{report.total_campaigns} campañas</span>
        {report.ok > 0 && <span className="text-emerald-400">✓ {report.ok} ok</span>}
        {report.alertas > 0 && <span className="text-amber-400">⚠ {report.alertas} alerta(s)</span>}
        {report.criticas > 0 && <span className="text-red-400">✗ {report.criticas} crítica(s)</span>}
        {report.sin_datos > 0 && <span className="text-neutral-600">— {report.sin_datos} sin datos</span>}
      </div>

      <span className="ml-auto text-[10px] text-neutral-600 tabular-nums">
        Checkeado {ts}
      </span>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function MonitoreoPage() {
  const [report, setReport]     = useState<MonitorReport | null>(null)
  const [loading, setLoading]   = useState(false)
  const [syncing, setSyncing]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  async function handleCheck() {
    setLoading(true)
    setError(null)
    try {
      const r = await api.runWeeklyCheck()
      setReport(r)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al correr el check')
    } finally {
      setLoading(false)
    }
  }

  async function handleSyncAndCheck() {
    setSyncing(true)
    setError(null)
    try {
      await api.syncCampaigns()
      const r = await api.runWeeklyCheck()
      setReport(r)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al sincronizar')
    } finally {
      setSyncing(false)
    }
  }

  const sorted = (report?.campaigns ?? []).slice().sort((a, b) => {
    const rank: Record<MonitorHealth, number> = { critico: 3, alerta: 2, ok: 1, sin_datos: 0 }
    return rank[b.health] - rank[a.health]
  })

  return (
    <div className="flex-1 overflow-auto bg-neutral-950">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-white text-2xl font-bold">Monitoreo de Campañas</h1>
            <p className="text-neutral-500 text-sm mt-1">
              Estado de las {report ? report.total_campaigns : '—'} campañas monitoreadas en Customer.io
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSyncAndCheck}
              disabled={syncing || loading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-sm bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 rounded-lg transition-colors disabled:opacity-40"
            >
              {syncing
                ? <><span className="w-3.5 h-3.5 border border-neutral-400 border-t-transparent rounded-full animate-spin" /> Sincronizando…</>
                : '↻ Sync + Check'}
            </button>
            <button
              onClick={handleCheck}
              disabled={loading || syncing}
              className="flex items-center gap-2 px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-sm rounded-lg transition-colors disabled:opacity-40"
            >
              {loading
                ? <><span className="w-3.5 h-3.5 border-2 border-neutral-800 border-t-transparent rounded-full animate-spin" /> Analizando…</>
                : '▶ Correr check'}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/8 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-400/60 hover:text-red-400">✕</button>
          </div>
        )}

        {/* Empty state */}
        {!report && !loading && !error && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-10 text-center">
            <p className="text-neutral-400 mb-1 font-medium">Sin check corrido aún</p>
            <p className="text-neutral-600 text-sm mb-5">
              Corre "Correr check" para ver el estado de tus campañas con los datos actuales del cache,
              o "Sync + Check" para sincronizar primero con CIO y luego analizar.
            </p>
            <button
              onClick={handleCheck}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-sm rounded-lg transition-colors"
            >
              ▶ Correr check
            </button>
          </div>
        )}

        {/* Loading */}
        {(loading || syncing) && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-white font-medium">
                {syncing ? 'Sincronizando con CIO…' : 'Analizando campañas…'}
              </p>
            </div>
          </div>
        )}

        {/* Results */}
        {report && !loading && !syncing && (
          <>
            <SummaryBar report={report} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sorted.map(c => (
                <CampaignCard key={c.cio_campaign_id} c={c} />
              ))}
            </div>

            <div className="flex items-center justify-end">
              <button
                onClick={handleCheck}
                className="text-xs text-neutral-500 hover:text-neutral-300 underline transition-colors"
              >
                Refrescar análisis
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  )
}
