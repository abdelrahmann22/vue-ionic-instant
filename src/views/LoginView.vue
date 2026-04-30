<template>
  <ion-page>
    <ion-content :scroll-y="true" style="--background: #FAFAFA;">
      <div :style="container">
        <!-- Brand -->
        <div style="text-align:center; margin-bottom:32px;">
          <div :style="logoBubble">
            <AppIcon name="scan-line" :size="32" color="#fff" :stroke-width="2" />
          </div>
          <h1 style="font-size:28px; font-weight:700; margin:0; letter-spacing:-0.03em;">Welcome back</h1>
          <p style="font-size:14px; color:#6B7280; margin:6px 0 0;">Log in to continue splitting bills</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="onSubmit" style="display:flex; flex-direction:column; gap:14px;">
          <label :style="fieldLabel">
            <span :style="labelText">Email</span>
            <input
              v-model="email"
              type="email"
              autocomplete="email"
              inputmode="email"
              placeholder="you@example.com"
              :style="inputStyle"
              required
            />
          </label>

          <label :style="fieldLabel">
            <span :style="labelText">Password</span>
            <input
              v-model="password"
              type="password"
              autocomplete="current-password"
              placeholder="Enter your password"
              :style="inputStyle"
              required
            />
          </label>

          <div v-if="errorMsg" :style="errorBox">{{ errorMsg }}</div>

          <button type="submit" :style="primaryBtn" :disabled="submitting">
            <template v-if="submitting">
              <div :style="spinner" /> Logging in…
            </template>
            <template v-else>Log in</template>
          </button>
        </form>

        <!-- Footer -->
        <div style="text-align:center; margin-top:24px; font-size:13px; color:#6B7280;">
          New to Instant?
          <router-link to="/signup" style="color:#2D6A4F; font-weight:600; text-decoration:none; margin-left:4px;">
            Create account
          </router-link>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<style>
@keyframes spn { to { transform: rotate(360deg); } }
</style>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { IonPage, IonContent, toastController } from '@ionic/vue'
import { useAuthStore } from '@/stores/auth'
import { useBillStore } from '@/stores/bills'
import { extractErrorMessage } from '@/services/api'
import AppIcon from '@/components/AppIcon.vue'

const router = useRouter()
const authStore = useAuthStore()
const billStore = useBillStore()

const email = ref('')
const password = ref('')
const errorMsg = ref('')
const submitting = ref(false)

async function onSubmit() {
  errorMsg.value = ''
  submitting.value = true
  try {
    await authStore.login(email.value.trim(), password.value)
    await billStore.loadPayments()
    const toast = await toastController.create({
      message: 'Logged in', duration: 1500, position: 'top', color: 'dark',
    })
    await toast.present()
    router.replace('/tabs/home')
  } catch (e) {
    errorMsg.value = extractErrorMessage(e)
  } finally {
    submitting.value = false
  }
}

// Styles
const container = { padding: '64px 24px 40px', maxWidth: '420px', margin: '0 auto' }
const logoBubble = { width: '64px', height: '64px', borderRadius: '20px', background: '#1C1C1E', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', boxShadow: '0 8px 24px rgba(28,28,30,0.20)' }
const fieldLabel = { display: 'flex', flexDirection: 'column', gap: '6px' }
const labelText = { fontSize: '12px', fontWeight: '600', color: '#6B7280', letterSpacing: '0.02em', textTransform: 'uppercase' }
const inputStyle = { width: '100%', height: '52px', borderRadius: '12px', border: '1px solid #E5E7EB', background: '#FFFFFF', padding: '0 16px', fontFamily: 'inherit', fontSize: '15px', color: '#1A1A1A', outline: 'none' }
const primaryBtn = { width: '100%', height: '52px', borderRadius: '12px', background: '#1C1C1E', color: '#fff', border: 'none', fontFamily: 'inherit', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', letterSpacing: '-0.01em' }
const errorBox = { background: '#FEE2E2', color: '#DC2626', borderRadius: '10px', padding: '10px 12px', fontSize: '13px', fontWeight: '500' }
const spinner = { width: '16px', height: '16px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spn 700ms linear infinite' }
</script>
