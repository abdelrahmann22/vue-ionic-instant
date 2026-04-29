<template>
  <ion-page>
    <ion-content :scroll-y="false" style="--background: #0A0A0A;">
      <div style="height:100%; background:#0A0A0A; position:relative; color:#fff; overflow:hidden;">
        <style>
          @keyframes scanLine {
            0% { transform: translateY(-90px); opacity: 0; }
            10% { opacity: 1; }
            50% { transform: translateY(90px); opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(-90px); opacity: 0; }
          }
          @keyframes pulseDot {
            0%, 100% { opacity: 0.5; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.4); }
          }
        </style>

        <!-- Camera noise gradient -->
        <div style="position:absolute; inset:0; background:radial-gradient(ellipse at center, #1a1a1a 0%, #050505 70%);" />

        <!-- Top bar -->
        <div style="position:absolute; top:0; left:0; right:0; padding:56px 16px 12px; display:flex; justify-content:space-between; align-items:center; z-index:3;">
          <button :style="glassBtn" @click="router.back()">
            <AppIcon name="x" :size="18" color="#fff" :stroke-width="2" />
          </button>
          <div style="font-size:14px; font-weight:600; letter-spacing:-0.01em;">Scan a QR code</div>
          <button :style="flashBtn" @click="flashOn = !flashOn">
            <AppIcon name="flash" :size="16" :color="flashOn ? '#1A1A1A' : '#fff'" :stroke-width="2" />
          </button>
        </div>

        <!-- Reticle -->
        <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -54%); width:240px; height:240px;">
          <!-- Corner TL -->
          <div style="position:absolute; top:0; left:0; width:36px; height:36px; border-top:3px solid #fff; border-left:3px solid #fff; border-radius:12px 0 0 0;" />
          <!-- Corner TR -->
          <div style="position:absolute; top:0; right:0; width:36px; height:36px; border-top:3px solid #fff; border-right:3px solid #fff; border-radius:0 12px 0 0;" />
          <!-- Corner BL -->
          <div style="position:absolute; bottom:0; left:0; width:36px; height:36px; border-bottom:3px solid #fff; border-left:3px solid #fff; border-radius:0 0 0 12px;" />
          <!-- Corner BR -->
          <div style="position:absolute; bottom:0; right:0; width:36px; height:36px; border-bottom:3px solid #fff; border-right:3px solid #fff; border-radius:0 0 12px 0;" />
          <!-- Scan line -->
          <div style="position:absolute; top:50%; left:12px; right:12px; height:2px; background:linear-gradient(90deg,transparent,#22C55E,transparent); box-shadow:0 0 10px #22C55E; animation:scanLine 2.4s ease-in-out infinite;" />
        </div>

        <!-- Helper text -->
        <div style="position:absolute; top:calc(50% + 150px); left:0; right:0; text-align:center; padding:0 32px;">
          <div style="font-size:14px; font-weight:500; opacity:0.85; margin-bottom:6px; letter-spacing:-0.01em;">Align the QR code within the frame</div>
          <div style="font-size:12px; color:rgba(255,255,255,0.5);">We'll auto-detect the bill</div>
        </div>

        <!-- Bottom action area -->
        <div style="position:absolute; bottom:110px; left:0; right:0; display:flex; flex-direction:column; align-items:center; gap:14px; z-index:3;">
          <div style="display:flex; gap:10px;">
            <button :style="glassChip">
              <AppIcon name="image" :size="14" color="#fff" :stroke-width="2" />
              From photos
            </button>
            <button :style="glassChip">
              <AppIcon name="plus" :size="14" color="#fff" :stroke-width="2" />
              Enter manually
            </button>
          </div>

          <button :style="captureBtn" :disabled="scanning" @click="handleScan">
            <AppIcon v-if="scanning" name="check" :size="26" color="#fff" :stroke-width="2.5" />
          </button>

          <div style="font-size:11px; color:rgba(255,255,255,0.55); display:flex; align-items:center; gap:6px;">
            <div :style="pulseDot" />
            {{ scanning ? 'Bill detected — opening…' : 'Camera ready' }}
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { IonPage, IonContent } from '@ionic/vue'
import { useBillStore } from '@/stores/bills'
import AppIcon from '@/components/AppIcon.vue'

const router = useRouter()
const store = useBillStore()
const scanning = ref(false)
const flashOn = ref(false)

async function handleScan() {
  if (scanning.value) return
  scanning.value = true
  try {
    const bill = await store.scanQR('mock-qr-token')
    store.setActiveBill(bill)
    router.push(`/bill/${bill.id}`)
  } finally {
    scanning.value = false
  }
}

const glassBtn = { width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(10px)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }
const flashBtn = computed(() => ({ ...glassBtn, background: flashOn.value ? '#fff' : 'rgba(255,255,255,0.10)' }))
const glassChip = { padding: '10px 18px', borderRadius: '9999px', background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(10px)', border: 'none', color: '#fff', fontFamily: 'inherit', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }
const captureBtn = computed(() => ({ width: '64px', height: '64px', borderRadius: '50%', background: scanning.value ? '#2D6A4F' : '#fff', border: '4px solid rgba(255,255,255,0.25)', cursor: scanning.value ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 200ms' }))
const pulseDot = { width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E', animation: 'pulseDot 1.5s infinite', display: 'inline-block' }
</script>
