/**
 * ConfirmSheet Stories
 *
 * ── props / emit を持つコンポーネントの Storybook 実装パターン ──
 *
 * ① args → props の自動マッピング
 *    Meta<typeof Component> の args に書いた値が props に渡される。
 *    Controls パネルからリアルタイムに変更可能。
 *
 * ② emit のキャプチャ
 *    Storybook は on{EventName} 形式の args を @eventName リスナーとして自動バインド。
 *    fn() を割り当てると Actions パネルで emit の発火ログを確認できる。
 *    例: onConfirmed: fn()  →  @confirmed が発火するたびに Actions に記録される
 *
 * ③ 開閉状態を持つコンポーネント（isOpen など）
 *    isOpen を args で固定すると、emit で閉じても isOpen が変わらない。
 *    （Storybook 上には「親コンポーネント」が存在しないため）
 *    → render() でラッパーを定義し ref で isOpen を管理して親役を担わせる。
 *       これが「開閉する動作を確認できる Interactive Story」の実装パターン。
 */
import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { fn } from 'storybook/test'
import ConfirmSheet from './ConfirmSheet.vue'

// ----------------------------------------------------------------
// Meta: コンポーネント共通設定
// ----------------------------------------------------------------
const meta: Meta<typeof ConfirmSheet> = {
  title: 'Components/ConfirmSheet',
  component: ConfirmSheet,

  // args: 全 Story に共通するデフォルト値
  // on{EventName} 形式で emit をキャプチャ（Actions パネルに表示）
  args: {
    isOpen: false,
    title: '操作を確認しますか？',
    confirmLabel: '確認',
    destructive: false,
    onConfirmed: fn(),   // ← @confirmed emit のキャプチャ
    onCancelled: fn(),   // ← @cancelled emit のキャプチャ
  },

  // argTypes: Controls パネルの UI を定義
  argTypes: {
    isOpen:       { control: 'boolean',  description: 'ActionSheet の開閉状態（親が制御）' },
    title:        { control: 'text',     description: 'ヘッダーに表示する確認メッセージ' },
    confirmLabel: { control: 'text',     description: '確認ボタンのラベル（省略時: 確認）' },
    destructive:  { control: 'boolean',  description: 'true のとき確認ボタンを赤色で表示' },
    onConfirmed:  { action: 'confirmed', description: '確認ボタン押下時に emit される' },
    onCancelled:  { action: 'cancelled', description: 'キャンセル / バックドロップ押下時に emit される' },
  },
}
export default meta
type Story = StoryObj<typeof ConfirmSheet>

// ----------------------------------------------------------------
// Story ①: 通常の確認ダイアログ（開いた状態）
//   args で isOpen: true を渡すだけ。
//   Controls で props を変えて外観を確認できる。
//   ※ キャンセルを押しても isOpen が変わらないため閉じない（静的表示用）
// ----------------------------------------------------------------
export const Open: Story = {
  name: '① 通常確認（開いた状態）',
  args: {
    isOpen: true,
  },
}

// ----------------------------------------------------------------
// Story ②: 破壊的操作（削除等）
//   destructive: true で確認ボタンが赤くなる。
// ----------------------------------------------------------------
export const Destructive: Story = {
  name: '② 破壊的操作（destructive=true）',
  args: {
    isOpen: true,
    title: 'このアイテムを削除しますか？',
    confirmLabel: '削除',
    destructive: true,
  },
}

// ----------------------------------------------------------------
// Story ③: インタラクティブ（親役ラッパーあり）
//   render() でラッパーコンポーネントを定義し、
//   ref で isOpen を管理することで実際の開閉動作を再現する。
//   ・ボタンクリック → シートが開く（親が open() を呼ぶ相当）
//   ・確認 / キャンセル → emit を受けてシートが閉じる（親が close() を呼ぶ相当）
//   ・Actions パネルで emit のログを確認できる
// ----------------------------------------------------------------
export const Interactive: Story = {
  name: '③ インタラクティブ（開閉動作を確認）',

  render: (args) => ({
    components: { ConfirmSheet },
    setup() {
      const isOpen = ref(false)
      const lastEmit = ref<string | null>(null)

      function open() {
        isOpen.value = true
      }

      function onConfirmed() {
        args.onConfirmed?.()          // Actions パネルにログ
        lastEmit.value = 'confirmed'
        isOpen.value = false          // 親が閉じる
      }

      function onCancelled() {
        args.onCancelled?.()          // Actions パネルにログ
        lastEmit.value = 'cancelled'
        isOpen.value = false          // 親が閉じる
      }

      return { isOpen, lastEmit, args, open, onConfirmed, onCancelled }
    },

    // ラッパーテンプレート:
    //   ・ion-button が「親コンポーネントの削除ボタン」に相当
    //   ・confirm-sheet に props を渡し、emit を受け取る
    template: `
      <div style="padding: 16px;">
        <ion-button color="danger" @click="open">
          削除（クリックでシートを開く）
        </ion-button>

        <p v-if="lastEmit" style="margin-top: 12px; font-size: 14px;">
          最後の emit:
          <strong :style="{ color: lastEmit === 'confirmed' ? 'var(--ion-color-danger)' : 'var(--ion-color-medium)' }">
            {{ lastEmit }}
          </strong>
        </p>

        <confirm-sheet
          :is-open="isOpen"
          :title="args.title"
          :confirm-label="args.confirmLabel"
          :destructive="args.destructive"
          @confirmed="onConfirmed"
          @cancelled="onCancelled"
        />
      </div>
    `,
  }),

  args: {
    title: 'このアイテムを削除しますか？',
    confirmLabel: '削除',
    destructive: true,
  },
}
