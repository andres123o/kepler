'use client'
import { useEffect, useState } from 'react'
import { api, TrainingStatus } from '@/lib/api'

export default function ModeloPage() {
  const [status, setStatus] = useState<TrainingStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [training, setTraining] = useState(false)
  const [trainMsg, setTrainMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .trainingStatus()
      .then(setStatus)
      .catch(() => setError('No se pudo cargar el estado del modelo'))
      .finally(() => setLoading(false))
  }, [])

  async function handleTrain() {
    const ok = confirm(
      'El entrenamiento descarga el historial de Supabase y corre 60 trials de Optuna.\n\nPuede tardar 10-15 minutos. ¿Continuar?'
    )
    if (!ok) return
    setTraining(true)
    setTrainMsg(null)
    try {
      const r = await api.train()
      const v = r.version as number
      const mae = r.mae_walk_forward as number
      setTrainMsg({
        type: 'ok',
        text: `Entrenamiento completado → v${v} | MAE walk-forward: ${mae?.toFixed(2)}`,
      })
      const newStatus = await api.trainingStatus()
      setStatus(newStatus)
    } catch (err) {
      setTrainMsg({
        type: 'err',
        text: err instanceof Error ? err.message : 'Error en entrenamiento',
      })
    } finally {
      setTraining(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-neutral-500 animate-pulse">Cargando estado del modelo...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Estado del modelo</h1>
        <p className="text-neutral-400 text-sm mt-1">
          Métricas del modelo XGBoost activo en producción
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {status && !status.has_model && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
          <p className="text-amber-400 text-sm">
            {status.message ?? 'No hay modelos entrenados.'}
          </p>
        </div>
      )}

      {status?.has_model && (
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Metric label="Versión" value={`v${status.version}`} />
          <Metric
            label="MAE walk-forward"
            value={status.mae_walk_forward?.toFixed(2) ?? '—'}
            sub="Error promedio en validación OOS"
          />
          <Metric
            label="R² entrenamiento"
            value={status.r2_train?.toFixed(4) ?? '—'}
            sub="Ajuste sobre datos de train"
          />
          <Metric
            label="MAE entrenamiento"
            value={status.mae_train?.toFixed(2) ?? '—'}
          />
          <Metric
            label="Ratio WF / Train"
            value={status.ratio_wf_train?.toFixed(2) ?? '—'}
            sub={`Overfitting flag: ${status.overfitting_flag ?? '—'}`}
            accent={status.overfitting_flag === 'ok' ? 'green' : 'amber'}
          />
          <Metric
            label="Datos"
            value={`${status.n_samples ?? '—'} filas · ${status.n_features ?? '—'} features`}
          />
        </div>
      )}

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
        <h2 className="text-white font-semibold mb-2">Reentrenar modelo</h2>
        <p className="text-neutral-400 text-sm mb-5">
          Descarga <code className="text-amber-400 text-xs">master_consolidado_final</code> de
          Supabase y reentrena XGBoost + Optuna (60 trials). Ejecutar los domingos antes de
          predecir cuando haya datos nuevos.
        </p>
        <button
          onClick={handleTrain}
          disabled={training}
          className="bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 text-white font-medium rounded-lg px-6 py-2.5 text-sm transition-colors"
        >
          {training ? 'Entrenando...' : 'Iniciar entrenamiento'}
        </button>

        {training && (
          <p className="text-neutral-500 text-xs mt-3 animate-pulse">
            Proceso corriendo en background · no cierres esta ventana
          </p>
        )}

        {trainMsg && (
          <p
            className={`text-sm mt-3 ${
              trainMsg.type === 'ok' ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {trainMsg.text}
          </p>
        )}
      </div>
    </div>
  )
}

function Metric({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: string
  sub?: string
  accent?: 'green' | 'amber'
}) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
      <p className="text-neutral-400 text-xs uppercase tracking-wider mb-1.5">{label}</p>
      <p
        className={`text-2xl font-semibold tabular-nums ${
          accent === 'green'
            ? 'text-emerald-400'
            : accent === 'amber'
            ? 'text-amber-400'
            : 'text-white'
        }`}
      >
        {value}
      </p>
      {sub && <p className="text-neutral-500 text-xs mt-1">{sub}</p>}
    </div>
  )
}
