import { api, setToken, clearToken, setStoredUser, clearStoredUser } from './api'

export interface AuthUser {
  id: number
  username: string | null
  email: string
}

export interface AuthResponse {
  token: string
  user: AuthUser
}

export const authService = {
  async signup(username: string, email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/api/auth/user/signup', { username, email, password })
    await setToken(data.token)
    await setStoredUser(data.user)
    return data
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/api/auth/user/login', { email, password })
    await setToken(data.token)
    await setStoredUser(data.user)
    return data
  },

  async logout(): Promise<void> {
    await clearToken()
    await clearStoredUser()
  },
}
