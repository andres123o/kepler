'use server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export interface LoginState {
  error?: string
}

export async function login(
  _prev: LoginState | undefined,
  formData: FormData
): Promise<LoginState> {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  if (username === 'admin' && password === 'admintrii') {
    const cookieStore = await cookies()
    cookieStore.set('kepler-session', 'authenticated', {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
    })
    redirect('/app/ingresar')
  }

  return { error: 'Usuario o contraseña incorrectos' }
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('kepler-session')
  redirect('/login')
}
