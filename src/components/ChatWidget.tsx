import { useState } from 'react'
import type { Language, ContactInfo } from '../types'
import { useChatWidget, useSupportModal } from '../hooks/useChatWidget'
import { LanguageSelector, ContactInfo as ContactInfoComponent, ToggleButton, ChatWindow, ChatEndedState, ChatHeader } from './index'

export interface ChatWidgetProps {
 initialOpen?: boolean
 className?: string
}

export const ChatWidget = ({ initialOpen = false, className }: ChatWidgetProps) => {
 const [isOpen, setIsOpen] = useState(initialOpen)
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
 setLang(selected)
 setCurrentStep('chat')
 handleSelectLang(selected)
 }

 const handleSuggestionClick = (btn: { text: string; value: string }) => {
 handleButtonOption(btn)
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

 const handleSupportSubmit = async (data: { name: string; email: string; phone: string; message: string }) => {
 setIsSupportSending(true)
 try {
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
 <div className={"fixed bottom-0 right-0 md:bottom-6 md:right-6 z-50 w-full md:w-auto " + (className || '')}>
 {!isOpen && <ToggleButton onOpen={() => setIsOpen(true)} />}
 {isOpen && (
 <div className="relative">
 <div className="w-full md:w-[400px] lg:w-[420px] h-screen md:h-[600px] lg:h-[650px] bg-white md:rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col">
 {currentStep === 'contact' && (
 <ContactInfoComponent onContactSubmit={handleContactSubmit} lang={lang || 'en'} />
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
 contactInfo={contactInfo || undefined}
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
 className="hidden md:flex absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-red-800 rounded-full shadow-xl hover:bg-red-900 transition-all duration-200 items-center justify-center hover:scale-110"
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

// Lightweight container for embedding already-started chat (skip contact/language steps)
export const ChatUIContainer = ({
 lang = 'en',
 className
}: { lang?: Language; className?: string }) => {
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
 const { isOpen: isSupportOpen, setIsOpen: setIsSupportOpen, isSending: isSupportSending, resetForm } = useSupportModal()

 // Initialize language once
 if (messages.length === 0) {
 handleSelectLang(lang)
 }

 return (
 <div className={className || ''}>
 <ChatWindow
 lang={lang}
 messages={messages}
 messagesEndRef={messagesEndRef}
 input={input}
 setInput={setInput}
 onSend={handleSend}
 onKeyPress={handleKeyPress}
 isLoading={isLoading}
 onClose={() => { /* no-op for embedded */ }}
 onOpenSupport={() => setIsSupportOpen(true)}
 onCloseSupport={() => setIsSupportOpen(false)}
 onSendSupport={async (d) => { await sendSupportRequest(d); resetForm(); }}
 isSupportOpen={isSupportOpen}
 isSupportSending={isSupportSending}
 contactInfo={undefined}
 onButtonClick={handleButtonOption}
 />
 </div>
 )
}
