/**
 * URL base del backend (kepler-backend). Definida en código.
 * Desarrollo: http://localhost:8000
 * Producción: https://api.iskepler.com
 */

const BACKEND_URL_DEV = 'http://localhost:8000';
const BACKEND_URL_PROD = 'https://api.iskepler.com';

export function getBackendUrl(): string {
  return process.env.NODE_ENV === 'production' ? BACKEND_URL_PROD : BACKEND_URL_DEV;
}
