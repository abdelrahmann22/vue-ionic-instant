<template>
  <ion-page>
    <ion-content :scroll-y="true" style="--background: #FAFAFA;">
      <div :style="container">
        <div :style="iconWrap">
          <AppIcon name="x" :size="36" color="#DC2626" :stroke-width="2.5" />
        </div>

        <h1 style="font-size:22px; font-weight:700; margin:14px 0 6px; letter-spacing:-0.02em; text-align:center;">
          Payment cancelled
        </h1>
        <p style="font-size:14px; color:#6B7280; text-align:center; margin:0 0 24px; max-width:320px; line-height:1.5;">
          You cancelled the payment on Stripe. Your bill is still open — you can try again anytime.
        </p>

        <div style="display:flex; flex-direction:column; gap:10px; width:100%; max-width:320px;">
          <button :style="primaryBtn" @click="tryAgain">Try again</button>
          <button :style="secondaryBtn" @click="goHome">Back to home</button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { IonPage, IonContent } from '@ionic/vue'
import AppIcon from '@/components/AppIcon.vue'

const route = useRoute()
const router = useRouter()

const billId = computed(() => {
  const raw = route.query.bill_id
  const n = parseInt(String(raw ?? ''), 10)
  return Number.isFinite(n) ? n : null
})

function tryAgain() {
  if (billId.value) {
    router.replace(`/bill/${billId.value}`)
  } else {
    router.replace('/tabs/home')
  }
}

function goHome() {
  router.replace('/tabs/home')
}

const container = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '40px 24px' }
const iconWrap = { width: '88px', height: '88px', borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }
const primaryBtn = { width: '100%', height: '52px', borderRadius: '12px', background: '#1C1C1E', color: '#fff', border: 'none', fontFamily: 'inherit', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }
const secondaryBtn = { width: '100%', height: '48px', borderRadius: '12px', background: 'transparent', color: '#6B7280', border: '1px solid #E5E7EB', fontFamily: 'inherit', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }
</script>
