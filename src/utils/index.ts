import type { Language } from '../types'

export const formatTime = (date: Date, lang: Language): string => {
  return date.toLocaleTimeString(
    lang === 'ar' ? 'ar-EG' : 'en-US',
    { hour: '2-digit', minute: '2-digit', hour12: true }
  )
}

export const generateUserId = (): string => {
  return 'user-' + Math.random().toString(36).substr(2, 9)
}

export const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text)
  } catch (error) {
    console.error('Failed to copy text to clipboard:', error)
  }
}
