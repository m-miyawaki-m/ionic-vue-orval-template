# テーマ切り替え機能 設計仕様書

## 概要

Ionic Vue アプリに3テーマ（Default / Dark / Blue）の切り替え機能を追加する。
テーマはlocalStorageで永続化し、アプリ起動時に自動復元する。
切り替えUIはヘッダー右上のアイコンボタン → ActionSheetで選択する方式。

---

## アーキテクチャ

### テーマの仕組み

- テーマは `<body>` へのクラス付与で表現する
  - Default: クラスなし（Ionicのデフォルト変数をそのまま使用）
  - Dark: `body.theme-dark`
  - Blue: `body.theme-blue`
- Ionic UIコンポーネントのCSS変数（`--ion-color-primary` 等）を各テーマクラスでオーバーライドする
- 配色の値は後から `variables.css` に追記する前提で、今回は変数のスケルトンのみ定義する

### localStorageキー

- キー名: `app-theme`
- 値: `"default"` | `"dark"` | `"blue"`
- 未設定時のデフォルト: `"default"`

---

## ファイル変更・追加

### 1. `src/theme/variables.css`（拡張）

```css
/* === Default（Ionicデフォルト、上書きなし） === */
/* 必要に応じて :root に追記 */

/* === Dark テーマ === */
body.theme-dark {
  /* --ion-color-primary: TBD; */
  /* --ion-background-color: TBD; */
  /* --ion-text-color: TBD; */
  /* 他のIonic変数をここに追加 */
}

/* === Blue テーマ === */
body.theme-blue {
  /* --ion-color-primary: TBD; */
  /* --ion-background-color: TBD; */
  /* --ion-text-color: TBD; */
  /* 他のIonic変数をここに追加 */
}
```

### 2. `src/composables/useTheme.ts`（新規作成）

**責務**: テーマ状態の管理・切り替え・永続化

```
- THEMES: テーマ名の定数配列 ['default', 'dark', 'blue']
- currentTheme: Ref<string>（module-levelでシングルトン）
- setTheme(name): bodyクラスを付け替え + localStorage保存
- initTheme(): localStorage読み込み → setTheme() で適用
- useTheme(): { currentTheme, setTheme, initTheme } を返すcomposable関数
```

bodyクラスの管理ルール:
- `theme-dark` / `theme-blue` を先に全て除去してから、対象クラスを追加
- Defaultの場合はクラスを追加しない

### 3. `src/main.ts`（変更）

`app.mount()` 直前に `initTheme()` を呼び出す。`onMounted` だとコンポーネント描画後の適用になり画面チラつき（FOUC）が起きるため、マウント前に適用する。

```ts
import { useTheme } from '@/composables/useTheme'

router.isReady().then(async () => {
  await enableMocking()
  useTheme().initTheme()   // マウント前にbodyクラス適用
  app.mount('#app')
})
```

### 4. `src/layouts/AppLayout.vue`（変更）

- ヘッダー右端（既存の `slot="end"` の手前）にテーマアイコンボタンを追加
- `IonActionSheet` でテーマ選択UIを実装
- アクションシートのボタン: Default / Dark / Blue / キャンセル
- 各ボタン押下で `setTheme()` を呼ぶ

追加するIonicコンポーネント:
- `IonActionSheet`
- `IonIcon`（`colorPalette` または `brush` アイコン）

---

## データフロー

```
起動時:
  main.ts（app.mount前）
    → initTheme()
      → localStorage.getItem('app-theme')
      → setTheme(name)
        → body.classList 更新
        → currentTheme.value 更新

切り替え時:
  ユーザーがヘッダーボタンをタップ
    → ActionSheet表示
      → テーマ選択
        → setTheme(name)
          → body.classList 更新
          → localStorage.setItem('app-theme', name)
          → currentTheme.value 更新
```

---

## スコープ外（今回対象外）

- 各テーマの具体的な配色（後から `variables.css` に追記）
- OSのダークモード設定との連動（`prefers-color-scheme`）
- テーマプレビュー機能

---

## テスト観点

- Default / Dark / Blue それぞれ選択後、ページをリロードしても同じテーマが適用されること
- `body` に正しいクラスが付与・除去されること
- ActionSheetがキャンセルされた場合にテーマが変わらないこと
