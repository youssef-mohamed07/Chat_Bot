import React from 'react'

interface TypingIndicatorProps {
  isVisible: boolean
  lang: 'en' | 'ar'
}

export const TypingIndicator = ({ isVisible, lang }: TypingIndicatorProps) => {
  if (!isVisible) return null

  return (
    <div className="flex items-end gap-3 fade-in-up">
      <div className="w-7 h-7 rounded-full overflow-hidden shadow-md">
        <img src="/logo.jpg" alt="AI" className="w-full h-full object-cover" />
      </div>
      
      <div className="max-w-[72%] flex flex-col items-start">
        <div className="relative px-4 py-2.5 rounded-2xl rounded-bl-md shadow-md bg-gray-100">
          <div className="flex items-center gap-1">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full typing-animation" style={{ animationDelay: '0s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full typing-animation" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full typing-animation" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <span className="text-xs text-gray-500 ml-2">
              {lang === 'ar' ? 'يكتب...' : 'typing...'}
            </span>
          </div>
          <span className="absolute left-1 -bottom-1 -rotate-45 w-2 h-2 bg-gray-100" />
        </div>
      </div>
    </div>
  )
}
