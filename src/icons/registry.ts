import MsPaletteOutline from '~icons/material-symbols/palette-outline'
import MsPalette       from '~icons/material-symbols/palette'
import MsHomeOutline   from '~icons/material-symbols/home-outline'
import MsHome          from '~icons/material-symbols/home'
import MsSettingsOutline from '~icons/material-symbols/settings-outline'
import MsSettings       from '~icons/material-symbols/settings'
import MsDarkModeOutline from '~icons/material-symbols/dark-mode-outline'
import MsDarkMode        from '~icons/material-symbols/dark-mode'

export const iconRegistry = {
  palette:     { outline: MsPaletteOutline,    filled: MsPalette },
  home:        { outline: MsHomeOutline,        filled: MsHome },
  settings:    { outline: MsSettingsOutline,    filled: MsSettings },
  'dark-mode': { outline: MsDarkModeOutline,    filled: MsDarkMode },
} as const

export type AppIconName = keyof typeof iconRegistry
