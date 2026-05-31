# テーマ切り替え機能 実装プラン

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Default / Dark / Blue の3テーマをヘッダーのActionSheetで切り替え、localStorageで永続化する仕組みを実装する。

**Architecture:** `<body>` へのクラス付与（`theme-dark` / `theme-blue`）でテーマを表現し、CSS変数でIonicコンポーネントの配色をオーバーライドする。`useTheme` composableがテーマ状態とlocalStorage永続化を担い、`main.ts`でアプリマウント前に復元することでFOUCを防ぐ。

**Tech Stack:** Vue 3 Composition API, Ionic Vue 8, ionicons, Vitest / jsdom

---

## ファイル一覧

| 操作 | パス | 内容 |
|------|------|------|
| 新規作成 | `src/composables/useTheme.ts` | テーマ状態管理・切り替え・永続化 |
| 新規作成 | `src/composables/useTheme.test.ts` | useTheme の単体テスト |
| 変更 | `src/theme/variables.css` | テーマクラスのCSS変数スケルトン追加 |
| 変更 | `src/main.ts` | `initTheme()` をマウント前に呼び出す |
| 変更 | `src/layouts/AppLayout.vue` | テーマアイコンボタン + ActionSheet追加 |

---

## Task 1: `useTheme` composable を TDD で実装する

**Files:**
- Create: `src/composables/useTheme.ts`
- Create: `src/composables/useTheme.test.ts`

- [ ] **Step 1: テストファイルを作成する**

`src/composables/useTheme.test.ts` を以下の内容で作成する:

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('useTheme', () => {
  beforeEach(() => {
    vi.resetModules()
    localStorage.clear()
    document.body.className = ''
  })

  it('initTheme() は localStorage 未設定時に default を適用する', async () => {
    const { useTheme } = await import('./useTheme')
    const { initTheme, currentTheme } = useTheme()
    initTheme()
    expect(document.body.classList.contains('theme-dark')).toBe(false)
    expect(document.body.classList.contains('theme-blue')).toBe(false)
    expect(currentTheme.value).toBe('default')
  })

  it('initTheme() は localStorage に保存されたテーマを復元する', async () => {
    localStorage.setItem('app-theme', 'dark')
    const { useTheme } = await import('./useTheme')
    const { initTheme, currentTheme } = useTheme()
    initTheme()
    expect(document.body.classList.contains('theme-dark')).toBe(true)
    expect(currentTheme.value).toBe('dark')
  })

  it('setTheme("dark") は body に theme-dark クラスを追加し localStorage に保存する', async () => {
    const { useTheme } = await import('./useTheme')
    const { setTheme, currentTheme } = useTheme()
    setTheme('dark')
    expect(document.body.classList.contains('theme-dark')).toBe(true)
    expect(localStorage.getItem('app-theme')).toBe('dark')
    expect(currentTheme.value).toBe('dark')
  })

  it('setTheme("blue") は theme-dark を除去して theme-blue を追加する', async () => {
    const { useTheme } = await import('./useTheme')
    const { setTheme } = useTheme()
    setTheme('dark')
    setTheme('blue')
    expect(document.body.classList.contains('theme-dark')).toBe(false)
    expect(document.body.classList.contains('theme-blue')).toBe(true)
  })

  it('setTheme("default") は全テーマクラスを除去する', async () => {
    const { useTheme } = await import('./useTheme')
    const { setTheme, currentTheme } = useTheme()
    setTheme('dark')
    setTheme('default')
    expect(document.body.classList.contains('theme-dark')).toBe(false)
    expect(document.body.classList.contains('theme-blue')).toBe(false)
    expect(currentTheme.value).toBe('default')
  })
})
```

- [ ] **Step 2: テストが失敗することを確認する**

```
npm run test -- src/composables/useTheme.test.ts
```

期待: `FAIL` — `Cannot find module './useTheme'`

- [ ] **Step 3: `useTheme.ts` を実装する**

`src/composables/useTheme.ts` を以下の内容で作成する:

```ts
import { ref } from 'vue'

const THEMES = ['default', 'dark', 'blue'] as const
type Theme = typeof THEMES[number]

const currentTheme = ref<Theme>('default')

function isTheme(value: string | null): value is Theme {
  return value !== null && (THEMES as readonly string[]).includes(value)
}

function setTheme(name: Theme) {
  THEMES.forEach((t) => {
    if (t !== 'default') document.body.classList.remove(`theme-${t}`)
  })
  if (name !== 'default') document.body.classList.add(`theme-${name}`)
  localStorage.setItem('app-theme', name)
  currentTheme.value = name
}

function initTheme() {
  const saved = localStorage.getItem('app-theme')
  setTheme(isTheme(saved) ? saved : 'default')
}

export function useTheme() {
  return { currentTheme, setTheme, initTheme }
}
```

- [ ] **Step 4: テストが全て通ることを確認する**

```
npm run test -- src/composables/useTheme.test.ts
```

期待: `PASS` — 5 tests passed

- [ ] **Step 5: コミットする**

```bash
git add src/composables/useTheme.ts src/composables/useTheme.test.ts
git commit -m "feat: add useTheme composable with localStorage persistence"
```

---

## Task 2: `variables.css` にテーマスケルトンを追加する

**Files:**
- Modify: `src/theme/variables.css`

- [ ] **Step 1: `variables.css` を以下の内容で上書きする**

```css
/* Ionic theme variables. 既定のままでよい。プロジェクト固有の色はここで上書き。 */

/* === Default（Ionicデフォルト、上書きなし） === */
/* 必要に応じて :root に追記 */

/* === Dark テーマ === */
body.theme-dark {
  /* --ion-color-primary: ; */
  /* --ion-color-primary-rgb: ; */
  /* --ion-color-primary-contrast: ; */
  /* --ion-color-primary-shade: ; */
  /* --ion-color-primary-tint: ; */
  /* --ion-background-color: ; */
  /* --ion-background-color-rgb: ; */
  /* --ion-text-color: ; */
  /* --ion-text-color-rgb: ; */
  /* --ion-toolbar-background: ; */
  /* --ion-item-background: ; */
}

/* === Blue テーマ === */
body.theme-blue {
  /* --ion-color-primary: ; */
  /* --ion-color-primary-rgb: ; */
  /* --ion-color-primary-contrast: ; */
  /* --ion-color-primary-shade: ; */
  /* --ion-color-primary-tint: ; */
  /* --ion-background-color: ; */
  /* --ion-background-color-rgb: ; */
  /* --ion-text-color: ; */
  /* --ion-text-color-rgb: ; */
  /* --ion-toolbar-background: ; */
  /* --ion-item-background: ; */
}
```

- [ ] **Step 2: コミットする**

```bash
git add src/theme/variables.css
git commit -m "feat: add theme CSS variable skeletons for dark and blue themes"
```

---

## Task 3: `main.ts` でアプリマウント前にテーマを初期化する

**Files:**
- Modify: `src/main.ts`

- [ ] **Step 1: `main.ts` を以下の内容に変更する**

```ts
import { createApp } from 'vue'
import { IonicVue } from '@ionic/vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import App from './App.vue'
import { router } from './router'
import { useTheme } from '@/composables/useTheme'

/* Ionic core CSS */
import '@ionic/vue/css/core.css'
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'
import './theme/variables.css'

const app = createApp(App)
  .use(IonicVue, { mode: 'md' })
  .use(router)
  .use(VueQueryPlugin)

async function enableMocking() {
  if (!import.meta.env.DEV) return
  const { worker } = await import('./mocks/browser')
  await worker.start({ onUnhandledRequest: 'bypass' })
}

router.isReady().then(async () => {
  await enableMocking()
  useTheme().initTheme()
  app.mount('#app')
})
```

- [ ] **Step 2: 全テストがまだ通ることを確認する**

```
npm run test
```

期待: `PASS` — 全テスト通過

- [ ] **Step 3: コミットする**

```bash
git add src/main.ts
git commit -m "feat: initialize theme from localStorage before app mount"
```

---

## Task 4: `AppLayout.vue` にテーマ切り替えUIを追加する

**Files:**
- Modify: `src/layouts/AppLayout.vue`

- [ ] **Step 1: `AppLayout.vue` を以下の内容に変更する**

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
          <ion-button @click="showSheet = true" aria-label="テーマを切り替える">
            <ion-icon :icon="colorPaletteOutline" slot="icon-only" />
          </ion-button>
          <slot name="actions" />
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <slot />
    </ion-content>
  </ion-page>

  <ion-action-sheet
    :is-open="showSheet"
    header="テーマを選択"
    :buttons="sheetButtons"
    @did-dismiss="showSheet = false"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonBackButton, IonButton, IonIcon, IonActionSheet,
} from '@ionic/vue'
import { colorPaletteOutline } from 'ionicons/icons'
import { useTheme } from '@/composables/useTheme'

defineProps<{ title: string; backHref?: string }>()

const { setTheme } = useTheme()
const showSheet = ref(false)

const sheetButtons = [
  { text: 'Default', handler: () => setTheme('default') },
  { text: 'Dark',    handler: () => setTheme('dark') },
  { text: 'Blue',    handler: () => setTheme('blue') },
  { text: 'キャンセル', role: 'cancel' },
]
</script>
```

- [ ] **Step 2: 全テストがまだ通ることを確認する**

```
npm run test
```

期待: `PASS` — 全テスト通過

- [ ] **Step 3: コミットする**

```bash
git add src/layouts/AppLayout.vue
git commit -m "feat: add theme switcher button and action sheet to AppLayout"
```
