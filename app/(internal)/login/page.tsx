'use client'
import { useActionState } from 'react'
import { login } from './actions'

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined)

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950">
      <div className="w-full max-w-sm px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/10 mb-4">
            <span className="text-amber-400 text-xl font-bold">K</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Kepler</h1>
          <p className="text-neutral-500 text-sm mt-1">Panel interno · Trii</p>
        </div>

        <form
          action={action}
          className="bg-neutral-900 rounded-xl p-8 border border-neutral-800 space-y-4"
        >
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5 uppercase tracking-wide">
              Usuario
            </label>
            <input
              name="username"
              type="text"
              autoComplete="username"
              required
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5 uppercase tracking-wide">
              Contraseña
            </label>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          {state?.error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-neutral-950 font-semibold rounded-lg py-2.5 text-sm transition-colors mt-2"
          >
            {pending ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </main>
  )
}
