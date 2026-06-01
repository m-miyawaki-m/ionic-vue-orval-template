# Material Symbols アイコン導入設計

**日付:** 2026-06-02  
**対象:** ionic-vue-orval-template  
**ステータス:** 承認済み

---

## 1. 検討経緯

### 1.1 要件の確認（Q&A）

| 質問 | 回答 | 影響 |
|------|------|------|
| どのアイコンセット？ | Material Symbols（Google 最新世代） | Iconify の `material-symbols` コレクションを使用 |
| 色切り替えの仕組みは？ | `seq-theme-switch.puml` のテーマ設計 — `body.classList` に `theme-dark` 等を付与し CSS 変数で色を一括切り替え | アイコンは `currentColor` で CSS 変数に追従する必要がある |
| 使い方のスタイルは？ | 共通コンポーネント（ラッパー型） | `AppIcon` ラッパー + アイコンレジストリを設ける |

### 1.2 アプローチ比較

| 案 | 内容 | 長所 | 短所 | 結論 |
|----|------|------|------|------|
| A | Web Font (CDN) + CSS 変数 | 設定ゼロ | CDN 依存 / 型安全なし / tree-shaking 不可 | 不採用 |
| B | Web Font + `AppIcon` ラッパー | 型安全（手動定義）/ CSS 変数連動 | CDN 依存 / アイコン名型を手動メンテ | 不採用 |
| **C** | **unplugin-icons + アイコンレジストリ + `AppIcon` ラッパー** | SVG の `currentColor` で CSS 変数と完全連動 / tree-shaking / 型安全 / CDN 不要 | Storybook に `viteFinal` 追加が必要 | **採用** |

### 1.3 B案→C案の変更理由

ブレインストーミング中に一時 B案に切り替えたが、Storybook（`@storybook/vue3-vite` v10）は Vite ベースのため `viteFinal` 一箇所の追加で unplugin-icons が動くと確認。セットアップコストは軽微であり、C案の優位性（型安全・tree-shaking・CDN 不要）が上回ると判断して C案に戻した。

---

## 2. アーキテクチャ

### 2.1 ファイル構成

```
src/
├── components/
│   └── AppIcon.vue            # 共通アイコンコンポーネント
├── icons/
│   └── registry.ts            # アイコン登録・AppIconName 型定義
└── types/
    └── unplugin-icons.d.ts    # ~icons/* の型宣言（自動生成 or 手動）

vite.config.ts                 # Icons プラグイン追加
tsconfig.json                  # ~icons/* パス解決
.storybook/main.ts             # viteFinal で Icons プラグイン追加
```

### 2.2 データフロー

```
<AppIcon name="palette" :fill="true" />
  ↓
registry.ts: "palette" → MsPaletteComponent（SVG コンポーネント）
  ↓
SVG レンダリング（stroke/fill = currentColor）
  ↓
CSS color 変数（--ion-color-primary 等）が色を決定
  ↓
body.theme-dark / body.theme-blue 等のクラスで CSS 変数値が切り替わる
```

---

## 3. コンポーネント仕様

### 3.1 AppIcon.vue

```typescript
defineProps<{
  name: AppIconName       // 'home' | 'palette' | ... (レジストリの keyof)
  fill?: boolean          // true = 塗りバリアント / false = outline（デフォルト）
  size?: number | string  // px 値（デフォルト: 24）
  color?: string          // CSS color 値（省略時は親の color を継承）
}>()
```

- `fill` は Iconify のアイコン名バリアントで実現（例: `home-outline` ↔ `home`）
- `size` は `width` / `height` スタイルとして SVG に渡す
- `color` は `style="color: ..."` で上書き可能、省略時は CSS 変数を継承

### 3.2 使用例

```html
<!-- テーマ CSS 変数の色でアイコンを表示 -->
<AppIcon name="palette" />

<!-- 塗りバリアント -->
<AppIcon name="home" :fill="true" />

<!-- サイズと色を明示指定 -->
<AppIcon name="settings" :size="32" color="var(--ion-color-danger)" />
```

---

## 4. アイコンレジストリ仕様

### 4.1 registry.ts の構造

```typescript
// src/icons/registry.ts
import MsHome from '~icons/material-symbols/home-outline'
import MsHomeFilled from '~icons/material-symbols/home'
import MsPalette from '~icons/material-symbols/palette'
// ... 必要なアイコンを追加

export const iconRegistry = {
  home: { outline: MsHome, filled: MsHomeFilled },
  palette: { outline: MsPalette, filled: MsPalette },
} as const

export type AppIconName = keyof typeof iconRegistry
```

### 4.2 管理方針

- アプリ全体で使うアイコンのみレジストリに登録（tree-shaking を維持）
- 追加手順: `~icons/material-symbols/...` を import → `iconRegistry` にエントリ追加
- `AppIconName` 型は `keyof typeof iconRegistry` で自動生成（手動型定義不要）

---

## 5. セットアップ変更点

| ファイル | 変更内容 |
|----------|----------|
| `package.json` | `unplugin-icons`、`@iconify/json` を devDependencies に追加 |
| `vite.config.ts` | `Icons({ compiler: 'vue3' })` をプラグインに追加 |
| `tsconfig.json` | `unplugin-icons/types/vue` を types に追加 |
| `.storybook/main.ts` | `viteFinal` で Icons プラグインを追加 |

---

## 6. テスト方針

- `AppIcon` の単体テストは Vitest + `@vue/test-utils` で props の組み合わせを確認
- テーマ連動は Storybook Story で各テーマクラスをデコレータで付与して目視確認
- Storybook Story に `default` / `filled` / `with-color` / `sizes` のバリアントを用意
