import axios, { AxiosError, type AxiosInstance } from 'axios'
import { Preferences } from '@capacitor/preferences'
import type { AuthUser } from '@/types'

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

export async function getToken(): Promise<string | null> {
  const { value } = await Preferences.get({ key: TOKEN_KEY })
  return value
}

export async function setToken(token: string): Promise<void> {
  await Preferences.set({ key: TOKEN_KEY, value: token })
}

export async function clearToken(): Promise<void> {
  await Preferences.remove({ key: TOKEN_KEY })
}

export async function getStoredUser(): Promise<AuthUser | null> {
  const { value } = await Preferences.get({ key: USER_KEY })
  if (!value) return null
  try {
    return JSON.parse(value) as AuthUser
  } catch {
    return null
  }
}

export async function setStoredUser(user: AuthUser): Promise<void> {
  await Preferences.set({ key: USER_KEY, value: JSON.stringify(user) })
}

export async function clearStoredUser(): Promise<void> {
  await Preferences.remove({ key: USER_KEY })
}

const baseURL = import.meta.env.VITE_API_URL || 'https://nodejs-instant-api-production.up.railway.app'

export const api: AxiosInstance = axios.create({
  baseURL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(async (config) => {
  const token = await getToken()
  if (token) {
    config.headers = config.headers ?? {}
    ;(config.headers as Record<string, string>).Authorization = `Bearer ${token}`
  }
  return config
})

let onUnauthorized: (() => void) | null = null
export function setUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await clearToken()
      await clearStoredUser()
      onUnauthorized?.()
    }
    return Promise.reject(error)
  }
)

export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined
    if (data?.message) return data.message
    if (error.message === 'Network Error') return 'Check your internet connection'
    return error.message
  }
  return 'Something went wrong'
}
