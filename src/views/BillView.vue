<template>
  <ion-page>
    <ion-content :scroll-y="true" style="--background: #FAFAFA;">
      <div v-if="bill" style="min-height:100%; padding-bottom:160px; background:#FAFAFA;">

        <!-- Header -->
        <div style="padding:56px 16px 12px; display:flex; justify-content:space-between; align-items:center;">
          <button :style="circleBtn" @click="goBack">
            <AppIcon name="arrow-left" :size="18" color="#1A1A1A" :stroke-width="2" />
          </button>
          <div style="text-align:center;">
            <div style="font-size:11px; color:#9CA3AF; font-weight:500; letter-spacing:0.04em; text-transform:uppercase;">Bill #{{ bill.id }}</div>
          </div>
          <div :style="circleBtn" />
        </div>

        <!-- Hero card -->
        <div style="padding:8px 16px 0;">
          <div :style="heroCard">
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:16px;">
              <div :style="merchantIcon">
                <AppIcon name="utensils" :size="16" color="#2D6A4F" :stroke-width="2" />
              </div>
              <div style="flex:1;">
                <div style="font-size:16px; font-weight:700; letter-spacing:-0.02em;">{{ bill.title }}</div>
                <div style="font-size:12px; color:#6B7280; margin-top:1px;">
                  {{ store.activeBillMerchant || 'Merchant' }} · {{ formatDate(bill.createdAt) }}
                </div>
              </div>
              <StatusBadge :status="badgeStatus" />
            </div>

            <div style="border-top:1px solid #F3F4F6; padding-top:18px;">
              <div style="font-size:12px; color:#6B7280; font-weight:500; margin-bottom:6px; letter-spacing:0.02em; text-transform:uppercase;">Remaining</div>
              <div style="display:flex; align-items:baseline; gap:6px; margin-bottom:12px;">
                <span style="font-size:36px; font-weight:700; letter-spacing:-0.03em; color:#1A1A1A; line-height:1;">{{ symbol }}{{ bill.remaining.toFixed(2) }}</span>
                <span style="font-size:13px; color:#9CA3AF;">of {{ symbol }}{{ bill.amount.toFixed(2) }}</span>
              </div>
              <AppProgressBar :pct="progressPct" />
              <div style="display:flex; justify-content:space-between; font-size:12px; color:#6B7280; margin-top:8px;">
                <span><b style="color:#1A1A1A">{{ symbol }}{{ bill.paidAmount.toFixed(2) }}</b> collected</span>
                <span>{{ progressPct.toFixed(0) }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Items card -->
        <div v-if="bill.items.length > 0" style="padding:14px 16px 0;">
          <div style="background:#FFFFFF; border-radius:16px; padding:18px; border:1px solid #F3F4F6;">
            <div style="font-size:12px; font-weight:600; color:#6B7280; letter-spacing:0.04em; text-transform:uppercase; margin-bottom:12px;">Items</div>
            <div v-for="(item, i) in bill.items" :key="i" :style="itemRow(i < bill.items.length - 1)">
              <div style="display:flex; gap:10px; align-items:center;">
                <span style="font-size:12px; font-weight:600; color:#6B7280; background:#F3F4F6; padding:2px 7px; border-radius:6px;">{{ item.quantity }}×</span>
                <span style="font-size:14px; color:#1A1A1A; font-weight:500;">{{ item.title }}</span>
              </div>
              <span style="font-size:14px; font-weight:600; color:#1A1A1A; letter-spacing:-0.01em;">{{ symbol }}{{ Number(item.price).toFixed(2) }}</span>
            </div>
            <div style="border-top:1px solid #F3F4F6; margin-top:8px; padding-top:12px; display:flex; flex-direction:column; gap:6px;">
              <div v-if="bill.fees > 0" style="display:flex; justify-content:space-between; font-size:13px;">
                <span style="color:#6B7280;">Fees</span>
                <span style="color:#6B7280; font-weight:500;">{{ symbol }}{{ bill.fees.toFixed(2) }}</span>
              </div>
              <div style="border-top:1px solid #F3F4F6; margin-top:4px; padding-top:10px; display:flex; justify-content:space-between;">
                <span style="font-size:15px; font-weight:700; letter-spacing:-0.01em;">Total</span>
                <span style="font-size:17px; font-weight:700; letter-spacing:-0.02em;">{{ symbol }}{{ bill.amount.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Expiry warning -->
        <div v-if="isExpired" style="padding:14px 16px 0;">
          <div :style="warnBox">
            <AppIcon name="clock" :size="16" color="#DC2626" :stroke-width="2" />
            This bill has expired. You can no longer pay.
          </div>
        </div>
        <div v-else-if="isFullyPaid" style="padding:14px 16px 0;">
          <div :style="successBox">
            <AppIcon name="check" :size="16" color="#166534" :stroke-width="2.5" />
            This bill is fully paid.
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-else-if="store.loading" style="height:100%; display:flex; align-items:center; justify-content:center;">
        <div style="font-size:14px; color:#9CA3AF;">Loading bill…</div>
      </div>

      <!-- Error -->
      <div v-else style="height:100%; padding:80px 24px; display:flex; flex-direction:column; align-items:center; gap:14px;">
        <AppIcon name="x" :size="36" color="#9CA3AF" />
        <div style="font-size:15px; font-weight:600; color:#1A1A1A;">Bill not available</div>
        <div style="font-size:13px; color:#6B7280; text-align:center;">{{ store.error || 'The bill may have expired or the link is invalid.' }}</div>
        <button :style="primaryBtn" @click="router.replace('/tabs/home')">Back home</button>
      </div>
    </ion-content>

    <!-- Pay CTA anchored at bottom -->
    <div v-if="bill && canPay" :style="ctaWrapper">
      <button :style="ctaBtn" @click="showPayment = true">
        Pay your share
        <span style="background:rgba(255,255,255,0.15); padding:4px 10px; border-radius:8px; font-size:13px; font-weight:700;">{{ symbol }}{{ bill.remaining.toFixed(2) }} left</span>
      </button>
    </div>

    <!-- Payment Sheet Modal -->
    <ion-modal
      :is-open="showPayment"
      :initial-breakpoint="0.92"
      :breakpoints="[0, 0.92]"
      @did-dismiss="showPayment = false"
    >
      <PaymentSheet v-if="bill" :bill="bill" :merchant="store.activeBillMerchant" @close="showPayment = false" @initiated="onInitiated" />
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { IonPage, IonContent, IonModal } from '@ionic/vue'
import { useBillStore } from '@/stores/bills'
import { currencySymbol, mapBillStatus } from '@/services/billService'
import AppIcon from '@/components/AppIcon.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import AppProgressBar from '@/components/AppProgressBar.vue'
import PaymentSheet from './PaymentSheet.vue'

const route = useRoute()
const router = useRouter()
const store = useBillStore()
const showPayment = ref(false)

const bill = computed(() => store.activeBill)
const symbol = computed(() => currencySymbol(bill.value?.currency ?? 'usd'))
const progressPct = computed(() =>
  bill.value && bill.value.amount > 0 ? (bill.value.paidAmount / bill.value.amount) * 100 : 0
)
const isExpired = computed(() => {
  if (!bill.value) return false
  if (bill.value.status === 'expired') return true
  return new Date(bill.value.expiresAt).getTime() < Date.now()
})
const isFullyPaid = computed(() =>
  bill.value ? bill.value.remaining <= 0 || bill.value.status === 'paid' || bill.value.status === 'completed' : false
)
const canPay = computed(() => !isExpired.value && !isFullyPaid.value)
const badgeStatus = computed(() => isExpired.value ? 'Expired' : mapBillStatus(bill.value!.status))

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function goBack() {
  if (window.history.length > 1) router.back()
  else router.replace('/tabs/home')
}

async function onInitiated(checkoutUrl: string, amount: number) {
  showPayment.value = false
  router.push({ path: '/processing', query: { url: checkoutUrl, amount: String(amount) } })
}

onMounted(async () => {
  // If we already have an active bill matching the route id, no need to refetch
  const id = parseInt(String(route.params.id), 10)
  if (store.activeBill?.id === id) return
  // Look up token from existing payment history if available
  await store.loadPayments()
  const match = store.payments.find((p) => p.billId === id)
  if (match) {
    try {
      await store.loadBillByToken(match.billId, match.billToken, match.merchantName)
    } catch { /* error shown in UI */ }
  }
})

const circleBtn = { width: '40px', height: '40px', borderRadius: '50%', background: '#FFFFFF', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }
const heroCard = { background: '#FFFFFF', borderRadius: '24px', padding: '24px 24px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', border: '1px solid #F3F4F6' }
const merchantIcon = { width: '36px', height: '36px', borderRadius: '12px', background: '#D8F3DC', display: 'flex', alignItems: 'center', justifyContent: 'center' }
const itemRow = (border: boolean) => ({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: border ? '1px solid #F3F4F6' : 'none' })
const ctaWrapper = { position: 'fixed', bottom: '24px', left: '0', right: '0', padding: '12px 16px', background: 'linear-gradient(to top, rgba(250,250,250,0.98) 60%, rgba(250,250,250,0))', zIndex: '10' }
const ctaBtn = { width: '100%', height: '56px', borderRadius: '16px', background: '#1C1C1E', color: '#fff', border: 'none', fontFamily: 'inherit', fontSize: '15px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer', letterSpacing: '-0.01em', boxShadow: '0 8px 24px rgba(28,28,30,0.30)' }
const warnBox = { background: '#FEE2E2', color: '#DC2626', borderRadius: '12px', padding: '12px 14px', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }
const successBox = { background: '#D1FAE5', color: '#166534', borderRadius: '12px', padding: '12px 14px', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }
const primaryBtn = { padding: '12px 24px', borderRadius: '12px', background: '#1C1C1E', color: '#fff', border: 'none', fontFamily: 'inherit', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }
</script>
