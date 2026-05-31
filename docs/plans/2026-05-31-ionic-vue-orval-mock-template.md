# Ionic + Vue + orval Mock テンプレート 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** OpenAPI 仕様から orval で型・Vue Query クライアント・MSW モックを生成し、CRUD が本物のように動く Ionic + Vue のスターターテンプレートを構築する。

**Architecture:** Vite + @ionic/vue（md固定）。orval が `src/api/generated/` に型・vue-query composable・MSW ハンドラを生成（再生成可・聖域）。手書きは `src/mocks/` の薄いインメモリ store とそれで生成ハンドラを上書き合成する handlers のみ。MSW は dev/Storybook 限定で起動し、本番は実API直結。

**Tech Stack:** Vue 3, TypeScript, Vite, @ionic/vue, @ionic/vue-router, orval, @tanstack/vue-query, MSW v2, Storybook, msw-storybook-addon, Vitest。

**作業ディレクトリ:** `C:\Oracle\3df002\ionic-vue-orval-template`（git 初期化済み）

**Windows 補足:** コマンドは npm/npx でクロスプラットフォーム。PowerShell では `&&` が使えないため、各コマンドは1行ずつ実行する。

---

## ファイル構成（このプランで作成/変更するもの）

```
ionic-vue-orval-template/
├─ package.json                         T1
├─ tsconfig.json / tsconfig.node.json   T1
├─ vite.config.ts                       T1
├─ index.html                           T1
├─ .gitignore                           T1
├─ openapi/openapi.yaml                 T2
├─ orval.config.ts                      T3
├─ src/
│  ├─ main.ts                           T1, T6（MSW起動を追記）
│  ├─ App.vue                           T1
│  ├─ router/index.ts                   T1, T7/T8（ルート追記）
│  ├─ theme/variables.css               T1
│  ├─ api/
│  │  ├─ mutator.ts                     T4
│  │  └─ generated/ …                   T3（orval生成・手で書かない）
│  ├─ mocks/
│  │  ├─ store.ts                       T5
│  │  ├─ handlers.ts                    T6
│  │  └─ browser.ts                     T6
│  ├─ layouts/AppLayout.vue             T7
│  └─ views/
│     ├─ ItemListPage.vue               T7
│     └─ ItemDetailPage.vue             T8
├─ src/mocks/store.test.ts              T5
├─ .storybook/{main.ts,preview.ts}      T9
├─ src/views/*.stories.ts               T9
└─ README.md                            T10
```

---

## Task 1: プロジェクト雛形（Vite + Ionic Vue が起動する）

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `index.html`, `.gitignore`
- Create: `src/main.ts`, `src/App.vue`, `src/router/index.ts`, `src/theme/variables.css`, `src/views/ItemListPage.vue`(仮)

- [ ] **Step 1: package.json を作成**

```json
{
  "name": "ionic-vue-orval-template",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc --noEmit && vite build",
    "preview": "vite preview",
    "api:gen": "orval --config ./orval.config.ts",
    "msw:init": "msw init public --save",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint .",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  },
  "dependencies": {
    "@ionic/vue": "^8.0.0",
    "@ionic/vue-router": "^8.0.0",
    "@tanstack/vue-query": "^5.0.0",
    "ionicons": "^7.0.0",
    "vue": "^3.4.0",
    "vue-router": "^4.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "@vue/test-utils": "^2.4.10",
    "eslint": "^8.57.0",
    "eslint-plugin-vue": "^9.20.0",
    "jsdom": "^24.0.0",
    "msw": "^2.0.0",
    "orval": "^7.0.0",
    "typescript": "~5.4.0",
    "vite": "^5.0.0",
    "vitest": "^1.4.0",
    "vue-tsc": "^2.0.0"
  }
}
```

- [ ] **Step 2: 依存をインストール**

Run: `npm install`
Expected: `node_modules` 生成、エラー無し。

- [ ] **Step 3: tsconfig.json を作成**

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "lib": ["ESNext", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "noEmit": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] },
    "types": ["vite/client"]
  },
  "include": ["src/**/*.ts", "src/**/*.vue", "orval.config.ts"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 4: tsconfig.node.json を作成**

```json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 5: vite.config.ts を作成**

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
})
```

- [ ] **Step 6: index.html を作成**

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="viewport-fit=cover, width=device-width, initial-scale=1.0" />
    <title>Ionic Vue Orval Template</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 7: .gitignore を作成**

```
node_modules
dist
storybook-static
*.local
public/mockServiceWorker.js
```

- [ ] **Step 8: src/theme/variables.css を作成（空でよいがファイルは作る）**

```css
/* Ionic theme variables. 既定のままでよい。プロジェクト固有の色はここで上書き。 */
```

- [ ] **Step 9: src/router/index.ts を作成（一覧のみ・仮）**

```ts
import { createRouter, createWebHistory } from '@ionic/vue-router'
import type { RouteRecordRaw } from 'vue-router'
import ItemListPage from '@/views/ItemListPage.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/items' },
  { path: '/items', component: ItemListPage },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
```

- [ ] **Step 10: src/views/ItemListPage.vue を仮作成（起動確認用）**

```vue
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Items</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <p>scaffold ok</p>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue'
</script>
```

- [ ] **Step 11: src/App.vue を作成**

```vue
<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue'
</script>
```

- [ ] **Step 12: src/main.ts を作成（md固定 + VueQuery + Ionic CSS）**

```ts
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
```

- [ ] **Step 13: 起動確認**

Run: `npm run dev`
Expected: dev サーバ起動、ブラウザで `http://localhost:5173/items` に「scaffold ok」が表示される。確認後 Ctrl+C。

- [ ] **Step 14: コミット**

```
git add -A
git commit -m "feat: scaffold Vite + Ionic Vue app (md mode) with Vue Query"
```

---

## Task 2: サンプル OpenAPI 仕様

**Files:**
- Create: `openapi/openapi.yaml`

- [ ] **Step 1: openapi/openapi.yaml を作成**

```yaml
openapi: 3.0.3
info:
  title: Items
  version: 1.0.0
servers:
  - url: /api
paths:
  /items:
    get:
      operationId: listItems
      summary: List items
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Item'
    post:
      operationId: createItem
      summary: Create item
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ItemInput'
      responses:
        '201':
          description: Created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Item'
  /items/{id}:
    get:
      operationId: getItem
      summary: Get item
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string }
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Item'
        '404':
          description: Not Found
    put:
      operationId: updateItem
      summary: Update item
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string }
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ItemInput'
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Item'
    delete:
      operationId: deleteItem
      summary: Delete item
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string }
      responses:
        '204':
          description: No Content
components:
  schemas:
    Item:
      type: object
      required: [id, title, status, createdAt]
      properties:
        id: { type: string }
        title: { type: string }
        description: { type: string }
        status:
          type: string
          enum: [todo, doing, done]
        createdAt: { type: string, format: date-time }
    ItemInput:
      type: object
      required: [title, status]
      properties:
        title: { type: string }
        description: { type: string }
        status:
          type: string
          enum: [todo, doing, done]
```

- [ ] **Step 2: コミット**

```
git add openapi/openapi.yaml
git commit -m "feat: add sample OpenAPI spec (Item CRUD)"
```

---

## Task 3: orval 設定とコード生成

**Files:**
- Create: `orval.config.ts`
- Generated（手で書かない）: `src/api/generated/**`

- [ ] **Step 1: orval.config.ts を作成**

```ts
import { defineConfig } from 'orval'

export default defineConfig({
  items: {
    input: {
      target: './openapi/openapi.yaml',
    },
    output: {
      mode: 'single',
      target: './src/api/generated/endpoints.ts',
      schemas: './src/api/generated/model',
      client: 'vue-query',
      mock: true,
      baseUrl: '/api',
      override: {
        mutator: {
          path: './src/api/mutator.ts',
          name: 'customFetch',
        },
      },
    },
  },
})
```

- [ ] **Step 2: mutator がまだ無いので、空の暫定 mutator を作成（Task 4 で本実装）**

Create `src/api/mutator.ts`:

```ts
// 暫定。Task 4 で本実装する。
export const customFetch = async <T>(config: { url: string; method: string; data?: unknown; params?: unknown }): Promise<T> => {
  throw new Error('not implemented yet')
}
```

- [ ] **Step 3: コード生成を実行**

Run: `npm run api:gen`
Expected: `src/api/generated/endpoints.ts`、`src/api/generated/model/*` が生成される。MSW モックも同ファイル内（または `endpoints.msw.ts`）に出力される。エラー無し。

- [ ] **Step 4: 生成されたエクスポート名を確認（後続タスクで使う）**

Run: `npx grep -n "export const" src/api/generated/endpoints.ts` の代わりに、エディタで `src/api/generated/endpoints.ts` を開き、以下を**実際の名前**としてメモする:
- 一覧 query composable（例: `useListItems`）
- 取得 query composable（例: `useGetItem`）
- 作成/更新/削除 mutation composable（例: `useCreateItem` / `useUpdateItem` / `useDeleteItem`）
- MSW ハンドラ集約関数（例: `getItemsMock`）と個別 `get<Op>MockHandler`

> 注: orval のバージョンにより composable 名は `useListItems` 形式。MSW 集約関数は `get<Title>Mock()` で全ハンドラ配列を返す。Task 5/6/7/8 のコードは、ここで確認した実際の名前に合わせて参照を修正すること。

- [ ] **Step 5: コミット**

```
git add orval.config.ts src/api/generated src/api/mutator.ts
git commit -m "feat: add orval config and generate vue-query client + msw mocks"
```

---

## Task 4: fetch mutator（共通 HTTP インスタンス）

**Files:**
- Modify: `src/api/mutator.ts`

- [ ] **Step 1: mutator.ts を本実装**

```ts
// orval の override.mutator が呼び出す共通 fetch 実装。
// 本番は baseURL を実APIに向ける。dev/Storybook では MSW が横取りする。
export interface RequestConfig {
  url: string
  method: 'get' | 'post' | 'put' | 'delete' | 'patch'
  params?: Record<string, unknown>
  data?: unknown
  headers?: Record<string, string>
  signal?: AbortSignal
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export const customFetch = async <T>(config: RequestConfig): Promise<T> => {
  const { url, method, params, data, headers, signal } = config
  const query = params
    ? '?' + new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v !== undefined && v !== null)
          .map(([k, v]) => [k, String(v)]),
      ).toString()
    : ''

  const res = await fetch(`${BASE_URL}${url}${query}`, {
    method: method.toUpperCase(),
    headers: { 'Content-Type': 'application/json', ...headers },
    body: data !== undefined ? JSON.stringify(data) : undefined,
    signal,
  })

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText} for ${method.toUpperCase()} ${url}`)
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export default customFetch
```

- [ ] **Step 2: 型チェックが通ることを確認**

Run: `npx vue-tsc --noEmit`
Expected: mutator 起因のエラー無し（生成コードが `customFetch` を正しく呼べる）。

- [ ] **Step 3: コミット**

```
git add src/api/mutator.ts
git commit -m "feat: implement fetch mutator for orval client"
```

---

## Task 5: インメモリ CRUD ストア（TDD）

**Files:**
- Create: `src/mocks/store.ts`
- Test: `src/mocks/store.test.ts`

- [ ] **Step 1: 失敗するテストを書く**

Create `src/mocks/store.test.ts`:

```ts
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
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `npx vitest run src/mocks/store.test.ts`
Expected: FAIL（`./store` が存在しない）。

- [ ] **Step 3: store.ts を実装**

> 型は生成 model を流用。`Item` / `ItemInput` の import パスは Task 3 で確認した実際のパスに合わせる（例: `@/api/generated/model`）。

```ts
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
```

- [ ] **Step 4: テストが通ることを確認**

Run: `npx vitest run src/mocks/store.test.ts`
Expected: PASS（全6ケース）。

- [ ] **Step 5: コミット**

```
git add src/mocks/store.ts src/mocks/store.test.ts
git commit -m "feat: add in-memory CRUD store with tests"
```

---

## Task 6: MSW ハンドラ合成と起動配線

**Files:**
- Create: `src/mocks/handlers.ts`, `src/mocks/browser.ts`
- Modify: `src/main.ts`
- Generate: `public/mockServiceWorker.js`（CLI）

- [ ] **Step 1: MSW worker スクリプトを生成**

Run: `npm run msw:init`
Expected: `public/mockServiceWorker.js` が生成される。

- [ ] **Step 2: handlers.ts を作成（store で上書き合成）**

> `getItemsMock` は Task 3 で確認した実際の集約関数名に置き換える。URL は spec の server `/api` を踏まえ `*/api/items` でマッチさせる。

```ts
import { http, HttpResponse } from 'msw'
import { store } from './store'
import { getItemsMock } from '@/api/generated/endpoints' // ← 実名に合わせる

export const handlers = [
  // サンプルリソースは store 版で上書き（CRUDが永続化）
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

  // 未上書きの将来エンドポイント用フォールバック（生成 faker モック）
  ...getItemsMock(),
]
```

- [ ] **Step 3: browser.ts を作成**

```ts
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)
```

- [ ] **Step 4: main.ts に dev限定の MSW 起動を追記**

`src/main.ts` の mount 直前を以下に変更:

```ts
async function enableMocking() {
  if (!import.meta.env.DEV) return
  const { worker } = await import('./mocks/browser')
  await worker.start({ onUnhandledRequest: 'bypass' })
}

router.isReady().then(async () => {
  await enableMocking()
  app.mount('#app')
})
```

（既存の `router.isReady().then(() => app.mount('#app'))` を置き換える。）

- [ ] **Step 5: dev でモックが効くことを確認**

Run: `npm run dev`
ブラウザの devtools コンソールに `[MSW] Mocking enabled` が出る。`http://localhost:5173/items` で（次タスクの一覧実装後に）データが返ることを後で確認。今は MSW 起動ログのみ確認し Ctrl+C。

- [ ] **Step 6: コミット**

```
git add src/mocks/handlers.ts src/mocks/browser.ts src/main.ts
git commit -m "feat: wire MSW handlers (store overlay) with dev-only startup"
```

---

## Task 7: 共通レイアウト + 一覧画面（GET + 追加モーダル POST）

**Files:**
- Create: `src/layouts/AppLayout.vue`
- Rewrite: `src/views/ItemListPage.vue`

- [ ] **Step 1: AppLayout.vue を作成（共通テンプレート）**

```vue
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start" v-if="backHref">
          <ion-back-button :default-href="backHref" />
        </ion-buttons>
        <ion-title>{{ title }}</ion-title>
        <ion-buttons slot="end">
          <slot name="actions" />
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <slot />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton,
} from '@ionic/vue'

defineProps<{ title: string; backHref?: string }>()
</script>
```

- [ ] **Step 2: ItemListPage.vue を本実装**

> `useListItems` / `useCreateItem` は Task 3 で確認した実名に置き換える。`useQueryClient` は `@tanstack/vue-query`。

```vue
<template>
  <app-layout title="Items">
    <template #actions>
      <ion-button @click="openCreate">追加</ion-button>
    </template>

    <div v-if="isLoading" class="ion-text-center">
      <ion-spinner />
    </div>
    <ion-text color="danger" v-else-if="isError">
      <p>読み込みに失敗しました。</p>
    </ion-text>
    <ion-list v-else>
      <ion-item
        v-for="item in items"
        :key="item.id"
        button
        :router-link="`/items/${item.id}`"
      >
        <ion-label>
          <h2>{{ item.title }}</h2>
          <p>{{ item.status }}</p>
        </ion-label>
      </ion-item>
      <ion-text v-if="items && items.length === 0" color="medium">
        <p>項目がありません。</p>
      </ion-text>
    </ion-list>

    <ion-modal :is-open="showCreate" @did-dismiss="showCreate = false">
      <ion-header>
        <ion-toolbar>
          <ion-title>追加</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showCreate = false">閉じる</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-input label="タイトル" label-placement="stacked" v-model="form.title" />
        <ion-textarea label="説明" label-placement="stacked" v-model="form.description" />
        <ion-select label="状態" label-placement="stacked" v-model="form.status">
          <ion-select-option value="todo">todo</ion-select-option>
          <ion-select-option value="doing">doing</ion-select-option>
          <ion-select-option value="done">done</ion-select-option>
        </ion-select>
        <ion-button expand="block" class="ion-margin-top" :disabled="!form.title" @click="submitCreate">
          保存
        </ion-button>
      </ion-content>
    </ion-modal>
  </app-layout>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import {
  IonButton, IonList, IonItem, IonLabel, IonSpinner, IonText, IonModal,
  IonHeader, IonToolbar, IonTitle, IonButtons, IonContent,
  IonInput, IonTextarea, IonSelect, IonSelectOption,
} from '@ionic/vue'
import { useQueryClient } from '@tanstack/vue-query'
import AppLayout from '@/layouts/AppLayout.vue'
import { useListItems, useCreateItem } from '@/api/generated/endpoints' // ← 実名に合わせる

const queryClient = useQueryClient()
const { data, isLoading, isError } = useListItems()
const items = computed(() => data.value)

const showCreate = ref(false)
const form = reactive({ title: '', description: '', status: 'todo' as 'todo' | 'doing' | 'done' })

function openCreate() {
  form.title = ''
  form.description = ''
  form.status = 'todo'
  showCreate.value = true
}

const createMutation = useCreateItem({
  mutation: {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/items'] })
      showCreate.value = false
    },
  },
})

function submitCreate() {
  createMutation.mutate({ data: { title: form.title, description: form.description, status: form.status } })
}
</script>
```

> 注: `invalidateQueries` の `queryKey` は orval が生成する実際のキー（`getListItemsQueryKey()` 等）に合わせるのが堅い。生成コードに `getListItemsQueryKey` があればそれを import して使う。

- [ ] **Step 3: 一覧表示・追加が動くことを確認**

Run: `npm run dev`
- `/items` にシード3件が表示される。
- 「追加」→ モーダルでタイトル入力→保存→一覧の先頭に追加される（invalidate で再取得）。
確認後 Ctrl+C。

- [ ] **Step 4: コミット**

```
git add src/layouts/AppLayout.vue src/views/ItemListPage.vue
git commit -m "feat: add AppLayout and Item list page with create modal"
```

---

## Task 8: 詳細画面（GET + 編集 PUT + 削除 DELETE + 404）

**Files:**
- Create: `src/views/ItemDetailPage.vue`
- Modify: `src/router/index.ts`

- [ ] **Step 1: ルートを追加**

`src/router/index.ts` の routes に追記:

```ts
import ItemDetailPage from '@/views/ItemDetailPage.vue'
// ...
const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/items' },
  { path: '/items', component: ItemListPage },
  { path: '/items/:id', component: ItemDetailPage },
]
```

- [ ] **Step 2: ItemDetailPage.vue を作成**

> `useGetItem` / `useUpdateItem` / `useDeleteItem` は実名に合わせる。

```vue
<template>
  <app-layout title="詳細" back-href="/items">
    <div v-if="isLoading" class="ion-text-center"><ion-spinner /></div>
    <ion-text color="danger" v-else-if="isError">
      <p>項目が見つかりません（404）。</p>
    </ion-text>
    <template v-else-if="data">
      <ion-input label="タイトル" label-placement="stacked" v-model="form.title" />
      <ion-textarea label="説明" label-placement="stacked" v-model="form.description" />
      <ion-select label="状態" label-placement="stacked" v-model="form.status">
        <ion-select-option value="todo">todo</ion-select-option>
        <ion-select-option value="doing">doing</ion-select-option>
        <ion-select-option value="done">done</ion-select-option>
      </ion-select>

      <ion-button expand="block" class="ion-margin-top" :disabled="!form.title" @click="save">保存</ion-button>
      <ion-button expand="block" color="danger" @click="remove">削除</ion-button>
    </template>
  </app-layout>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  IonSpinner, IonText, IonInput, IonTextarea, IonSelect, IonSelectOption, IonButton,
} from '@ionic/vue'
import { useQueryClient } from '@tanstack/vue-query'
import AppLayout from '@/layouts/AppLayout.vue'
import { useGetItem, useUpdateItem, useDeleteItem } from '@/api/generated/endpoints' // ← 実名に合わせる

const route = useRoute()
const router = useRouter()
const queryClient = useQueryClient()
const id = String(route.params.id)

const { data, isLoading, isError } = useGetItem(id)
const form = reactive({ title: '', description: '', status: 'todo' as 'todo' | 'doing' | 'done' })

watch(data, (v) => {
  if (v) {
    form.title = v.title
    form.description = v.description ?? ''
    form.status = v.status
  }
}, { immediate: true })

const updateMutation = useUpdateItem({
  mutation: {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/items'] })
      router.back()
    },
  },
})
const deleteMutation = useDeleteItem({
  mutation: {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/items'] })
      router.replace('/items')
    },
  },
})

function save() {
  updateMutation.mutate({ id, data: { title: form.title, description: form.description, status: form.status } })
}
function remove() {
  deleteMutation.mutate({ id })
}
</script>
```

- [ ] **Step 3: 詳細・編集・削除・404 を確認**

Run: `npm run dev`
- 一覧から項目タップ→詳細表示。
- 編集→保存→一覧に反映。
- 削除→一覧に戻り消えている。
- URL を `/items/nope` に手入力→404 メッセージ表示。
確認後 Ctrl+C。

- [ ] **Step 4: 型チェック**

Run: `npx vue-tsc --noEmit`
Expected: エラー無し。

- [ ] **Step 5: コミット**

```
git add src/views/ItemDetailPage.vue src/router/index.ts
git commit -m "feat: add Item detail page (edit/delete/404)"
```

---

## Task 9: Storybook + MSW 連携とストーリー

**Files:**
- Create: `.storybook/main.ts`, `.storybook/preview.ts`
- Create: `src/views/ItemListPage.stories.ts`, `src/views/ItemDetailPage.stories.ts`
- Modify: `package.json`（Storybook/addon の devDependencies 追加）

- [ ] **Step 1: Storybook と addon を追加インストール**

Run: `npx storybook@latest init --type vue3 --builder vite --yes`
（対話を避けるため `--yes`。失敗する場合は手動で `npm i -D storybook @storybook/vue3-vite` を実行。）

Run: `npm i -D msw-storybook-addon`
Expected: devDependencies に Storybook 一式と `msw-storybook-addon` が入る。

- [ ] **Step 2: .storybook/main.ts を整える**

```ts
import type { StorybookConfig } from '@storybook/vue3-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs'],
  framework: { name: '@storybook/vue3-vite', options: {} },
  staticDirs: ['../public'], // mockServiceWorker.js を配信
}
export default config
```

- [ ] **Step 3: .storybook/preview.ts に MSW + Ionic + VueQuery を設定**

```ts
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
      store.reset() // ストーリー間のデータ汚染防止
      return story()
    },
  ],
}
export default preview
```

- [ ] **Step 4: ItemListPage.stories.ts を作成**

```ts
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
    msw: { handlers: [http.get('*/api/items', async () => { await delay('infinite'); return HttpResponse.json([]) })] },
  },
}

export const ErrorState: Story = {
  parameters: {
    msw: { handlers: [http.get('*/api/items', () => new HttpResponse(null, { status: 500 }))] },
  },
}
```

- [ ] **Step 5: ItemDetailPage.stories.ts を作成**

> 詳細は `route.params.id` を読むため、Story では `vue-router` をモックするより、id 固定のラッパーで確認するのが簡便。ここでは MSW 状態の出し分けに集中し、ルーターは Storybook の `vue-router` 既定（`/`）で `id` が undefined になる点を避けるため、`*/api/items/:id` を固定レスポンスで返す。

```ts
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
          HttpResponse.json({ id: '1', title: 'サンプル', description: '説明', status: 'doing', createdAt: '2026-05-01T00:00:00Z' }),
        ),
      ],
    },
  },
}

export const NotFound: Story = {
  parameters: {
    msw: { handlers: [http.get('*/api/items/:id', () => new HttpResponse(null, { status: 404 }))] },
  },
}
```

- [ ] **Step 6: Storybook 起動確認**

Run: `npm run storybook`
- `Pages/ItemList` の Default/Empty/Loading/ErrorState が各状態で表示される。
- `Pages/ItemDetail` の Found/NotFound が表示される。
確認後 Ctrl+C。

- [ ] **Step 7: コミット**

```
git add .storybook src/views/ItemListPage.stories.ts src/views/ItemDetailPage.stories.ts package.json package-lock.json
git commit -m "feat: add Storybook with MSW integration and page stories"
```

---

## Task 10: ハンドラ結合テスト・lint・README・最終ゲート

**Files:**
- Create: `src/mocks/handlers.test.ts`
- Create: `README.md`
- Create: `.eslintrc.cjs`（init で未作成なら）

- [ ] **Step 1: handlers の結合テストを書く（node setupServer）**

Create `src/mocks/handlers.test.ts`:

```ts
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
```

- [ ] **Step 2: テスト実行**

Run: `npx vitest run`
Expected: store + handlers の全テスト PASS。

- [ ] **Step 3: README.md を作成**

```markdown
# Ionic + Vue + orval Mock テンプレート

Ionic(Vue) で、バックエンド無しでも CRUD が動くスターター。
OpenAPI 仕様から orval で型・Vue Query クライアント・MSW モックを生成します。

## このテンプレートの使い方（触る場所 / 触らない場所）

1. `openapi/openapi.yaml` を自分の API 仕様に差し替える
2. `npm run api:gen` で再生成（型・vue-query composable・MSW モックが更新される）
3. `src/mocks/store.ts` と `src/mocks/handlers.ts` を自分のリソースに合わせて編集
4. **`src/api/generated/` は触らない**（再生成で上書きされる聖域）

## セットアップ

```
npm install
npm run api:gen
npm run msw:init   # public/mockServiceWorker.js を生成
npm run dev
```

## スクリプト

| コマンド | 内容 |
|---|---|
| `npm run dev` | 開発サーバ（MSW モック有効） |
| `npm run api:gen` | orval でコード生成 |
| `npm run build` | 型チェック + 本番ビルド（MSW 無し・実API直結） |
| `npm run test` | Vitest |
| `npm run storybook` | Storybook（同じ MSW モックを共有） |
| `npm run lint` | ESLint |

## 本番 API への差し替え

MSW は dev/Storybook 限定で起動します（`src/main.ts` の `import.meta.env.DEV` ガード）。
本番は `.env` に `VITE_API_BASE_URL` を設定して実 API に向けるだけです。

## アーキテクチャ

- データ取得: orval(vue-query) → `useXxxQuery` / `useXxxMutation`
- モック: MSW。サンプルリソースは `src/mocks/store.ts`（インメモリ）で CRUD を永続化。
- UI: `src/layouts/AppLayout.vue`（共通テンプレート）＋ Ionic 標準タグのみ。md 固定。

## 拡張ポイント（このテンプレには未実装・必要時に追加）

- 認証 / 認可
- ページネーション / 無限スクロール
- 楽観的更新（Vue Query の `onMutate`）
- 複数リソース（store/handlers をリソース単位に分割）
- E2E（Cypress/Playwright）
- i18n / Pinia
```

- [ ] **Step 4: lint 設定を確認・実行**

`.eslintrc.cjs` が無ければ作成:

```js
module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  extends: ['plugin:vue/vue3-recommended', 'eslint:recommended'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  ignorePatterns: ['dist', 'src/api/generated', 'public/mockServiceWorker.js'],
}
```

Run: `npm run lint`
Expected: エラー無し（生成物は ignore 済み）。

- [ ] **Step 5: 全ゲート通過確認**

Run（1つずつ）:
- `npm run lint` → PASS
- `npm run test` → PASS
- `npm run build` → 型チェック + ビルド成功

- [ ] **Step 6: コミット**

```
git add -A
git commit -m "test+docs: add handler integration tests, README, eslint config"
```

---

## 自己レビュー（spec 対応チェック）

- spec §2 スタック → T1 でセットアップ。md固定 → T1 Step12。✔
- spec §3 ディレクトリ分離（generated 聖域 / mocks 手書き） → T3/T5/T6。✔
- spec §4 データフロー（mutation→invalidate→一覧反映） → T7 Step2, T8 Step2。✔
- spec §5 store 上書き合成・404サンプル → T5/T6。✔
- spec §6 サンプル spec・CRUD画面・追加は ion-modal → T2/T7/T8。✔
- spec §7 Storybook MSW 単一ソース・状態別ストーリー・store.reset → T9。✔
- spec §8 store.test / handlers.test / 品質ゲート / README → T5/T10。✔
- 型整合: `customFetch`(T3暫定→T4本実装), `store` メソッド名(list/get/create/update/remove/reset) は T5 で定義し T6 で使用、`Item`/`ItemInput` は generated model を参照。✔
- 注意点として明記済み: orval 生成エクスポートの**実名確認**(T3 Step4)に全 composable/集約関数/queryKey 参照を合わせること。
```
