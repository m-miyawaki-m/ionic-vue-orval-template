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
