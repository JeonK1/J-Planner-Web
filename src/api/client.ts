import { MESSAGES } from '@/constants'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

export const AUTH_EVENT_KEY = Symbol('auth-session-expired')

export class ApiError extends Error {
  code: string
  status: number
  retryAfter?: number

  constructor(code: string, message: string, status: number, retryAfter?: number) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
    this.retryAfter = retryAfter
  }
}

export class NetworkError extends Error {
  constructor(message = MESSAGES.error.network) {
    super(message)
    this.name = 'NetworkError'
  }
}

const STATUS_MESSAGE_MAP: Record<number, string> = {
  400: '잘못된 요청입니다.',
  401: '인증에 실패했습니다.',
  403: '세션이 만료되었습니다.',
  404: '요청한 리소스를 찾을 수 없습니다.',
  429: MESSAGES.error.tooManyRequests,
}

function getSafeErrorMessage(status: number): string {
  if (status >= 500) return MESSAGES.error.serverError
  return STATUS_MESSAGE_MAP[status] ?? MESSAGES.error.unknown
}

export function dispatchSessionExpired() {
  window.dispatchEvent(new CustomEvent('auth:session-expired', { detail: AUTH_EVENT_KEY }))
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {}
  if (body) {
    headers['Content-Type'] = 'application/json'
  }

  let res: Response
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new NetworkError()
  }

  if (!res.ok) {
    let code = 'UNKNOWN_ERROR'
    try {
      const err = await res.json()
      code = err.code ?? code
    } catch {
      // JSON 파싱 실패 시 기본 에러 코드 사용
    }
    if (res.status === 403) {
      dispatchSessionExpired()
    }
    const retryAfter = res.status === 429
      ? Number(res.headers.get('Retry-After')) || undefined
      : undefined
    throw new ApiError(code, getSafeErrorMessage(res.status), res.status, retryAfter)
  }

  if (res.status === 204) {
    return undefined as T
  }

  return res.json()
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  del: <T>(path: string) => request<T>('DELETE', path),
}
