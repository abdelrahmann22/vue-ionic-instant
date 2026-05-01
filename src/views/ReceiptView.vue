<template>
  <ion-page>
    <ion-content :scroll-y="true" style="--background: #FAFAFA;">
      <div style="padding-bottom:100px; background:#FAFAFA;">

        <!-- ========== SKELETON STATE ========== -->
        <template v-if="receiptLoading">
          <!-- Header -->
          <div style="padding:56px 16px 12px; display:flex; justify-content:space-between; align-items:center;">
            <button :style="circleBtn" @click="done">
              <AppIcon name="x" :size="18" color="#1A1A1A" :stroke-width="2" />
            </button>
            <div style="font-size:14px; font-weight:600;">Receipt</div>
            <div style="width:66px;" />
          </div>

          <!-- Status badge skeleton -->
          <div style="display:flex; flex-direction:column; align-items:center; padding:20px 16px 24px;">
            <SkeletonBox :width="88" :height="88" radius="50%" style="margin-bottom:18px;" />
            <SkeletonBox :width="120" :height="13" radius="6" style="margin-bottom:6px;" />
            <SkeletonBox :width="160" :height="38" radius="8" style="margin-bottom:6px;" />
            <SkeletonBox :width="200" :height="13" radius="6" />
          </div>

          <!-- Receipt card skeleton -->
          <div style="padding:0 16px;">
            <div style="background:#FFFFFF; border-radius:20px; padding:4px 0; box-shadow:0 1px 3px rgba(0,0,0,0.04); border:1px solid #F3F4F6; position:relative;">
              <div style="position:absolute; left:-8px; top:50%; transform:translateY(-50%); width:16px; height:16px; border-radius:50%; background:#FAFAFA;" />
              <div style="position:absolute; right:-8px; top:50%; transform:translateY(-50%); width:16px; height:16px; border-radius:50%; background:#FAFAFA;" />

              <!-- Detail rows skeleton -->
              <div style="padding:16px 20px; display:flex; flex-direction:column; gap:10px;">
                <SkeletonBox :width="'100%'" :height="14" radius="4" />
                <SkeletonBox :width="'100%'" :height="14" radius="4" />
                <SkeletonBox :width="'100%'" :height="14" radius="4" />
                <SkeletonBox :width="'100%'" :height="14" radius="4" />
              </div>

              <!-- Items skeleton -->
              <div style="padding:10px 20px; border-top:1px solid #F3F4F6; display:flex; flex-direction:column; gap:8px;">
                <SkeletonBox :width="60" :height="11" radius="4" />
                <div v-for="n in 3" :key="n" style="display:flex; justify-content:space-between; align-items:center;">
                  <div style="display:flex; gap:8px; align-items:center;">
                    <SkeletonBox :width="28" :height="18" radius="5" />
                    <SkeletonBox :width="100" :height="13" radius="4" />
                  </div>
                  <SkeletonBox :width="50" :height="13" radius="4" />
                </div>
              </div>

              <div style="border-top:1.5px dashed #E5E7EB; margin:4px 16px;" />

              <!-- Totals skeleton -->
              <div style="padding:14px 20px; display:flex; flex-direction:column; gap:10px;">
                <SkeletonBox :width="'100%'" :height="14" radius="4" />
                <SkeletonBox :width="'100%'" :height="14" radius="4" />
                <div style="display:flex; justify-content:space-between; align-items:center; padding-top:10px; border-top:1px solid #F3F4F6; margin-top:6px;">
                  <SkeletonBox :width="80" :height="17" radius="4" />
                  <SkeletonBox :width="100" :height="17" radius="4" />
                </div>
              </div>

              <!-- Footer skeleton -->
              <div style="border-top:1px solid #F3F4F6; padding:12px 20px; display:flex; justify-content:space-between; align-items:center;">
                <SkeletonBox :width="120" :height="11" radius="4" />
                <SkeletonBox :width="60" :height="11" radius="4" />
              </div>
            </div>
          </div>

          <!-- CTA -->
          <div style="padding:20px 16px 0;">
            <button :style="doneBtn" @click="done">Done</button>
          </div>
        </template>

        <!-- ========== REAL RECEIPT ========== -->
        <template v-else-if="receipt">
          <!-- Header -->
          <div style="padding:56px 16px 12px; display:flex; justify-content:space-between; align-items:center;">
            <button :style="circleBtn" @click="done">
              <AppIcon name="x" :size="18" color="#1A1A1A" :stroke-width="2" />
            </button>
            <div style="font-size:14px; font-weight:600;">{{ isFailed ? 'Failed payment' : 'Receipt' }}</div>
            <button v-if="!isFailed" style="padding:8px 14px; border-radius:9999px; background:#FFFFFF; border:1px solid #E5E7EB; color:#1A1A1A; font-family:inherit; font-size:12px; font-weight:600; cursor:pointer;" @click="shareReceipt">Share</button>
            <div v-else style="width:66px;" />
          </div>

          <!-- Status badge -->
          <div style="display:flex; flex-direction:column; align-items:center; padding:20px 16px 24px; position:relative;">
            <div style="position:relative; width:88px; height:88px; margin-bottom:18px;">
              <div v-if="!isFailed" style="position:absolute; inset:0; border-radius:50%; background:#D8F3DC; animation:ringRipple 1.5s ease-out infinite;" />
              <div :style="iconCircle">
                <AppIcon :name="isFailed ? 'x' : 'check'" :size="36" color="#fff" :stroke-width="3" />
              </div>
            </div>
            <div :style="badgeText">{{ isFailed ? 'Payment failed' : 'Payment sent' }}</div>
            <div style="font-size:38px; font-weight:700; letter-spacing:-0.03em; color:#1A1A1A; margin-top:6px; animation:fadeUp 400ms 280ms both; font-variant-numeric:tabular-nums;">
              {{ symbol }}{{ receipt?.amount.toFixed(2) }}
            </div>
            <div style="font-size:13px; color:#6B7280; margin-top:4px; animation:fadeUp 400ms 360ms both;">
              to <b style="color:#1A1A1A;">{{ receipt?.merchant }}</b> · {{ receipt?.title }}
            </div>
          </div>

          <!-- Receipt card -->
          <div style="padding:0 16px; animation:fadeUp 500ms 440ms both;">
            <div style="background:#FFFFFF; border-radius:20px; padding:4px 0; box-shadow:0 1px 3px rgba(0,0,0,0.04); border:1px solid #F3F4F6; position:relative;">
              <div style="position:absolute; left:-8px; top:50%; transform:translateY(-50%); width:16px; height:16px; border-radius:50%; background:#FAFAFA;" />
              <div style="position:absolute; right:-8px; top:50%; transform:translateY(-50%); width:16px; height:16px; border-radius:50%; background:#FAFAFA;" />

              <div style="padding:16px 20px;">
                <DetailRow label="Bill" :value="receipt?.title ?? ''" />
                <DetailRow label="Recipient" :value="receipt?.merchant ?? ''" />
                <DetailRow label="Date" :value="receipt?.date ?? ''" />
                <div v-if="!isFailed" style="display:flex; justify-content:space-between; padding:7px 0; align-items:center;">
                  <span style="font-size:13px; color:#6B7280; font-weight:500;">Method</span>
                  <span style="font-size:13px; color:#1A1A1A; font-weight:600; display:flex; align-items:center; gap:6px;">
                    <AppIcon name="credit-card" :size="14" color="#6B7280" :stroke-width="2" />
                    Card · 4242
                  </span>
                </div>
              </div>

              <!-- Contributors -->
              <div v-if="!isFailed && receipt?.contributors.length" style="padding:10px 20px; border-top:1px solid #F3F4F6;">
                <div style="font-size:11px; font-weight:600; color:#6B7280; letter-spacing:0.04em; text-transform:uppercase; margin-bottom:8px;">Contributors</div>
                <div style="display:flex; gap:12px; overflow-x:auto; padding-bottom:2px;">
                  <div v-for="(c, i) in receipt.contributors" :key="i" style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
                    <AppAvatar :initial="c.name.charAt(0).toUpperCase()" :size="24" :palette="i % 6" />
                    <div>
                      <div style="font-size:12px; color:#1A1A1A; font-weight:500;">{{ c.name }}</div>
                      <div style="font-size:11px; color:#6B7280;">{{ symbol }}{{ c.amount.toFixed(2) }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Items -->
              <div v-if="receipt?.items.length" style="padding:10px 20px; border-top:1px solid #F3F4F6;">
                <div v-for="(item, i) in receipt.items" :key="i" style="display:flex; justify-content:space-between; padding:5px 0; align-items:center;">
                  <div style="display:flex; gap:8px; align-items:center;">
                    <span style="font-size:11px; font-weight:600; color:#6B7280; background:#F3F4F6; padding:2px 6px; border-radius:5px;">{{ item.quantity }}×</span>
                    <span style="font-size:13px; color:#1A1A1A;">{{ item.title }}</span>
                  </div>
                  <span style="font-size:13px; font-weight:600; color:#1A1A1A;">{{ symbol }}{{ Number(item.price).toFixed(2) }}</span>
                </div>
              </div>

              <div style="border-top:1.5px dashed #E5E7EB; margin:4px 16px;" />

              <div style="padding:14px 20px;">
                <DetailRow :label="`Amount`" :value="`${symbol}${receipt?.amount.toFixed(2)}`" />
                <DetailRow v-if="!isFailed" label="Fee" :value="`${symbol}0.00`" :muted="true" />
                <div style="display:flex; justify-content:space-between; align-items:center; padding-top:10px; border-top:1px solid #F3F4F6; margin-top:6px;">
                  <span style="font-size:14px; font-weight:700;">{{ isFailed ? 'Total' : 'Total paid' }}</span>
                  <span style="font-size:17px; font-weight:700; letter-spacing:-0.02em;">{{ symbol }}{{ receipt?.amount.toFixed(2) }}</span>
                </div>
              </div>

              <div style="border-top:1px solid #F3F4F6; padding:12px 20px; display:flex; justify-content:space-between; align-items:center;">
                <div style="font-size:11px; color:#9CA3AF; font-family:ui-monospace,Menlo,monospace;">TX · {{ receipt?.txn }}</div>
                <div v-if="!isFailed" style="font-size:11px; color:#2D6A4F; font-weight:600; display:flex; align-items:center; gap:4px;">
                  <AppIcon name="shield" :size="11" color="#2D6A4F" :stroke-width="2.5" />
                  Verified
                </div>
                <div v-else style="font-size:11px; color:#DC2626; font-weight:600; display:flex; align-items:center; gap:4px;">
                  <AppIcon name="x" :size="11" color="#DC2626" :stroke-width="2.5" />
                  Failed
                </div>
              </div>
            </div>
          </div>

          <!-- CTA -->
          <div style="padding:20px 16px 0; animation:fadeUp 500ms 540ms both;">
            <button :style="doneBtn" @click="done">Done</button>
          </div>
        </template>

        <!-- ========== EMPTY STATE ========== -->
        <template v-else>
          <div style="height:100%; padding:80px 24px; display:flex; flex-direction:column; align-items:center; gap:14px;">
            <AppIcon name="receipt" :size="36" color="#9CA3AF" />
            <div style="font-size:15px; font-weight:600; color:#1A1A1A;">No receipt</div>
            <div style="font-size:13px; color:#6B7280; text-align:center;">The receipt may have expired or the payment is not available.</div>
            <button :style="doneBtn" @click="done">Back home</button>
          </div>
        </template>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, defineComponent, h } from 'vue'
import { useRouter } from 'vue-router'
import { IonPage, IonContent, toastController } from '@ionic/vue'
import { useBillStore } from '@/stores/bills'
import { currencySymbol } from '@/services/billService'
import AppIcon from '@/components/AppIcon.vue'
import AppAvatar from '@/components/AppAvatar.vue'
import SkeletonBox from '@/components/SkeletonBox.vue'

const router = useRouter()
const store = useBillStore()
const receipt = computed(() => store.receipt)
const receiptLoading = computed(() => store.receiptLoading)
const symbol = computed(() => currencySymbol(receipt.value?.currency ?? 'gbp'))
const isFailed = computed(() => receipt.value?.status === 'failed')

function done() {
  const id = store.activeBill?.id
  store.clearReceipt()
  store.clearActiveBill()
  router.replace('/tabs/home')
}

async function shareReceipt() {
  if (isFailed.value) return
  const itemsText = receipt.value?.items.length
    ? '\n' + receipt.value!.items.map((i) => `${i.quantity}× ${i.title} ${symbol.value}${Number(i.price).toFixed(2)}`).join('\n')
    : ''
  const text = `Payment confirmed ✓\n${symbol.value}${receipt.value?.amount.toFixed(2)} to ${receipt.value?.merchant}${itemsText}\nTX: ${receipt.value?.txn}`
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Instant Receipt', text })
      return
    } catch {
      // user cancelled — fall through to clipboard
    }
  }
  try {
    await navigator.clipboard.writeText(text)
    const toast = await toastController.create({ message: 'Receipt copied to clipboard', duration: 2000, position: 'bottom', color: 'dark' })
    await toast.present()
  } catch {
    // clipboard also failed — ignore silently
  }
}

// Sub-component
const DetailRow = defineComponent({
  props: { label: String, value: String, muted: Boolean },
  setup(props) {
    return () => h('div', { style: 'display:flex; justify-content:space-between; padding:7px 0; align-items:center;' }, [
      h('span', { style: 'font-size:13px; color:#6B7280; font-weight:500;' }, props.label),
      h('span', { style: `font-size:13px; color:${props.muted ? '#6B7280' : '#1A1A1A'}; font-weight:${props.muted ? '500' : '600'}; letter-spacing:-0.005em;` }, props.value),
    ])
  },
})

const circleBtn = { width: '40px', height: '40px', borderRadius: '50%', background: '#FFFFFF', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }
const doneBtn = { width: '100%', height: '52px', borderRadius: '14px', background: '#1C1C1E', color: '#fff', border: 'none', fontFamily: 'inherit', fontSize: '14px', fontWeight: '600', cursor: 'pointer', letterSpacing: '-0.01em' }
const iconCircle = computed(() => ({
  position: 'absolute' as const,
  top: '8px', left: '8px', right: '8px', bottom: '8px',
  borderRadius: '50%',
  background: isFailed.value ? '#DC2626' : '#2D6A4F',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: isFailed.value ? '0 8px 24px rgba(220,38,38,0.35)' : '0 8px 24px rgba(45,106,79,0.35)',
  animation: isFailed.value ? 'none' : 'checkPop 500ms cubic-bezier(.2,.9,.3,1.4) both',
}))
const badgeText = computed(() => ({
  fontSize: '13px',
  fontWeight: '600',
  color: isFailed.value ? '#DC2626' : '#2D6A4F',
  letterSpacing: '0.04em',
  textTransform: 'uppercase' as const,
  animation: 'fadeUp 400ms 200ms both',
}))
</script>

<style>
@keyframes checkPop {
  0% { transform: scale(0); opacity: 0; }
  60% { transform: scale(1.15); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes ringRipple {
  0% { transform: scale(0.8); opacity: 0.6; }
  100% { transform: scale(1.6); opacity: 0; }
}
@keyframes fadeUp {
  from { transform: translateY(8px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>