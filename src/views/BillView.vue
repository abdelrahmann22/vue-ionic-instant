<template>
  <ion-page>
    <ion-content :scroll-y="true" style="--background: #FAFAFA;">
      <div v-if="bill" style="min-height:100%; padding-bottom:160px; background:#FAFAFA;">

        <!-- Header -->
        <div style="padding:56px 16px 12px; display:flex; justify-content:space-between; align-items:center;">
          <button :style="circleBtn" @click="router.back()">
            <AppIcon name="arrow-left" :size="18" color="#1A1A1A" :stroke-width="2" />
          </button>
          <div style="text-align:center;">
            <div style="font-size:11px; color:#9CA3AF; font-weight:500; letter-spacing:0.04em; text-transform:uppercase;">Bill #{{ bill.code }}</div>
          </div>
          <button :style="circleBtn" @click="switchToContributors">
            <AppIcon name="users" :size="16" color="#1A1A1A" :stroke-width="2" />
          </button>
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
                <div style="font-size:12px; color:#6B7280; margin-top:1px;">{{ bill.merchant }} · {{ bill.date }}</div>
              </div>
              <StatusBadge status="Pending" />
            </div>

            <div style="border-top:1px solid #F3F4F6; padding-top:18px;">
              <div style="font-size:12px; color:#6B7280; font-weight:500; margin-bottom:6px; letter-spacing:0.02em; text-transform:uppercase;">Your share</div>
              <div style="display:flex; align-items:baseline; gap:6px; margin-bottom:12px;">
                <span style="font-size:36px; font-weight:700; letter-spacing:-0.03em; color:#1A1A1A; line-height:1;">${{ bill.userShare.toFixed(2) }}</span>
                <span style="font-size:13px; color:#9CA3AF;">of ${{ bill.total.toFixed(2) }}</span>
              </div>
              <AppProgressBar :pct="progressPct" />
              <div style="display:flex; justify-content:space-between; font-size:12px; color:#6B7280; margin-top:8px;">
                <span><b style="color:#1A1A1A">${{ bill.contributed }}</b> collected</span>
                <span>${{ (bill.total - bill.contributed).toFixed(2) }} remaining</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div style="padding:20px 16px 0;">
          <div style="display:flex; gap:6px; background:#F3F4F6; border-radius:12px; padding:4px;">
            <button v-for="t in tabs" :key="t" :style="tabBtn(t === activeTab)" @click="activeTab = t">{{ t }}</button>
          </div>
        </div>

        <!-- Bill tab -->
        <div v-if="activeTab === 'Bill'" style="padding:14px 16px 0;">
          <div style="background:#FFFFFF; border-radius:16px; padding:18px; border:1px solid #F3F4F6;">
            <div v-for="(item, i) in bill.items" :key="i" :style="itemRow(i < bill.items.length - 1)">
              <div style="display:flex; gap:10px; align-items:center;">
                <span style="font-size:12px; font-weight:600; color:#6B7280; background:#F3F4F6; padding:2px 7px; border-radius:6px;">{{ item.qty }}×</span>
                <span style="font-size:14px; color:#1A1A1A; font-weight:500;">{{ item.name }}</span>
              </div>
              <span style="font-size:14px; font-weight:600; color:#1A1A1A; letter-spacing:-0.01em;">${{ item.price.toFixed(2) }}</span>
            </div>
            <div style="border-top:1px solid #F3F4F6; margin-top:8px; padding-top:12px; display:flex; flex-direction:column; gap:6px;">
              <div style="display:flex; justify-content:space-between; font-size:13px;">
                <span style="color:#6B7280;">Subtotal</span>
                <span style="color:#6B7280; font-weight:500;">${{ bill.subtotal.toFixed(2) }}</span>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:13px;">
                <span style="color:#6B7280;">Tax & Service (10%)</span>
                <span style="color:#6B7280; font-weight:500;">${{ bill.tax.toFixed(2) }}</span>
              </div>
              <div style="border-top:1px solid #F3F4F6; margin-top:4px; padding-top:10px; display:flex; justify-content:space-between;">
                <span style="font-size:15px; font-weight:700; letter-spacing:-0.01em;">Total</span>
                <span style="font-size:17px; font-weight:700; letter-spacing:-0.02em;">${{ bill.total.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Contributors tab -->
        <div v-else style="padding:14px 16px 0; display:flex; flex-direction:column; gap:8px;">
          <div v-for="(c, i) in bill.contributors" :key="c.id" :style="contributorCard">
            <AppAvatar :initial="c.name[0]" :size="40" :palette="i + 1" />
            <div style="flex:1;">
              <div style="font-size:14px; font-weight:600; letter-spacing:-0.01em;">{{ c.name }}</div>
              <div style="font-size:12px; color:#9CA3AF; margin-top:1px;">{{ c.paid ? `Paid ${c.time}` : 'Not paid yet' }}</div>
            </div>
            <div style="display:flex; flex-direction:column; align-items:flex-end; gap:4px;">
              <span style="font-size:14px; font-weight:700; letter-spacing:-0.01em;">${{ c.amount.toFixed(2) }}</span>
              <StatusBadge :status="c.paid ? 'Completed' : 'Pending'" />
            </div>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-else style="height:100%; display:flex; align-items:center; justify-content:center;">
        <div style="font-size:14px; color:#9CA3AF;">Loading…</div>
      </div>
    </ion-content>

    <!-- Pay CTA anchored at bottom -->
    <div v-if="bill" :style="ctaWrapper">
      <button :style="ctaBtn" @click="showPayment = true">
        Pay your share
        <span style="background:rgba(255,255,255,0.15); padding:4px 10px; border-radius:8px; font-size:13px; font-weight:700;">${{ bill.userShare.toFixed(2) }}</span>
      </button>
    </div>

    <!-- Payment Sheet Modal -->
    <ion-modal
      :is-open="showPayment"
      :initial-breakpoint="0.92"
      :breakpoints="[0, 0.92]"
      @did-dismiss="showPayment = false"
    >
      <PaymentSheet v-if="bill" :bill="bill" @close="showPayment = false" @paid="onPaid" />
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { IonPage, IonContent, IonModal } from '@ionic/vue'
import { useBillStore } from '@/stores/bills'
import AppIcon from '@/components/AppIcon.vue'
import AppAvatar from '@/components/AppAvatar.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import AppProgressBar from '@/components/AppProgressBar.vue'
import PaymentSheet from './PaymentSheet.vue'

const route = useRoute()
const router = useRouter()
const store = useBillStore()
const tabs = ['Bill', 'Contributors']
const activeTab = ref('Bill')
const showPayment = ref(false)

const bill = computed(() => store.activeBill)
const progressPct = computed(() => bill.value ? (bill.value.contributed / bill.value.total) * 100 : 0)

onMounted(async () => {
  if (!store.activeBill || store.activeBill.id !== route.params.id) {
    const found = await import('@/services/billService').then(m => m.billService.getBillById(route.params.id as string))
    if (found) store.setActiveBill(found)
  }
})

function switchToContributors() {
  activeTab.value = 'Contributors'
}

async function onPaid(amount: number) {
  showPayment.value = false
  await store.pay(amount)
  router.push('/receipt')
}

// Styles
const circleBtn = { width: '40px', height: '40px', borderRadius: '50%', background: '#FFFFFF', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }
const heroCard = { background: '#FFFFFF', borderRadius: '24px', padding: '24px 24px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', border: '1px solid #F3F4F6' }
const merchantIcon = { width: '36px', height: '36px', borderRadius: '12px', background: '#D8F3DC', display: 'flex', alignItems: 'center', justifyContent: 'center' }
const tabBtn = (active: boolean) => ({ flex: '1', padding: '8px 12px', borderRadius: '9px', border: 'none', background: active ? '#FFFFFF' : 'transparent', color: active ? '#1A1A1A' : '#6B7280', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', boxShadow: active ? '0 1px 3px rgba(0,0,0,0.04)' : 'none', transition: 'all 150ms' })
const itemRow = (border: boolean) => ({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: border ? '1px solid #F3F4F6' : 'none' })
const contributorCard = { background: '#FFFFFF', borderRadius: '14px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #F3F4F6' }
const ctaWrapper = { position: 'fixed', bottom: '80px', left: '0', right: '0', padding: '12px 16px', background: 'linear-gradient(to top, rgba(250,250,250,0.98) 60%, rgba(250,250,250,0))', zIndex: '10' }
const ctaBtn = { width: '100%', height: '56px', borderRadius: '16px', background: '#1C1C1E', color: '#fff', border: 'none', fontFamily: 'inherit', fontSize: '15px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer', letterSpacing: '-0.01em', boxShadow: '0 8px 24px rgba(28,28,30,0.30)' }
</script>
