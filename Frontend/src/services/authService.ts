const AUTH_BASE_URL = (import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8765').replace(/\/+$/, '')

type ErrorPayload = {
  message?: string
  error?: string
  validationErrors?: Record<string, string>
}

function getErrorMessage(payload: unknown, fallback: string) {
  if (typeof payload === 'string' && payload.trim()) {
    return payload
  }

  if (typeof payload === 'object' && payload !== null) {
    const error = payload as ErrorPayload
    const validationMessages = error.validationErrors
      ? Object.values(error.validationErrors).filter(Boolean).join(' ')
      : ''
    return validationMessages || error.message || error.error || fallback
  }

  return fallback
}

async function request(path: string, init?: RequestInit, retries = 2, delayMs = 1200) {
  let response: Response | undefined
  let networkFailed = false

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      networkFailed = false
      response = await fetch(`${AUTH_BASE_URL}${path}`, {
        ...init,
        headers: {
          Accept: 'application/json, text/plain',
          ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
          ...init?.headers,
        },
      })
      // If service is temporarily warming up (502, 503, 504), wait and retry
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
    throw new Error(`Unable to connect to the banking core at ${AUTH_BASE_URL}. The services may be initializing, please try again in a few moments.`)
  }

  const responseText = await response.text()
  let payload: unknown = responseText
  if (responseText) {
    try {
      payload = JSON.parse(responseText) as unknown
    } catch {
      payload = responseText
    }
  }

  if (!response.ok) {
    throw new Error(getErrorMessage(payload, `Authentication request failed (${response.status}).`))
  }

  return payload
}

function getResponseText(payload: unknown) {
  if (typeof payload === 'string') {
    return payload.trim()
  }
  if (typeof payload === 'object' && payload !== null && 'token' in payload) {
    const token = payload.token
    if (typeof token === 'string') {
      return token.trim()
    }
  }
  throw new Error('The authentication service returned an unexpected response.')
}

export async function registerAdmin(username: string, password: string, email?: string) {
  const cleanUsername = username.trim()
  const cleanEmail = email?.trim() || `${cleanUsername.replace(/[^a-zA-Z0-9._-]/g, '').toLowerCase() || 'admin'}@bank.com`
  await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: cleanUsername,
      email: cleanEmail,
      password: password,
    }),
  })
}

export async function getAuthToken(username: string, password: string) {
  const payload = await request('/auth/token', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
  const token = getResponseText(payload).replace(/^"|"$/g, '')
  if (!token) {
    throw new Error('The authentication service returned an empty token.')
  }
  return token
}

export async function validateAuthToken(token: string) {
  const query = new URLSearchParams({ token })
  const payload = await request(`/auth/validate?${query.toString()}`)
  if (getResponseText(payload) !== 'Token is valid') {
    throw new Error('The authentication service did not confirm the token.')
  }
}

export async function checkGatewayOnline(): Promise<boolean> {
  try {
    const res = await fetch(`${AUTH_BASE_URL}/actuator/health`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    })
    return res.status < 500
  } catch {
    return false
  }
}
