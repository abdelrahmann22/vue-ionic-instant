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
              <AppProgressBar :pct="progressPct" :pending-pct="pendingPct" />
              <div style="display:flex; justify-content:space-between; font-size:12px; color:#6B7280; margin-top:8px;">
                <span>
                  <b style="color:#1A1A1A">{{ symbol }}{{ bill.paidAmount.toFixed(2) }}</b> collected
                  <span v-if="bill.pendingAmount > 0" style="color:#D97706; font-weight:500; margin-left:6px;">+ {{ symbol }}{{ bill.pendingAmount.toFixed(2) }} pending</span>
                </span>
                <span>{{ (progressPct + pendingPct).toFixed(0) }}%</span>
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
                <span style="font-size:12px; font-weight:600; color:#6B7280; background:#F3F4F6; padding:2px 7px; border-radius:6px;">{{ item.quantity }}&times;</span>
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

        <!-- Contributors section -->
        <div v-if="bill.contributors.length > 0" style="padding:14px 16px 0;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; padding:0 2px;">
            <span style="font-size:16px; font-weight:500; color:#1A1A1A;">Contributors</span>
            <span style="font-size:14px; color:#6B7280;">{{ bill.contributors.length }} paid</span>
          </div>
          <div style="display:flex; gap:16px; overflow-x:auto; padding-bottom:4px;">
            <div v-for="(c, i) in bill.contributors" :key="i" style="width:72px; display:flex; flex-direction:column; align-items:center; gap:4px; flex-shrink:0;">
              <AppAvatar :initial="c.name.charAt(0).toUpperCase()" :size="56" :palette="i % 6" />
              <span style="font-size:14px; color:#6B7280; text-align:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:100%;">{{ c.name }}</span>
              <span style="font-size:14px; font-weight:600; color:#1A1A1A;">{{ symbol }}{{ c.amount.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <!-- Status banner -->
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
        <div v-else-if="store.hasPendingPaymentOnActiveBill || store.pendingPaymentId" style="padding:14px 16px 0;">
          <div :style="pendingBox">
            <div :style="pendingDot" />
            Payment pending — complete checkout in the other tab
          </div>
        </div>
        <div v-else-if="bill.pendingAmount > 0" style="padding:14px 16px 0;">
          <div :style="othersPendingBox">
            <div :style="othersPendingDot" />
            A payment is being processed — some amount is temporarily held
          </div>
        </div>
      </div>

      <!-- Skeleton loading -->
      <div v-else-if="store.loading" style="min-height:100%; padding-bottom:160px; background:#FAFAFA;">
        <!-- Header skeleton -->
        <div style="padding:56px 16px 12px; display:flex; justify-content:space-between; align-items:center;">
          <SkeletonBox :width="40" :height="40" radius="50%" />
          <SkeletonBox :width="80" :height="11" />
          <SkeletonBox :width="40" :height="40" radius="50%" />
        </div>

        <!-- Hero card skeleton -->
        <div style="padding:8px 16px 0;">
          <div :style="heroCard">
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:16px;">
              <SkeletonBox :width="36" :height="36" radius="12" />
              <div style="flex:1; display:flex; flex-direction:column; gap:6px;">
                <SkeletonBox :width="'60%'" :height="16" />
                <SkeletonBox :width="'40%'" :height="12" />
              </div>
              <SkeletonBox :width="64" :height="22" radius="9999" />
            </div>
            <div style="border-top:1px solid #F3F4F6; padding-top:18px;">
              <SkeletonBox :width="100" :height="11" />
              <div style="margin-top:10px;">
                <SkeletonBox :width="'50%'" :height="36" />
              </div>
              <div style="margin-top:14px;">
                <SkeletonBox :width="'100%'" :height="8" radius="999" />
              </div>
            </div>
          </div>
        </div>

        <!-- Items card skeleton -->
        <div style="padding:14px 16px 0;">
          <div style="background:#FFFFFF; border-radius:16px; padding:18px; border:1px solid #F3F4F6; display:flex; flex-direction:column; gap:14px;">
            <SkeletonBox :width="60" :height="11" />
            <div v-for="n in 3" :key="n" style="display:flex; justify-content:space-between; align-items:center;">
              <div style="display:flex; gap:10px; align-items:center; flex:1;">
                <SkeletonBox :width="32" :height="20" radius="6" />
                <SkeletonBox :width="'50%'" :height="14" />
              </div>
              <SkeletonBox :width="50" :height="14" />
            </div>
          </div>
        </div>
      </div>

      <!-- Error -->
      <div v-else style="height:100%; padding:80px 24px; display:flex; flex-direction:column; align-items:center; gap:14px;">
        <AppIcon name="x" :size="36" color="#9CA3AF" />
        <div style="font-size:15px; font-weight:600; color:#1A1A1A;">Bill not available</div>
        <div style="font-size:13px; color:#6B7280; text-align:center;">{{ store.error || 'The bill may have expired or the link is invalid.' }}</div>
        <button :style="primaryBtn" @click="router.replace('/tabs/home')">Back home</button>
      </div>
    </ion-content>

    <!-- CTA anchored at bottom -->
    <div v-if="bill && canPay" :style="ctaWrapper">
      <button v-if="store.hasPendingPaymentOnActiveBill || store.pendingPaymentId" :style="cancelCtaBtn" @click="handleCancelPayment">
        Cancel payment
      </button>
      <button v-else :style="ctaBtn" @click="showPayment = true">
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { IonPage, IonContent, IonModal, alertController } from '@ionic/vue'
import { useBillStore } from '@/stores/bills'
import { currencySymbol, mapBillStatus } from '@/services/billService'
import { useBillSocket } from '@/composables/useBillSocket'
import type { PaymentCancelledData, PaymentInitiatedData } from '@/composables/useBillSocket'
import AppIcon from '@/components/AppIcon.vue'
import AppAvatar from '@/components/AppAvatar.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import AppProgressBar from '@/components/AppProgressBar.vue'
import SkeletonBox from '@/components/SkeletonBox.vue'
import PaymentSheet from './PaymentSheet.vue'

const route = useRoute()
const router = useRouter()
const store = useBillStore()
const showPayment = ref(false)
const { connect, disconnect } = useBillSocket()

function startSocket() {
  if (!store.activeBill) return
  connect(store.activeBill.id, store.activeBill.token, {
    onPaymentSucceeded(data) {
      store.updateActiveBill({
        paidAmount: data.paid_amount,
        pendingAmount: data.pending_amount,
        remaining: data.remaining,
      })
      store.addContributor(data.contributor)

      // If we have a pending payment, check if ours succeeded
      if (store.pendingPaymentId) {
        store.loadPayments().then(() => {
          const ours = store.payments.find(
            (p) => p.billId === store.activeBill!.id && p.rawStatus === 'succeeded'
          )
          if (ours) {
            store.pendingPaymentId = null
            store.buildReceipt(ours)
            router.replace('/receipt')
          }
        })
      }
    },
    onPaymentCancelled(data: PaymentCancelledData) {
      store.updateActiveBill({
        paidAmount: data.paid_amount,
        pendingAmount: data.pending_amount,
        remaining: data.remaining,
      })
      store.pendingPaymentId = null
      store.loadPayments()
    },
    onBillPaid(data) {
      store.updateActiveBill({ status: data.status })
    },
    onPaymentInitiated(data: PaymentInitiatedData) {
      store.updateActiveBill({
        pendingAmount: data.pending_amount,
        remaining: data.remaining,
      })
    },
  })
}

const bill = computed(() => store.activeBill)
const symbol = computed(() => currencySymbol(bill.value?.currency ?? 'gbp'))
const progressPct = computed(() =>
  bill.value && bill.value.amount > 0 ? (bill.value.paidAmount / bill.value.amount) * 100 : 0
)
const pendingPct = computed(() =>
  bill.value && bill.value.amount > 0 ? (bill.value.pendingAmount / bill.value.amount) * 100 : 0
)
const isExpired = computed(() => {
  if (!bill.value) return false
  if (bill.value.status === 'expired') return true
  return new Date(bill.value.expiresAt).getTime() < Date.now()
})
const isFullyPaid = computed(() =>
  bill.value ? bill.value.status === 'paid' || bill.value.status === 'completed' : false
)
const canPay = computed(() => {
  if (isExpired.value || isFullyPaid.value) return false
  if (store.hasPendingPaymentOnActiveBill || store.pendingPaymentId) return true
  return bill.value ? bill.value.remaining > 0 : false
})
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
  // Stay on BillView — socket will handle confirmation
}

async function handleCancelPayment() {
  const alert = await alertController.create({
    header: 'Cancel payment?',
    message: 'This will release the held amount so you or others can pay again.',
    buttons: [
      { text: 'Keep', role: 'cancel' },
      {
        text: 'Cancel',
        role: 'destructive',
        handler: () => {
          store.cancelPendingPayment().catch(() => {})
        },
      },
    ],
  })
  await alert.present()
}

onMounted(async () => {
  const id = parseInt(String(route.params.id), 10)

  // If we already have an active bill matching the route id, just connect socket
  if (store.activeBill?.id === id) {
    startSocket()
    return
  }

  // Look up token from existing payment history if available
  await store.loadPayments()
  const match = store.payments.find((p) => p.billId === id)
  if (match) {
    try {
      await store.loadBillByToken(match.billId, match.billToken, match.merchantName)
      startSocket()
    } catch { /* error shown in UI */ }
  }
})

onBeforeUnmount(() => {
  disconnect()
})

const circleBtn = { width: '40px', height: '40px', borderRadius: '50%', background: '#FFFFFF', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }
const heroCard = { background: '#FFFFFF', borderRadius: '24px', padding: '24px 24px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', border: '1px solid #F3F4F6' }
const merchantIcon = { width: '36px', height: '36px', borderRadius: '12px', background: '#D8F3DC', display: 'flex', alignItems: 'center', justifyContent: 'center' }
const itemRow = (border: boolean) => ({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: border ? '1px solid #F3F4F6' : 'none' })
const ctaWrapper = { position: 'fixed', bottom: '24px', left: '0', right: '0', padding: '12px 16px', background: 'linear-gradient(to top, rgba(250,250,250,0.98) 60%, rgba(250,250,250,0))', zIndex: '10' }
const ctaBtn = { width: '100%', height: '56px', borderRadius: '16px', background: '#1C1C1E', color: '#fff', border: 'none', fontFamily: 'inherit', fontSize: '15px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer', letterSpacing: '-0.01em', boxShadow: '0 8px 24px rgba(28,28,30,0.30)' }
const cancelCtaBtn = { width: '100%', height: '56px', borderRadius: '16px', background: '#FFFFFF', color: '#EF4444', border: '1.5px solid #EF4444', fontFamily: 'inherit', fontSize: '15px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer', letterSpacing: '-0.01em' }
const warnBox = { background: '#FEE2E2', color: '#DC2626', borderRadius: '12px', padding: '12px 14px', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }
const successBox = { background: '#D1FAE5', color: '#166534', borderRadius: '12px', padding: '12px 14px', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }
const pendingBox = { background: '#FEF3C7', color: '#D97706', borderRadius: '12px', padding: '12px 14px', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }
const pendingDot = { width: '8px', height: '8px', borderRadius: '50%', background: '#D97706', animation: 'pulseDot 2s ease-in-out infinite' }
const othersPendingBox = { background: '#EFF6FF', color: '#2563EB', borderRadius: '12px', padding: '12px 14px', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }
const othersPendingDot = { width: '8px', height: '8px', borderRadius: '50%', background: '#2563EB' }
const primaryBtn = { padding: '12px 24px', borderRadius: '12px', background: '#1C1C1E', color: '#fff', border: 'none', fontFamily: 'inherit', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }
</script>

<style scoped>
@keyframes pulseDot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
</style>
