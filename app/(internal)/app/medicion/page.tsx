'use client'

import { useState, useEffect } from 'react'
import { api, type MeasurementSnapshot } from '@/lib/api'

type View = 'historial' | 'nueva'

// ─── Viewer ───────────────────────────────────────────────────────────────────

function SnapshotViewer({
  snapshot,
  loading,
}: {
  snapshot: MeasurementSnapshot | null
  loading: boolean
}) {
  if (loading) {
    return (
      <div className="flex-1 min-h-0 flex items-center justify-center">
        <div className="flex items-center gap-2.5">
          <span className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-neutral-500 text-sm">Cargando análisis…</p>
        </div>
      </div>
    )
  }
  if (!snapshot?.html_content) {
    return (
      <div className="flex-1 min-h-0 flex items-center justify-center">
        <p className="text-neutral-700 text-sm">Selecciona una semana</p>
      </div>
    )
  }
  return (
    <div className="flex-1 min-h-0 rounded-xl overflow-hidden border border-neutral-800/60" style={{ display: 'flex', flexDirection: 'column' }}>
      <iframe
        srcDoc={snapshot.html_content}
        style={{ flex: 1, minHeight: 0, width: '100%', border: 'none', display: 'block' }}
        sandbox="allow-scripts"
        title={snapshot.semana_label}
      />
    </div>
  )
}

// ─── Formulario nueva entrada ─────────────────────────────────────────────────

function NuevaEntradaForm({
  onSaved,
  onCancel,
}: {
  onSaved: (snap: MeasurementSnapshot) => void
  onCancel: () => void
}) {
  const [semanaLabel, setSemanaLabel] = useState('')
  const [inicioSemana, setInicioSemana] = useState('')
  const [finSemana, setFinSemana] = useState('')
  const [modelVersion, setModelVersion] = useState('')
  const [htmlContent, setHtmlContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    if (!semanaLabel.trim()) { setError('Ingresa el label de la semana'); return }
    if (!htmlContent.trim()) { setError('Pega el HTML generado por Claude'); return }
    setSaving(true)
    setError(null)
    try {
      const saved = await api.saveSnapshot({
        semana_label:  semanaLabel.trim(),
        inicio_semana: inicioSemana  || undefined,
        fin_semana:    finSemana     || undefined,
        model_version: modelVersion.trim() || undefined,
        html_content:  htmlContent.trim(),
      })
      onSaved(saved)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="min-h-full flex items-center justify-center py-10">
        <div className="w-full max-w-2xl space-y-6">

          {/* Steps */}
          <div className="grid grid-cols-4 gap-4">
            {[
              'Corre las 5 queries en BigQuery Studio',
              'Pega resultados en Claude con el prompt',
              'Copia el HTML que devuelve Claude',
              'Pega abajo y guarda',
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="shrink-0 w-4 h-4 rounded-full bg-neutral-800 text-neutral-600 text-[10px] flex items-center justify-center font-mono mt-px">
                  {i + 1}
                </span>
                <span className="text-xs text-neutral-500 leading-snug">{step}</span>
              </div>
            ))}
          </div>

          {/* Campos */}
          <div className="grid grid-cols-6 gap-3">
            <div className="col-span-3">
              <label className="text-xs text-neutral-500 block mb-1.5">Label de la semana *</label>
              <input
                type="text"
                value={semanaLabel}
                onChange={e => setSemanaLabel(e.target.value)}
                placeholder="ej. 11-17 mayo 2026"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-500 block mb-1.5">Inicio</label>
              <input
                type="date"
                value={inicioSemana}
                onChange={e => setInicioSemana(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-500 block mb-1.5">Fin</label>
              <input
                type="date"
                value={finSemana}
                onChange={e => setFinSemana(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-500 block mb-1.5">Modelo</label>
              <input
                type="text"
                value={modelVersion}
                onChange={e => setModelVersion(e.target.value)}
                placeholder="keplerv4"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>

          {/* HTML */}
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <label className="text-xs text-neutral-500">HTML del análisis *</label>
              {htmlContent.trim() && (
                <span className="text-xs text-neutral-700">{(htmlContent.length / 1024).toFixed(1)} KB</span>
              )}
            </div>
            <textarea
              value={htmlContent}
              onChange={e => setHtmlContent(e.target.value)}
              rows={12}
              placeholder={'<!DOCTYPE html>\n<html>\n...\n</html>'}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500/50 font-mono resize-y"
            />
          </div>

          {error && (
            <div className="bg-red-500/8 border border-red-500/20 rounded-lg px-4 py-2.5 text-sm text-red-400 flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="ml-3 text-red-400/60 hover:text-red-400">✕</button>
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onCancel}
              className="text-sm text-neutral-500 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-sm rounded-lg transition-colors disabled:opacity-40"
            >
              {saving
                ? <><span className="w-3.5 h-3.5 border-2 border-neutral-800 border-t-transparent rounded-full animate-spin" /> Guardando…</>
                : '↓ Guardar análisis'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function MedicionPage() {
  const [view, setView] = useState<View>('historial')
  const [snapshots, setSnapshots] = useState<MeasurementSnapshot[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [activeSnap, setActiveSnap] = useState<MeasurementSnapshot | null>(null)
  const [loadingSnap, setLoadingSnap] = useState(false)

  useEffect(() => {
    api.listSnapshots()
      .then(snaps => {
        setSnapshots(snaps)
        if (snaps.length > 0) loadSnapshot(snaps[0].id)
      })
      .catch(() => {})
      .finally(() => setLoadingList(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadSnapshot(id: string) {
    setLoadingSnap(true)
    setActiveSnap(null)
    try {
      const snap = await api.getSnapshot(id)
      setActiveSnap(snap)
    } catch {}
    finally { setLoadingSnap(false) }
  }

  function handleSaved(snap: MeasurementSnapshot) {
    setSnapshots(prev => [snap, ...prev])
    setView('historial')
    loadSnapshot(snap.id)
  }

  return (
    <div className="bg-neutral-950 overflow-hidden flex flex-col" style={{ height: '100vh' }}>
      <div className="flex flex-col gap-4 px-6 py-5 h-full">

        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          {view === 'nueva' ? (
            <button
              onClick={() => setView('historial')}
              className="flex items-center gap-1.5 text-neutral-500 hover:text-white text-sm transition-colors"
            >
              ← Volver al historial
            </button>
          ) : (
            <>
              <div>
                <h1 className="text-white text-xl font-bold leading-tight">Métricas y Resultados</h1>
                <p className="text-neutral-600 text-xs mt-0.5">keplerv4 · análisis semanal test vs control</p>
              </div>

              <div className="flex items-center gap-3">
                {!loadingList && snapshots.length > 0 && (
                  <select
                    value={activeSnap?.id ?? ''}
                    onChange={e => loadSnapshot(e.target.value)}
                    className="bg-neutral-900 border border-neutral-800 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500/50 cursor-pointer [color-scheme:dark]"
                  >
                    {snapshots.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.semana_label}{s.model_version ? ` · ${s.model_version}` : ''}
                      </option>
                    ))}
                  </select>
                )}
                <button
                  onClick={() => setView('nueva')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 text-xs font-medium transition-colors"
                >
                  + Nueva semana
                </button>
              </div>
            </>
          )}
        </div>

        {/* ── Historial ── */}
        {view === 'historial' && (
          <>
            {!loadingList && snapshots.length === 0 && (
              <div className="shrink-0 text-center py-4">
                <p className="text-neutral-600 text-sm mb-2">Sin semanas guardadas aún</p>
                <button
                  onClick={() => setView('nueva')}
                  className="text-xs text-amber-500 hover:text-amber-400 underline"
                >
                  Agregar primera semana
                </button>
              </div>
            )}
            <SnapshotViewer snapshot={activeSnap} loading={loadingSnap || loadingList} />
          </>
        )}

        {/* ── Nueva entrada ── */}
        {view === 'nueva' && (
          <NuevaEntradaForm onSaved={handleSaved} onCancel={() => setView('historial')} />
        )}

      </div>
    </div>
  )
}
