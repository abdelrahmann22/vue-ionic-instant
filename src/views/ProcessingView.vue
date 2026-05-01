<template>
  <ion-page>
    <ion-content :scroll-y="true" style="--background: #FAFAFA;">
      <div :style="container">
        <div :style="iconWrap">
          <div :style="spinnerLarge" />
          <AppIcon name="credit-card" :size="32" color="#2D6A4F" :stroke-width="2" />
        </div>

        <h1 style="font-size:22px; font-weight:700; margin:14px 0 6px; letter-spacing:-0.02em; text-align:center;">
          {{ statusText }}
        </h1>
        <p style="font-size:14px; color:#6B7280; text-align:center; margin:0 0 24px; max-width:320px;">
          {{ subText }}
        </p>

        <div v-if="!done" style="display:flex; flex-direction:column; gap:10px; width:100%; max-width:320px;">
          <button :style="primaryBtn" @click="checkNow" :disabled="checking">
            <template v-if="checking"><div :style="spinnerSm" /> Checking…</template>
            <template v-else>I paid — check status</template>
          </button>

          <button :style="secondaryBtn" @click="cancel">
            Cancel and go back
          </button>
        </div>

        <div v-if="!done" :style="hint">
          We'll auto-detect your payment within a few seconds after you complete it on Stripe's page.
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { IonPage, IonContent, toastController } from '@ionic/vue'
import { Browser } from '@capacitor/browser'
import { Capacitor } from '@capacitor/core'
import { useBillStore } from '@/stores/bills'
import { useBillSocket } from '@/composables/useBillSocket'
import type { PaymentCancelledData } from '@/composables/useBillSocket'
import AppIcon from '@/components/AppIcon.vue'

const route = useRoute()
const router = useRouter()
const store = useBillStore()
const { connect, disconnect } = useBillSocket()

const amountPaid = parseFloat(String(route.query.amount ?? '0'))

const done = ref(false)
const checking = ref(false)
let pollHandle: number | null = null

const statusText = computed(() => {
  if (done.value) return 'Payment confirmed!'
  return 'Waiting for payment…'
})

const subText = computed(() => {
  if (done.value) return 'Redirecting to your receipt…'
  return `Complete your payment of $${amountPaid.toFixed(2)} on the Stripe page that just opened. We'll detect it automatically.`
})

function startSocket() {
  if (!store.activeBill) return
  connect(store.activeBill.id, store.activeBill.token, {
    onPaymentSucceeded() {
      if (!done.value) onSuccess()
    },
    async onPaymentCancelled(data: PaymentCancelledData) {
      if (done.value) return
      // Stripe session expired or another frontend cancelled the payment
      stopPolling()
      const t = await toastController.create({
        message: 'Payment session expired. You can try again.',
        duration: 3000, position: 'bottom', color: 'dark',
      })
      await t.present()
      const billId = store.activeBill?.id
      router.replace(`/payment/cancel?bill_id=${billId ?? ''}`)
    },
  })
}

function startPolling() {
  stopPolling()
  // Fallback poll at 10s interval (socket handles real-time)
  pollHandle = window.setInterval(checkStatus, 10000)
  checkStatus()
}

function stopPolling() {
  if (pollHandle != null) {
    clearInterval(pollHandle)
    pollHandle = null
  }
}

async function checkStatus() {
  if (done.value || !store.activeBill) return
  try {
    await store.loadPayments()
    const billId = store.activeBill.id
    const succeeded = store.payments.find(
      (p) => p.billId === billId && p.rawStatus === 'succeeded'
    )
    if (succeeded) onSuccess()
  } catch {
    /* ignore transient errors */
  }
}

async function checkNow() {
  if (done.value) return
  checking.value = true
  try {
    await store.loadPayments()
    const billId = store.activeBill?.id
    if (!billId) return
    const succeeded = store.payments.find(
      (p) => p.billId === billId && p.rawStatus === 'succeeded'
    )
    if (succeeded) {
      onSuccess()
    } else {
      const t = await toastController.create({
        message: 'Not confirmed yet. Stripe webhooks usually take a few seconds.',
        duration: 2200, position: 'bottom', color: 'dark',
      })
      await t.present()
    }
  } finally {
    checking.value = false
  }
}

async function onSuccess() {
  done.value = true
  stopPolling()
  store.pendingPaymentId = null
  const billId = store.activeBill?.id
  const succeeded = store.payments.find(
    (p) => p.billId === billId && p.rawStatus === 'succeeded'
  )
  if (succeeded) store.buildReceipt(succeeded)
  if (Capacitor.isNativePlatform()) {
    try { await Browser.close() } catch { /* ignore */ }
  }
  setTimeout(() => router.replace('/receipt'), 600)
}

async function cancel() {
  stopPolling()
  if (Capacitor.isNativePlatform()) {
    try { await Browser.close() } catch { /* ignore */ }
  }
  const billId = store.activeBill?.id
  try {
    await store.cancelPendingPayment()
  } catch {
    // best-effort; user may have already closed the tab
  }
  router.replace(`/payment/cancel?bill_id=${billId ?? ''}`)
}

onMounted(() => {
  // Stripe was opened by PaymentSheet right after the user tapped "Pay".
  // Socket provides real-time confirmation; fallback poll every 10s.
  startSocket()
  startPolling()
})

onBeforeUnmount(() => {
  stopPolling()
  disconnect()
})

const container = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '40px 24px' }
const iconWrap = { width: '88px', height: '88px', borderRadius: '50%', background: '#D8F3DC', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }
const spinnerLarge = { position: 'absolute', inset: '-4px', borderRadius: '50%', border: '3px solid transparent', borderTopColor: '#2D6A4F', animation: 'spn 1.2s linear infinite' }
const primaryBtn = { width: '100%', height: '52px', borderRadius: '12px', background: '#1C1C1E', color: '#fff', border: 'none', fontFamily: 'inherit', fontSize: '15px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }
const secondaryBtn = { width: '100%', height: '48px', borderRadius: '12px', background: 'transparent', color: '#6B7280', border: '1px solid #E5E7EB', fontFamily: 'inherit', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }
const hint = { marginTop: '20px', fontSize: '12px', color: '#9CA3AF', textAlign: 'center', maxWidth: '320px', lineHeight: '1.5' }
const spinnerSm = { width: '14px', height: '14px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spn 700ms linear infinite' }
</script>

<style>
@keyframes spn { to { transform: rotate(360deg); } }
</style>
