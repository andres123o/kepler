'use client'
import { useEffect, useRef, useState } from 'react'
import { api, PredictionResult, ContextoItem } from '@/lib/api'

// ── Nombres humanos para las variables del modelo ────────────────────────────
const FEATURE_LABELS: Record<string, string> = {
  // Pasos del funnel
  registros_semanal:        'Nuevos registros',
  registros_semana:         'Nuevos registros',
  users_basic_data:         'Usuarios en Basic Data',
  users_risk_profile:       'Perfil de riesgo completado',
  users_full_data:          'Datos completos (Full Data)',
  users_video_review:       'Revisión de video',
  users_approved:           'Usuarios aprobados',
  users_cashin:             'Primer depósito realizado',
  // Variables externas
  trm:                      'Tasa de cambio (TRM)',
  TRM:                      'Tasa de cambio (TRM)',
  tasa_intervencion_mensual:'Tasa de intervención bancaria',
  Tasa_Intervencion_Mensual:'Tasa de intervención bancaria',
  variacion_colcap:         'Variación COLCAP (bolsa)',
  Variacion_COLCAP:         'Variación COLCAP (bolsa)',
  // Temporales
  es_festivo:               'Semana con festivos',
  es_primero_mes:           'Inicio de mes',
  es_final_mes:             'Fin de mes',
  semana_del_mes:           'Semana del mes',
  mes:                      'Mes del año',
  // Soporte
  soporte_tickets:          'Tickets de soporte',
  soporte_tickets_semanal:  'Tickets de soporte',
}

function humanize(name: string): string {
  return FEATURE_LABELS[name] ?? name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

// ── Configuración visual de severidad ────────────────────────────────────────
const SEV: Record<string, { badge: string; border: string }> = {
  crítica:    { badge: 'text-red-400 bg-red-500/10 border border-red-500/20',       border: 'border-red-500/30' },
  alerta:     { badge: 'text-amber-400 bg-amber-500/10 border border-amber-500/20', border: 'border-amber-500/30' },
  monitorear: { badge: 'text-sky-400 bg-sky-500/10 border border-sky-500/20',       border: 'border-sky-500/20' },
}

// ── Selector de historial ─────────────────────────────────────────────────────
function HistorialSelector({
  history, current, onSelect,
}: {
  history: PredictionResult[]
  current: PredictionResult
  onSelect: (r: PredictionResult) => void
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
        <div className="absolute right-0 top-full mt-1 w-72 bg-neutral-800 border border-neutral-700 rounded-xl shadow-xl z-10 overflow-hidden">
          {history.map((item, i) => {
            const isActive = item.semana_datos === current.semana_datos
            return (
              <button
                key={item.semana_datos}
                onClick={() => { onSelect(item); setOpen(false) }}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors ${
                  isActive ? 'bg-amber-500/10 text-amber-300' : 'text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                <span>{item.semana_label ?? item.semana_datos}</span>
                <span className="flex items-center gap-1.5 shrink-0 ml-3">
                  {i === 0 && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-400 rounded px-1.5 py-0.5">
                      última
                    </span>
                  )}
                  <span className="tabular-nums text-neutral-400">
                    {item.prediccion_siguiente_semana.toLocaleString('es-CO')}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Descripción de cambio porcentual ─────────────────────────────────────────
function describeCambio(ctx: ContextoItem) {
  if (ctx.current_value == null || ctx.trailing_12w_mean === 0) return null
  const pct = ((ctx.current_value - ctx.trailing_12w_mean) / ctx.trailing_12w_mean) * 100
  const abs = Math.abs(pct).toFixed(0)
  const dir = pct >= 0 ? 'por encima' : 'por debajo'
  return { pct, abs, dir }
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function PredecirPage() {
  const [loading, setLoading]         = useState(true)
  const [calculating, setCalculating] = useState(false)
  const [history, setHistory]         = useState<PredictionResult[]>([])
  const [result, setResult]           = useState<PredictionResult | null>(null)
  const [error, setError]             = useState<string | null>(null)
  const [showTechDetails, setShowTechDetails] = useState(false)

  useEffect(() => {
    api.predictionHistory()
      .then(data => {
        setHistory(data)
        if (data.length > 0) setResult(data[0])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function calcular() {
    setCalculating(true)
    setError(null)
    try {
      const r = await api.predict()
      const newHistory = await api.predictionHistory()
      setHistory(newHistory)
      setResult(r)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al calcular predicción')
    } finally {
      setCalculating(false)
    }
  }

  const isLatest = history.length > 0 && result?.semana_datos === history[0].semana_datos

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-neutral-500 animate-pulse">Cargando proyecciones...</p>
      </div>
    )
  }

  // ── Sin datos ─────────────────────────────────────────────────────────────
  if (!result && !calculating) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-white mb-8">Proyección semanal</h1>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-12 text-center">
          <p className="text-neutral-400 mb-2">No hay proyecciones guardadas todavía.</p>
          <p className="text-neutral-500 text-sm mb-6">
            Andá a &quot;Ingresar datos&quot;, completá la semana y hacé click en &quot;Guardar y proyectar&quot;.
          </p>
          {error && (
            <p className="text-red-400 text-sm mb-4 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2 inline-block">
              {error}
            </p>
          )}
          <button
            onClick={calcular}
            disabled={calculating}
            className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-semibold rounded-lg px-6 py-2.5 text-sm transition-colors"
          >
            {calculating ? 'Calculando...' : 'Calcular ahora'}
          </button>
        </div>
      </div>
    )
  }

  // ── Calculando ────────────────────────────────────────────────────────────
  if (calculating) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-neutral-400 text-sm">Corriendo el modelo ML...</p>
        <p className="text-neutral-600 text-xs">~30 segundos</p>
      </div>
    )
  }

  // ── Resultado ─────────────────────────────────────────────────────────────
  const r = result!

  // Mapa para cruzar prescripcion con contexto histórico
  const ctxMap = Object.fromEntries(
    r.contexto_historico_top_features.map(c => [c.feature, c])
  )

  // SHAP: separar positivos y negativos (top 8 de cada grupo)
  const shapPos = r.shap_top.filter(s => s.contribution > 0).slice(0, 8)
  const shapNeg = r.shap_top.filter(s => s.contribution < 0).slice(0, 8)
  const maxContrib = Math.max(...r.shap_top.map(s => Math.abs(s.contribution)), 1)

  // Resumen para el párrafo ejecutivo
  const nCritica = r.prescripcion.filter(p => p.severidad === 'crítica').length
  const nAlerta  = r.prescripcion.filter(p => p.severidad === 'alerta').length
  const rangoMin = r.prediccion_siguiente_semana - (r.mae_modelo ?? 0)
  const rangoMax = r.prediccion_siguiente_semana + (r.mae_modelo ?? 0)

  function resumenSenales() {
    if (r.prescripcion.length === 0) return null
    const partes: string[] = []
    if (nCritica > 0) partes.push(`${nCritica} señal${nCritica > 1 ? 'es' : ''} crítica${nCritica > 1 ? 's' : ''}`)
    if (nAlerta > 0)  partes.push(`${nAlerta} alerta${nAlerta > 1 ? 's' : ''}`)
    if (partes.length === 0) partes.push(`${r.prescripcion.length} señales`)
    return partes.join(' y ')
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white">Proyección semanal</h1>
            {isLatest && (
              <span className="text-xs bg-amber-500/15 text-amber-400 border border-amber-500/25 rounded-full px-2.5 py-0.5 font-medium">
                semana actual
              </span>
            )}
          </div>
          <p className="text-neutral-400 text-sm">
            Semana del{' '}
            <span className="text-neutral-200 font-medium">
              {r.semana_label ?? r.semana_datos}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <HistorialSelector history={history} current={r} onSelect={setResult} />
          <button
            onClick={calcular}
            disabled={calculating}
            className="bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors"
          >
            Recalcular
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-5">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-6">

        {/* ── KPIs ── */}
        <div className="grid grid-cols-3 gap-5">

          {/* Número principal */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl px-7 py-6 flex flex-col justify-between">
            <p className="text-neutral-400 text-xs uppercase tracking-widest mb-4">
              Primeros depósitos proyectados
            </p>
            <div>
              <p className="text-6xl font-bold text-white tabular-nums leading-none">
                {r.prediccion_siguiente_semana.toLocaleString('es-CO')}
              </p>
              <p className="text-neutral-600 text-xs mt-3">{r.modelo_version}</p>
            </div>
          </div>

          {/* vs. promedio */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl px-7 py-6 flex flex-col justify-between">
            <p className="text-neutral-400 text-xs uppercase tracking-widest mb-4">
              Promedio últimas 12 semanas
            </p>
            <div>
              <p className="text-4xl font-semibold text-neutral-200 tabular-nums leading-none">
                {r.baseline_12w.toLocaleString('es-CO')}
              </p>
              <div className={`flex items-baseline gap-1.5 mt-3 ${r.brecha_vs_baseline >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                <span className="text-lg font-bold tabular-nums">
                  {r.brecha_vs_baseline >= 0 ? '+' : ''}{r.brecha_vs_baseline.toLocaleString('es-CO')}
                </span>
                <span className="text-xs opacity-80">
                  {r.brecha_vs_baseline >= 0 ? 'más de lo habitual' : 'menos de lo habitual'}
                </span>
              </div>
            </div>
          </div>

          {/* Rango probable */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl px-7 py-6 flex flex-col justify-between">
            <p className="text-neutral-400 text-xs uppercase tracking-widest mb-4">
              Rango probable esta semana
            </p>
            <div>
              <p className="text-4xl font-semibold text-neutral-200 tabular-nums leading-none">
                {rangoMin.toLocaleString('es-CO')}
                <span className="text-neutral-600 font-light mx-2 text-3xl">–</span>
                {rangoMax.toLocaleString('es-CO')}
              </p>
              <p className="text-neutral-500 text-xs mt-3">
                Margen de error: ±{r.mae_modelo?.toLocaleString('es-CO') ?? '—'} depósitos
              </p>
            </div>
          </div>
        </div>

        {/* ── Resumen ejecutivo ── */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl px-6 py-5">
          <div className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-amber-400 mt-[5px] shrink-0" />
            <p className="text-neutral-300 text-sm leading-relaxed">
              El modelo proyecta{' '}
              <span className="text-white font-semibold">
                {r.prediccion_siguiente_semana.toLocaleString('es-CO')} primeros depósitos
              </span>{' '}
              esta semana —{' '}
              <span className={`font-semibold ${r.brecha_vs_baseline >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {Math.abs(r.brecha_vs_baseline).toLocaleString('es-CO')}{' '}
                {r.brecha_vs_baseline >= 0 ? 'más' : 'menos'} de lo habitual
              </span>
              {' '}según las últimas 12 semanas.
              {resumenSenales() && (
                <>
                  {' '}Se detectaron{' '}
                  <span className="text-white font-medium">{resumenSenales()}</span>
                  {' '}que conviene revisar antes de ajustar campañas.
                </>
              )}
              {r.mae_modelo && (
                <span className="text-neutral-500">
                  {' '}Rango esperado: {rangoMin.toLocaleString('es-CO')} – {rangoMax.toLocaleString('es-CO')}.
                </span>
              )}
            </p>
          </div>
        </div>

        {/* ── Señales detectadas ── */}
        {r.prescripcion.length > 0 && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <div className="mb-5">
              <h2 className="text-white font-semibold text-sm">Señales detectadas esta semana</h2>
              <p className="text-neutral-500 text-xs mt-1">
                Variables con comportamiento inusual vs. el promedio — las que más están moviendo la proyección
              </p>
            </div>

            <div className="space-y-3">
              {r.prescripcion.map(item => {
                const sev = SEV[item.severidad] ?? SEV.monitorear
                const ctx = ctxMap[item.variable]
                const cambio = ctx ? describeCambio(ctx) : null
                const impacto = item.contribucion_depositos

                return (
                  <div
                    key={item.variable}
                    className={`flex items-start gap-4 p-4 bg-neutral-800/50 rounded-xl border ${sev.border}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${sev.badge}`}>
                          {item.severidad}
                        </span>
                        <span className="text-white text-sm font-medium">
                          {humanize(item.variable)}
                        </span>
                      </div>
                      {cambio ? (
                        <p className="text-neutral-400 text-xs leading-relaxed">
                          Está{' '}
                          <span className={cambio.pct >= 0 ? 'text-emerald-400 font-medium' : 'text-red-400 font-medium'}>
                            {cambio.abs}% {cambio.dir}
                          </span>
                          {' '}del promedio de las últimas 12 semanas
                          {ctx?.current_value != null && ctx?.trailing_12w_mean != null && (
                            <span className="text-neutral-600">
                              {' '}(actual: {ctx.current_value.toLocaleString('es-CO', { maximumFractionDigits: 1 })} · promedio: {ctx.trailing_12w_mean.toLocaleString('es-CO', { maximumFractionDigits: 1 })})
                            </span>
                          )}
                        </p>
                      ) : (
                        <p className="text-neutral-500 text-xs">Sin datos comparativos disponibles</p>
                      )}
                    </div>

                    <div className="text-right shrink-0 min-w-[64px]">
                      <p className={`text-xl font-bold tabular-nums ${impacto >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {impacto >= 0 ? '+' : ''}{impacto.toFixed(0)}
                      </p>
                      <p className="text-neutral-500 text-[10px] leading-tight">depósitos<br />estimados</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <p className="text-neutral-600 text-xs mt-4 pl-1">
              El impacto es la estimación del modelo. Positivo suma a la proyección, negativo la resta.
            </p>
          </div>
        )}

        {/* ── ¿Qué explica esta proyección? (SHAP humanizado) ── */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <div className="mb-5">
            <h2 className="text-white font-semibold text-sm">¿Qué explica esta proyección?</h2>
            <p className="text-neutral-500 text-xs mt-1">
              Los factores con mayor peso en el modelo esta semana. Los números indican cuántos depósitos aportan o restan.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
            {/* Positivos */}
            {shapPos.length > 0 && (
              <div>
                <p className="text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <span>▲</span> Empujando hacia arriba
                </p>
                <div className="space-y-3">
                  {shapPos.map(item => {
                    const pct = (item.contribution / maxContrib) * 100
                    return (
                      <div key={item.feature}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-neutral-300 text-xs truncate flex-1 pr-2 leading-tight">
                            {humanize(item.feature)}
                          </span>
                          <span className="text-emerald-400 text-xs tabular-nums shrink-0 font-medium">
                            +{item.contribution.toFixed(0)} dep.
                          </span>
                        </div>
                        <div className="bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500/60 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Negativos */}
            {shapNeg.length > 0 && (
              <div>
                <p className="text-red-400 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <span>▼</span> Jalando hacia abajo
                </p>
                <div className="space-y-3">
                  {shapNeg.map(item => {
                    const pct = (Math.abs(item.contribution) / maxContrib) * 100
                    return (
                      <div key={item.feature}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-neutral-300 text-xs truncate flex-1 pr-2 leading-tight">
                            {humanize(item.feature)}
                          </span>
                          <span className="text-red-400 text-xs tabular-nums shrink-0 font-medium">
                            {item.contribution.toFixed(0)} dep.
                          </span>
                        </div>
                        <div className="bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full bg-red-500/60 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Detalles técnicos (colapsable) ── */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowTechDetails(v => !v)}
            className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-neutral-800/40 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-neutral-400 text-sm font-medium">Detalle técnico del modelo</span>
              <span className="text-neutral-600 text-xs">
                — variables, valores actuales, z-scores, impacto SHAP
              </span>
            </div>
            <span className="text-neutral-500 text-xs shrink-0">
              {showTechDetails ? '▲ ocultar' : '▼ ver detalle'}
            </span>
          </button>

          {showTechDetails && (
            <div className="px-6 pb-6 border-t border-neutral-800">
              <div className="overflow-x-auto mt-4">
                <table className="w-full">
                  <thead>
                    <tr className="text-neutral-500 text-xs border-b border-neutral-700">
                      <th className="text-left pb-2 pr-4 font-medium">Variable</th>
                      <th className="text-right pb-2 pr-4 font-medium">Valor actual</th>
                      <th className="text-right pb-2 pr-4 font-medium">Promedio 12 sem.</th>
                      <th className="text-right pb-2 pr-4 font-medium">Z-score</th>
                      <th className="text-right pb-2 font-medium">Impacto (dep.)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {r.contexto_historico_top_features.map(item => (
                      <tr key={item.feature} className="border-b border-neutral-800/60">
                        <td className="py-2 pr-4 text-neutral-200 text-xs">
                          {humanize(item.feature)}
                        </td>
                        <td className="py-2 pr-4 text-right text-neutral-300 text-xs tabular-nums">
                          {item.current_value != null
                            ? item.current_value.toLocaleString('es-CO', { maximumFractionDigits: 2 })
                            : '—'}
                        </td>
                        <td className="py-2 pr-4 text-right text-neutral-500 text-xs tabular-nums">
                          {item.trailing_12w_mean.toLocaleString('es-CO', { maximumFractionDigits: 2 })}
                        </td>
                        <td className={`py-2 pr-4 text-right text-xs tabular-nums font-medium ${
                          item.z_score == null    ? 'text-neutral-600'
                          : Math.abs(item.z_score) > 2   ? 'text-red-400'
                          : Math.abs(item.z_score) > 1.5 ? 'text-amber-400'
                          : 'text-neutral-400'
                        }`}>
                          {item.z_score?.toFixed(2) ?? '—'}
                        </td>
                        <td className={`py-2 text-right text-xs tabular-nums ${
                          item.shap_contribution >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {item.shap_contribution >= 0 ? '+' : ''}{item.shap_contribution.toFixed(0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
