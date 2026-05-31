import { createApp } from 'vue'
import { IonicVue } from '@ionic/vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import App from './App.vue'
import { router } from './router'

/* Ionic core CSS */
import '@ionic/vue/css/core.css'
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'
import './theme/variables.css'

const app = createApp(App)
  .use(IonicVue, { mode: 'md' }) // md固定
  .use(router)
  .use(VueQueryPlugin)

router.isReady().then(() => app.mount('#app'))
