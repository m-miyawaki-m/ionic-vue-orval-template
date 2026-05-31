# 項目定義書 — ItemDetailPage

**ページ:** アイテム詳細・編集  
**ルート:** `/items/:id`  
**ソース:** `src/views/ItemDetailPage.vue`  
**データ取得:** `useGetItem(id)` → GET `/api/items/:id`

---

## ヘッダーエリア（AppLayout 共通）

| No. | 項目ID | 表示ラベル | コンポーネント | 種別 | 必須 | 備考 |
|-----|--------|-----------|---------------|------|------|------|
| H-1 | back-btn | （戻るアイコン） | IonBackButton | ナビゲーション | — | `default-href="/items"` → 一覧ページへ戻る |
| H-2 | page-title | 詳細 | IonTitle | 表示 | — | 固定文字列 |
| H-3 | theme-toggle-btn | （アイコンのみ） | IonButton + IonIcon | 操作 | — | カラーパレットアイコン。タップで ActionSheet を表示 |

---

## コンテンツエリア — 状態別表示

### ローディング状態（`v-if isLoading`）

| No. | 項目ID | 表示ラベル | コンポーネント | 種別 | 表示条件 |
|-----|--------|-----------|---------------|------|---------|
| L-1 | loading-spinner | — | IonSpinner | 状態表示 | API レスポンス待ち中 |

### エラー状態（`v-else-if isError`）

| No. | 項目ID | 表示ラベル | コンポーネント | 種別 | 表示条件 | 備考 |
|-----|--------|-----------|---------------|------|---------|------|
| E-1 | error-message | 項目が見つかりません（404）。 | IonText | 状態表示 | GET が 404 または非 2xx を返したとき | `color="danger"` |

### 正常状態 — 編集フォーム（`v-else-if data`）

#### 入力フィールド

| No. | 項目ID | 表示ラベル | コンポーネント | 種別 | 必須 | 型 | デフォルト | 制約・バリデーション |
|-----|--------|-----------|---------------|------|------|-----|-----------|-------------------|
| C-1 | form-title | タイトル | IonInput | 入力 | ✅ | string | 取得データの `item.title` | 空文字の場合、保存ボタンが disabled |
| C-2 | form-description | 説明 | IonTextarea | 入力 | ❌ | string | 取得データの `item.description ?? ''` | 未入力でも送信可 |
| C-3 | form-status | 状態 | IonSelect | 入力 | ✅ | `todo \| doing \| done` | 取得データの `item.status` | 3択のみ |
| C-3a | — | todo | IonSelectOption | 選択肢 | — | — | — | value=`"todo"` |
| C-3b | — | doing | IonSelectOption | 選択肢 | — | — | — | value=`"doing"` |
| C-3c | — | done | IonSelectOption | 選択肢 | — | — | — | value=`"done"` |

#### アクションボタン

| No. | 項目ID | 表示ラベル | コンポーネント | 種別 | 制約 | 操作時の挙動 | 対応API |
|-----|--------|-----------|---------------|------|------|-------------|--------|
| C-4 | save-btn | 保存 | IonButton | 操作 | `form.title` が空の場合 disabled | `updateMutation.mutate({ id, data: form })` → 成功後一覧ページへ戻る | PUT `/api/items/:id` |
| C-5 | delete-btn | 削除 | IonButton | 操作 | 制約なし | `deleteMutation.mutate({ id })` → 成功後 `/items` へリダイレクト | DELETE `/api/items/:id` |

> **C-5 補足:** `color="danger"` で赤色表示。`router.replace('/items')` のため戻るボタンで戻れない。

---

## フォーム初期値の設定ルール

`watch(data, callback, { immediate: true })` でデータ取得後に自動設定される。

| フォームフィールド | 設定値 | タイミング |
|-----------------|--------|----------|
| `form.title` | `data.title` | `useGetItem` でデータ取得後（即時） |
| `form.description` | `data.description ?? ''` | 同上（null/undefined は空文字に変換） |
| `form.status` | `data.status` | 同上 |

---

## 状態遷移まとめ

```
ページ表示（/items/:id）
  → isLoading=true  : [L-1] スピナー表示
  → isError=true    : [E-1] 404エラーメッセージ表示
  → データ取得成功   : [C-1〜C-5] 編集フォーム表示
                       watch(data) → フォームに初期値セット

[C-4] 保存タップ（title必須）
  → PUT 成功 : 一覧キャッシュ無効化 → router.back()

[C-5] 削除タップ
  → DELETE 成功 : 一覧キャッシュ無効化 → router.replace('/items')

[H-1] 戻るボタンタップ
  → router.back() : 前画面へ（変更は破棄される）
```

---

## バリデーション一覧

| 対象フィールド | ルール | UIへの反映 |
|--------------|--------|-----------|
| タイトル（C-1） | 必須（空文字不可） | 保存ボタン（C-4）を `:disabled="!form.title"` で制御 |
| 説明（C-2） | 任意 | 制約なし |
| 状態（C-3） | `todo \| doing \| done` のいずれか必須 | 初期値が取得データの status のため未選択なし |

---

## テスト観点（この定義書から導出）

| テストケース | 対象項目 | 検証内容 |
|-------------|---------|---------|
| ローディング中はスピナー表示 | L-1 | `isLoading=true` 時に IonSpinner が存在する |
| 404時はエラーメッセージ表示 | E-1 | `isError=true` 時に "項目が見つかりません" が存在する |
| データ取得後フォームに初期値が入る | C-1〜C-3 | `data` 取得後に各フィールドに `item.*` の値が反映される |
| タイトル空で保存ボタンが disabled | C-1, C-4 | `form.title=''` の時ボタンに disabled 属性がある |
| 保存成功後に前画面へ戻る | C-4 | mutation 成功後 `router.back()` が呼ばれる |
| 削除成功後に一覧へリダイレクト | C-5 | mutation 成功後 `router.replace('/items')` が呼ばれる |
| 戻るボタンが一覧ページを指す | H-1 | `default-href="/items"` が設定されている |
