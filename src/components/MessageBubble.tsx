import { useState } from 'react'
import type { ChatMessage, Language, ButtonOption } from '../types'
import { formatTime, copyToClipboard, useSoundEffects } from '../utils'
import { InteractiveMessage } from './InteractiveMessage'

interface MessageBubbleProps {
  message: ChatMessage
  lang: Language
  onButtonClick?: (button: ButtonOption) => void
}

export const MessageBubble = ({ message, lang, onButtonClick }: MessageBubbleProps) => {
  const [isCopied, setIsCopied] = useState(false)
  const { playClick, playSuccess } = useSoundEffects()

  const handleCopy = async () => {
    await copyToClipboard(message.text)
    setIsCopied(true)
    playSuccess()
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleButtonClick = (button: ButtonOption) => {
    if (onButtonClick) {
      onButtonClick(button)
    }
    playClick()
  }

  return (
    <div 
      className={`flex items-end gap-3 ${message.isUser ? 'flex-row-reverse' : 'flex-row'} message-bubble`}
    >
      {!message.isUser ? (
        <div className="w-8 h-8 rounded-full overflow-hidden shadow-sm">
          <img src="/logo.jpg" alt="AI" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center text-xs font-medium">
          You
        </div>
      )}
      
      <div className={`max-w-[72%] ${message.isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`
            relative px-4 py-3 rounded-xl shadow-sm
            ${message.isUser ? 'rounded-br-md' : 'rounded-bl-md'}
          `}
          style={
            message.isUser
              ? { 
                  background: 'var(--chat-user-bg)', 
                  color: 'var(--chat-user-text)' 
                }
              : { 
                  background: 'var(--chat-bot-bg)', 
                  color: 'var(--chat-bot-text)' 
                }
          }
        >
          <InteractiveMessage 
            message={message} 
            onButtonClick={handleButtonClick}
          />
          <span
            className={`absolute ${
              message.isUser ? 'right-1 -bottom-1 rotate-45' : 'left-1 -bottom-1 -rotate-45'
            } w-2 h-2`}
            style={
              message.isUser
                ? { background: 'var(--chat-user-bg)' }
                : { background: 'var(--chat-bot-bg)' }
            }
          />
        </div>
        
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-gray-400">
            {formatTime(message.timestamp, lang)}
          </span>
          
          <div className="flex items-center gap-1">
            <button 
              title={isCopied ? "Copied!" : "Copy"} 
              onClick={handleCopy} 
              className={`
                text-xs px-2 py-1 rounded-full transition-colors duration-200
                ${isCopied 
                  ? 'text-green-600 bg-green-50' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                }
              `}
            >
              {isCopied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
