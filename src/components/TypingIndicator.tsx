import React from 'react'

interface TypingIndicatorProps {
  isVisible: boolean
  lang: 'en' | 'ar'
}

export const TypingIndicator = ({ isVisible, lang }: TypingIndicatorProps) => {
  if (!isVisible) return null

  return (
    <div className="flex items-end gap-3">
      <div className="w-8 h-8 rounded-full overflow-hidden shadow-sm">
        <img src="/logo.jpg" alt="AI" className="w-full h-full object-cover" />
      </div>
      
      <div className="max-w-[72%] flex flex-col items-start">
        <div className="relative px-4 py-3 rounded-xl rounded-bl-md shadow-sm bg-gray-100">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <span className="text-xs text-gray-500">
              {lang === 'ar' ? 'يكتب...' : 'typing...'}
            </span>
          </div>
          <span className="absolute left-1 -bottom-1 -rotate-45 w-2 h-2 bg-gray-100" />
        </div>
      </div>
    </div>
  )
}
