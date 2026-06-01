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
