import type { ChatMessage, Language } from '../types'
import { MessageBubble } from './MessageBubble'

interface MessagesListProps {
  messages: ChatMessage[]
  lang: Language
  messagesEndRef: React.RefObject<HTMLDivElement | null>
}

export const MessagesList = ({ messages, lang, messagesEndRef }: MessagesListProps) => {
  return (
    <div 
      className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-gray-50 bg-noise p-4 space-y-4" 
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {messages.map((message, index) => (
        <MessageBubble key={index} message={message} lang={lang} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}
