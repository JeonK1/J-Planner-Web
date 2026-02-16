import { MESSAGES } from '@/constants'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

export class ApiError extends Error {
  code: string
  status: number

  constructor(code: string, message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
  }
}

export class NetworkError extends Error {
  constructor(message = MESSAGES.error.network) {
    super(message)
    this.name = 'NetworkError'
  }
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
    let message = MESSAGES.error.unknown
    try {
      const err = await res.json()
      code = err.code ?? code
      message = err.message ?? message
    } catch {
      // JSON 파싱 실패 시 기본 에러 사용
    }
    if (res.status === 403) {
      window.dispatchEvent(new CustomEvent('auth:session-expired'))
    }
    throw new ApiError(code, message, res.status)
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
