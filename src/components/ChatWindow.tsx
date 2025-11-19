import type { Language, ChatMessage, ButtonOption } from '../types'
import { ChatHeader, ChatFooter } from './ChatComponents'
import { MessagesList } from './MessagesList'
import { SupportModal } from './FormComponents'

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
 onButtonClick?: (button: ButtonOption) => void
 contactInfo?: { phone: string; email: string }
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
 isSupportSending,
 onButtonClick,
 contactInfo
}: ChatWindowProps) => {
 return (
 <div className="w-full h-full bg-white md:rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col">
 <ChatHeader onClose={onClose} />
 
 <MessagesList 
 messages={messages} 
 lang={lang} 
 messagesEndRef={messagesEndRef}
 isLoading={isLoading}
 onButtonClick={onButtonClick}
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
 contactInfo={contactInfo}
 />
 </div>
 )
}
