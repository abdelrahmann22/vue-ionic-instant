<template>
  <ion-page>
    <ion-content :scroll-y="false" style="--background: #0A0A0A;">
      <div style="height:100%; background:#0A0A0A; position:relative; color:#fff; overflow:hidden;">
        <!-- Camera video feed -->
        <video
          ref="videoEl"
          playsinline
          autoplay
          muted
          :style="videoStyle"
        />

        <!-- Dim overlay when camera not active -->
        <div v-if="!cameraActive" style="position:absolute; inset:0; background:radial-gradient(ellipse at center, #1a1a1a 0%, #050505 70%);" />

        <!-- Top bar -->
        <div style="position:absolute; top:0; left:0; right:0; padding:56px 16px 12px; display:flex; justify-content:space-between; align-items:center; z-index:3;">
          <button :style="glassBtn" @click="closeView">
            <AppIcon name="x" :size="18" color="#fff" :stroke-width="2" />
          </button>
          <div style="font-size:14px; font-weight:600; letter-spacing:-0.01em;">Scan a QR code</div>
          <button :style="flashBtnStyle" :disabled="!hasFlash" @click="toggleFlash">
            <AppIcon name="flash" :size="16" :color="flashOn ? '#1A1A1A' : '#fff'" :stroke-width="2" />
          </button>
        </div>

        <!-- Reticle -->
        <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -54%); width:240px; height:240px; z-index:2;">
          <div style="position:absolute; top:0; left:0; width:36px; height:36px; border-top:3px solid #fff; border-left:3px solid #fff; border-radius:12px 0 0 0;" />
          <div style="position:absolute; top:0; right:0; width:36px; height:36px; border-top:3px solid #fff; border-right:3px solid #fff; border-radius:0 12px 0 0;" />
          <div style="position:absolute; bottom:0; left:0; width:36px; height:36px; border-bottom:3px solid #fff; border-left:3px solid #fff; border-radius:0 0 0 12px;" />
          <div style="position:absolute; bottom:0; right:0; width:36px; height:36px; border-bottom:3px solid #fff; border-right:3px solid #fff; border-radius:0 0 12px 0;" />
          <div style="position:absolute; top:50%; left:12px; right:12px; height:2px; background:linear-gradient(90deg,transparent,#22C55E,transparent); box-shadow:0 0 10px #22C55E; animation:scanLine 2.4s ease-in-out infinite;" />
        </div>

        <!-- Helper text -->
        <div style="position:absolute; top:calc(50% + 150px); left:0; right:0; text-align:center; padding:0 32px; z-index:2;">
          <div style="font-size:14px; font-weight:500; opacity:0.85; margin-bottom:6px; letter-spacing:-0.01em;">{{ helperTitle }}</div>
          <div style="font-size:12px; color:rgba(255,255,255,0.5);">{{ helperSub }}</div>
        </div>

        <!-- Bottom action area -->
        <div style="position:absolute; bottom:110px; left:0; right:0; display:flex; flex-direction:column; align-items:center; gap:14px; z-index:3;">
          <div style="display:flex; gap:10px;">
            <button :style="glassChip" @click="enterManually">
              <AppIcon name="plus" :size="14" color="#fff" :stroke-width="2" />
              Enter manually
            </button>
            <button v-if="!cameraActive && !permissionDenied" :style="glassChip" @click="startCamera">
              <AppIcon name="scan-line" :size="14" color="#fff" :stroke-width="2" />
              Enable camera
            </button>
          </div>

          <div :style="statusPill">
            <div :style="cameraActive ? pulseDot : staticDot" />
            {{ statusText }}
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonPage, IonContent,
  alertController, toastController,
  onIonViewWillEnter, onIonViewWillLeave,
} from '@ionic/vue'
import { useBillStore } from '@/stores/bills'
import { parseBillFromQR } from '@/services/billService'
import AppIcon from '@/components/AppIcon.vue'
import QrScanner from 'qr-scanner'

const router = useRouter()
const store = useBillStore()
const videoEl = ref<HTMLVideoElement | null>(null)

const loading = ref(false)
const flashOn = ref(false)
const hasFlash = ref(false)
const cameraActive = ref(false)
const permissionDenied = ref(false)
const handlingResult = ref(false)
let scanner: QrScanner | null = null

const statusText = computed(() => {
  if (loading.value) return 'Loading bill…'
  if (cameraActive.value) return 'Scanning…'
  if (permissionDenied.value) return 'Camera blocked — use manual entry'
  return 'Camera not started'
})

const helperTitle = computed(() => {
  if (cameraActive.value) return 'Align the QR code within the frame'
  if (permissionDenied.value) return 'Camera access blocked'
  return 'Tap "Enable camera" to scan'
})

const helperSub = computed(() => {
  if (cameraActive.value) return "We'll auto-detect the bill"
  if (permissionDenied.value) return 'Allow camera access in your browser settings, or enter the bill manually'
  return 'Or use "Enter manually" with a bill code'
})

async function startCamera() {
  if (!videoEl.value) return
  permissionDenied.value = false

  try {
    scanner = new QrScanner(
      videoEl.value,
      (result) => onScanResult(result.data),
      {
        highlightScanRegion: false,
        highlightCodeOutline: false,
        preferredCamera: 'environment',
        maxScansPerSecond: 5,
      },
    )
    await scanner.start()
    cameraActive.value = true
    try {
      hasFlash.value = await scanner.hasFlash()
    } catch {
      hasFlash.value = false
    }
  } catch (err: any) {
    cameraActive.value = false
    if (err?.name === 'NotAllowedError' || /permission/i.test(String(err?.message))) {
      permissionDenied.value = true
    }
    console.warn('[ScanView] camera failed to start:', err)
  }
}

function stopCamera() {
  try {
    scanner?.stop()
    scanner?.destroy()
  } catch { /* ignore */ }
  scanner = null
  cameraActive.value = false
  flashOn.value = false
}

async function toggleFlash() {
  if (!scanner || !hasFlash.value) return
  try {
    await scanner.toggleFlash()
    flashOn.value = scanner.isFlashOn()
  } catch (err) {
    console.warn('[ScanView] flash toggle failed:', err)
  }
}

async function onScanResult(data: string) {
  if (handlingResult.value) return
  const parsed = parseBillFromQR(data)
  if (!parsed) {
    // Ignore non-bill QR codes
    return
  }
  handlingResult.value = true
  stopCamera()
  await openBill(parsed.billId, parsed.token)
  handlingResult.value = false
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
          stopCamera()
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
    // Restart camera so user can try another QR
    if (!cameraActive.value && !permissionDenied.value) startCamera()
  } finally {
    loading.value = false
  }
}

function closeView() {
  stopCamera()
  router.replace('/tabs/home')
}

// Ionic caches page components — use Ionic lifecycle so the camera restarts
// every time the user navigates back to the Scan tab.
onIonViewWillEnter(async () => {
  handlingResult.value = false
  await nextTick()
  await startCamera()
})

onIonViewWillLeave(() => {
  stopCamera()
})

// Ensures cleanup if the component is actually unmounted (e.g. on logout)
onBeforeUnmount(() => stopCamera())

const videoStyle = computed(() => ({
  position: 'absolute',
  inset: '0',
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  background: '#000',
  opacity: cameraActive.value ? '1' : '0',
  transition: 'opacity 200ms',
  zIndex: '1',
}))
const glassBtn = { width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(10px)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }
const flashBtnStyle = computed(() => ({
  ...glassBtn,
  background: flashOn.value ? '#fff' : 'rgba(255,255,255,0.10)',
  opacity: hasFlash.value ? '1' : '0.4',
  cursor: hasFlash.value ? 'pointer' : 'not-allowed',
}))
const glassChip = { padding: '10px 18px', borderRadius: '9999px', background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(10px)', border: 'none', color: '#fff', fontFamily: 'inherit', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }
const statusPill = { fontSize: '11px', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)', padding: '6px 12px', borderRadius: '9999px' }
const pulseDot = { width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E', animation: 'pulseDot 1.5s infinite', display: 'inline-block' }
const staticDot = { width: '6px', height: '6px', borderRadius: '50%', background: '#9CA3AF', display: 'inline-block' }
</script>

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
