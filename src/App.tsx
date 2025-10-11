import { useState } from 'react'
import type { Language } from './types'
import { useChatWidget } from './hooks/useChatWidget'
import { useSupportModal } from './hooks/useSupportModal'
import { LanguageSelector, ToggleButton, ChatWindow } from './components'
import { ThemeProvider } from './contexts/ThemeContext'

function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [lang, setLang] = useState<Language | null>(null)
  
  const {
    messages,
    input,
    setInput,
    isLoading,
    messagesEndRef,
    handleSelectLang,
    handleSend,
    handleKeyPress,
    sendSupportRequest
  } = useChatWidget()

  const {
    isOpen: isSupportOpen,
    setIsOpen: setIsSupportOpen,
    isSending: isSupportSending,
    setIsSending: setIsSupportSending,
    resetForm
  } = useSupportModal(lang)

  const handleLanguageSelect = (selected: Language) => {
    setLang(selected)
    handleSelectLang(selected)
  }

  const handleSupportSubmit = async (data: { name: string; email: string; phone: string; message: string }) => {
    setIsSupportSending(true)
    try {
      await sendSupportRequest(data)
      setIsSupportOpen(false)
      resetForm()
    } finally {
      setIsSupportSending(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && <ToggleButton onOpen={() => setIsOpen(true)} />}
      
      {isOpen && (
        <div className="popup-animate w-[360px] sm:w-[380px] h-[560px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
          {lang === null ? (
            <LanguageSelector onSelectLanguage={handleLanguageSelect} />
          ) : (
            <ChatWindow
              lang={lang}
              messages={messages}
              messagesEndRef={messagesEndRef}
              input={input}
              setInput={setInput}
              onSend={handleSend}
              onKeyPress={handleKeyPress}
              isLoading={isLoading}
              onClose={() => setIsOpen(false)}
              onOpenSupport={() => setIsSupportOpen(true)}
              onCloseSupport={() => setIsSupportOpen(false)}
              onSendSupport={handleSupportSubmit}
              isSupportOpen={isSupportOpen}
              isSupportSending={isSupportSending}
            />
          )}
        </div>
      )}
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden transition-colors duration-300">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-32 h-32 bg-blue-200 dark:bg-blue-800 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-purple-200 dark:bg-purple-800 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-32 left-40 w-40 h-40 bg-pink-200 dark:bg-pink-800 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-20 right-20 w-28 h-28 bg-indigo-200 dark:bg-indigo-800 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        </div>
        
        <ChatWidget />
      </div>
    </ThemeProvider>
  )
}

