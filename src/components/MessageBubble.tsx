import type { ChatMessage, Language, ButtonOption } from '../types'
import { formatTime } from '../utils'

interface MessageBubbleProps {
  message: ChatMessage
  lang: Language
  onButtonClick?: (button: ButtonOption) => void
}

export const MessageBubble = ({ message, lang }: MessageBubbleProps) => {
  return (
    <div 
      className={`flex items-end gap-3 ${message.isUser ? 'flex-row-reverse' : 'flex-row'} message-bubble`}
    >
      {!message.isUser ? (
        <div className="w-8 h-8 rounded-full overflow-hidden shadow-sm">
          <img src="/logo.jpg" alt="AI" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
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
          <p className="text-sm">{message.text}</p>
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
        </div>
      </div>
    </div>
  )
}
