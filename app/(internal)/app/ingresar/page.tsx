'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

const GROUPS = [
  {
    title: 'Funnel de conversión',
    fields: [
      { key: 'usuarios_registro_base', label: 'Registros base' },
      { key: 'step_09_full_account', label: 'Full account (step 9)' },
      { key: 'tasa_basic_a_risk', label: 'Tasa basic → risk (%)' },
      { key: 'tasa_risk_a_fulldata', label: 'Tasa risk → full data (%)' },
      { key: 'tasa_fulldata_a_video', label: 'Tasa full data → video (%)' },
      { key: 'tasa_video_a_review', label: 'Tasa video → review (%)' },
      { key: 'tasa_review_a_aprobado', label: 'Tasa review → aprobado (%)' },
      { key: 'tasa_registro_a_aprobado', label: 'Tasa registro → aprobado (%)' },
      { key: 'tasa_rechazo_implicita_kyc', label: 'Tasa rechazo implícita KYC (%)' },
      { key: 'mediana_dias_registro_a_full', label: 'Mediana días registro → full' },
      { key: 'pct_perfil_conservador', label: '% perfil conservador' },
      { key: 'pct_perfil_arriesgado', label: '% perfil arriesgado' },
      { key: 'full_users_aprobados', label: 'Full users aprobados' },
    ],
  },
  {
    title: 'Canales',
    fields: [
      { key: 'push_mail_delivered_pre_deposito', label: 'Entregados pre-depósito' },
      { key: 'push_mail_converted_pre_deposito', label: 'Convertidos pre-depósito' },
    ],
  },
  {
    title: 'Soporte',
    fields: [
      { key: 'cx_friccion_kyc', label: 'CX fricción KYC' },
      { key: 'cx_bloqueos', label: 'CX bloqueos' },
    ],
  },
  {
    title: 'Macro',
    fields: [
      { key: 'tasa_intervencion_mensual', label: 'Tasa intervención mensual (%)' },
      { key: 'trm', label: 'TRM' },
      { key: 'variacion_colcap', label: 'Variación COLCAP (%)' },
    ],
  },
  {
    title: 'Resultado real',
    description: 'Opcional — completar cuando se conozca el valor real de esta semana',
    fields: [
      { key: 'usuarios_primer_cashin', label: 'Primer cash-in real' },
      { key: 'intervencion_kepler', label: 'Intervención Kepler (0 = no · 1 = sí)' },
    ],
  },
]

type FormValues = Record<string, string>

type PageState = 'loading' | 'has_data' | 'empty'

export default function IngresarPage() {
  const router = useRouter()
  const [pageState, setPageState] = useState<PageState>('loading')
  const [semanaActual, setSemanaActual] = useState('')  // semana que ya está en ultima_semana
  const [semana, setSemana] = useState('')
  const [form, setForm] = useState<FormValues>({})
  const [archiving, setArchiving] = useState(false)
  const [saving, setSaving] = useState(false)
  const [predicting, setPredicting] = useState(false)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  useEffect(() => {
    api
      .getUltimaSemana()
      .then(data => {
        const s = (data.semana as string) ?? ''
        if (s) {
          setSemanaActual(s)
          setSemana(s)
          const vals: FormValues = {}
          for (const [k, v] of Object.entries(data)) {
            if (k !== 'semana' && k !== 'id') vals[k] = v != null ? String(v) : ''
          }
          setForm(vals)
          setPageState('has_data')
        } else {
          setPageState('empty')
        }
      })
      .catch(() => setPageState('empty'))
  }, [])

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  // Archiva semana actual → master y limpia el form para la semana nueva
  async function handleNuevaProyeccion() {
    const ok = confirm(
      `¿Archivar la semana ${semanaActual} en master_consolidado_final y abrir la semana nueva?`
    )
    if (!ok) return
    setArchiving(true)
    setMsg(null)
    try {
      const res = await api.nuevaProyeccion()
      localStorage.setItem('kepler-projection-reset', '1')
      setSemanaActual('')
      setSemana('')
      setForm({})
      setPageState('empty')
      setMsg({ type: 'ok', text: `Semana ${res.semana_archivada} archivada. Ingresá los datos de la semana nueva.` })
    } catch (err) {
      setMsg({ type: 'err', text: err instanceof Error ? err.message : 'Error al archivar' })
    } finally {
      setArchiving(false)
    }
  }

  async function buildPayload() {
    if (!semana.trim()) {
      setMsg({ type: 'err', text: 'La semana es obligatoria (DD/MM/YYYY)' })
      return null
    }
    const payload: Record<string, unknown> = { semana: semana.trim() }
    for (const [k, v] of Object.entries(form)) {
      if (v !== '') payload[k] = Number(v)
    }
    return payload
  }

  async function handleSave() {
    const payload = await buildPayload()
    if (!payload) return
    setSaving(true)
    setMsg(null)
    try {
      await api.saveUltimaSemana(payload)
      setMsg({ type: 'ok', text: 'Datos guardados correctamente.' })
    } catch (err) {
      setMsg({ type: 'err', text: err instanceof Error ? err.message : 'Error al guardar' })
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveAndPredict() {
    const payload = await buildPayload()
    if (!payload) return
    setPredicting(true)
    setMsg(null)
    try {
      await api.saveUltimaSemana(payload)
      await api.predict()          // guarda resultado en prediction_results
      router.push('/app/predecir')
    } catch (err) {
      setMsg({ type: 'err', text: err instanceof Error ? err.message : 'Error al proyectar' })
      setPredicting(false)
    }
  }

  if (pageState === 'loading') {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-neutral-500 animate-pulse">Cargando datos...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Datos de la semana</h1>
          <p className="text-neutral-400 text-sm mt-1">
            {pageState === 'has_data'
              ? `Semana actual en sistema: ${semanaActual}`
              : 'No hay datos para la semana actual — ingresá los datos nuevos'}
          </p>
        </div>

        {/* Botón "Nueva proyección" — solo visible cuando ya hay datos */}
        {pageState === 'has_data' && (
          <button
            onClick={handleNuevaProyeccion}
            disabled={archiving}
            className="shrink-0 bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 text-white font-medium rounded-lg px-4 py-2.5 text-sm transition-colors flex items-center gap-2"
          >
            {archiving ? (
              <span className="animate-pulse">Archivando...</span>
            ) : (
              <>
                <span>↗</span>
                Nueva proyección
              </>
            )}
          </button>
        )}
      </div>

      {/* Info banner cuando hay datos en sistema */}
      {pageState === 'has_data' && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
          <p className="text-amber-300 text-sm">
            <strong>Es domingo?</strong> Hacé click en &quot;Nueva proyección&quot; para archivar la semana{' '}
            <strong>{semanaActual}</strong> e ingresar los datos de la semana nueva.
          </p>
        </div>
      )}

      {/* Semana */}
      <div className="mb-6 bg-neutral-900 border border-neutral-800 rounded-xl p-5">
        <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
          Semana
        </label>
        <input
          value={semana}
          onChange={e => setSemana(e.target.value)}
          placeholder="04/05/2026"
          className="bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-white text-sm w-52 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <p className="text-neutral-500 text-xs mt-2">Formato DD/MM/YYYY — fecha de inicio de la semana</p>
      </div>

      {/* Field groups */}
      <div className="space-y-5">
        {GROUPS.map(group => (
          <section key={group.title} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <h2 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
              {group.title}
            </h2>
            {group.description && (
              <p className="text-neutral-500 text-xs mb-3">{group.description}</p>
            )}
            <div className="grid grid-cols-2 gap-3 mt-3">
              {group.fields.map(f => (
                <div key={f.key}>
                  <label className="block text-xs text-neutral-400 mb-1">{f.label}</label>
                  <input
                    type="number"
                    step="any"
                    value={form[f.key] ?? ''}
                    onChange={e => set(f.key, e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button
          onClick={handleSaveAndPredict}
          disabled={saving || predicting}
          className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-semibold rounded-lg px-6 py-2.5 text-sm transition-colors"
        >
          {predicting ? 'Guardando y proyectando...' : 'Guardar y proyectar →'}
        </button>
        <button
          onClick={handleSave}
          disabled={saving || predicting}
          className="bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 text-white font-medium rounded-lg px-5 py-2.5 text-sm transition-colors"
        >
          {saving ? 'Guardando...' : 'Solo guardar'}
        </button>
        {msg && (
          <p className={`text-sm ${msg.type === 'ok' ? 'text-emerald-400' : 'text-red-400'}`}>
            {msg.text}
          </p>
        )}
      </div>

      {predicting && (
        <p className="text-neutral-500 text-xs mt-3 animate-pulse">
          Corriendo pipeline ML + SHAP... puede tardar ~30 segundos
        </p>
      )}
    </div>
  )
}
