import { useState } from 'react'
import type { ChatMessage, Language } from '../types'
import { formatTime, copyToClipboard, useSoundEffects } from '../utils'

interface MessageBubbleProps {
  message: ChatMessage
  lang: Language
}

export const MessageBubble = ({ message, lang }: MessageBubbleProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [showReactions, setShowReactions] = useState(false)
  const { playClick, playSuccess } = useSoundEffects()

  const handleCopy = async () => {
    await copyToClipboard(message.text)
    setIsCopied(true)
    playSuccess()
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleReaction = (reaction: string) => {
    // Add reaction logic here
    console.log(`Added reaction: ${reaction}`)
    setShowReactions(false)
    playClick()
  }

  return (
    <div 
      className={`flex items-end gap-3 ${message.isUser ? 'flex-row-reverse' : 'flex-row'} message-bubble`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!message.isUser ? (
        <div className={`
          w-7 h-7 rounded-full overflow-hidden shadow-md transition-all duration-300
          ${isHovered ? 'scale-110 shadow-lg' : 'scale-100'}
        `}>
          <img src="/logo.jpg" alt="AI" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className={`
          w-7 h-7 rounded-full bg-gray-800 text-white flex items-center justify-center text-xs
          transition-all duration-300
          ${isHovered ? 'scale-110 shadow-lg' : 'scale-100'}
        `}>
          You
        </div>
      )}
      
      <div className={`max-w-[72%] ${message.isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`
            relative px-4 py-2.5 rounded-2xl shadow transition-all duration-300
            ${message.isUser ? 'rounded-br-md' : 'rounded-bl-md'}
            ${isHovered ? 'shadow-lg scale-[1.02]' : 'shadow-md'}
          `}
          style={
            message.isUser
              ? { 
                  background: isHovered 
                    ? 'linear-gradient(135deg, var(--chat-user-bg) 0%, #d1d5db 100%)'
                    : 'var(--chat-user-bg)', 
                  color: 'var(--chat-user-text)' 
                }
              : { 
                  background: isHovered 
                    ? 'linear-gradient(135deg, var(--chat-bot-bg) 0%, #8b1e3a 100%)'
                    : 'var(--chat-bot-bg)', 
                  color: 'var(--chat-bot-text)' 
                }
          }
        >
          <p className="text-sm whitespace-pre-wrap" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            {message.text}
          </p>
          <span
            className={`absolute ${
              message.isUser ? 'right-1 -bottom-1 rotate-45' : 'left-1 -bottom-1 -rotate-45'
            } w-2 h-2 transition-all duration-300`}
            style={
              message.isUser
                ? { background: isHovered ? '#d1d5db' : 'var(--chat-user-bg)' }
                : { background: isHovered ? '#8b1e3a' : 'var(--chat-bot-bg)' }
            }
          />
          
          {/* Shimmer effect on hover */}
          {isHovered && (
            <div className="absolute inset-0 rounded-2xl shimmer opacity-20 pointer-events-none" />
          )}
        </div>
        
        <div className={`
          flex items-center gap-2 mt-1 transition-all duration-300
          ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}
        `}>
          <span className="text-[10px] text-gray-400">
            {formatTime(message.timestamp, lang)}
          </span>
          
          <div className="flex items-center gap-1">
            <button 
              title={isCopied ? "Copied!" : "Copy"} 
              onClick={handleCopy} 
              className={`
                text-[10px] px-2 py-1 rounded-full transition-all duration-200
                ${isCopied 
                  ? 'text-green-600 bg-green-50' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                }
              `}
            >
              {isCopied ? '✓ Copied' : 'Copy'}
            </button>
            
            {!message.isUser && (
              <button 
                title="React" 
                onClick={() => setShowReactions(!showReactions)}
                className="text-[10px] text-gray-400 hover:text-gray-600 hover:bg-gray-50 px-2 py-1 rounded-full transition-all duration-200"
              >
                😊
              </button>
            )}
          </div>
        </div>

        {/* Reaction picker */}
        {showReactions && !message.isUser && (
          <div className="flex gap-1 mt-2 fade-in-up">
            {['👍', '❤️', '😂', '😮', '😢', '😡'].map((reaction) => (
              <button
                key={reaction}
                onClick={() => handleReaction(reaction)}
                className="text-lg hover:scale-125 transition-transform duration-200"
              >
                {reaction}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
