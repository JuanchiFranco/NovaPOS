import { create } from 'zustand'

type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

function applyThemeClass(theme: Theme): void {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

function getInitialTheme(): Theme {
  const stored = window.localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const initialTheme = getInitialTheme()
applyThemeClass(initialTheme)

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: initialTheme,
  toggleTheme: () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark'
    window.localStorage.setItem('theme', next)
    applyThemeClass(next)
    set({ theme: next })
  },
  setTheme: (theme) => {
    window.localStorage.setItem('theme', theme)
    applyThemeClass(theme)
    set({ theme })
  }
}))
