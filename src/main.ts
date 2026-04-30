import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { IonicVue } from '@ionic/vue'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'

import '@ionic/vue/css/core.css'
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'
import './assets/global.css'

const app = createApp(App)

app.use(IonicVue, { mode: 'ios', animated: true })
const pinia = createPinia()
app.use(pinia)
app.use(router)

;(async () => {
  // Hydrate auth state from persisted token before first render
  const authStore = useAuthStore(pinia)
  await authStore.init()

  await router.isReady()
  app.mount('#app')
})()
