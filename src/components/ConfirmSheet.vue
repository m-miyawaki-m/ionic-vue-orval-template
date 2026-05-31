<template>
  <ion-action-sheet
    :is-open="isOpen"
    :header="title"
    :buttons="buttons"
    @did-dismiss="onDismiss"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { IonActionSheet } from '@ionic/vue'

/**
 * 確認用 ActionSheet コンポーネント
 *
 * Props:
 *   isOpen      - シートの開閉状態（親が制御）
 *   title       - ヘッダーに表示する確認メッセージ
 *   confirmLabel - 確認ボタンのラベル（省略時: '確認'）
 *   destructive - true のとき確認ボタンを破壊的スタイル（赤）で表示
 *
 * Emits:
 *   confirmed  - 確認ボタン押下時
 *   cancelled  - キャンセル / バックドロップ押下時
 */
const props = defineProps<{
  isOpen: boolean
  title: string
  confirmLabel?: string
  destructive?: boolean
}>()

const emit = defineEmits<{
  confirmed: []
  cancelled: []
}>()

const buttons = computed(() => [
  {
    text: props.confirmLabel ?? '確認',
    role: props.destructive ? 'destructive' : undefined,
    handler: () => { emit('confirmed') },
  },
  {
    text: 'キャンセル',
    role: 'cancel',
  },
])

/**
 * @did-dismiss は全パターン（確認・キャンセル・バックドロップ）で発火する。
 * role が 'cancel' または 'backdrop' のときのみ cancelled を emit する。
 * 確認ボタン由来の dismiss では role が undefined / 'destructive' になるため
 * cancelled は emit されない。
 */
function onDismiss(event: CustomEvent<{ role?: string }>) {
  const { role } = event.detail
  if (role === 'cancel' || role === 'backdrop') {
    emit('cancelled')
  }
}
</script>
