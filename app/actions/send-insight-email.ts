/**
 * Envío de insights por email: se gestionará desde el backend.
 * Conectar a POST /api/insights/send-email (o equivalente) cuando el backend exponga el endpoint.
 */

'use server'

export interface SendInsightEmailResult {
  success: boolean
  message?: string
  error?: string
}

export async function sendInsightByEmail(
  _insightId: string,
  _organizationId: string
): Promise<SendInsightEmailResult> {
  return {
    success: false,
    error: 'Envío de email pendiente de conectar al backend (POST /api/insights/send-email o equivalente).',
  }
}
