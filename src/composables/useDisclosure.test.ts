import { describe, it, expect } from 'vitest'
import { useDisclosure } from './useDisclosure'

describe('useDisclosure', () => {
  it('デフォルトは閉じた状態', () => {
    const { isOpen } = useDisclosure()
    expect(isOpen.value).toBe(false)
  })

  it('initial=true で開いた状態', () => {
    const { isOpen } = useDisclosure(true)
    expect(isOpen.value).toBe(true)
  })

  it('open() で true になる', () => {
    const { isOpen, open } = useDisclosure()
    open()
    expect(isOpen.value).toBe(true)
  })

  it('close() で false になる', () => {
    const { isOpen, close } = useDisclosure(true)
    close()
    expect(isOpen.value).toBe(false)
  })

  it('toggle() で反転する', () => {
    const { isOpen, toggle } = useDisclosure()
    toggle()
    expect(isOpen.value).toBe(true)
    toggle()
    expect(isOpen.value).toBe(false)
  })
})
