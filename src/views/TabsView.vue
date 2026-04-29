<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet />
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="home" href="/tabs/home">
          <AppIcon name="house" :size="22" :stroke-width="isActive('home') ? 2.2 : 1.8" />
          <ion-label>Home</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="scan" href="/tabs/scan">
          <AppIcon name="scan-line" :size="22" :stroke-width="isActive('scan') ? 2.2 : 1.8" />
          <ion-label>Scan</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="account" href="/tabs/account">
          <AppIcon name="user" :size="22" :stroke-width="isActive('account') ? 2.2 : 1.8" />
          <ion-label>Account</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonTabs, IonTabBar, IonTabButton, IonLabel, IonRouterOutlet } from '@ionic/vue'
import { useRoute } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'

const route = useRoute()
const isActive = (tab: string) => route.path.includes(`/tabs/${tab}`)
</script>
