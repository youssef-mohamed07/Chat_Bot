import React from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useSoundEffects } from '../utils'

interface ThemeToggleProps {
  className?: string
}

export const ThemeToggle = ({ className = '' }: ThemeToggleProps) => {
  const { theme, toggleTheme } = useTheme()
  const { playClick } = useSoundEffects()

  const handleToggle = () => {
    playClick()
    toggleTheme()
  }

  return (
    <button
      onClick={handleToggle}
      className={`
        relative w-12 h-6 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20
        ${theme === 'dark' ? 'bg-blue-600' : 'bg-gray-300'}
        ${className}
      `}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      <div
        className={`
          absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ease-in-out
          ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0.5'}
        `}
      >
        <div className="flex items-center justify-center h-full">
          {theme === 'dark' ? (
            <span className="text-xs">🌙</span>
          ) : (
            <span className="text-xs">☀️</span>
          )}
        </div>
      </div>
    </button>
  )
}
