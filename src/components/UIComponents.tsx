import type { Language } from '../types'
import { LABELS } from '../utils'

// Support CTA Component
interface SupportCTAProps {
  onOpenSupport: () => void
  lang: Language
}

export const SupportCTA = ({ onOpenSupport, lang }: SupportCTAProps) => {
  return (
    <div className="mt-3 text-[12px] text-gray-500">
      <button 
        onClick={onOpenSupport} 
        className="underline hover:text-gray-700"
      >
        {LABELS[lang].needSupport}
      </button>
    </div>
  )
}

// Typing Indicator Component
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

// Skeleton Components
interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
  rounded?: boolean
}

export const Skeleton = ({ 
  className = '', 
  width = '100%', 
  height = '1rem', 
  rounded = true 
}: SkeletonProps) => {
  return (
    <div
      className={`
        bg-gray-200 animate-pulse
        ${rounded ? 'rounded' : ''}
        ${className}
      `}
      style={{ width, height }}
    />
  )
}

interface MessageSkeletonProps {
  isUser?: boolean
}

export const MessageSkeleton = ({ isUser = false }: MessageSkeletonProps) => {
  return (
    <div className={`flex items-end gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
      
      <div className={`max-w-[72%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className={`
          px-4 py-3 rounded-xl shadow-sm bg-gray-200 animate-pulse
          ${isUser ? 'rounded-br-md' : 'rounded-bl-md'}
        `}>
          <div className="space-y-2">
            <Skeleton width="80%" height="0.875rem" />
            <Skeleton width="60%" height="0.875rem" />
            {Math.random() > 0.5 && (
              <Skeleton width="40%" height="0.875rem" />
            )}
          </div>
        </div>
        <Skeleton width="3rem" height="0.75rem" className="mt-2" />
      </div>
    </div>
  )
}

interface ChatSkeletonProps {
  messageCount?: number
}

export const ChatSkeleton = ({ messageCount = 3 }: ChatSkeletonProps) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: messageCount }).map((_, index) => (
        <MessageSkeleton key={index} isUser={index % 2 === 0} />
      ))}
    </div>
  )
}
