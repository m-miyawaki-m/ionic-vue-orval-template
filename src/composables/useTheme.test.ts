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
