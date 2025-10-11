import React, { createContext, useContext, useState, useEffect } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: React.ReactNode
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check localStorage first, then system preference
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme) return savedTheme
    
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    // Update CSS custom properties based on theme
    const root = document.documentElement
    
    if (theme === 'dark') {
      root.style.setProperty('--bg-primary', '#1a1a1a')
      root.style.setProperty('--bg-secondary', '#2d2d2d')
      root.style.setProperty('--text-primary', '#ffffff')
      root.style.setProperty('--text-secondary', '#a0a0a0')
      root.style.setProperty('--border-color', '#404040')
      root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.3)')
      root.classList.add('dark')
    } else {
      root.style.setProperty('--bg-primary', '#ffffff')
      root.style.setProperty('--bg-secondary', '#f8f9fa')
      root.style.setProperty('--text-primary', '#212121')
      root.style.setProperty('--text-secondary', '#666666')
      root.style.setProperty('--border-color', '#e0e0e0')
      root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.1)')
      root.classList.remove('dark')
    }
    
    // Save to localStorage
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light')
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
