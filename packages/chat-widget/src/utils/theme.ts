// ===================================
// THEME MANAGEMENT
// CSS variable theming system
// ===================================

export type ThemeVars = Partial<{
  '--brand-primary': string
  '--brand-secondary': string
  '--chat-user-bg': string
  '--chat-user-text': string
  '--chat-bot-bg': string
  '--chat-bot-text': string
  '--color-success': string
  '--color-warning': string
  '--color-error': string
  '--header-bg': string
  '--border-color': string
  '--text-primary': string
  '--text-secondary': string
  '--bg-primary': string
  '--bg-secondary': string
}>

export const defaultTheme: ThemeVars = {
  '--brand-primary': '#7A0C2E',
  '--brand-secondary': '#991B1B',
  '--chat-user-bg': '#f3f4f6',
  '--chat-user-text': '#374151',
  '--chat-bot-bg': '#7A0C2E',
  '--chat-bot-text': '#ffffff',
  '--color-success': '#059669',
  '--color-warning': '#d97706',
  '--color-error': '#dc2626',
  '--header-bg': '#991B1B',
  '--border-color': '#e5e7eb',
  '--text-primary': '#111827',
  '--text-secondary': '#6b7280',
  '--bg-primary': '#ffffff',
  '--bg-secondary': '#f9fafb',
}

export const applyTheme = (overrides?: ThemeVars): void => {
  const vars = { ...defaultTheme, ...(overrides || {}) }
  const root = document.documentElement
  
  Object.entries(vars).forEach(([key, value]) => {
    if (value) {
      root.style.setProperty(key, value)
    }
  })
}
