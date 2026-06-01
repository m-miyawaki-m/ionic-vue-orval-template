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
