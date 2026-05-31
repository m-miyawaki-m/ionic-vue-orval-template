# イベント一覧

このドキュメントはプロジェクト内の **コンポーネント間イベント** を一覧化する。  
「イベント」には Vue のカスタム emit と、利用している Ionic コンポーネントの固有イベントを含む。

---

## 1. カスタム emit イベント（`defineEmits`）

親子コンポーネント間の **子 → 親** への通知。

| コンポーネント | イベント名 | ペイロード | 発火条件 | 親での受け取り方 | 関連 Props |
|--------------|-----------|-----------|---------|--------------|-----------|
| `ConfirmSheet` | `confirmed` | なし | 確認ボタン押下 | `@confirmed="handler"` | `isOpen`, `confirmLabel`, `destructive` |
| `ConfirmSheet` | `cancelled` | なし | キャンセルボタン / バックドロップ押下 | `@cancelled="showConfirm = false"` | `isOpen` |

### emit フロー図

```
ItemDetailPage（親）
  │
  │  :is-open="showConfirm"         ← props（親→子）
  │  title="このアイテムを削除しますか？"
  │  :destructive="true"
  ↓
ConfirmSheet（子）
  │
  │  @confirmed → emit('confirmed') ← emit（子→親）
  │  @cancelled → emit('cancelled')
  ↓
ItemDetailPage（親）が処理
  ・confirmed → remove() を実行
  ・cancelled → showConfirm = false
```

---

## 2. Ionic コンポーネント固有イベント（利用中のもの）

Ionic が提供する組み込みイベント。プロジェクト内での利用箇所を記録する。

### `@did-dismiss`

ActionSheet / Modal が **完全に閉じた後** に発火する。

| 利用箇所 | コンポーネント | ハンドラ | 処理内容 |
|---------|--------------|---------|---------|
| `ConfirmSheet.vue` | `IonActionSheet` | `onDismiss(event)` | `event.detail.role` で `cancelled` emit を判定 |
| `ItemListPage.vue` | `IonModal` | `showCreate = false` | モーダルの開閉状態をリセット |
| `AppLayout.vue` | `IonActionSheet` | `showSheet = false` | テーマ選択シートの開閉状態をリセット |

#### `event.detail.role` の値

| role 値 | 発火原因 |
|---------|---------|
| `'cancel'` | `role: 'cancel'` のボタン押下 |
| `'backdrop'` | バックドロップ（背景）押下 |
| `'destructive'` | `role: 'destructive'` のボタン押下 |
| `undefined` | role 未指定の通常ボタン押下 |

---

## 3. Vue Query コールバック（ミューテーション結果の受け取り）

Vue Query のミューテーションオプションで受け取るコールバック。厳密には emit ではないが、非同期処理の「結果通知」として同じ役割を果たす。

| 利用箇所 | ミューテーション | コールバック | 処理内容 |
|---------|----------------|------------|---------|
| `ItemListPage.vue` | `useCreateItem` | `onSuccess` | キャッシュ無効化 → `showCreate = false` |
| `ItemDetailPage.vue` | `useUpdateItem` | `onSuccess` | キャッシュ無効化 → `router.back()` |
| `ItemDetailPage.vue` | `useDeleteItem` | `onSuccess` | キャッシュ無効化 → `router.replace('/items')` |

---

## 4. Props → Emit の対応表（コンポーネント公開インターフェース）

自作コンポーネントの公開インターフェースをまとめる。追加時はここに記載する。

### ConfirmSheet

```ts
// Props（親 → 子）
defineProps<{
  isOpen: boolean       // 開閉状態
  title: string         // 確認メッセージ
  confirmLabel?: string // 確認ボタンラベル（省略時: '確認'）
  destructive?: boolean // 破壊的スタイル（省略時: false）
}>()

// Emits（子 → 親）
defineEmits<{
  confirmed: []  // 確認時
  cancelled: []  // キャンセル時
}>()
```

### AppLayout

```ts
// Props（親 → 子）
defineProps<{
  title: string      // ページタイトル
  backHref?: string  // 戻るボタンの遷移先（省略時: 戻るボタン非表示）
}>()

// Emits: なし
// 子 → 親の通知は slot[actions] でコンテンツを差し込む方式で代替
```

---

## 5. 追加・更新のルール

| タイミング | 対応 |
|-----------|------|
| `defineEmits` を持つコンポーネントを新規作成した | セクション1・4に追記 |
| 新たな Ionic イベント（`@ionChange` 等）を利用した | セクション2に追記 |
| emit のペイロード型が変わった | セクション1・4を更新 |
| コンポーネントを削除した | 該当行を削除し「削除済み」をコミットメッセージに記載 |

---

## 6. emit を使う基準

| 状況 | 推奨パターン | 理由 |
|------|-----------|------|
| 子が「何かが起きた」と親に伝えるだけ | `emit` | 単純な通知に最適 |
| 子が表示データを親から受け取る | `props` | データの流れが明確 |
| 離れたコンポーネント同士の通信 | composable（useXxx） | emit は親子間のみ有効 |
| フォーム値のリアルタイム同期 | `v-model`（= `:modelValue` + `@update:modelValue`） | Vue の規約に従う |
