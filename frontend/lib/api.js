/**
 * Centralized API configuration.
 *
 * All components should import route URLs from here instead of
 * constructing them inline from multiple env vars.
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

export const API_ROUTES = {
  PREVIEW: `${BACKEND_URL}/preview`,
  ANALYSIS: `${BACKEND_URL}/analysis`,
  ANALYTICS: `${BACKEND_URL}/analytics`,
}

export default BACKEND_URL
