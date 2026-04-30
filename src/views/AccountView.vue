<template>
  <ion-page>
    <ion-content :scroll-y="true" style="--background: #FAFAFA;">
      <div style="padding-bottom:110px; background:#FAFAFA;">

        <!-- Profile hero -->
        <div style="padding:8px 16px 0;">
          <div :style="profileCard">
            <div :style="profileBg" />
            <div style="position:relative; margin-top:4px;">
              <AppAvatar :initial="initials" :size="72" :palette="0" />
              <div :style="verifyBadge">
                <AppIcon name="check" :size="11" color="#fff" :stroke-width="3" />
              </div>
            </div>
            <div style="text-align:center; position:relative;">
              <div style="font-size:18px; font-weight:700; letter-spacing:-0.02em;">{{ displayName }}</div>
              <div style="font-size:13px; color:#6B7280; margin-top:2px;">{{ email }}</div>
            </div>
            <button :style="editBtn" @click="editProfile">Edit profile</button>
          </div>
        </div>

        <!-- Stat cards -->
        <div style="padding:12px 16px 0; display:grid; grid-template-columns:1fr 1fr; gap:10px;">
          <StatCard tint="#F3E8FF" label="Total contributed" :value="`$${billStore.totalContributed.toFixed(2)}`" :sub="`${billStore.payments.length} payments`" />
          <StatCard tint="#D8F3DC" label="Bills paid" :value="String(billStore.billsPaidCount)" :sub="`${billStore.activeBillsCount} pending`" />
        </div>

        <!-- Preferences -->
        <div style="padding:20px 16px 0;">
          <div style="font-size:11px; font-weight:600; color:#6B7280; letter-spacing:0.06em; text-transform:uppercase; padding:0 4px 8px;">Preferences</div>
          <div style="background:#FFFFFF; border-radius:16px; border:1px solid #F3F4F6; overflow:hidden;">
            <SettingsRow icon="bell" label="Notifications">
              <AppToggle :model-value="billStore.preferences.notifications" @update:model-value="toggleNotifications" />
            </SettingsRow>
            <SettingsRow icon="shield" label="Biometric login">
              <AppToggle :model-value="billStore.preferences.biometrics" @update:model-value="toggleBiometrics" />
            </SettingsRow>
            <SettingsRow icon="globe" label="Language" clickable @row-click="changeLanguage">
              <span style="display:flex; align-items:center; gap:4px; color:#9CA3AF; font-size:13px;">
                {{ billStore.preferences.language }} <AppIcon name="chevron-right" :size="14" color="#9CA3AF" :stroke-width="2" />
              </span>
            </SettingsRow>
            <SettingsRow icon="credit-card" label="Payment methods" :no-border="true" clickable @row-click="paymentMethods">
              <span style="display:flex; align-items:center; gap:4px; color:#9CA3AF; font-size:13px;">
                <AppIcon name="chevron-right" :size="14" color="#9CA3AF" :stroke-width="2" />
              </span>
            </SettingsRow>
          </div>
        </div>

        <!-- Account -->
        <div style="padding:16px 16px 0;">
          <div style="font-size:11px; font-weight:600; color:#6B7280; letter-spacing:0.06em; text-transform:uppercase; padding:0 4px 8px;">Account</div>
          <div style="background:#FFFFFF; border-radius:16px; border:1px solid #F3F4F6; overflow:hidden;">
            <SettingsRow icon="user" label="Personal information" clickable @row-click="editProfile">
              <AppIcon name="chevron-right" :size="16" color="#9CA3AF" :stroke-width="2" />
            </SettingsRow>
            <SettingsRow icon="receipt" label="Transaction history" clickable @row-click="viewHistory">
              <AppIcon name="chevron-right" :size="16" color="#9CA3AF" :stroke-width="2" />
            </SettingsRow>
            <SettingsRow icon="log-out" label="Logout" label-color="#DC2626" icon-color="#DC2626" :no-border="true" clickable @row-click="logout">
              <AppIcon name="chevron-right" :size="16" color="#FCA5A5" :stroke-width="2" />
            </SettingsRow>
          </div>
        </div>

        <div style="text-align:center; padding:24px 16px 0; font-size:11px; color:#9CA3AF;">Instant · v1.0.0</div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, defineComponent, h } from 'vue'
import { useRouter } from 'vue-router'
import { IonPage, IonContent, alertController, toastController } from '@ionic/vue'
import { useBillStore } from '@/stores/bills'
import { useAuthStore } from '@/stores/auth'
import AppIcon from '@/components/AppIcon.vue'
import AppAvatar from '@/components/AppAvatar.vue'
import AppToggle from '@/components/AppToggle.vue'

const router = useRouter()
const billStore = useBillStore()
const authStore = useAuthStore()

const displayName = computed(() => authStore.user?.username || authStore.user?.email?.split('@')[0] || 'Guest')
const email = computed(() => authStore.user?.email || '')
const initials = computed(() => (displayName.value[0] || 'G').toUpperCase())

async function toggleNotifications(val: boolean) {
  await billStore.updatePreferences({ notifications: val })
}

async function toggleBiometrics(val: boolean) {
  await billStore.updatePreferences({ biometrics: val })
}

async function editProfile() {
  const toast = await toastController.create({
    message: 'Profile editing — backend endpoint not yet available',
    duration: 2400, position: 'bottom', color: 'dark',
  })
  await toast.present()
}

async function changeLanguage() {
  const languages = ['English', 'Arabic', 'French', 'Spanish']
  const alert = await alertController.create({
    header: 'Language',
    inputs: languages.map((lang) => ({
      type: 'radio' as const,
      label: lang,
      value: lang,
      checked: billStore.preferences.language === lang,
    })),
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      {
        text: 'Select',
        handler: async (lang: string) => {
          await billStore.updatePreferences({ language: lang })
        },
      },
    ],
  })
  await alert.present()
}

async function paymentMethods() {
  const toast = await toastController.create({
    message: 'Payment methods — coming soon!',
    duration: 2000, position: 'bottom', color: 'dark',
  })
  await toast.present()
}

function viewHistory() {
  router.push('/tabs/home')
}

async function logout() {
  const alert = await alertController.create({
    header: 'Log out',
    message: 'Are you sure you want to log out?',
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      {
        text: 'Log out',
        role: 'destructive',
        handler: async () => {
          await authStore.logout()
          billStore.reset()
          router.replace('/login')
        },
      },
    ],
  })
  await alert.present()
}

const StatCard = defineComponent({
  props: { tint: String, label: String, value: String, sub: String },
  setup(props) {
    return () => h('div', {
      style: `background:${props.tint}; border-radius:18px; padding:14px 16px 16px; display:flex; flex-direction:column; gap:4px;`,
    }, [
      h('div', { style: 'font-size:11px; font-weight:600; color:#6B7280; letter-spacing:0.02em; text-transform:uppercase;' }, props.label),
      h('div', { style: 'font-size:22px; font-weight:700; letter-spacing:-0.02em; color:#1A1A1A;' }, props.value),
      h('div', { style: 'font-size:11px; color:#6B7280; font-weight:500; margin-top:2px;' }, props.sub),
    ])
  },
})

const SettingsRow = defineComponent({
  props: {
    icon: String, label: String, noBorder: Boolean,
    labelColor: String, iconColor: String, clickable: Boolean,
  },
  emits: ['row-click'],
  setup(props, { slots, emit }) {
    return () => h('div', {
      style: `padding:14px 16px; display:flex; align-items:center; gap:12px; border-bottom:${props.noBorder ? 'none' : '1px solid #F3F4F6'}; ${props.clickable ? 'cursor:pointer;' : ''}`,
      onClick: props.clickable ? () => emit('row-click') : undefined,
    }, [
      h('div', { style: 'width:32px; height:32px; border-radius:10px; background:#F3F4F6; display:flex; align-items:center; justify-content:center;' }, [
        h(AppIcon, { name: props.icon!, size: 16, color: props.iconColor ?? '#6B7280', strokeWidth: 2 }),
      ]),
      h('div', { style: `flex:1; font-size:14px; font-weight:500; color:${props.labelColor ?? '#1A1A1A'}; letter-spacing:-0.01em;` }, props.label),
      slots.default?.(),
    ])
  },
})

const profileCard = { background: '#FFFFFF', borderRadius: '24px', padding: '24px 20px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', border: '1px solid #F3F4F6', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', position: 'relative', overflow: 'hidden' }
const profileBg = { position: 'absolute', top: '-40px', left: '-40px', right: '-40px', height: '110px', background: 'linear-gradient(180deg, #E8F5EA 0%, transparent 100%)' }
const verifyBadge = { position: 'absolute', bottom: '-2px', right: '-2px', width: '22px', height: '22px', borderRadius: '50%', background: '#2D6A4F', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #fff' }
const editBtn = { padding: '8px 16px', borderRadius: '9999px', marginTop: '4px', background: '#F3F4F6', border: 'none', color: '#1A1A1A', fontFamily: 'inherit', fontSize: '12px', fontWeight: '600', cursor: 'pointer', position: 'relative' }
</script>
