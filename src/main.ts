import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { IonicVue } from '@ionic/vue'

import App from './App.vue'
import router from './router'

import '@ionic/vue/css/core.css'
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'
import './assets/global.css'

const app = createApp(App)

app.use(IonicVue, {
  mode: 'ios',
  animated: true,
})
app.use(createPinia())
app.use(router)

router.isReady().then(() => {
  app.mount('#app')
})
