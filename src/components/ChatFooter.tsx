import type { Language } from '../types'
import { ChatInput } from './ChatInput'
import { SupportCTA } from './SupportCTA'

interface ChatFooterProps {
  input: string
  setInput: (value: string) => void
  onSend: () => void
  onKeyPress: (e: React.KeyboardEvent) => void
  isLoading: boolean
  lang: Language
  onOpenSupport: () => void
}

export const ChatFooter = ({ 
  input, 
  setInput, 
  onSend, 
  onKeyPress, 
  isLoading, 
  lang, 
  onOpenSupport 
}: ChatFooterProps) => {
  return (
    <div className="border-t border-gray-200 bg-white p-3">
      <ChatInput
        input={input}
        setInput={setInput}
        onSend={onSend}
        onKeyPress={onKeyPress}
        isLoading={isLoading}
        lang={lang}
      />
      <SupportCTA onOpenSupport={onOpenSupport} lang={lang} />
    </div>
  )
}
