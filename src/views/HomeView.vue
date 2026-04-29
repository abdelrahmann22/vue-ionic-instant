<template>
  <ion-page>
    <ion-content :scroll-y="true">
      <div style="padding-bottom: 100px;">
        <!-- Hero greeting card -->
        <div style="padding: 8px 16px 0;">
          <div :style="heroCard">
            <!-- Decorative rings -->
            <div :style="ring1" />
            <div :style="ring2" />

            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:36px;">
              <div>
                <div style="font-size:13px; color:#6B7280; font-weight:500; margin-bottom:4px;">Good morning</div>
                <h1 style="font-size:22px; font-weight:700; margin:0; letter-spacing:-0.02em;">{{ store.user.name.split(' ')[0] }} 👋</h1>
              </div>
              <button :style="notifBtn">
                <AppIcon name="bell" :size="18" color="#1A1A1A" :stroke-width="1.8" />
                <div :style="notifDot" />
              </button>
            </div>

            <div>
              <div style="font-size:12px; color:#6B7280; font-weight:500; margin-bottom:4px; letter-spacing:0.02em; text-transform:uppercase;">Total contributed</div>
              <div style="font-size:40px; font-weight:700; letter-spacing:-0.03em; line-height:1; color:#1A1A1A;">
                ${{ store.user.totalContributed.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
              </div>
              <div style="font-size:12px; color:#2D6A4F; font-weight:600; margin-top:8px; display:flex; align-items:center; gap:4px;">
                <AppIcon name="arrow-up-right" :size="12" color="#2D6A4F" :stroke-width="2.5" />
                +$45.00 this week
              </div>
            </div>
          </div>
        </div>

        <!-- Quick actions -->
        <div style="padding:20px 16px 0; display:grid; grid-template-columns:1fr 1fr; gap:10px;">
          <button :style="scanBtn" @click="router.push('/tabs/scan')">
            <div :style="scanIcon">
              <AppIcon name="scan-line" :size="16" color="#fff" :stroke-width="2" />
            </div>
            Scan a bill
          </button>
          <button :style="splitBtn">
            <div :style="splitIcon">
              <AppIcon name="users" :size="16" color="#2D6A4F" :stroke-width="2" />
            </div>
            Split with…
          </button>
        </div>

        <!-- Recent activity header -->
        <div style="padding:24px 16px 12px; display:flex; justify-content:space-between; align-items:center;">
          <h2 style="font-size:16px; font-weight:600; margin:0; letter-spacing:-0.01em;">Recent activity</h2>
          <button style="background:none; border:none; color:#1A1A1A; font-size:13px; font-weight:600; cursor:pointer; font-family:inherit;">See all</button>
        </div>

        <!-- Filter chips -->
        <div style="padding:0 16px 12px; display:flex; gap:8px; overflow-x:auto;">
          <FilterChip v-for="f in filters" :key="f" :active="activeFilter === f" @click="activeFilter = f">{{ f }}</FilterChip>
        </div>

        <!-- Payment list -->
        <div style="padding:0 16px; display:flex; flex-direction:column; gap:8px;">
          <button
            v-for="(bill, i) in filteredBills"
            :key="bill.id"
            :style="payRow"
            @click="openBill(bill)"
            @mousedown="(e) => (e.currentTarget as HTMLElement).style.transform = 'scale(0.98)'"
            @mouseup="(e) => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'"
            @mouseleave="(e) => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'"
          >
            <AppAvatar :initial="bill.title[0]" :size="42" :palette="i" />
            <div style="flex:1; min-width:0;">
              <div style="font-size:14px; font-weight:600; color:#1A1A1A; letter-spacing:-0.01em;">{{ bill.title }}</div>
              <div style="font-size:12px; color:#9CA3AF; margin-top:2px; display:flex; align-items:center; gap:6px;">
                <span>{{ bill.time }}</span>
                <span style="width:3px;height:3px;border-radius:50%;background:#9CA3AF;display:inline-block;"/>
                <span>{{ bill.peopleCount }} people</span>
              </div>
            </div>
            <div style="display:flex; flex-direction:column; align-items:flex-end; gap:4px;">
              <div style="font-size:15px; font-weight:700; color:#1A1A1A; letter-spacing:-0.01em;">${{ bill.amount.toFixed(2) }}</div>
              <StatusBadge :status="bill.status" />
            </div>
          </button>

          <!-- Empty state -->
          <div v-if="filteredBills.length === 0" :style="emptyState">
            <AppIcon name="receipt" :size="36" color="#E5E7EB" />
            <div style="font-size:14px; font-weight:600;">No {{ activeFilter.toLowerCase() }} payments</div>
            <div style="font-size:13px; color:#6B7280;">Try a different filter</div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { IonPage, IonContent } from '@ionic/vue'
import { useBillStore } from '@/stores/bills'
import type { Bill } from '@/types'
import AppIcon from '@/components/AppIcon.vue'
import AppAvatar from '@/components/AppAvatar.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import FilterChip from '@/components/FilterChip.vue'

const router = useRouter()
const store = useBillStore()
const filters = ['All', 'Completed', 'Pending', 'Failed']
const activeFilter = ref('All')

const filteredBills = computed(() =>
  activeFilter.value === 'All'
    ? store.bills
    : store.bills.filter(b => b.status === activeFilter.value)
)

function openBill(bill: Bill) {
  store.setActiveBill(bill)
  router.push(`/bill/${bill.id}`)
}

onMounted(() => { if (!store.bills.length) store.loadBills() })

// Styles
const heroCard = {
  background: 'linear-gradient(160deg, #E8F5EA 0%, #F4ECDC 100%)',
  borderRadius: '24px', padding: '24px', position: 'relative', overflow: 'hidden',
}
const ring1 = { position: 'absolute', right: '-60px', top: '-60px', width: '180px', height: '180px', borderRadius: '50%', border: '1px solid rgba(45,106,79,0.15)' }
const ring2 = { position: 'absolute', right: '-30px', top: '-30px', width: '120px', height: '120px', borderRadius: '50%', border: '1px solid rgba(45,106,79,0.10)' }
const notifBtn = { width: '40px', height: '40px', borderRadius: '50%', background: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', cursor: 'pointer', position: 'relative' }
const notifDot = { position: 'absolute', top: '9px', right: '11px', width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444', border: '1.5px solid #fff' }
const scanBtn = { background: '#1C1C1E', color: '#fff', border: 'none', borderRadius: '16px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'inherit', fontSize: '13px', fontWeight: '600', cursor: 'pointer', letterSpacing: '-0.01em' }
const scanIcon = { width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }
const splitBtn = { background: '#FFFFFF', color: '#1A1A1A', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'inherit', fontSize: '13px', fontWeight: '600', cursor: 'pointer', letterSpacing: '-0.01em' }
const splitIcon = { width: '32px', height: '32px', borderRadius: '10px', background: '#D8F3DC', display: 'flex', alignItems: 'center', justifyContent: 'center' }
const payRow = { background: '#FFFFFF', border: 'none', borderRadius: '16px', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', width: '100%', transition: 'transform 120ms' }
const emptyState = { background: '#FFFFFF', borderRadius: '16px', padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginTop: '8px' }
</script>
