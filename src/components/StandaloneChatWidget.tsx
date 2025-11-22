"use client"
import { useState } from 'react'
import type { Language, ContactInfo } from '../shared'
import { useChatWidget, useSupportModal } from '../hooks/useChatWidget'
import { 
 LanguageSelector,
 ContactInfo as ContactInfoComponent,
 ToggleButton,
 ChatWindow,
 ChatEndedState,
 ChatHeader
} from './index'

// Single-file widget you can copy-paste into Next.js "app" or "pages"
// Usage in Next.js (app router):
// 'use client'
// import dynamic from 'next/dynamic'
// const StandaloneChatWidget = dynamic(() => import('./StandaloneChatWidget'), { ssr: false })
// export default function Page() { return <StandaloneChatWidget /> }

export default function StandaloneChatWidget({ initialOpen = false }: { initialOpen?: boolean }) {
 const [isOpen, setIsOpen] = useState(initialOpen)
 const [lang, setLang] = useState<Language | null>(null)
 const [currentStep, setCurrentStep] = useState<'language' | 'contact' | 'chat' | 'ended'>('language')

 const {
 messages,
 input,
 setInput,
 isLoading,
 messagesEndRef,
 handleSelectLang,
 handleSend,
 handleKeyPress,
 sendSupportRequest,
 handleButtonOption
 } = useChatWidget()

 const {
 isOpen: isSupportOpen,
 setIsOpen: setIsSupportOpen,
 isSending: isSupportSending,
 setIsSending: setIsSupportSending,
 resetForm
 } = useSupportModal()

 const handleLanguageSelect = (selected: Language) => {
 console.log('🌍 Language selected (no customer info yet):', selected)
 setLang(selected)
 setCurrentStep('contact')
 // ❌ لا نستدعي handleSelectLang هنا - سننتظر حتى يملأ المستخدم النموذج
 }

 const handleContactSubmit = (contact: ContactInfo) => {
 console.log('📝 Customer info submitted:', contact)
 console.log('📤 Will send to backend with lang:', lang, 'and contact:', contact)
 setCurrentStep('chat')
 // ✅ الآن نستدعي handleSelectLang مع بيانات العميل
 if (lang) {
 console.log('✅ Calling handleSelectLang with complete customer info')
 handleSelectLang(lang, contact)
 } else {
 console.error('❌ ERROR: Language not set!')
 }
 }

 const handleSuggestionClick = (btn: { text: string; value: string }) => {
 handleButtonOption(btn)
 }

 const handleEndChat = () => setCurrentStep('ended')
 const handleRestartChat = () => { setCurrentStep('language'); setLang(null) }

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
 <div className="fixed bottom-0 right-0 md:bottom-6 md:right-6 z-50 w-full md:w-auto">
 {!isOpen && <ToggleButton onOpen={() => setIsOpen(true)} />}
 {isOpen && (
 <div className="relative">
 <div className="w-full md:w-[400px] lg:w-[420px] h-screen md:h-[600px] lg:h-[650px] bg-white md:rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col">
 {currentStep === 'language' && (
 <LanguageSelector onSelectLanguage={handleLanguageSelect} />
 )}
 {currentStep === 'contact' && lang && (
 <div className="flex flex-col h-full">
 <ChatHeader onClose={() => setIsOpen(false)} isChatEnded={false} />
 <ContactInfoComponent onContactSubmit={handleContactSubmit} lang={lang} />
 </div>
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
 onButtonClick={handleSuggestionClick}
 />
 )}
 {currentStep === 'ended' && lang && (
 <div className="flex flex-col h-full">
 <ChatHeader onClose={() => setIsOpen(false)} isChatEnded={true} />
 <div className="flex-1 overflow-y-auto">
 <ChatEndedState lang={lang} onRestartChat={handleRestartChat} />
 </div>
 </div>
 )}
 </div>
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
