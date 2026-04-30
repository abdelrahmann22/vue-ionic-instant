<template>
  <ion-content style="--background: #FFFFFF;">
    <div style="padding:14px 16px 28px; display:flex; flex-direction:column; gap:14px;">
      <div style="width:40px; height:4px; border-radius:2px; background:#E5E7EB; margin:0 auto 4px;" />

      <!-- Header -->
      <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(216,243,220,0.7); padding:12px 16px; border-radius:14px;">
        <div>
          <div style="font-size:14px; font-weight:700; letter-spacing:-0.01em;">{{ bill.title }}</div>
          <div style="font-size:12px; color:#6B7280; margin-top:1px;">Remaining: {{ symbol }}{{ bill.remaining.toFixed(2) }}</div>
        </div>
        <button @click="$emit('close')" style="width:32px;height:32px;border-radius:50%;background:#FFFFFF;border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;">
          <AppIcon name="x" :size="16" color="#1A1A1A" :stroke-width="2" />
        </button>
      </div>

      <!-- Amount display -->
      <div style="text-align:center; padding:8px 0 0;">
        <div style="font-size:44px; font-weight:700; letter-spacing:-0.04em; color:#1A1A1A; line-height:1; font-variant-numeric:tabular-nums;">
          <span :style="{ color: amount === '' ? '#9CA3AF' : '#1A1A1A', marginRight: '4px' }">{{ symbol }}</span>
          <span :style="{ color: amount === '' ? '#9CA3AF' : '#1A1A1A' }">{{ display }}</span>
        </div>
        <div style="font-size:11px; color:#9CA3AF; margin-top:8px; letter-spacing:0.04em; text-transform:uppercase;">{{ bill.currency.toUpperCase() }} · Instant pay</div>
      </div>

      <!-- Validation hint -->
      <div v-if="overpay" style="text-align:center; font-size:12px; color:#DC2626; font-weight:500;">
        Amount exceeds remaining ({{ symbol }}{{ bill.remaining.toFixed(2) }})
      </div>

      <!-- Quick amounts -->
      <div style="display:flex; gap:8px; justify-content:center; flex-wrap:wrap;">
        <button
          v-for="q in quickAmounts"
          :key="q.label"
          :style="chipBtn"
          @click="amount = q.value.toFixed(2)"
        >
          {{ q.label }} · {{ symbol }}{{ q.value.toFixed(2) }}
        </button>
      </div>

      <!-- Numpad -->
      <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-top:4px;">
        <button v-for="n in [1,2,3,4,5,6,7,8,9]" :key="n" class="key-btn" :style="numKey" @click="press(String(n))">{{ n }}</button>
        <button class="key-btn" :style="numKey" @click="press('.')">·</button>
        <button class="key-btn" :style="numKey" @click="press('0')">0</button>
        <button class="key-btn" :style="numKey" @click="press('del')">
          <AppIcon name="delete" :size="20" color="#fff" :stroke-width="2" />
        </button>
      </div>

      <!-- Error -->
      <div v-if="errorMsg" style="background:#FEE2E2; color:#DC2626; padding:10px 12px; border-radius:10px; font-size:13px; font-weight:500; text-align:center;">
        {{ errorMsg }}
      </div>

      <!-- Pay CTA -->
      <button :style="payBtn" :disabled="!canPay || initiating" @click="handlePay">
        <template v-if="initiating">
          <div :style="spinner" />
          Connecting to Stripe…
        </template>
        <template v-else>
          <AppIcon name="shield" :size="16" color="#fff" :stroke-width="2" />
          Pay {{ symbol }}{{ (numericAmount || 0).toFixed(2) }}
        </template>
      </button>
    </div>
  </ion-content>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { IonContent } from '@ionic/vue'
import { Browser } from '@capacitor/browser'
import { Capacitor } from '@capacitor/core'
import type { BillDetail } from '@/types'
import { useBillStore } from '@/stores/bills'
import { currencySymbol } from '@/services/billService'
import { extractErrorMessage } from '@/services/api'
import AppIcon from '@/components/AppIcon.vue'

const props = defineProps<{ bill: BillDetail; merchant?: string }>()
const emit = defineEmits<{ close: []; initiated: [checkoutUrl: string, amount: number] }>()

const store = useBillStore()
const amount = ref('')
const initiating = ref(false)
const errorMsg = ref('')

const display = computed(() => amount.value === '' ? '0.00' : amount.value)
const numericAmount = computed(() => parseFloat(amount.value) || 0)
const symbol = computed(() => currencySymbol(props.bill.currency))
const overpay = computed(() => numericAmount.value > props.bill.remaining + 0.0001)
const canPay = computed(() => numericAmount.value > 0 && !overpay.value)

const quickAmounts = computed(() => {
  const out: { label: string; value: number }[] = []
  out.push({ label: 'Full', value: props.bill.remaining })
  if (props.bill.amount > 0) {
    const half = +(props.bill.amount / 2).toFixed(2)
    if (half <= props.bill.remaining && half > 0) out.push({ label: '1/2', value: half })
    const third = +(props.bill.amount / 3).toFixed(2)
    if (third <= props.bill.remaining && third > 0 && third !== half) out.push({ label: '1/3', value: third })
  }
  return out
})

function press(k: string) {
  if (initiating.value) return
  errorMsg.value = ''
  if (k === 'del') { amount.value = amount.value.slice(0, -1); return }
  if (k === '.') {
    if (amount.value.includes('.')) return
    amount.value = amount.value === '' ? '0.' : amount.value + '.'
    return
  }
  if (amount.value.includes('.')) {
    const dec = amount.value.split('.')[1] ?? ''
    if (dec.length >= 2) return
  }
  if (amount.value.replace('.', '').length >= 7) return
  amount.value += k
}

async function handlePay() {
  if (!canPay.value) return
  errorMsg.value = ''
  initiating.value = true

  // On web, open a blank tab synchronously to capture the user gesture.
  // We'll redirect it to Stripe once we have the checkout URL.
  const isNative = Capacitor.isNativePlatform()
  let popup: Window | null = null
  if (!isNative) {
    popup = window.open('', '_blank')
  }

  try {
    const checkoutUrl = await store.initiatePayment(numericAmount.value)
    if (isNative) {
      await Browser.open({ url: checkoutUrl, presentationStyle: 'popover' })
    } else if (popup && !popup.closed) {
      popup.location.href = checkoutUrl
    } else {
      // Popup blocked — fall back to navigating the current tab
      window.location.href = checkoutUrl
      return
    }
    emit('initiated', checkoutUrl, numericAmount.value)
  } catch (e) {
    if (popup && !popup.closed) popup.close()
    errorMsg.value = extractErrorMessage(e)
  } finally {
    initiating.value = false
  }
}

const numKey = { height: '56px', borderRadius: '14px', background: '#2C2C2E', color: '#fff', border: 'none', fontFamily: 'inherit', fontSize: '22px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: '-0.02em' }
const chipBtn = { padding: '7px 14px', borderRadius: '9999px', background: '#F3F4F6', border: '1px solid #E5E7EB', color: '#1A1A1A', fontFamily: 'inherit', fontSize: '12px', fontWeight: '600', cursor: 'pointer', letterSpacing: '-0.01em' }
const payBtn = computed(() => ({ width: '100%', height: '56px', borderRadius: '16px', background: canPay.value ? '#1C1C1E' : '#9CA3AF', color: '#fff', border: 'none', marginTop: '4px', fontFamily: 'inherit', fontSize: '15px', fontWeight: '600', cursor: canPay.value && !initiating.value ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', letterSpacing: '-0.01em', boxShadow: canPay.value ? '0 6px 20px rgba(28,28,30,0.30)' : 'none', transition: 'all 200ms' }))
const spinner = { width: '16px', height: '16px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spn 700ms linear infinite' }
</script>

<style>
@keyframes spn { to { transform: rotate(360deg); } }
.key-btn { transition: transform 80ms, background 120ms; }
.key-btn:active { transform: scale(0.94); background: #3a3a3c !important; }
</style>
