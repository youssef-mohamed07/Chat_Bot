import type { ChatMessage, Language } from '../types'
import { formatTime, copyToClipboard } from '../utils'

interface MessageBubbleProps {
  message: ChatMessage
  lang: Language
}

export const MessageBubble = ({ message, lang }: MessageBubbleProps) => {
  const handleCopy = () => {
    copyToClipboard(message.text)
  }

  return (
    <div className={`flex items-end gap-3 ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!message.isUser ? (
        <div className="w-7 h-7 rounded-full overflow-hidden shadow-md">
          <img src="/logo.jpg" alt="AI" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-7 h-7 rounded-full bg-gray-800 text-white flex items-center justify-center text-xs">
          You
        </div>
      )}
      
      <div className={`max-w-[72%] ${message.isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`relative px-4 py-2.5 rounded-2xl shadow ${
            message.isUser ? 'rounded-br-md' : 'rounded-bl-md'
          }`}
          style={
            message.isUser
              ? { background: 'var(--chat-user-bg)', color: 'var(--chat-user-text)' }
              : { background: 'var(--chat-bot-bg)', color: 'var(--chat-bot-text)' }
          }
        >
          <p className="text-sm whitespace-pre-wrap" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            {message.text}
          </p>
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
        
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-gray-400">
            {formatTime(message.timestamp, lang)}
          </span>
          <button 
            title="Copy" 
            onClick={handleCopy} 
            className="text-[10px] text-gray-400 hover:text-gray-600"
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  )
}
