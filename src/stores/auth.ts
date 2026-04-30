import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/authService'
import { getToken } from '@/services/api'
import type { AuthUser } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const ready = ref(false)

  const isAuthenticated = computed(() => !!user.value)

  async function init() {
    if (ready.value) return
    const token = await getToken()
    if (token) {
      // We have a token but no user details — keep user null and let routes that need
      // user info refetch. For MVP we just mark authenticated.
      user.value = user.value ?? { id: 0, username: null, email: '' }
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
