/**
 * Verificación/creación del bucket de storage: se gestionará desde el backend.
 * Conectar a POST /api/storage/ensure-bucket (o equivalente) cuando el backend exponga el endpoint.
 */

'use server'

export async function ensureStorageBucket(): Promise<{ success: boolean; error?: string }> {
  return {
    success: true,
    error: undefined,
  }
}
