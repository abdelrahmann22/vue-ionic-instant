<template>
  <ion-page>
    <ion-content :scroll-y="true" style="--background: #FAFAFA;">
      <div style="padding-bottom:100px; background:#FAFAFA;">
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

        <!-- Header -->
        <div style="padding:56px 16px 12px; display:flex; justify-content:space-between; align-items:center;">
          <button :style="circleBtn" @click="done">
            <AppIcon name="x" :size="18" color="#1A1A1A" :stroke-width="2" />
          </button>
          <div style="font-size:14px; font-weight:600;">Receipt</div>
          <button style="padding:8px 14px; border-radius:9999px; background:#FFFFFF; border:1px solid #E5E7EB; color:#1A1A1A; font-family:inherit; font-size:12px; font-weight:600; cursor:pointer;">Share</button>
        </div>

        <!-- Success badge -->
        <div style="display:flex; flex-direction:column; align-items:center; padding:20px 16px 24px; position:relative;">
          <div style="position:relative; width:88px; height:88px; margin-bottom:18px;">
            <div style="position:absolute; inset:0; border-radius:50%; background:#D8F3DC; animation:ringRipple 1.5s ease-out infinite;" />
            <div style="position:absolute; inset:8px; border-radius:50%; background:#2D6A4F; display:flex; align-items:center; justify-content:center; box-shadow:0 8px 24px rgba(45,106,79,0.35); animation:checkPop 500ms cubic-bezier(.2,.9,.3,1.4) both;">
              <AppIcon name="check" :size="36" color="#fff" :stroke-width="3" />
            </div>
          </div>
          <div style="font-size:13px; font-weight:600; color:#2D6A4F; letter-spacing:0.04em; text-transform:uppercase; animation:fadeUp 400ms 200ms both;">Payment sent</div>
          <div style="font-size:38px; font-weight:700; letter-spacing:-0.03em; color:#1A1A1A; margin-top:6px; animation:fadeUp 400ms 280ms both; font-variant-numeric:tabular-nums;">
            ${{ receipt?.amount.toFixed(2) }}
          </div>
          <div style="font-size:13px; color:#6B7280; margin-top:4px; animation:fadeUp 400ms 360ms both;">
            to <b style="color:#1A1A1A;">{{ receipt?.merchant }}</b> · {{ receipt?.title }}
          </div>
        </div>

        <!-- Receipt card -->
        <div style="padding:0 16px; animation:fadeUp 500ms 440ms both;">
          <div style="background:#FFFFFF; border-radius:20px; padding:4px 0; box-shadow:0 1px 3px rgba(0,0,0,0.04); border:1px solid #F3F4F6; position:relative;">
            <!-- Punch holes -->
            <div style="position:absolute; left:-8px; top:50%; transform:translateY(-50%); width:16px; height:16px; border-radius:50%; background:#FAFAFA;" />
            <div style="position:absolute; right:-8px; top:50%; transform:translateY(-50%); width:16px; height:16px; border-radius:50%; background:#FAFAFA;" />

            <div style="padding:16px 20px;">
              <DetailRow label="Bill" :value="receipt?.title ?? ''" />
              <DetailRow label="Recipient" :value="receipt?.merchant ?? ''" />
              <DetailRow label="Date" :value="receipt?.date ?? ''" />
              <div style="display:flex; justify-content:space-between; padding:7px 0; align-items:center;">
                <span style="font-size:13px; color:#6B7280; font-weight:500;">Method</span>
                <span style="font-size:13px; color:#1A1A1A; font-weight:600; display:flex; align-items:center; gap:6px;">
                  <AppIcon name="credit-card" :size="14" color="#6B7280" :stroke-width="2" />
                  Card · 4242
                </span>
              </div>
            </div>

            <div style="border-top:1.5px dashed #E5E7EB; margin:4px 16px;" />

            <div style="padding:14px 20px;">
              <DetailRow :label="`Amount`" :value="`$${receipt?.amount.toFixed(2)}`" />
              <DetailRow label="Fee" value="$0.00" muted />
              <div style="display:flex; justify-content:space-between; align-items:center; padding-top:10px; border-top:1px solid #F3F4F6; margin-top:6px;">
                <span style="font-size:14px; font-weight:700;">Total paid</span>
                <span style="font-size:17px; font-weight:700; letter-spacing:-0.02em;">${{ receipt?.amount.toFixed(2) }}</span>
              </div>
            </div>

            <div style="border-top:1px solid #F3F4F6; padding:12px 20px; display:flex; justify-content:space-between; align-items:center;">
              <div style="font-size:11px; color:#9CA3AF; font-family:ui-monospace,Menlo,monospace;">TX · {{ receipt?.txn }}</div>
              <div style="font-size:11px; color:#2D6A4F; font-weight:600; display:flex; align-items:center; gap:4px;">
                <AppIcon name="shield" :size="11" color="#2D6A4F" :stroke-width="2.5" />
                Verified
              </div>
            </div>
          </div>
        </div>

        <!-- CTAs -->
        <div style="padding:20px 16px 0; display:flex; flex-direction:column; gap:8px; animation:fadeUp 500ms 540ms both;">
          <button :style="doneBtn" @click="done">Done</button>
          <button style="width:100%; height:48px; border-radius:14px; background:transparent; color:#6B7280; border:none; font-family:inherit; font-size:13px; font-weight:500; cursor:pointer;">View bill details</button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { IonPage, IonContent } from '@ionic/vue'
import { useBillStore } from '@/stores/bills'
import AppIcon from '@/components/AppIcon.vue'

const router = useRouter()
const store = useBillStore()
const receipt = computed(() => store.receipt)

function done() {
  store.clearReceipt()
  store.clearActiveBill()
  router.replace('/tabs/home')
}

const circleBtn = { width: '40px', height: '40px', borderRadius: '50%', background: '#FFFFFF', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }
const doneBtn = { width: '100%', height: '52px', borderRadius: '14px', background: '#1C1C1E', color: '#fff', border: 'none', fontFamily: 'inherit', fontSize: '14px', fontWeight: '600', cursor: 'pointer', letterSpacing: '-0.01em' }
</script>

<script lang="ts">
import { defineComponent, h } from 'vue'

const DetailRow = defineComponent({
  props: { label: String, value: String, muted: Boolean },
  setup(props) {
    return () => h('div', { style: 'display:flex; justify-content:space-between; padding:7px 0; align-items:center;' }, [
      h('span', { style: 'font-size:13px; color:#6B7280; font-weight:500;' }, props.label),
      h('span', { style: `font-size:13px; color:${props.muted ? '#6B7280' : '#1A1A1A'}; font-weight:${props.muted ? '500' : '600'}; letter-spacing:-0.005em;` }, props.value),
    ])
  },
})

export default { components: { DetailRow } }
</script>
