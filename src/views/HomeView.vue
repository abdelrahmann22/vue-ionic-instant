<template>
  <ion-page>
    <ion-content ref="contentRef" :scroll-y="true">
      <ion-refresher slot="fixed" @ionRefresh="onRefresh($event)">
        <ion-refresher-content />
      </ion-refresher>

      <div style="padding-bottom: 100px;">
        <!-- Hero greeting card -->
        <div style="padding: 8px 16px 0;">
          <div :style="heroCard">
            <div :style="ring1" />
            <div :style="ring2" />

            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:36px;">
              <div>
                <div style="font-size:13px; color:#6B7280; font-weight:500; margin-bottom:4px;">{{ greeting }}</div>
                <h1 style="font-size:22px; font-weight:700; margin:0; letter-spacing:-0.02em;">{{ firstName }} 👋</h1>
              </div>
              <button :style="notifBtn" @click="showNotifications">
                <AppIcon name="bell" :size="18" color="#1A1A1A" :stroke-width="1.8" />
                <div v-if="hasPendingPayments" :style="notifDot" />
              </button>
            </div>

            <div>
              <div style="font-size:12px; color:#6B7280; font-weight:500; margin-bottom:4px; letter-spacing:0.02em; text-transform:uppercase;">Total contributed</div>
              <template v-if="statsLoading">
                <SkeletonBox :width="180" :height="40" radius="8" />
                <div style="margin-top:10px;">
                  <SkeletonBox :width="100" :height="14" radius="6" />
                </div>
              </template>
              <template v-else>
                <div style="font-size:40px; font-weight:700; letter-spacing:-0.03em; line-height:1; color:#1A1A1A;">
                  {{ currencySymbol(store.payments[0]?.currency ?? 'gbp') }}{{ store.totalContributed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                </div>
                <div style="font-size:12px; color:#2D6A4F; font-weight:600; margin-top:8px; display:flex; align-items:center; gap:4px;">
                  <AppIcon name="arrow-up-right" :size="12" color="#2D6A4F" :stroke-width="2.5" />
                  {{ store.billsPaidCount }} bills paid
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- Recent activity header -->
        <div style="padding:24px 16px 12px; display:flex; justify-content:space-between; align-items:center;">
          <h2 style="font-size:16px; font-weight:600; margin:0; letter-spacing:-0.01em;">Recent activity</h2>
          <button v-if="store.payments.length > 0" style="background:none; border:none; color:#1A1A1A; font-size:13px; font-weight:600; cursor:pointer; font-family:inherit;" @click="seeAll">See all</button>
        </div>

        <!-- Filter chips -->
        <div v-if="store.payments.length > 0" style="padding:0 16px 12px; display:flex; gap:8px; overflow-x:auto;">
          <FilterChip v-for="f in filters" :key="f" :active="activeFilter === f" @click="activeFilter = f">{{ f }}</FilterChip>
        </div>

        <!-- Skeleton loading state -->
        <div v-if="store.loading && store.payments.length === 0" style="padding:0 16px; display:flex; flex-direction:column; gap:8px;">
          <div v-for="n in 4" :key="n" :style="skeletonRow">
            <SkeletonBox :width="42" :height="42" radius="50%" />
            <div style="flex:1; display:flex; flex-direction:column; gap:6px;">
              <SkeletonBox :width="'55%'" :height="14" />
              <SkeletonBox :width="'35%'" :height="11" />
            </div>
            <div style="display:flex; flex-direction:column; align-items:flex-end; gap:6px;">
              <SkeletonBox :width="56" :height="15" />
              <SkeletonBox :width="64" :height="18" radius="9999" />
            </div>
          </div>
        </div>

        <!-- Payment list -->
        <div v-else-if="filteredPayments.length > 0" style="padding:0 16px; display:flex; flex-direction:column; gap:8px;">
          <button
            v-for="(p, i) in filteredPayments"
            :key="p.paymentId"
            :style="payRow"
            @click="openPayment(p)"
          >
            <AppAvatar :initial="p.merchantName?.[0] || p.billTitle?.[0] || '?'" :size="42" :palette="i" />
            <div style="flex:1; min-width:0;">
              <div style="font-size:14px; font-weight:600; color:#1A1A1A; letter-spacing:-0.01em;">{{ p.billTitle || `Bill #${p.billId}` }}</div>
              <div style="font-size:12px; color:#9CA3AF; margin-top:2px; display:flex; align-items:center; gap:6px;">
                <span>{{ formatTime(p.paidAt, p.createdAt) }}</span>
                <span v-if="p.contributorsCount > 0" style="width:3px;height:3px;border-radius:50%;background:#9CA3AF;display:inline-block;" />
                <span v-if="p.contributorsCount > 0">{{ p.contributorsCount }} {{ p.contributorsCount === 1 ? 'person' : 'people' }}</span>
              </div>
            </div>
            <div style="display:flex; flex-direction:column; align-items:flex-end; gap:4px;">
              <div style="font-size:15px; font-weight:700; color:#1A1A1A; letter-spacing:-0.01em;">{{ formatAmount(p.amount, p.currency) }}</div>
              <StatusBadge :status="p.status" />
            </div>
          </button>
        </div>

        <!-- Empty state -->
        <div v-else style="padding:0 16px;">
          <div :style="emptyState">
            <AppIcon name="receipt" :size="36" color="#E5E7EB" />
            <div style="font-size:14px; font-weight:600;">No {{ activeFilter === 'All' ? '' : activeFilter.toLowerCase() }} payments yet</div>
            <div style="font-size:13px; color:#6B7280; text-align:center;">Scan a merchant's QR to pay your share</div>
            <button :style="emptyCta" @click="router.push('/tabs/scan')">Scan a bill</button>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonPage, IonContent, IonRefresher, IonRefresherContent,
  alertController, toastController,
} from '@ionic/vue'
import { useBillStore } from '@/stores/bills'
import { useAuthStore } from '@/stores/auth'
import { currencySymbol } from '@/services/billService'
import type { PaymentHistoryItem } from '@/types'
import AppIcon from '@/components/AppIcon.vue'
import AppAvatar from '@/components/AppAvatar.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import FilterChip from '@/components/FilterChip.vue'
import SkeletonBox from '@/components/SkeletonBox.vue'

const router = useRouter()
const store = useBillStore()
const authStore = useAuthStore()
const contentRef = ref()
const filters = ['All', 'Completed', 'Pending', 'Failed']
const activeFilter = ref('All')

const firstName = computed(() => {
  const name = authStore.user?.username || authStore.user?.email?.split('@')[0] || 'there'
  return name.split(' ')[0]
})

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
})

const hasPendingPayments = computed(() =>
  store.payments.some((p) => p.rawStatus === 'pending')
)

const statsLoading = computed(() => store.loading && store.payments.length === 0)

const filteredPayments = computed(() =>
  activeFilter.value === 'All'
    ? store.payments
    : store.payments.filter((p) => p.status === activeFilter.value)
)

function formatAmount(amount: number, currency: string) {
  return `${currencySymbol(currency)}${amount.toFixed(2)}`
}

function formatTime(paidAt: string | null, createdAt: string): string {
  const iso = paidAt ?? createdAt
  const date = new Date(iso)
  const diff = Date.now() - date.getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min} min ago`
  const hours = Math.floor(min / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

async function openPayment(p: PaymentHistoryItem) {
  if (p.rawStatus === 'failed' || p.rawStatus === 'cancelled') {
    store.buildReceipt(p)
    router.push('/receipt')
    return
  }

  if (p.rawStatus === 'succeeded') {
    // Build basic receipt from payment data (items=[], contributors=[])
    // then navigate immediately while loading full data in background
    store.buildReceipt(p)
    store.receiptLoading = true
    router.push('/receipt')
    store.loadBillByToken(p.billId, p.billToken, p.merchantName)
      .then(() => {
        store.buildReceipt(p)
        store.receiptLoading = false
      })
      .catch(() => {
        store.receiptLoading = false
      })
    return
  }

  // Pending — go to bill view
  try {
    await store.loadBillByToken(p.billId, p.billToken, p.merchantName)
    router.push(`/bill/${p.billId}`)
  } catch (e: any) {
    const toast = await toastController.create({
      message: e?.response?.data?.message ?? 'Could not open this bill (it may have expired)',
      duration: 2500, position: 'bottom', color: 'danger',
    })
    await toast.present()
  }
}

function seeAll() {
  activeFilter.value = 'All'
  contentRef.value?.$el?.scrollToTop?.(300)
}

async function showNotifications() {
  const message = hasPendingPayments.value
    ? 'You have pending payments — pull down to refresh status.'
    : 'No new notifications'
  const alert = await alertController.create({
    header: 'Notifications',
    message,
    buttons: ['OK'],
  })
  await alert.present()
}

async function onRefresh(event: any) {
  await store.loadPayments()
  event.target.complete()
}

onMounted(() => {
  if (store.payments.length === 0) store.loadPayments()
})

// Styles
const heroCard = { background: 'linear-gradient(160deg, #E8F5EA 0%, #F4ECDC 100%)', borderRadius: '24px', padding: '24px', position: 'relative', overflow: 'hidden' }
const ring1 = { position: 'absolute', right: '-60px', top: '-60px', width: '180px', height: '180px', borderRadius: '50%', border: '1px solid rgba(45,106,79,0.15)' }
const ring2 = { position: 'absolute', right: '-30px', top: '-30px', width: '120px', height: '120px', borderRadius: '50%', border: '1px solid rgba(45,106,79,0.10)' }
const notifBtn = { width: '40px', height: '40px', borderRadius: '50%', background: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', cursor: 'pointer', position: 'relative' }
const notifDot = { position: 'absolute', top: '9px', right: '11px', width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444', border: '1.5px solid #fff' }
const payRow = { background: '#FFFFFF', border: 'none', borderRadius: '16px', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', width: '100%', transition: 'transform 120ms' }
const emptyState = { background: '#FFFFFF', borderRadius: '16px', padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginTop: '8px' }
const emptyCta = { marginTop: '8px', padding: '10px 18px', borderRadius: '10px', background: '#1C1C1E', color: '#fff', border: 'none', fontFamily: 'inherit', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }
const skeletonRow = { background: '#FFFFFF', borderRadius: '16px', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }
</script>
