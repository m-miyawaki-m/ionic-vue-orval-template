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
  name: '③ カラー指定（outline）',
  args: { name: 'home', fill: false, color: 'var(--ion-color-primary)' },
}

// Controls are intentionally disabled; this is a static comparison grid.
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

// Controls are intentionally disabled; renders all registered icons as outline/filled pairs.
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
          <span style="font-size: 11px; color: var(--ion-color-medium);">{{ name }}</span>
        </div>
      </div>
    `,
  }),
}
