<template>
  <ion-page>
    <ion-content :scroll-y="true" style="--background: #FAFAFA;">
      <div :style="container">
        <!-- Animated icon -->
        <div :style="iconWrap">
          <template v-if="state === 'pending'">
            <div :style="spinnerLarge" />
            <AppIcon name="credit-card" :size="32" color="#2D6A4F" :stroke-width="2" />
          </template>
          <template v-else-if="state === 'timeout'">
            <AppIcon name="clock" :size="36" color="#D97706" :stroke-width="2" />
          </template>
          <template v-else>
            <AppIcon name="check" :size="36" color="#fff" :stroke-width="3" />
          </template>
        </div>

        <h1 style="font-size:22px; font-weight:700; margin:14px 0 6px; letter-spacing:-0.02em; text-align:center;">
          {{ headline }}
        </h1>
        <p style="font-size:14px; color:#6B7280; text-align:center; margin:0 0 24px; max-width:320px; line-height:1.5;">
          {{ subline }}
        </p>

        <div v-if="state === 'timeout'" style="display:flex; flex-direction:column; gap:10px; width:100%; max-width:320px;">
          <button :style="primaryBtn" @click="checkAgain" :disabled="checking">
            <template v-if="checking"><div :style="spinnerSm" /> Checking…</template>
            <template v-else>Check again</template>
          </button>
          <button :style="secondaryBtn" @click="goHome">Back to home</button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { IonPage, IonContent } from '@ionic/vue'
import { useBillStore } from '@/stores/bills'
import { useBillSocket } from '@/composables/useBillSocket'
import AppIcon from '@/components/AppIcon.vue'

const route = useRoute()
const router = useRouter()
const store = useBillStore()
const { connect, disconnect } = useBillSocket()

const billId = computed(() => {
  const raw = route.query.bill_id
  const n = parseInt(String(raw ?? ''), 10)
  return Number.isFinite(n) ? n : null
})

const state = ref<'pending' | 'timeout'>('pending')
const checking = ref(false)
const POLL_INTERVAL_MS = 10000
let timer: number | null = null

const headline = computed(() => {
  if (state.value === 'timeout') return 'Still confirming…'
  return 'Confirming your payment…'
})

const subline = computed(() => {
  if (state.value === 'timeout') return "We haven't received the confirmation yet. Stripe webhooks usually take a few seconds — try checking again."
  return "Hang tight — we're verifying with Stripe. This usually takes a few seconds."
})

async function tryFind(): Promise<boolean> {
  if (!billId.value) return false
  try {
    await store.loadPayments()
    const match = store.payments.find(
      (p) => p.billId === billId.value && p.rawStatus === 'succeeded'
    )
    if (match) {
      store.buildReceipt(match)
      router.replace('/receipt')
      return true
    }
  } catch {
    /* keep polling */
  }
  return false
}

async function poll() {
  const found = await tryFind()
  if (found) return
  timer = window.setTimeout(poll, POLL_INTERVAL_MS)
}

function stopTimer() {
  if (timer != null) {
    clearTimeout(timer)
    timer = null
  }
}

async function checkAgain() {
  checking.value = true
  try {
    await tryFind()
  } finally {
    checking.value = false
  }
}

function goHome() {
  router.replace('/tabs/home')
}

async function startSocket() {
  if (!billId.value) return
  // Need token from payment history to authenticate with the socket
  await store.loadPayments()
  const match = store.payments.find((p) => p.billId === billId.value)
  if (!match) return
  connect(billId.value, match.billToken, {
    onPaymentSucceeded() {
      tryFind()
    },
  })
}

onMounted(async () => {
  if (!billId.value) {
    // Missing bill_id — nothing to verify. Send user home.
    router.replace('/tabs/home')
    return
  }
  // Start socket for real-time confirmation + fallback poll
  await startSocket()
  poll()
})

onBeforeUnmount(() => {
  stopTimer()
  disconnect()
})

const container = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '40px 24px' }
const iconWrap = { width: '88px', height: '88px', borderRadius: '50%', background: '#D8F3DC', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }
const spinnerLarge = { position: 'absolute', inset: '-4px', borderRadius: '50%', border: '3px solid transparent', borderTopColor: '#2D6A4F', animation: 'spn 1.2s linear infinite' }
const primaryBtn = { width: '100%', height: '52px', borderRadius: '12px', background: '#1C1C1E', color: '#fff', border: 'none', fontFamily: 'inherit', fontSize: '15px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }
const secondaryBtn = { width: '100%', height: '48px', borderRadius: '12px', background: 'transparent', color: '#6B7280', border: '1px solid #E5E7EB', fontFamily: 'inherit', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }
const spinnerSm = { width: '14px', height: '14px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spn 700ms linear infinite' }
</script>

<style scoped>
@keyframes spn { to { transform: rotate(360deg); } }
</style>
