import type { Item, ItemInput } from '@/api/generated/model'

function seedItems(): Item[] {
  return [
    { id: '1', title: '牛乳を買う', description: 'スーパーで', status: 'todo', createdAt: '2026-05-01T09:00:00Z' },
    { id: '2', title: '設計レビュー', description: 'orvalテンプレ', status: 'doing', createdAt: '2026-05-02T10:00:00Z' },
    { id: '3', title: 'README作成', description: '', status: 'done', createdAt: '2026-05-03T11:00:00Z' },
  ]
}

let items: Item[] = seedItems()
let seq = items.length

export const store = {
  list(): Item[] {
    return items
  },
  get(id: string): Item | undefined {
    return items.find((i) => i.id === id)
  },
  create(input: ItemInput): Item {
    seq += 1
    const created: Item = {
      id: String(seq),
      title: input.title,
      description: input.description,
      status: input.status,
      createdAt: '2026-05-31T00:00:00Z',
    }
    items = [created, ...items]
    return created
  },
  update(id: string, input: ItemInput): Item | undefined {
    const idx = items.findIndex((i) => i.id === id)
    if (idx === -1) return undefined
    const updated: Item = { ...items[idx], title: input.title, description: input.description, status: input.status }
    items = items.map((i, k) => (k === idx ? updated : i))
    return updated
  },
  remove(id: string): void {
    items = items.filter((i) => i.id !== id)
  },
  reset(): void {
    items = seedItems()
    seq = items.length
  },
}
