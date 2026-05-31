import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { setupServer } from 'msw/node'
import { handlers } from './handlers'
import { store } from './store'

const server = setupServer(...handlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => { server.resetHandlers(); store.reset() })
afterAll(() => server.close())

describe('msw handlers over store', () => {
  it('GET /api/items returns seed list', async () => {
    const res = await fetch('http://localhost/api/items')
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.length).toBeGreaterThan(0)
  })

  it('POST then GET reflects creation', async () => {
    await fetch('http://localhost/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '結合テスト', status: 'todo' }),
    })
    const res = await fetch('http://localhost/api/items')
    const body = await res.json()
    expect(body[0].title).toBe('結合テスト')
  })

  it('GET missing id returns 404', async () => {
    const res = await fetch('http://localhost/api/items/nope')
    expect(res.status).toBe(404)
  })
})
