import { HTTPError } from 'ky'

interface ApiErrorResponse {
  message?: unknown
}

export async function getApiErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof HTTPError)) return fallback

  try {
    const payload = await error.response.json<ApiErrorResponse>()
    return typeof payload.message === 'string' && payload.message.trim() ? payload.message.trim() : fallback
  } catch {
    return fallback
  }
}
