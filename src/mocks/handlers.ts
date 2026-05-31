import { http, HttpResponse } from 'msw'
import { store } from './store'
import { getItemsMock } from '@/api/generated/endpoints'

export const handlers = [
  // Store overlay — CRUD is persisted in-memory (B-plan)
  http.get('*/api/items', () => HttpResponse.json(store.list())),

  http.get('*/api/items/:id', ({ params }) => {
    const item = store.get(String(params.id))
    return item ? HttpResponse.json(item) : new HttpResponse(null, { status: 404 })
  }),

  http.post('*/api/items', async ({ request }) => {
    const body = (await request.json()) as Parameters<typeof store.create>[0]
    return HttpResponse.json(store.create(body), { status: 201 })
  }),

  http.put('*/api/items/:id', async ({ params, request }) => {
    const body = (await request.json()) as Parameters<typeof store.update>[1]
    const updated = store.update(String(params.id), body)
    return updated ? HttpResponse.json(updated) : new HttpResponse(null, { status: 404 })
  }),

  http.delete('*/api/items/:id', ({ params }) => {
    store.remove(String(params.id))
    return new HttpResponse(null, { status: 204 })
  }),

  // Fallback: generated faker handlers for any other/future endpoints
  ...getItemsMock(),
]
