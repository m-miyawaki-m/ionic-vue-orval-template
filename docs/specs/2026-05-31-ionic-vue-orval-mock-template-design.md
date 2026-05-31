# 設計書: Ionic + Vue + orval Mock 再利用テンプレート

- 日付: 2026-05-31
- 種別: 再利用スターターテンプレート（雛形）の設計
- 由来知見: `ionic-ui-sample`（Ionic + Vue3 + Storybook + Capacitor, md固定運用）

## 1. 目的とスコープ

他プロジェクトがコピーして使う「Ionic + Vue + orval + Mock」の共通スターターテンプレートを整備する。
バックエンドが無くても、OpenAPI 仕様から orval で型・Vue Query クライアント・MSW モックを生成し、
CRUD が「本物のように動く」サンプル画面まで含める。

### 前提・制約
- UI は **共通テンプレート（AppLayout）＋ Ionic 標準タグ（ion-*）のみ**。独自コンポーネントを作らない。
- Ionic は **md モード固定**。iOS 専用パターン（card modal, swipeback 等）は使わない。
- データ取得層は **orval + @tanstack/vue-query**。
- モックは **MSW**。Storybook でも同一モックを共有する。
- サンプルは **1リソース・CRUD（一覧＋詳細）** の最小構成。

### スコープ外（YAGNI・README に拡張ポイントとして1行ずつ残すのみ）
認証 / ページネーション / 楽観的更新 / 複数リソース / E2E(Cypress) / i18n / Pinia 等の状態管理。

## 2. 技術スタック

- Vue 3 + TypeScript + Vite
- @ionic/vue + @ionic/vue-router（md固定）
- orval（codegen: client=vue-query, mock=msw）
- @tanstack/vue-query
- MSW（dev/storybook 限定起動。本番ビルドは MSW 無し＝実API直結）
- Storybook + msw-storybook-addon
- Vitest（ユニット）

## 3. ディレクトリ構成

```
ionic-vue-orval-template/
├─ openapi/
│  └─ openapi.yaml            # サンプル仕様（差し替え対象）
├─ orval.config.ts            # 生成設定（client: vue-query, mock: msw）
├─ src/
│  ├─ api/
│  │  ├─ generated/           # ★orval生成物（手で触らない聖域）
│  │  │  ├─ endpoints.ts      #   useXxxQuery / useXxxMutation
│  │  │  ├─ model/            #   型
│  │  │  └─ msw/              #   MSWハンドラ雛形（faker）
│  │  └─ mutator.ts           # orval用の共通fetch/axiosインスタンス
│  ├─ mocks/
│  │  ├─ store.ts             # ★手書き インメモリCRUDストア（B案の肝）
│  │  ├─ handlers.ts          # 生成ハンドラ + storeで上書き合成
│  │  └─ browser.ts           # MSW worker起動（dev時）
│  ├─ layouts/
│  │  └─ AppLayout.vue        # 共通テンプレート（ion-page/header/content）
│  ├─ views/
│  │  ├─ ItemListPage.vue     # 一覧（GET）＋ 追加(ion-modal/POST)
│  │  └─ ItemDetailPage.vue   # 詳細＋編集(PUT)/削除(DELETE)
│  ├─ router/
│  ├─ theme/
│  ├─ main.ts                 # VueQueryPlugin + (dev only) MSW起動
│  └─ App.vue
├─ .storybook/                # msw-storybook-addon設定
└─ package.json
```

### 分離方針
- `src/api/generated/` は再生成可能・手で触らない聖域。
- 手書きは `src/mocks/store.ts` と `src/mocks/handlers.ts` の上書き部分**だけ**。
- `layouts/AppLayout.vue` が「共通テンプレート」。各画面は AppLayout + ion-* のみ。

## 4. データフロー

```
[画面] ItemListPage.vue
   │  useListItemsQuery()           ← orval生成 (Vue Query)
   ▼
[Vue Query]  キャッシュ / loading / error 管理
   │  fetch() 経由で GET /items
   ▼
[mutator.ts]  共通fetchインスタンス（baseURL, ヘッダ, エラー整形）
   ▼  (dev/storybook時のみ MSW が横取り)
[MSW handlers.ts]  生成ハンドラ → store で上書き合成
   ▼
[store.ts]  インメモリ配列に対する list/get/create/update/remove
```

- **読み取り(GET)**: `useListItemsQuery()` / `useGetItemQuery(id)` をそのまま画面で使用。MSW が `store.list()` / `store.get(id)` を返す。
- **更新(POST/PUT/DELETE)**: `useXxxMutation()` を呼ぶ → MSW が `store` を変更 → `onSuccess` で `queryClient.invalidateQueries(['items'])` → 一覧が自動再取得され画面に即反映。
- **本番差し替え**: MSW は `if (import.meta.env.DEV)` ガードで dev/storybook 限定。本番は MSW 無しで実API直結。`mutator.ts` の baseURL を変えるだけ。

## 5. モック合成（B案の肝）

### store.ts（手書き・型は生成 model を流用）
```ts
import type { Item } from '@/api/generated/model'
let items: Item[] = seedItems()        // 固定シード初期データ
export const store = {
  list: () => items,
  get:  (id: string) => items.find(i => i.id === id),
  create: (input) => { const it = { ...input, id: nextId() }; items.unshift(it); return it },
  update: (id, patch) => { /* 該当を置換し返す */ },
  remove: (id) => { items = items.filter(i => i.id !== id) },
  reset: () => { items = seedItems() },  // テスト/Storybook用
}
```

### handlers.ts（生成ハンドラを store で上書き合成）
```ts
import { getItemsMSW } from '@/api/generated/msw'   // orval生成（faker）
import { http, HttpResponse } from 'msw'
import { store } from './store'

export const handlers = [
  http.get('/items',        () => HttpResponse.json(store.list())),
  http.get('/items/:id',    ({params}) => {
    const it = store.get(params.id as string)
    return it ? HttpResponse.json(it) : new HttpResponse(null, {status:404})
  }),
  http.post('/items',       async ({request}) => HttpResponse.json(store.create(await request.json()), {status:201})),
  http.put('/items/:id',    async ({params,request}) => HttpResponse.json(store.update(params.id as string, await request.json()))),
  http.delete('/items/:id', ({params}) => { store.remove(params.id as string); return new HttpResponse(null,{status:204}) }),
  ...getItemsMSW(),   // 未上書きの将来エンドポイント用フォールバック
]
```

### ルール
- spec 差し替え→orval 再生成で型・クライアント・生成ハンドラは自動更新。
- 手書きが必要なのは `store.ts` ＋ `handlers.ts` の上書き部分だけ。コピーした人はこの2ファイルを自分のリソースに合わせて差し替える。
- 404 サンプルを含める（`store.get` が undefined → 404）。

## 6. サンプル OpenAPI spec と画面

### openapi/openapi.yaml（最小CRUD）
- リソース: `Item`（`id`, `title`, `description`, `status`, `createdAt`）
- エンドポイント:
  - `GET /items` → `Item[]`
  - `POST /items` → 201 `Item`
  - `GET /items/{id}` → `Item` / 404
  - `PUT /items/{id}` → `Item`
  - `DELETE /items/{id}` → 204
- 意図的に 1リソース・5エンドポイント。最小で全パターンを示す。

### ItemListPage.vue（AppLayout + ion-* のみ）
- `ion-header`/`ion-toolbar`/`ion-title` ＋ `ion-content`
- `useListItemsQuery()`: loading→`ion-spinner`、error→`ion-text`、成功→`ion-list`/`ion-item`
- 右上 `ion-button`(＋) → **追加は ion-modal** でフォーム入力（POST）
- 各 `ion-item` タップ → 詳細へ遷移
- 追加/削除後 invalidate で即反映

### ItemDetailPage.vue
- `useGetItemQuery(id)` で表示
- 編集: `ion-input`/`ion-textarea`/`ion-select`(status) → `useUpdateItemMutation()`(PUT)
- 削除: `ion-button`(danger) → `useDeleteItemMutation()`(DELETE) → 一覧へ戻る
- 404 時は `ion-text` でメッセージ

UI制約遵守: 独自コンポーネントを作らず AppLayout（共通テンプレート）＋ Ionic 標準タグのみ。md固定。

## 7. Storybook 連携（MSW）

- **msw-storybook-addon** を導入。`.storybook/preview.ts` で `initialize()` ＋ `mswLoader` を設定。worker は MSW CLI で `public/mockServiceWorker.js` を生成。
- `parameters.msw.handlers` に `src/mocks/handlers.ts` を渡す → アプリと同一モックでストーリーが動く（二重管理しない）。
- 各ストーリー冒頭で `store.reset()`（decorator）→ ストーリー間のデータ汚染防止。
- ストーリー:
  - `ItemListPage`: 通常 / 空（handler override） / ローディング / エラー
  - `ItemDetailPage`: 表示 / 404
  - 追加モーダル（ion-modal open 状態）
- 状態違いはストーリー単位で `parameters.msw.handlers` を差し替えて表現。

知見の踏襲: アプリと Storybook のモックを**単一ソース化**し、二重管理を避ける。

## 8. テスト・品質ゲート・README

### テスト（Vitest）
- `store.test.ts`: CRUD 純ロジック（create/update/remove/reset）の単体。MSW 不要・高速。
- `handlers.test.ts`（任意）: MSW `setupServer`(node) でハンドラ越しの store 反映を1ケース確認。
- 画面テスト: 最小1本（`ItemListPage` が loading→list を描画）。

### 品質ゲート（package.json scripts）
- `api:gen` … orval 実行（spec→生成）
- `dev` … vite（MSW dev起動）
- `build` … `vue-tsc && vite build`（MSW無し・実API前提）
- `test` … vitest run
- `storybook` / `build-storybook`
- `lint` … eslint
- 通過条件: `lint` + `test` + `build` が緑。

### README（テンプレの使い方＝生命線）
1. `openapi.yaml` を自分の仕様に差し替え
2. `npm run api:gen` で再生成
3. `src/mocks/store.ts` と `handlers.ts` を自分のリソースに合わせて編集
4. それ以外（`generated/`）は触らない
- 冒頭に「触る場所／触らない場所」を明記。スコープ外項目は拡張ポイントとして1行ずつ残す。

## 9. 主要な設計判断（採用案）

- **モック方式 = B案**: orval 生成（再生成可）＋ 薄い手書きインメモリストアで CRUD をセッション内永続化。
  - A案（生成モックそのまま）は CRUD が反映されず却下。
  - C案（@mswjs/data）は依存増・重さで「Ionic部品のみ」の軽量思想とズレるため却下。
- 追加UI = **ion-modal**（画面遷移を増やさず、モーダルの使い方も示す）。
- spec ソース = **テンプレ付属サンプル**（差し替え前提）。
