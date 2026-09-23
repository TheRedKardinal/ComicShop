import type { ApiErrorBody } from '../types'

export function getApiErrorMessage(error: unknown, fallback = 'Qualcosa è andato storto. Riprova.'): string {
  if (!error || typeof error !== 'object') return fallback

  if ('status' in error) {
    const data = (error as { data?: ApiErrorBody }).data
    return data?.message ?? fallback
  }

  if ('message' in error && typeof (error as { message?: unknown }).message === 'string') {
    return (error as { message: string }).message
  }

  return fallback
}
