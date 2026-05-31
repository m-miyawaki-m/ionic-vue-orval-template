import type { Meta, StoryObj } from '@storybook/vue3'
import { http, HttpResponse, delay } from 'msw'
import ItemListPage from './ItemListPage.vue'

const meta: Meta<typeof ItemListPage> = {
  title: 'Pages/ItemList',
  component: ItemListPage,
}
export default meta
type Story = StoryObj<typeof ItemListPage>

export const Default: Story = {}

export const Empty: Story = {
  parameters: {
    msw: { handlers: [http.get('*/api/items', () => HttpResponse.json([]))] },
  },
}

export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/items', async () => {
          await delay('infinite')
          return HttpResponse.json([])
        }),
      ],
    },
  },
}

export const ErrorState: Story = {
  name: 'Error',
  parameters: {
    msw: { handlers: [http.get('*/api/items', () => new HttpResponse(null, { status: 500 }))] },
  },
}
