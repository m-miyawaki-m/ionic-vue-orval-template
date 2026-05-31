import type { Meta, StoryObj } from '@storybook/vue3'
import { http, HttpResponse } from 'msw'
import ItemDetailPage from './ItemDetailPage.vue'

const meta: Meta<typeof ItemDetailPage> = {
  title: 'Pages/ItemDetail',
  component: ItemDetailPage,
}
export default meta
type Story = StoryObj<typeof ItemDetailPage>

export const Found: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/api/items/:id', () =>
          HttpResponse.json({
            id: '1',
            title: 'サンプル',
            description: '説明',
            status: 'doing',
            createdAt: '2026-05-01T00:00:00Z',
          }),
        ),
      ],
    },
  },
}

export const NotFound: Story = {
  parameters: {
    msw: {
      handlers: [http.get('*/api/items/:id', () => new HttpResponse(null, { status: 404 }))],
    },
  },
}
