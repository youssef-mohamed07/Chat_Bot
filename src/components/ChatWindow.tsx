import type { Language, ChatMessage } from '../types'
import { ChatHeader } from './ChatHeader'
import { MessagesList } from './MessagesList'
import { ChatFooter } from './ChatFooter'
import { SupportModal } from './SupportModal'

interface ChatWindowProps {
  lang: Language
  messages: ChatMessage[]
  messagesEndRef: React.RefObject<HTMLDivElement | null>
  input: string
  setInput: (value: string) => void
  onSend: () => void
  onKeyPress: (e: React.KeyboardEvent) => void
  isLoading: boolean
  onClose: () => void
  onOpenSupport: () => void
  onCloseSupport: () => void
  onSendSupport: (data: { name: string; email: string; phone: string; message: string }) => Promise<void>
  isSupportOpen: boolean
  isSupportSending: boolean
}

export const ChatWindow = ({
  lang,
  messages,
  messagesEndRef,
  input,
  setInput,
  onSend,
  onKeyPress,
  isLoading,
  onClose,
  onOpenSupport,
  onCloseSupport,
  onSendSupport,
  isSupportOpen,
  isSupportSending
}: ChatWindowProps) => {
  return (
    <div className="popup-animate w-[360px] sm:w-[380px] h-[560px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
      <ChatHeader onClose={onClose} lang={lang} />
      
      <MessagesList 
        messages={messages} 
        lang={lang} 
        messagesEndRef={messagesEndRef} 
      />
      
      <ChatFooter
        input={input}
        setInput={setInput}
        onSend={onSend}
        onKeyPress={onKeyPress}
        isLoading={isLoading}
        lang={lang}
        onOpenSupport={onOpenSupport}
      />
      
      <SupportModal
        isOpen={isSupportOpen}
        onClose={onCloseSupport}
        onSubmit={onSendSupport}
        isSending={isSupportSending}
        lang={lang}
      />
    </div>
  )
}
