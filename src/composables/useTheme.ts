import { ref } from 'vue'

const THEMES = ['default', 'dark', 'blue', 'practice'] as const
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
