import type { Preview } from '@storybook/vue3'
import { setup } from '@storybook/vue3'
import { IonicVue } from '@ionic/vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { initialize, mswLoader } from 'msw-storybook-addon'
import { handlers } from '../src/mocks/handlers'
import { store } from '../src/mocks/store'

import '@ionic/vue/css/core.css'
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'
import '../src/theme/variables.css'

initialize({ onUnhandledRequest: 'bypass' })

setup((app) => {
  app.use(IonicVue, { mode: 'md' })
  app.use(VueQueryPlugin)
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
