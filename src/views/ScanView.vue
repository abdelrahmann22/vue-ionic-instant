<template>
  <ion-page>
    <ion-content :scroll-y="false" style="--background: #0A0A0A;">
      <div style="height:100%; background:#0A0A0A; position:relative; color:#fff; overflow:hidden;">
        <div style="position:absolute; inset:0; background:radial-gradient(ellipse at center, #1a1a1a 0%, #050505 70%);" />

        <!-- Top bar -->
        <div style="position:absolute; top:0; left:0; right:0; padding:56px 16px 12px; display:flex; justify-content:space-between; align-items:center; z-index:3;">
          <button :style="glassBtn" @click="router.replace('/tabs/home')">
            <AppIcon name="x" :size="18" color="#fff" :stroke-width="2" />
          </button>
          <div style="font-size:14px; font-weight:600; letter-spacing:-0.01em;">Scan a QR code</div>
          <button :style="flashBtnStyle" @click="flashOn = !flashOn">
            <AppIcon name="flash" :size="16" :color="flashOn ? '#1A1A1A' : '#fff'" :stroke-width="2" />
          </button>
        </div>

        <!-- Reticle -->
        <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -54%); width:240px; height:240px;">
          <div style="position:absolute; top:0; left:0; width:36px; height:36px; border-top:3px solid #fff; border-left:3px solid #fff; border-radius:12px 0 0 0;" />
          <div style="position:absolute; top:0; right:0; width:36px; height:36px; border-top:3px solid #fff; border-right:3px solid #fff; border-radius:0 12px 0 0;" />
          <div style="position:absolute; bottom:0; left:0; width:36px; height:36px; border-bottom:3px solid #fff; border-left:3px solid #fff; border-radius:0 0 0 12px;" />
          <div style="position:absolute; bottom:0; right:0; width:36px; height:36px; border-bottom:3px solid #fff; border-right:3px solid #fff; border-radius:0 0 12px 0;" />
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
            <button :style="glassChip" @click="fromPhotos">
              <AppIcon name="image" :size="14" color="#fff" :stroke-width="2" />
              From photos
            </button>
            <button :style="glassChip" @click="enterManually">
              <AppIcon name="plus" :size="14" color="#fff" :stroke-width="2" />
              Enter manually
            </button>
          </div>

          <button :style="captureBtnStyle" :disabled="loading" @click="enterManually">
            <AppIcon v-if="loading" name="check" :size="26" color="#fff" :stroke-width="2.5" />
          </button>

          <div style="font-size:11px; color:rgba(255,255,255,0.55); display:flex; align-items:center; gap:6px;">
            <div :style="pulseDot" />
            {{ loading ? 'Loading bill…' : 'Tap to enter bill code' }}
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { IonPage, IonContent, alertController, toastController } from '@ionic/vue'
import { useBillStore } from '@/stores/bills'
import { parseBillFromQR } from '@/services/billService'
import AppIcon from '@/components/AppIcon.vue'

const router = useRouter()
const store = useBillStore()
const loading = ref(false)
const flashOn = ref(false)

async function fromPhotos() {
  const toast = await toastController.create({
    message: 'Photo library — coming soon!',
    duration: 2000, position: 'bottom', color: 'dark',
  })
  await toast.present()
}

async function enterManually() {
  const alert = await alertController.create({
    header: 'Enter Bill',
    message: 'Paste the bill URL or enter as "id:token".',
    inputs: [
      {
        name: 'value',
        type: 'text',
        placeholder: 'e.g. 5:Aa1Bb2Cc',
        attributes: { autocapitalize: 'off', autocorrect: 'off' },
      },
    ],
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      {
        text: 'Open Bill',
        handler: async (data: { value: string }) => {
          const parsed = parseBillFromQR(data.value)
          if (!parsed) {
            const t = await toastController.create({
              message: 'Invalid format. Try "5:Aa1Bb2Cc" or paste the QR URL.',
              duration: 2500, position: 'bottom', color: 'danger',
            })
            await t.present()
            return false
          }
          await openBill(parsed.billId, parsed.token)
          return true
        },
      },
    ],
  })
  await alert.present()
}

async function openBill(billId: number, token: string) {
  loading.value = true
  try {
    await store.loadBillByToken(billId, token)
    router.push(`/bill/${billId}`)
  } catch (e: any) {
    const t = await toastController.create({
      message: e?.response?.data?.message ?? 'Bill not found or expired',
      duration: 2500, position: 'bottom', color: 'danger',
    })
    await t.present()
  } finally {
    loading.value = false
  }
}

const glassBtn = { width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(10px)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }
const flashBtnStyle = computed(() => ({ ...glassBtn, background: flashOn.value ? '#fff' : 'rgba(255,255,255,0.10)' }))
const glassChip = { padding: '10px 18px', borderRadius: '9999px', background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(10px)', border: 'none', color: '#fff', fontFamily: 'inherit', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }
const captureBtnStyle = computed(() => ({ width: '64px', height: '64px', borderRadius: '50%', background: loading.value ? '#2D6A4F' : '#fff', border: '4px solid rgba(255,255,255,0.25)', cursor: loading.value ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 200ms' }))
const pulseDot = { width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E', animation: 'pulseDot 1.5s infinite', display: 'inline-block' }
</script>

<style scoped>
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
