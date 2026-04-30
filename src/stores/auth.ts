import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/authService'
import { getToken, getStoredUser, clearToken, clearStoredUser } from '@/services/api'
import type { AuthUser } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const ready = ref(false)

  const isAuthenticated = computed(() => !!user.value)

  async function init() {
    if (ready.value) return
    const token = await getToken()
    if (token) {
      const stored = await getStoredUser()
      if (stored) {
        user.value = stored
      } else {
        // Stale token from a session before user persistence existed (or storage was cleared).
        // Force a clean state so the user re-logs in instead of seeing "Guest".
        await clearToken()
        await clearStoredUser()
      }
    }
    ready.value = true
  }

  async function login(email: string, password: string) {
    const res = await authService.login(email, password)
    user.value = res.user
  }

  async function signup(username: string, email: string, password: string) {
    const res = await authService.signup(username, email, password)
    user.value = res.user
  }

  async function logout() {
    await authService.logout()
    user.value = null
  }

  return { user, ready, isAuthenticated, init, login, signup, logout }
})
