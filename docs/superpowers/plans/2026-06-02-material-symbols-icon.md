# Material Symbols アイコン導入 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** unplugin-icons + アイコンレジストリ + AppIcon コンポーネントを導入し、CSS 変数テーマと連動する型安全なアイコン共通コンポーネントを実現する。

**Architecture:** Vite プラグイン（unplugin-icons）で Material Symbols アイコンを SVG Vue コンポーネントとしてビルド時に解決する。`src/icons/registry.ts` にアプリ使用アイコンを一元登録し、`AppIcon.vue` がレジストリを参照して動的に SVG コンポーネントを切り替える。SVG の `currentColor` により `body.theme-*` クラスが制御する CSS 変数テーマが自動追従する。

**Tech Stack:** unplugin-icons, @iconify/json, Vue 3, TypeScript (strict), Vite, Vitest, @vue/test-utils, @storybook/vue3-vite

---

## Files

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `package.json` | devDependencies に unplugin-icons, @iconify/json を追加 |
| Modify | `vite.config.ts` | Icons({ compiler: 'vue3' }) を plugins に追加 |
| Modify | `tsconfig.json` | types に unplugin-icons/types/vue を追加 |
| Modify | `.storybook/main.ts` | viteFinal で Icons プラグインを追加 |
| Create | `src/icons/registry.ts` | アイコン登録・AppIconName 型定義 |
| Create | `src/icons/registry.spec.ts` | レジストリ構造のユニットテスト |
| Create | `src/components/AppIcon.vue` | 共通アイコンコンポーネント |
| Create | `src/components/AppIcon.spec.ts` | AppIcon ユニットテスト |
| Create | `src/components/AppIcon.stories.ts` | Storybook ストーリー |

---

### Task 1: パッケージインストール・設定ファイル変更

**Files:**
- Modify: `vite.config.ts`
- Modify: `tsconfig.json`
- Modify: `.storybook/main.ts`

- [ ] **Step 1: パッケージをインストール**

```bash
npm install -D unplugin-icons @iconify/json
```

Expected: `package.json` の devDependencies に `unplugin-icons` と `@iconify/json` が追加される。

- [ ] **Step 2: vite.config.ts に Icons プラグインを追加**

`vite.config.ts` 全体を以下に置き換える:

```typescript
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Icons from 'unplugin-icons/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [
    vue(),
    Icons({ compiler: 'vue3' }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
})
```

- [ ] **Step 3: tsconfig.json の types に unplugin-icons の型定義を追加**

`tsconfig.json` の `"types"` 行を変更（他はそのまま）:

```json
"types": ["vite/client", "unplugin-icons/types/vue"]
```

変更後の `tsconfig.json` 全体:

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
    "paths": { "@/*": ["./src/*"] },
    "types": ["vite/client", "unplugin-icons/types/vue"]
  },
  "include": ["src/**/*.ts", "src/**/*.vue", "orval.config.ts"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 4: .storybook/main.ts に viteFinal を追加**

`.storybook/main.ts` 全体を以下に置き換える:

```typescript
import type { StorybookConfig } from '@storybook/vue3-vite'
import Icons from 'unplugin-icons/vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs'],
  framework: { name: '@storybook/vue3-vite', options: {} },
  staticDirs: ['../public'],
  async viteFinal(config) {
    const { mergeConfig } = await import('vite')
    return mergeConfig(config, {
      plugins: [Icons({ compiler: 'vue3' })],
    })
  },
}
export default config
```

- [ ] **Step 5: ビルドが通ることを確認**

```bash
npm run build
```

Expected: エラーなし。`~icons/*` に関する型エラーが出ないことを確認。

- [ ] **Step 6: コミット**

```bash
git add vite.config.ts tsconfig.json .storybook/main.ts package.json package-lock.json
git commit -m "chore: install unplugin-icons and configure Vite/tsconfig/Storybook"
```

---

### Task 2: アイコンレジストリ作成（TDD）

**Files:**
- Create: `src/icons/registry.spec.ts`
- Create: `src/icons/registry.ts`

- [ ] **Step 1: 失敗するテストを書く**

`src/icons/registry.spec.ts` を作成:

```typescript
import { describe, it, expect } from 'vitest'
import { iconRegistry } from '@/icons/registry'
import type { AppIconName } from '@/icons/registry'

describe('iconRegistry', () => {
  it('palette エントリが outline / filled の両バリアントを持つ', () => {
    expect(iconRegistry.palette.outline).toBeDefined()
    expect(iconRegistry.palette.filled).toBeDefined()
  })

  it('home エントリが outline / filled の両バリアントを持つ', () => {
    expect(iconRegistry.home.outline).toBeDefined()
    expect(iconRegistry.home.filled).toBeDefined()
  })

  it('settings エントリが outline / filled の両バリアントを持つ', () => {
    expect(iconRegistry.settings.outline).toBeDefined()
    expect(iconRegistry.settings.filled).toBeDefined()
  })

  it('dark-mode エントリが outline / filled の両バリアントを持つ', () => {
    expect(iconRegistry['dark-mode'].outline).toBeDefined()
    expect(iconRegistry['dark-mode'].filled).toBeDefined()
  })

  it('AppIconName はレジストリのキーの union 型である', () => {
    const name: AppIconName = 'palette'
    expect(name).toBe('palette')
  })
})
```

- [ ] **Step 2: テストが失敗することを確認**

```bash
npm test -- src/icons/registry.spec.ts
```

Expected: FAIL — `Cannot find module '@/icons/registry'`

- [ ] **Step 3: registry.ts を実装**

`src/icons/registry.ts` を作成:

```typescript
import MsPaletteOutline from '~icons/material-symbols/palette-outline'
import MsPalette       from '~icons/material-symbols/palette'
import MsHomeOutline   from '~icons/material-symbols/home-outline'
import MsHome          from '~icons/material-symbols/home'
import MsSettingsOutline from '~icons/material-symbols/settings-outline'
import MsSettings       from '~icons/material-symbols/settings'
import MsDarkModeOutline from '~icons/material-symbols/dark-mode-outline'
import MsDarkMode        from '~icons/material-symbols/dark-mode'

export const iconRegistry = {
  palette:     { outline: MsPaletteOutline,    filled: MsPalette },
  home:        { outline: MsHomeOutline,        filled: MsHome },
  settings:    { outline: MsSettingsOutline,    filled: MsSettings },
  'dark-mode': { outline: MsDarkModeOutline,    filled: MsDarkMode },
} as const

export type AppIconName = keyof typeof iconRegistry
```

- [ ] **Step 4: テストが通ることを確認**

```bash
npm test -- src/icons/registry.spec.ts
```

Expected: PASS (5 tests)

- [ ] **Step 5: コミット**

```bash
git add src/icons/registry.ts src/icons/registry.spec.ts
git commit -m "feat: add icon registry with Material Symbols"
```

---

### Task 3: AppIcon コンポーネント実装（TDD）

**Files:**
- Create: `src/components/AppIcon.spec.ts`
- Create: `src/components/AppIcon.vue`

- [ ] **Step 1: 失敗するテストを書く**

`src/components/AppIcon.spec.ts` を作成:

```typescript
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import AppIcon from './AppIcon.vue'

describe('AppIcon', () => {
  it('有効なアイコン名で SVG をレンダリングする', () => {
    const wrapper = mount(AppIcon, { props: { name: 'palette' } })
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('デフォルトサイズは 24px', () => {
    const wrapper = mount(AppIcon, { props: { name: 'palette' } })
    expect(wrapper.find('svg').attributes('style')).toContain('24px')
  })

  it('size=32 を指定すると 32px が style に反映される', () => {
    const wrapper = mount(AppIcon, { props: { name: 'palette', size: 32 } })
    expect(wrapper.find('svg').attributes('style')).toContain('32px')
  })

  it('color を指定すると style に反映される', () => {
    const wrapper = mount(AppIcon, { props: { name: 'palette', color: 'red' } })
    expect(wrapper.find('svg').attributes('style')).toContain('red')
  })

  it('fill=true と fill=false で異なる SVG をレンダリングする', () => {
    const outline = mount(AppIcon, { props: { name: 'palette', fill: false } })
    const filled  = mount(AppIcon, { props: { name: 'palette', fill: true } })
    expect(outline.find('svg').html()).not.toBe(filled.find('svg').html())
  })
})
```

- [ ] **Step 2: テストが失敗することを確認**

```bash
npm test -- src/components/AppIcon.spec.ts
```

Expected: FAIL — `Cannot find module './AppIcon.vue'`

- [ ] **Step 3: AppIcon.vue を実装**

`src/components/AppIcon.vue` を作成:

```vue
<template>
  <component :is="icon" :style="iconStyle" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { iconRegistry, type AppIconName } from '@/icons/registry'

const props = defineProps<{
  name: AppIconName
  fill?: boolean
  size?: number | string
  color?: string
}>()

const icon = computed(() =>
  props.fill ? iconRegistry[props.name].filled : iconRegistry[props.name].outline
)

const iconStyle = computed(() => {
  const sizeVal = props.size !== undefined
    ? (typeof props.size === 'number' ? `${props.size}px` : props.size)
    : '24px'
  return {
    width: sizeVal,
    height: sizeVal,
    ...(props.color !== undefined ? { color: props.color } : {}),
  }
})
</script>
```

- [ ] **Step 4: テストが通ることを確認**

```bash
npm test -- src/components/AppIcon.spec.ts
```

Expected: PASS (5 tests)

- [ ] **Step 5: 全テストが壊れていないことを確認**

```bash
npm test
```

Expected: すべて PASS

- [ ] **Step 6: コミット**

```bash
git add src/components/AppIcon.vue src/components/AppIcon.spec.ts
git commit -m "feat: add AppIcon component (TDD)"
```

---

### Task 4: Storybook ストーリー追加

**Files:**
- Create: `src/components/AppIcon.stories.ts`

- [ ] **Step 1: AppIcon.stories.ts を作成**

```typescript
import type { Meta, StoryObj } from '@storybook/vue3'
import AppIcon from './AppIcon.vue'
import type { AppIconName } from '@/icons/registry'

const ICON_NAMES: AppIconName[] = ['palette', 'home', 'settings', 'dark-mode']

const meta: Meta<typeof AppIcon> = {
  title: 'Components/AppIcon',
  component: AppIcon,
  args: {
    name: 'palette',
    fill: false,
    size: 24,
  },
  argTypes: {
    name:  { control: 'select', options: ICON_NAMES, description: 'アイコン名（registry 登録済み）' },
    fill:  { control: 'boolean', description: 'true = 塗りバリアント / false = アウトライン（デフォルト）' },
    size:  { control: 'number', description: 'アイコンサイズ px（デフォルト: 24）' },
    color: { control: 'color', description: 'CSS color 値（省略時は親の color を継承）' },
  },
}
export default meta
type Story = StoryObj<typeof AppIcon>

export const Default: Story = {
  name: '① アウトライン（デフォルト）',
  args: { name: 'palette', fill: false },
}

export const Filled: Story = {
  name: '② 塗りバリアント（fill=true）',
  args: { name: 'palette', fill: true },
}

export const WithColor: Story = {
  name: '③ カラー指定',
  args: { name: 'home', color: 'var(--ion-color-primary)' },
}

export const Sizes: Story = {
  name: '④ サイズバリエーション',
  render: () => ({
    components: { AppIcon },
    template: `
      <div style="display: flex; align-items: center; gap: 16px; padding: 16px;">
        <AppIcon name="palette" :size="16" />
        <AppIcon name="palette" :size="24" />
        <AppIcon name="palette" :size="32" />
        <AppIcon name="palette" :size="48" />
      </div>
    `,
  }),
}

export const AllIcons: Story = {
  name: '⑤ 全登録アイコン（outline / filled ペア）',
  render: () => ({
    components: { AppIcon },
    setup() {
      return { names: ICON_NAMES }
    },
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 24px; padding: 16px;">
        <div v-for="name in names" :key="name"
             style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
          <div style="display: flex; gap: 8px;">
            <AppIcon :name="name" :fill="false" :size="28" />
            <AppIcon :name="name" :fill="true"  :size="28" />
          </div>
          <span style="font-size: 11px; color: gray;">{{ name }}</span>
        </div>
      </div>
    `,
  }),
}
```

- [ ] **Step 2: Storybook を起動して目視確認**

```bash
npm run storybook
```

ブラウザで `http://localhost:6006` → `Components/AppIcon` を確認:
- ① アウトラインアイコンが表示される
- ② 塗りアイコンが表示される（① と見た目が異なる）
- ③ `--ion-color-primary` の色でアイコンが表示される
- ④ 16 / 24 / 32 / 48px が横並びで表示される
- ⑤ 全 4 アイコンが outline / filled のペアで表示される

- [ ] **Step 3: コミット**

```bash
git add src/components/AppIcon.stories.ts
git commit -m "feat: add AppIcon Storybook stories"
```
