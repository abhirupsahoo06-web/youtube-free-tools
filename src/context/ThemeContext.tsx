import React, { useEffect, useState } from 'react'
import { ThemeContext, type Theme } from './themeContextDef'

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('ytt_theme') as Theme | null
    if (saved === 'dark' || saved === 'light') return saved
    return 'dark'
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
      root.style.backgroundColor = '#0b0c10'
      document.body.style.backgroundColor = '#0b0c10'
    } else {
      root.classList.remove('dark')
      root.style.backgroundColor = '#ffffff'
      document.body.style.backgroundColor = '#ffffff'
    }
    localStorage.setItem('ytt_theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
