import type { ChatMessage, Language, ButtonOption } from '../types'
import { TripCard } from './TripCard'
import { DateRangeWidget, TravellersWidget } from './ChatWidgets'
import { formatTime } from '../utils'

interface MessageBubbleProps {
  message: ChatMessage
  lang: Language
  onButtonClick?: (button: ButtonOption) => void
  showButtons?: boolean // Only show buttons on last bot message
}

export const MessageBubble = ({ message, lang, onButtonClick, showButtons = true }: MessageBubbleProps) => {
  // Don't render empty bot messages (no text, no widgets, no card)
  if (!message.isUser && 
      !message.text && 
      !message.meta?.card && 
      !message.meta?.images?.length &&
      !message.meta?.attachments?.length &&
      !message.meta?.dateRange &&
      !message.meta?.travellers &&
      (!message.meta?.buttons?.length || !showButtons)) {
    return null
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
              ? { background: 'var(--chat-user-bg)', color: 'var(--chat-user-text)' }
              : { background: '#ffffff', color: '#111111' }
          }
        >
          {message.meta?.card?.type === 'trip' ? (
            <TripCard lang={lang} data={message.meta.card.data} />
          ) : (
            <div className="space-y-2">
              {message.meta?.images && message.meta.images.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {message.meta.images.map((url, i) => (
                    <img key={i} src={url} alt={`img-${i}`} className="max-h-28 rounded-md border border-gray-200" />
                  ))}
                </div>
              ) : null}
              {message.meta?.attachments && message.meta.attachments.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {message.meta.attachments.map((f, i) => (
                    f.previewUrl && f.type.startsWith('image/') ? (
                      <img key={i} src={f.previewUrl} alt={f.name} className="max-h-28 rounded-md border border-gray-200" />
                    ) : (
                      <div key={i} className="flex items-center gap-2 px-3 py-1.5 text-xs bg-gray-100 rounded-md border border-gray-200">
                        <svg className="w-4 h-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path d="M8 2a2 2 0 00-2 2v9a3 3 0 106 0V6a1 1 0 112 0v7a5 5 0 11-10 0V4a4 4 0 118 0v7a3 3 0 11-6 0V6a1 1 0 112 0v5a1 1 0 102 0V4a2 2 0 10-4 0v9a4 4 0 108 0V6a3 3 0 00-6 0v5a2 2 0 104 0V4a4 4 0 10-8 0v9a6 6 0 1012 0V6a5 5 0 10-10 0v5a3 3 0 106 0V6a1 1 0 10-2 0v5a1 1 0 11-2 0V4a2 2 0 114 0v9a4 4 0 11-8 0V4a6 6 0 1112 0v9a6 6 0 11-12 0V4a8 8 0 1116 0v9a8 8 0 11-16 0V4a10 10 0 1120 0v9a10 10 0 11-20 0V4z"/></svg>
                        <span>{f.name}</span>
                      </div>
                    )
                  ))}
                </div>
              ) : null}
              {message.text ? (
                <p className="text-sm whitespace-pre-line">{message.text}</p>
              ) : null}
              {/* Date range widget */}
              {message.meta?.dateRange ? (
                <DateRangeWidget
                  heading={message.meta.dateRange.heading}
                  minDate={message.meta.dateRange.minDate}
                  maxDate={message.meta.dateRange.maxDate}
                  lang={lang}
                  onConfirm={(start: string, end: string) =>
                    onButtonClick && onButtonClick({
                      text: `${lang==='ar'?'التواريخ':'Dates'}: ${start} → ${end}`,
                      value: `set_dates:${start}..${end}`
                    })
                  }
                />
              ) : null}
              {/* Travellers widget */}
              {message.meta?.travellers ? (
                <TravellersWidget
                  heading={message.meta.travellers.heading}
                  min={message.meta.travellers.min}
                  max={message.meta.travellers.max}
                  initial={message.meta.travellers.default}
                  lang={lang}
                  onConfirm={(pax: number) =>
                    onButtonClick && onButtonClick({
                      text: `${pax} ${lang==='ar'?'مسافر':'traveler'}${pax>1?(lang==='ar'?'ين':'s'):''}`,
                      value: `set_pax:${pax}`
                    })
                  }
                />
              ) : null}
            </div>
          )}
          <span
            className={`absolute ${
              message.isUser ? 'right-1 -bottom-1 rotate-45' : 'left-1 -bottom-1 -rotate-45'
            } w-2 h-2`}
            style={
              message.isUser
                ? { background: 'var(--chat-user-bg)' }
                : { background: '#ffffff' }
            }
          />
        </div>
        {/* Buttons */}
        {!message.isUser && showButtons && message.meta?.buttons && message.meta.buttons.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {message.meta.buttons.map((btn, idx) => (
              <button
                key={idx}
                onClick={() => onButtonClick && onButtonClick(btn)}
                className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
              >
                {btn.text}
              </button>
            ))}
          </div>
        )}
        
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-gray-400">
            {formatTime(message.timestamp, lang)}
          </span>
        </div>
      </div>
    </div>
  )
}
