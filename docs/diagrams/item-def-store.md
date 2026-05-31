# 項目定義書 — MSW インメモリストア

**ソース:** `src/mocks/store.ts`  
**用途:** MSW ハンドラが参照するインメモリ CRUD ストア（開発・テスト専用）  
**本番環境:** 非使用（`enableMocking()` は `DEV` 環境のみ起動）

---

## 1. データモデル定義

### 1-1. Item（レスポンス型）

**ソース:** `src/api/generated/model/item.ts`（orval 自動生成）

| No. | フィールド名 | 型 | 必須 | 説明 | 制約 |
|-----|------------|-----|------|------|------|
| F-1 | `id` | `string` | ✅ | アイテムの一意識別子 | ストア内でインクリメントする整数を文字列化（`"1"`, `"2"` …） |
| F-2 | `title` | `string` | ✅ | タイトル | 空文字は UI 側で弾く（ストアはノーチェック） |
| F-3 | `description` | `string \| undefined` | ❌ | 説明文 | 未指定は `undefined`（省略可） |
| F-4 | `status` | `'todo' \| 'doing' \| 'done'` | ✅ | 進捗ステータス | 3値のみ有効（`ItemStatus` 定数で管理） |
| F-5 | `createdAt` | `string` | ✅ | 作成日時（ISO 8601 形式） | 新規作成時は固定値 `'2026-05-31T00:00:00Z'`（モック用簡略化） |

### 1-2. ItemInput（リクエスト型）

**ソース:** `src/api/generated/model/itemInput.ts`（orval 自動生成）

| No. | フィールド名 | 型 | 必須 | 説明 | 備考 |
|-----|------------|-----|------|------|------|
| I-1 | `title` | `string` | ✅ | タイトル | PUT/POST のリクエストボディ |
| I-2 | `description` | `string \| undefined` | ❌ | 説明文 | 省略可 |
| I-3 | `status` | `'todo' \| 'doing' \| 'done'` | ✅ | 進捗ステータス | `ItemInputStatus` 定数で管理 |

### 1-3. ItemStatus / ItemInputStatus

| 値 | 意味 |
|----|------|
| `'todo'` | 未着手 |
| `'doing'` | 進行中 |
| `'done'` | 完了 |

> `ItemStatus`（レスポンス用）と `ItemInputStatus`（リクエスト用）は現在同一の値セット。orval が型を分離生成しているため別々に管理される。

---

## 2. ストア内部状態

| 変数 | 型 | 初期値 | 説明 |
|------|-----|--------|------|
| `items` | `Item[]` | `seedItems()` の結果（3件） | アイテム配列。`let` で再代入可能（イミュータブル操作） |
| `seq` | `number` | `3`（seedItems の件数） | 新規作成時の ID 採番カウンター。`create()` のたびにインクリメント |

### イミュータブル操作の方針

ストアは `items` 配列を直接変更せず **新しい配列を生成して再代入** する。

| 操作 | 実装パターン |
|------|------------|
| 追加 | `items = [created, ...items]`（先頭に追加） |
| 更新 | `items = items.map(...)` |
| 削除 | `items = items.filter(...)` |

---

## 3. 操作定義（ストア API）

| No. | 操作名 | シグネチャ | 正常時の戻り値 | 異常時の戻り値 | 説明 |
|-----|--------|-----------|-------------|-------------|------|
| O-1 | `list` | `(): Item[]` | `Item[]`（0件以上） | — | 全アイテムを配列で返す |
| O-2 | `get` | `(id: string): Item \| undefined` | `Item` | `undefined`（存在しない場合） | ID でアイテムを1件取得 |
| O-3 | `create` | `(input: ItemInput): Item` | 作成した `Item` | — | `seq` をインクリメントして先頭に追加 |
| O-4 | `update` | `(id: string, input: ItemInput): Item \| undefined` | 更新後の `Item` | `undefined`（ID が存在しない場合） | `id` で対象を特定し `title / description / status` を更新 |
| O-5 | `remove` | `(id: string): void` | — | — | `id` に一致するアイテムを削除。存在しない場合も無視 |
| O-6 | `reset` | `(): void` | — | — | `items` を `seedItems()` に戻し `seq` もリセット |

### 各操作の詳細

#### O-1: list

```ts
list(): Item[]
```

- 現在の `items` 配列をそのまま返す（コピーなし）
- 呼び出し元で配列を変更すると内部状態に影響する点に注意

#### O-2: get

```ts
get(id: string): Item | undefined
```

- `Array.find` で線形探索
- 一致しない場合は `undefined`（MSW ハンドラは 404 を返す）

#### O-3: create

```ts
create(input: ItemInput): Item
```

- `seq += 1` → `id = String(seq)`
- `createdAt` は固定値 `'2026-05-31T00:00:00Z'`（モック簡略化）
- 一覧の **先頭に追加**（最新が上に来る表示順）

#### O-4: update

```ts
update(id: string, input: ItemInput): Item | undefined
```

- `id` が存在しない場合は `undefined` を返す（MSW ハンドラは 404 を返す）
- `createdAt` は変更しない（スプレッドで既存値を保持）

#### O-5: remove

```ts
remove(id: string): void
```

- 存在しない `id` を渡しても例外をスローしない
- MSW ハンドラは常に 204 を返す

#### O-6: reset

```ts
reset(): void
```

- テスト間のリセット用。`beforeEach` で呼び出す
- `seq` も `seedItems().length`（= 3）にリセットされる

---

## 4. シードデータ

`seedItems()` が返す初期データ（ページリロードまたは `reset()` で復元）。

| id | title | description | status | createdAt |
|----|-------|-------------|--------|-----------|
| `"1"` | 牛乳を買う | スーパーで | `todo` | 2026-05-01T09:00:00Z |
| `"2"` | 設計レビュー | orvalテンプレ | `doing` | 2026-05-02T10:00:00Z |
| `"3"` | README作成 | `""` | `done` | 2026-05-03T11:00:00Z |

> `seq` 初期値は `3`。次の `create()` で `id = "4"` が採番される。

---

## 5. MSW ハンドラとの対応

**ソース:** `src/mocks/handlers.ts`

| HTTP メソッド | パターン | ストア操作 | レスポンス |
|-------------|---------|-----------|----------|
| `GET` | `*/api/items` | `store.list()` | 200 + `Item[]` |
| `GET` | `*/api/items/:id` | `store.get(id)` | 200 + `Item` / 404（未存在） |
| `POST` | `*/api/items` | `store.create(body)` | 201 + 作成 `Item` |
| `PUT` | `*/api/items/:id` | `store.update(id, body)` | 200 + 更新 `Item` / 404（未存在） |
| `DELETE` | `*/api/items/:id` | `store.remove(id)` | 204 |

---

## 6. 制約・注意事項

| 項目 | 内容 |
|------|------|
| **永続化なし** | インメモリのみ。ページリロードでシードデータに戻る |
| **DEV 環境限定** | `enableMocking()` は `import.meta.env.DEV` が `true` の場合のみ起動 |
| **スレッドセーフでない** | ブラウザシングルスレッド前提。並列リクエストの競合は考慮しない |
| **ID 採番の欠番** | `remove()` で削除した ID は再利用されない |
| **createdAt 固定値** | 新規作成時の `createdAt` は `'2026-05-31T00:00:00Z'` 固定（ソート・表示テスト注意） |
| **description の空文字 vs undefined** | シードデータは `description: ''`（空文字）。`ItemInput.description` は `undefined` 可 |

---

## 7. テスト観点（`src/mocks/store.test.ts` より）

| テストケース | 対象操作 | 検証内容 |
|-------------|---------|---------|
| シード初期データが存在する | `list` | `list().length > 0` |
| 作成したアイテムが先頭に追加される | `create` | `list()[0].id === created.id` |
| 作成後に件数が1増える | `create` | `list().length === before + 1` |
| ID で取得できる | `get` | `get(id)?.id === id` |
| 存在しない ID は undefined | `get` | `get('nope') === undefined` |
| タイトル・ステータスを更新できる | `update` | `update(id, input)?.title === 'Changed'` |
| 削除後は取得できない | `remove` | `get(id) === undefined` |
| reset でシードデータに戻る | `reset` | 削除後に `reset()` → `list().length > 0` |

### 追加推奨テスト観点（未実装）

| テストケース | 対象操作 | 検証内容 |
|-------------|---------|---------|
| 存在しない ID の update は undefined | `update` | `update('nope', input) === undefined` |
| 存在しない ID の remove は例外なし | `remove` | `remove('nope')` がエラーをスローしない |
| reset 後の seq がリセットされる | `reset` + `create` | `reset()` 後に `create()` すると `id = "4"` |
| description が undefined のまま保持される | `create` / `update` | `input.description` が `undefined` の場合 `Item.description` も `undefined` |
