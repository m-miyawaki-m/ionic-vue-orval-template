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
