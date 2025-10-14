import { useState } from 'react'
import type { Language, ButtonOption, ContactInfo } from './types'
import { useChatWidget } from './hooks/useChatWidget'
import { useSupportModal } from './hooks/useSupportModal'
import { LanguageSelector, ContactInfo as ContactInfoComponent, ToggleButton, ChatWindow, ChatEndedState, ChatHeader } from './components'
import { ThemeProvider } from './contexts/ThemeContext'

function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [lang, setLang] = useState<Language | null>(null)
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null)
  const [currentStep, setCurrentStep] = useState<'contact' | 'language' | 'chat' | 'ended'>('contact')
  
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
    setCurrentStep('chat')
    handleSelectLang(selected)
  }

  const handleContactSubmit = (contact: ContactInfo) => {
    setContactInfo(contact)
    setCurrentStep('language')
  }

  const handleEndChat = () => {
    setCurrentStep('ended')
  }

  const handleRestartChat = () => {
    setCurrentStep('contact')
    setContactInfo(null)
    setLang(null)
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
      // Use pre-collected contact info if available, otherwise use form data
      const supportData = contactInfo ? {
        ...data,
        email: contactInfo.email,
        phone: contactInfo.phone
      } : data
      
      await sendSupportRequest(supportData)
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
        <div className="relative">
          <div className="w-[380px] sm:w-[400px] h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col">
            {currentStep === 'contact' && (
              <ContactInfoComponent 
                onContactSubmit={handleContactSubmit} 
                lang={lang || 'en'} 
              />
            )}
            {currentStep === 'language' && (
              <LanguageSelector onSelectLanguage={handleLanguageSelect} />
            )}
            {currentStep === 'chat' && lang && (
              <ChatWindow
                lang={lang}
                messages={messages}
                messagesEndRef={messagesEndRef}
                input={input}
                setInput={setInput}
                onSend={handleSend}
                onKeyPress={handleKeyPress}
                isLoading={isLoading}
                onClose={handleEndChat}
                onOpenSupport={() => setIsSupportOpen(true)}
                onCloseSupport={() => setIsSupportOpen(false)}
                onSendSupport={handleSupportSubmit}
                isSupportOpen={isSupportOpen}
                isSupportSending={isSupportSending}
                onButtonClick={handleButtonClick}
                contactInfo={contactInfo || undefined}
              />
            )}
            {currentStep === 'ended' && lang && (
              <div className="flex flex-col h-full">
                <ChatHeader onClose={() => setIsOpen(false)} lang={lang} isChatEnded={true} />
                <div className="flex-1 overflow-y-auto">
                  <ChatEndedState lang={lang} onRestartChat={handleRestartChat} />
                </div>
              </div>
            )}
          </div>
          {/* Floating Action Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-red-800 rounded-full shadow-xl hover:bg-red-900 transition-all duration-200 flex items-center justify-center hover:scale-110"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
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

