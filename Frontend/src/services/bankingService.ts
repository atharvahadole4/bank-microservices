const API_BASE_URL = (import.meta.env.VITE_BANK_API_URL || 'http://localhost:8765').replace(/\/+$/, '')

export type CustomerRequest = {
  name: string
  email: string
  mobile: string
  dateOfBirth: string
  gender: 'MALE' | 'FEMALE' | 'OTHER'
  city: string
}

export type SavingsRequest = {
  customerId: number
  openingDate: string
  balance: number
}

type ApiError = {
  message?: string
  error?: string
  validationErrors?: Record<string, string>
}

async function request<T>(
  path: string,
  token: string,
  options: RequestInit = {},
  retries = 2,
  delayMs = 1200,
): Promise<T> {
  let response: Response | undefined
  let networkFailed = false

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      networkFailed = false
      response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
          Accept: 'application/json, text/plain',
          Authorization: `Bearer ${token}`,
          ...(options.body ? { 'Content-Type': 'application/json' } : {}),
          ...options.headers,
        },
      })
      if ((response.status === 502 || response.status === 503 || response.status === 504) && attempt < retries) {
        await new Promise(res => setTimeout(res, delayMs))
        continue
      }
      break
    } catch {
      networkFailed = true
      if (attempt < retries) {
        await new Promise(res => setTimeout(res, delayMs))
        continue
      }
    }
  }

  if (networkFailed || !response) {
    throw new Error(`Unable to connect to the banking gateway at ${API_BASE_URL}. The services may be initializing, please try again in a moment.`)
  }

  const text = await response.text()
  let body: unknown = text
  if (text) {
    try {
      body = JSON.parse(text) as unknown
    } catch {
      body = text
    }
  }

  if (!response.ok) {
    throw new Error(readApiError(body, `Banking request failed (${response.status}).`))
  }

  return body as T
}

function readApiError(body: unknown, fallback: string) {
  if (typeof body === 'string' && body.trim()) return body
  if (typeof body !== 'object' || body === null) return fallback

  const error = body as ApiError
  const validationErrors = error.validationErrors
    ? Object.values(error.validationErrors).filter(Boolean).join(' ')
    : ''
  return validationErrors || error.message || error.error || fallback
}

export function getCustomerProfile(token: string) {
  return request<unknown>('/api/v1/customers', token)
}

export function getCustomerById(token: string, customerId: number) {
  return request<unknown>(`/api/v1/customers/${customerId}`, token)
}

export function createCustomer(token: string, customer: CustomerRequest) {
  return request<unknown>('/api/v1/customers', token, {
    method: 'POST',
    body: JSON.stringify(customer),
  })
}

export function getCustomerSavingsSummary(token: string, customerId: number) {
  return request<unknown>(`/api/v1/customers/savings/${customerId}`, token)
}

export function getSavingsProfile(token: string) {
  return request<unknown>('/api/v1/savings', token)
}

export function getSavingsServicePort(token: string) {
  return request<unknown>('/api/v1/savings/port', token)
}

export function getSavingsPortFromCustomerService(token: string) {
  return request<unknown>('/api/v1/customers/savings/port', token)
}

export function createSavings(token: string, savings: SavingsRequest) {
  return request<unknown>('/api/v1/savings', token, {
    method: 'POST',
    body: JSON.stringify(savings),
  })
}
