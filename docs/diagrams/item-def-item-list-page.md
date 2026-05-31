# 項目定義書 — ItemListPage

**ページ:** アイテム一覧  
**ルート:** `/items`  
**ソース:** `src/views/ItemListPage.vue`  
**データ取得:** `useListItems()` → GET `/api/items`

---

## ヘッダーエリア（AppLayout 共通）

| No. | 項目ID | 表示ラベル | コンポーネント | 種別 | 必須 | デフォルト | 制約・備考 |
|-----|--------|-----------|---------------|------|------|-----------|-----------|
| H-1 | theme-toggle-btn | （アイコンのみ） | IonButton + IonIcon | 操作 | — | — | カラーパレットアイコン。タップで ActionSheet を表示 |
| H-2 | add-btn | 追加 | IonButton | 操作 | — | — | `slot="actions"` 経由でヘッダー右端に配置 |

---

## コンテンツエリア — 状態別表示

### ローディング状態（`v-if isLoading`）

| No. | 項目ID | 表示ラベル | コンポーネント | 種別 | 表示条件 |
|-----|--------|-----------|---------------|------|---------|
| L-1 | loading-spinner | — | IonSpinner | 状態表示 | API レスポンス待ち中 |

### エラー状態（`v-else-if isError`）

| No. | 項目ID | 表示ラベル | コンポーネント | 種別 | 表示条件 | 備考 |
|-----|--------|-----------|---------------|------|---------|------|
| E-1 | error-message | 読み込みに失敗しました。 | IonText | 状態表示 | API が非 2xx を返したとき | `color="danger"` |

### 正常状態 — アイテム一覧（`v-else`）

| No. | 項目ID | 表示ラベル | コンポーネント | 種別 | 型 | 備考 |
|-----|--------|-----------|---------------|------|-----|------|
| C-1 | item-list | — | IonList | 表示コンテナ | — | 子に IonItem を繰り返し配置 |
| C-2 | item-row | — | IonItem | ナビゲーション | — | `button` 属性付き。タップで `/items/:id` へ遷移 |
| C-3 | item-title | タイトル | IonLabel > h2 | 表示 | string | `item.title` を表示 |
| C-4 | item-status | ステータス | IonLabel > p | 表示 | `todo \| doing \| done` | `item.status` を表示 |
| C-5 | empty-message | 項目がありません。 | IonText | 状態表示 | — | `items.length === 0` のとき表示。`color="medium"` |

---

## 追加モーダル（`v-if showCreate`）

### モーダルヘッダー

| No. | 項目ID | 表示ラベル | コンポーネント | 種別 | 備考 |
|-----|--------|-----------|---------------|------|------|
| M-1 | modal-title | 追加 | IonTitle | 表示 | モーダルのタイトル |
| M-2 | modal-close-btn | 閉じる | IonButton | 操作 | `showCreate = false` / モーダルを閉じる |

### 入力フォーム

| No. | 項目ID | 表示ラベル | コンポーネント | 種別 | 必須 | 型 | デフォルト | 制約・バリデーション |
|-----|--------|-----------|---------------|------|------|-----|-----------|-------------------|
| M-3 | form-title | タイトル | IonInput | 入力 | ✅ | string | `''`（空文字） | 空文字の場合、保存ボタンが disabled |
| M-4 | form-description | 説明 | IonTextarea | 入力 | ❌ | string | `''`（空文字） | 未入力でも送信可 |
| M-5 | form-status | 状態 | IonSelect | 入力 | ✅ | `todo \| doing \| done` | `'todo'` | 3択のみ |
| M-5a | — | todo | IonSelectOption | 選択肢 | — | — | — | value=`"todo"` |
| M-5b | — | doing | IonSelectOption | 選択肢 | — | — | — | value=`"doing"` |
| M-5c | — | done | IonSelectOption | 選択肢 | — | — | — | value=`"done"` |

### モーダルアクション

| No. | 項目ID | 表示ラベル | コンポーネント | 種別 | 制約 | 操作時の挙動 | 対応API |
|-----|--------|-----------|---------------|------|------|-------------|--------|
| M-6 | form-submit-btn | 保存 | IonButton | 操作 | `form.title` が空の場合 disabled | `createMutation.mutate(form)` → 成功後モーダルを閉じ一覧を再取得 | POST `/api/items` |

---

## 状態遷移まとめ

```
初期表示
  → isLoading=true : [L-1] スピナー表示
  → isError=true   : [E-1] エラーメッセージ表示
  → データ取得成功  : [C-1〜C-5] 一覧表示
                      items.length === 0 の場合は [C-5] も表示

[H-2] 追加ボタンタップ
  → showCreate=true : モーダルオープン
    → [M-6] 保存タップ（title必須）
        → POST 成功 : 一覧再取得 → モーダルクローズ
    → [M-2] 閉じるタップ or バックドロップ
        → showCreate=false : モーダルクローズ
```

---

## バリデーション一覧

| 対象フィールド | ルール | UIへの反映 |
|--------------|--------|-----------|
| タイトル（M-3） | 必須（空文字不可） | 保存ボタン（M-6）を `:disabled="!form.title"` で制御 |
| 説明（M-4） | 任意 | 制約なし |
| 状態（M-5） | `todo \| doing \| done` のいずれか必須 | デフォルト `todo` があるため実質未選択なし |

---

## テスト観点（この定義書から導出）

| テストケース | 対象項目 | 検証内容 |
|-------------|---------|---------|
| ローディング中はスピナー表示 | L-1 | `isLoading=true` 時に IonSpinner が存在する |
| エラー時はエラーメッセージ表示 | E-1 | `isError=true` 時に "読み込みに失敗しました" が存在する |
| 一覧にアイテムが表示される | C-2〜C-4 | `data` に item が含まれる場合 IonItem が描画される |
| 空リストメッセージが表示される | C-5 | `data=[]` の時 "項目がありません" が存在する |
| 追加ボタンでモーダルが開く | H-2, M-1 | クリック後 `showCreate=true` → モーダルが表示される |
| タイトル空で保存ボタンが disabled | M-3, M-6 | `form.title=''` の時ボタンに disabled 属性がある |
| 保存成功後モーダルが閉じる | M-6 | mutation 成功後 `showCreate=false` になる |
| 閉じるボタンでモーダルが閉じる | M-2 | クリック後 `showCreate=false` になる |
