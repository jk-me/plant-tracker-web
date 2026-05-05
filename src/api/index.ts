import type { Plant, PlantFormData, Blooming, Photo, User } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

let csrfToken: string | null = null

function updateCsrfTokenFromResponse(response: Response): void {
  const token = response.headers.get('X-CSRF-Token') ?? response.headers.get('x-csrf-token')
  if (token) {
    csrfToken = token
  }
}

async function fetchCsrfToken(): Promise<string | null> {
  if (csrfToken) {
    return csrfToken
  }

  const response = await fetch(`${API_BASE_URL}/csrf_token`, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }))
    throw new Error(errorData.message ?? response.statusText)
  }

  const data = (await response.json()) as {
    csrf_token?: string
    csrfToken?: string
    token?: string
  }

  csrfToken = data.csrf_token ?? data.csrfToken ?? data.token ?? null
  return csrfToken
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method ?? 'GET').toUpperCase()
  const isMutating = !['GET', 'HEAD', 'OPTIONS'].includes(method)
  const token = isMutating ? await fetchCsrfToken() : null
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { 'X-CSRF-Token': token } : {}),
      ...options.headers,
    },
  })

  updateCsrfTokenFromResponse(response)

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }))
    throw new Error(errorData.message ?? response.statusText)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

// Auth
export async function login(email_address: string, password: string): Promise<{ user: User }> {
  return request<{ user: User }>('/login', {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({ user: { email_address, password } }),
  })
}

export function logout(): Promise<void> {
  return request<void>('/session', { method: 'DELETE' })
}

export function getCurrentUser(): Promise<{ user: User }> {
  return request<{ user: User }>('/session')
}

export function signUp(
  email_address: string,
  password: string,
  password_confirmation: string
): Promise<User> {
  return request<User>('/signup', {
    method: 'POST',
    body: JSON.stringify({
      user: { email_address, password, password_confirmation },
    }),
  })
}

// Plants
export function getPlants(): Promise<Plant[]> {
  return request<Plant[]>('/plants')
}

export function getPlant(id: number): Promise<Plant> {
  return request<Plant>(`/plants/${id}`)
}

export function createPlant(plant: Partial<PlantFormData>): Promise<Plant> {
  return request<Plant>('/plants', {
    method: 'POST',
    body: JSON.stringify({ plant }),
  })
}

export function updatePlant(id: number, plant: Partial<PlantFormData>): Promise<Plant> {
  return request<Plant>(`/plants/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ plant }),
  })
}

export function deletePlant(id: number): Promise<void> {
  return request<void>(`/plants/${id}`, { method: 'DELETE' })
}

// Bloomings
export function getBloomings(plantId: number): Promise<Blooming[]> {
  return request<Blooming[]>(`/plants/${plantId}/bloomings`)
}

// Photos
export function getPhotos(plantId: number): Promise<Photo[]> {
  return request<Photo[]>(`/plants/${plantId}/photos`)
}
