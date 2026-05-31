import { describe, it, expect, beforeEach } from 'vitest'
import { store } from './store'

describe('store', () => {
  beforeEach(() => store.reset())

  it('seeds initial items', () => {
    expect(store.list().length).toBeGreaterThan(0)
  })

  it('creates an item at the top with a new id', () => {
    const before = store.list().length
    const created = store.create({ title: 'New', status: 'todo' })
    expect(created.id).toBeTruthy()
    expect(store.list().length).toBe(before + 1)
    expect(store.list()[0].id).toBe(created.id)
  })

  it('gets by id, undefined when missing', () => {
    const it0 = store.list()[0]
    expect(store.get(it0.id)?.id).toBe(it0.id)
    expect(store.get('nope')).toBeUndefined()
  })

  it('updates an existing item', () => {
    const it0 = store.list()[0]
    const updated = store.update(it0.id, { title: 'Changed', status: 'done' })
    expect(updated?.title).toBe('Changed')
    expect(store.get(it0.id)?.status).toBe('done')
  })

  it('removes an item', () => {
    const it0 = store.list()[0]
    store.remove(it0.id)
    expect(store.get(it0.id)).toBeUndefined()
  })

  it('reset restores seed', () => {
    store.remove(store.list()[0].id)
    store.reset()
    expect(store.list().length).toBeGreaterThan(0)
  })
})
