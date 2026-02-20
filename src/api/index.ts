import type { Plant, PlantFormData, Blooming, Photo, User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message ?? response.statusText);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

// Auth
export function login(email_address: string, password: string): Promise<User> {
  return request<User>('/login', {
    method: 'POST',
    body: JSON.stringify({ email_address, password }),
  });
}

export function logout(): Promise<void> {
  return request<void>('/session', { method: 'DELETE' });
}

export function signUp(email_address: string, password: string, password_confirmation: string): Promise<User> {
  return request<User>('/signup', {
    method: 'POST',
    body: JSON.stringify({ user: { email_address, password, password_confirmation } }),
  });
}

// Plants
export function getPlants(): Promise<Plant[]> {
  return request<Plant[]>('/plants');
}

export function getPlant(id: number): Promise<Plant> {
  return request<Plant>(`/plants/${id}`);
}

export function createPlant(plant: Partial<PlantFormData>): Promise<Plant> {
  return request<Plant>('/plants', {
    method: 'POST',
    body: JSON.stringify({ plant }),
  });
}

export function updatePlant(id: number, plant: Partial<PlantFormData>): Promise<Plant> {
  return request<Plant>(`/plants/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ plant }),
  });
}

export function deletePlant(id: number): Promise<void> {
  return request<void>(`/plants/${id}`, { method: 'DELETE' });
}

// Bloomings
export function getBloomings(plantId: number): Promise<Blooming[]> {
  return request<Blooming[]>(`/plants/${plantId}/bloomings`);
}

// Photos
export function getPhotos(plantId: number): Promise<Photo[]> {
  return request<Photo[]>(`/plants/${plantId}/photos`);
}
