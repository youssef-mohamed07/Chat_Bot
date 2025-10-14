import { useState } from 'react'
import type { Language, ButtonOption } from './types'
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

  const handleButtonClick = (button: ButtonOption) => {
    console.log('Button clicked:', button)
    
    // Handle different button actions immediately
    switch (button.action) {
      case 'url':
        window.open(button.value, '_blank')
        break
      case 'phone':
        window.open(`tel:${button.value}`)
        break
      case 'email':
        window.open(`mailto:${button.value}`)
        break
      case 'postback':
        // Send the button value as a message immediately
        handleSend(button.value)
        break
    }
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
        <div className="w-[380px] sm:w-[400px] h-[600px] bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col">
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
              onButtonClick={handleButtonClick}
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <ChatWidget />
      </div>
    </ThemeProvider>
  )
}

