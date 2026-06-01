import type { Preview } from '@storybook/vue3'
import { setup } from '@storybook/vue3'
import { IonicVue } from '@ionic/vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { createRouter, createMemoryHistory } from '@ionic/vue-router'
import { initialize, mswLoader } from 'msw-storybook-addon'
import { handlers } from '../src/mocks/handlers'
import { store } from '../src/mocks/store'

import '@ionic/vue/css/core.css'
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'
import '../src/theme/variables.css'

initialize({ onUnhandledRequest: 'bypass' })

// Storybook 用メモリルーター。
// @ionic/vue-router の createRouter は router.install 内で
// app.provide("navManager", ionRouter) を呼ぶため、
// これをインストールしないと IonBackButton の inject("navManager") が
// undefined になりクリックが無効になる。
// また useRoute() / useRouter() も undefined を返すため
// ItemDetailPage など route を使うコンポーネントがクラッシュする。
const storybookRouter = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', redirect: '/items' },
    { path: '/items', component: { template: '<div />' } },
    { path: '/items/:id', component: { template: '<div />' } },
  ],
})

setup((app) => {
  app.use(IonicVue, { mode: 'md' })
  app.use(VueQueryPlugin)
  app.use(storybookRouter)
})

const preview: Preview = {
  loaders: [mswLoader],
  parameters: {
    msw: { handlers },
  },
  decorators: [
    (story) => {
      store.reset()
      return story()
    },
  ],
}
export default preview
