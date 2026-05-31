# 項目定義書 — ConfirmSheet

**コンポーネント:** 確認用 ActionSheet  
**ソース:** `src/components/ConfirmSheet.vue`  
**分類:** 汎用コンポーネント（複数ページから再利用）  
**利用箇所:** `src/views/ItemDetailPage.vue`（削除確認）

---

## 概要

ユーザーに破壊的操作や重要な確認を促す汎用 ActionSheet コンポーネント。  
**開閉状態は親が `isOpen` props で制御し、操作結果は `confirmed` / `cancelled` emit で親に通知する。**

```
親コンポーネント
  ├─ props → ConfirmSheet（isOpen, title, confirmLabel, destructive）
  └─ emit ← ConfirmSheet（confirmed, cancelled）
```

---

## Props 定義

| No. | Props名 | 型 | 必須 | デフォルト | 説明 | 制約 |
|-----|--------|-----|------|-----------|------|------|
| P-1 | `isOpen` | `boolean` | ✅ | — | ActionSheet の開閉状態 | 親が `ref` で管理し、`@confirmed` / `@cancelled` 受信後に `false` にする |
| P-2 | `title` | `string` | ✅ | — | ヘッダーに表示する確認メッセージ | 「〜しますか？」形式を推奨 |
| P-3 | `confirmLabel` | `string` | ❌ | `'確認'` | 確認ボタンのラベル | 省略時は `'確認'` |
| P-4 | `destructive` | `boolean` | ❌ | `false` | `true` のとき確認ボタンを赤色（破壊的スタイル）で表示 | 削除・リセット等の不可逆操作に使用 |

---

## Emits 定義

| No. | イベント名 | ペイロード | 発火条件 | 親での使い方 |
|-----|-----------|-----------|---------|------------|
| E-1 | `confirmed` | なし | 確認ボタン押下時 | `@confirmed="実行したい処理"` |
| E-2 | `cancelled` | なし | キャンセルボタン / バックドロップ押下時 | `@cancelled="showConfirm = false"` |

### `@did-dismiss` との関係（内部実装の補足）

IonActionSheet の `@did-dismiss` は全ての閉じ操作で発火するため、ConfirmSheet 内部で `event.detail.role` を判定して emit を振り分けている。

| dismiss の原因 | `detail.role` | emit される |
|--------------|--------------|-----------|
| 確認ボタン押下（通常） | `undefined` | `confirmed`（handler内で発火） |
| 確認ボタン押下（destructive） | `'destructive'` | `confirmed`（handler内で発火） |
| キャンセルボタン押下 | `'cancel'` | `cancelled`（did-dismiss内で発火） |
| バックドロップ押下 | `'backdrop'` | `cancelled`（did-dismiss内で発火） |

---

## コンポーネント内部構成

| No. | 項目ID | 表示ラベル | コンポーネント | 種別 | 表示条件 | 操作時の挙動 |
|-----|--------|-----------|---------------|------|---------|------------|
| C-1 | action-sheet | — | IonActionSheet | 表示コンテナ | `isOpen=true` | — |
| C-2 | confirm-btn | `confirmLabel`（省略時: `'確認'`） | ボタン（buttons配列） | 操作 | 常時 | `emit('confirmed')` → シート自動クローズ |
| C-3 | cancel-btn | `'キャンセル'` | ボタン（buttons配列） | 操作 | 常時 | シートクローズ → `emit('cancelled')` |

---

## 使用例（ItemDetailPage）

```vue
<!-- 削除ボタン: クリックでシートを開く -->
<ion-button color="danger" @click="showConfirm = true">削除</ion-button>

<!-- ConfirmSheet: props で制御、emit で結果を受け取る -->
<confirm-sheet
  :is-open="showConfirm"
  title="このアイテムを削除しますか？"
  confirm-label="削除"
  :destructive="true"
  @confirmed="remove"
  @cancelled="showConfirm = false"
/>
```

```ts
// 親側の状態管理
const showConfirm = ref(false)

function remove() {
  deleteMutation.mutate({ id })
  // ← ConfirmSheet は confirmed を emit するだけ。
  //   実際の処理は親が持つ。
}
```

---

## 状態遷移まとめ

```
削除ボタンタップ
  → showConfirm = true
    → ConfirmSheet が開く

  ConfirmSheet で「削除」選択
    → emit('confirmed')
      → 親: remove() が実行される
      → 親: （mutationのonSuccessでページ遷移するためshowConfirmの更新不要）

  ConfirmSheet で「キャンセル」または バックドロップ
    → emit('cancelled')
      → 親: showConfirm = false
        → ConfirmSheet が閉じる
```

---

## テスト観点

| テストケース | 検証内容 |
|-------------|---------|
| `isOpen=true` で ActionSheet が表示される | ConfirmSheet をマウントし `:is-open="true"` で IonActionSheet が存在する |
| 確認ボタン押下で `confirmed` が emit される | 確認ボタンクリック後に `emitted('confirmed')` が存在する |
| キャンセルボタン押下で `cancelled` が emit される | キャンセルボタン相当の dismiss で `emitted('cancelled')` が存在する |
| `destructive=true` で確認ボタンが破壊的スタイル | buttons[0].role が `'destructive'` である |
| `confirmLabel` が省略時は `'確認'` になる | `confirmLabel` 未指定時に buttons[0].text が `'確認'` |
| `confirmLabel` 指定時はその値が表示される | `confirmLabel="削除"` 指定時に buttons[0].text が `'削除'` |
