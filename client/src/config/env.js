/**
 * Client environment configuration — deployment-safe.
 *
 * In development: Vite proxy handles /api → localhost:5000
 * In production:  Uses VITE_API_URL env var, or falls back to
 *                 same-origin (frontend & backend on same domain)
 */
export const getApiUrl = () => {
  // If VITE_API_URL is explicitly set, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // In development, use empty string (Vite proxy handles /api routes)
  if (import.meta.env.DEV) {
    return '';
  }

  // In production, use same origin (backend served from same domain)
  return '';
};
