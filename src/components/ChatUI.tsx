// ===================================
// CONSOLIDATED CHAT UI COMPONENTS
// Merges: ChatComponents + FormComponents + LanguageSelector + ToggleButton + TripCard + UIComponents
// ===================================

import { useState, useRef, useEffect } from 'react'
import type { Language } from '@/types/index'
import { PLACEHOLDERS, LABELS } from '@/config/index'

// ============ CHAT COMPONENTS (from ChatComponents.tsx) ============

// Chat Header Component
interface ChatHeaderProps {
  onClose: () => void
  isChatEnded?: boolean
}

export const ChatHeader = ({ onClose, isChatEnded = false }: ChatHeaderProps) => {
  return (
    <div className="px-3 md:px-4 py-3 md:py-4 bg-white border-b border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3">
          {/* Logo */}
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden shadow-lg">
            <img 
              src="/logo.jpg" 
              alt="Quick Air" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="flex items-center gap-1.5 md:gap-2">
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs md:text-sm font-medium text-gray-700">Quick Air - Online</span>
          </div>
        </div>
        
        {isChatEnded ? (
          <button 
            onClick={onClose} 
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            aria-label="Minimize chat"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
        ) : (
          <button 
            onClick={onClose} 
            className="px-3 py-1 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors duration-200"
            aria-label="End chat"
          >
            End chat
          </button>
        )}
      </div>
    </div>
  )
}

// Chat Input Component
interface ChatInputProps {
  input: string
  setInput: (value: string) => void
  onSend: () => void
  onKeyPress: (e: React.KeyboardEvent) => void
  isLoading: boolean
  lang: Language
}

export const ChatInput = ({ 
  input, 
  setInput, 
  onSend, 
  onKeyPress, 
  isLoading, 
  lang 
}: ChatInputProps) => {
  const [isFocused, setIsFocused] = useState(false)
  const [showEmojis, setShowEmojis] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const emojis = ['✈️', '🏖️', '🏝️', '🌴', '🌊', '🗺️', '🧳', '📸', '☀️', '🌅', '🏔️', '🏛️', '🕌', '🏰', '🎒', '🛫', '🛬', '🌍', '🌎', '🌏', '🎉', '😊']

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  const handleInputResize = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement
    target.style.height = 'auto'
    target.style.height = Math.min(target.scrollHeight, 120) + 'px'
  }

  const handleEmojiClick = (emoji: string) => {
    const textarea = textareaRef.current
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newText = input.substring(0, start) + emoji + input.substring(end)
      setInput(newText)
      
      // Focus back to textarea and set cursor position
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + emoji.length, start + emoji.length)
      }, 0)
    }
    setShowEmojis(false)
  }

  return (
    <div className="border-t border-gray-200 bg-white p-3 md:p-4">
      <div className="flex items-end gap-2 md:gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyPress={onKeyPress}
            onInput={handleInputResize}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            rows={1}
            placeholder={lang === 'ar' ? 'اكتب رسالتك أو اختر وجهة مثل "دهب"...' : 'Type your message or destination like "Bali"...'}
            className={`
              w-full resize-none rounded-lg border-2 px-3 md:px-4 py-2 md:py-3 text-sm transition-colors duration-200
              ${isFocused 
                ? 'border-blue-500' 
                : 'border-gray-200'
              }
              focus:outline-none focus:ring-2 focus:ring-blue-500/20
            `}
            style={{ maxHeight: '120px' }}
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
            disabled={isLoading}
          />
          
          {/* Character count */}
          {isFocused && (
            <div className="absolute -top-6 right-0 text-xs text-gray-400">
              {input.length}/500
            </div>
          )}
        </div>

        {/* Emoji button */}
        <button
          onClick={() => setShowEmojis(!showEmojis)}
          className={`
            h-11 w-11 rounded-lg flex items-center justify-center transition-colors duration-200
            ${showEmojis 
              ? 'bg-yellow-100 text-yellow-600' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }
          `}
          aria-label="Add emoji"
          title={lang === 'ar' ? 'إضافة إيموجي' : 'Add emoji'}
        >
          <span className="text-xl">😊</span>
        </button>

        {/* Send button */}
        <button
          onClick={onSend}
          disabled={isLoading || !input.trim()}
          className={`
            h-11 w-11 rounded-lg text-white flex items-center justify-center transition-colors duration-200
            ${isLoading || !input.trim() 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:opacity-90'
            }
          `}
          style={{ background: 'var(--chat-bot-bg)' }}
          aria-label="Send"
        >
          {isLoading ? (
            <div className="relative">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : (
            <svg className="w-5 h-5 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          )}
        </button>
      </div>

      {/* Emoji picker */}
      {showEmojis && (
        <div className="mt-3 p-4 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 rounded-2xl border-2 border-yellow-300 shadow-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">🎉 {lang === 'ar' ? 'اختر إيموجي المفضل' : 'Choose Your Emoji'}</span>
            <button
              onClick={() => setShowEmojis(false)}
              className="w-6 h-6 rounded-full bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center font-bold text-sm"
            >✕</button>
          </div>
          <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto">
            {emojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleEmojiClick(emoji)}
                className="text-3xl p-3 bg-white rounded-xl hover:bg-gradient-to-br hover:from-yellow-100 hover:to-orange-100 hover:scale-125 transition-all duration-300 shadow-md hover:shadow-xl border border-transparent hover:border-yellow-400"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Chat Footer Component (Simple version)
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
  const [showEmojis, setShowEmojis] = useState(false)
  const [isListening, setIsListening] = useState(false)

  const emojis = ['😊','😂','❤️','👍','🎉','🔥','✨','🌟','💯','🙏','👏','🎊','😍','🥰','😎','🤩','🏖️','✈️','🏨','🌴','🌊','⭐']

  // Voice input (Web Speech API)
  const recognitionRef = useRef<any>(null)
  useEffect(() => {
    const w = window as any
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition
    if (SR) {
      const rec = new SR()
      rec.lang = lang === 'ar' ? 'ar-EG' : 'en-US'
      rec.continuous = false
      rec.interimResults = true
      rec.maxAlternatives = 1
      rec.onresult = (e: any) => {
        const transcript = Array.from(e.results).map((r: any) => r[0]?.transcript || '').join(' ')
        setInput(transcript)
      }
      rec.onend = () => setIsListening(false)
      rec.onerror = (e: any) => {
        console.error('Speech recognition error:', e)
        setIsListening(false)
      }
      recognitionRef.current = rec
    }
  }, [lang, setInput])

  const toggleMic = () => {
    const rec = recognitionRef.current
    if (!rec) {
      alert(lang === 'ar' ? 'الميكروفون غير مدعوم في هذا المتصفح' : 'Microphone not supported in this browser')
      return
    }
    if (isListening) {
      try { rec.stop() } catch (err) { console.error(err) }
      setIsListening(false)
    } else {
      try { 
        rec.lang = lang === 'ar' ? 'ar-EG' : 'en-US'
        rec.start()
        setIsListening(true)
      } catch (err) { 
        console.error(err)
        alert(lang === 'ar' ? 'خطأ في تشغيل الميكروفون' : 'Error starting microphone')
      }
    }
  }

  const onEmojiClick = (emoji: string) => {
    const cursorEnd = input.length
    setInput(input.slice(0, cursorEnd) + emoji + input.slice(cursorEnd))
    setShowEmojis(false)
  }

  return (
    <div className="border-t border-gray-100 bg-white p-4">
      <div className="flex items-center gap-2">
        {/* Emoji button */}
        <button
          onClick={() => setShowEmojis(v => !v)}
          className={`h-10 w-10 rounded-lg flex items-center justify-center ${showEmojis? 'bg-yellow-100 text-yellow-600':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          aria-label="Add emoji"
          title={lang === 'ar' ? 'إضافة إيموجي' : 'Add emoji'}
        >
          <span className="text-xl">😊</span>
        </button>

        {/* Voice button */}
        <button
          onClick={toggleMic}
          className={`h-10 w-10 rounded-lg flex items-center justify-center ${
            isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          aria-label="Voice input"
          title={isListening ? 'جاري الاستماع...' : 'تسجيل صوتي'}
        >
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a3 3 0 00-3 3v5a3 3 0 106 0V5a3 3 0 00-3-3z"/>
            <path d="M4 9a1 1 0 112 0 4 4 0 008 0 1 1 0 112 0 6 6 0 11-12 0z"/>
          </svg>
        </button>

        {/* Text input */}
        <div className="flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder={PLACEHOLDERS[lang].message}
            disabled={isLoading}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-800/20 focus:border-red-600 text-sm"
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
          />
        </div>

        {/* Send button */}
        <button
          onClick={() => onSend()}
          disabled={isLoading || !input.trim()}
          className="w-10 h-10 bg-red-800 rounded-full flex items-center justify-center hover:bg-red-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>

      {/* Emoji picker */}
      {showEmojis && (
        <div className="mt-3 p-4 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 rounded-2xl border-2 border-yellow-300 shadow-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">🎉 {lang === 'ar' ? 'اختر إيموجي المفضل' : 'Choose Your Emoji'}</span>
            <button
              onClick={() => setShowEmojis(false)}
              className="w-6 h-6 rounded-full bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center font-bold text-sm"
            >✕</button>
          </div>
          <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto">
            {emojis.map((emoji, idx) => (
              <button
                key={idx}
                onClick={() => onEmojiClick(emoji)}
                className="text-3xl p-3 bg-white rounded-xl hover:bg-gradient-to-br hover:from-yellow-100 hover:to-orange-100 hover:scale-125 transition-all duration-300 shadow-md hover:shadow-xl border border-transparent hover:border-yellow-400"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Support CTA */}
      <div className="mt-3 text-center">
        <SupportCTA onOpenSupport={onOpenSupport} lang={lang} />
      </div>
      
      {/* Footer Branding */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-400">Powered by Quick Air</p>
      </div>
    </div>
  )
}

// Chat Ended State Component
interface ChatEndedStateProps {
  lang: Language
  onRestartChat: () => void
}

export const ChatEndedState = ({ onRestartChat }: ChatEndedStateProps) => {
  const [selectedRating, setSelectedRating] = useState<number | null>(null)

  const ratings = [
    { emoji: '😍', value: 5, label: 'Very Happy' },
    { emoji: '😊', value: 4, label: 'Happy' },
    { emoji: '😐', value: 3, label: 'Neutral' },
    { emoji: '😞', value: 2, label: 'Sad' },
    { emoji: '😢', value: 1, label: 'Very Sad' }
  ]

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Chat Ended Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-sm text-gray-500">Chat has ended</span>
        </div>
      </div>

      {/* Feedback Section */}
      <div className="text-center space-y-4">
        <h3 className="text-sm font-medium text-gray-700">
          How was your experience with us?
        </h3>
        
        {/* Rating Emojis */}
        <div className="flex justify-center gap-2">
          {ratings.map((rating) => (
            <button
              key={rating.value}
              onClick={() => setSelectedRating(rating.value)}
              className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                selectedRating === rating.value
                  ? 'border-red-800 bg-red-50 scale-110'
                  : 'border-gray-300 hover:border-red-600'
              }`}
              title={rating.label}
            >
              <span className="text-lg">{rating.emoji}</span>
            </button>
          ))}
        </div>

        {/* Restart Chat Button */}
        <button
          onClick={onRestartChat}
          className="w-full bg-red-800 text-white py-3 px-4 rounded-xl font-medium hover:bg-red-900 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          Restart Chat
        </button>
      </div>
    </div>
  )
}

// ============ FORM COMPONENTS (from FormComponents.tsx) ============

// Contact Info Component
interface ContactInfoProps {
  onContactSubmit: (contact: { name: string; phone: string; email: string }) => void
  lang: Language
}

export const ContactInfo = ({ onContactSubmit, lang }: ContactInfoProps) => {
  const [contactData, setContactData] = useState({
    name: '',
    phone: '',
    email: ''
  })
  const [errors, setErrors] = useState({
    name: '',
    phone: '',
    email: ''
  })

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string) => {
    // Remove all non-digit characters for validation
    const cleanPhone = phone.replace(/\D/g, '')
    return cleanPhone.length >= 10
  }

  const validateName = (name: string) => {
    return name.trim().length >= 2
  }

  const updateField = (field: 'name' | 'phone' | 'email', value: string) => {
    setContactData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSubmit = () => {
    let hasErrors = false
    const newErrors = { name: '', phone: '', email: '' }

    // Validate name
    if (!contactData.name.trim()) {
      newErrors.name = lang === 'ar' ? 'الاسم مطلوب' : 'Name is required'
      hasErrors = true
    } else if (!validateName(contactData.name)) {
      newErrors.name = lang === 'ar' ? 'الاسم يجب أن يكون حرفين على الأقل' : 'Name must be at least 2 characters'
      hasErrors = true
    }

    // Validate phone
    if (!contactData.phone.trim()) {
      newErrors.phone = LABELS[lang].phoneRequired
      hasErrors = true
    } else if (!validatePhone(contactData.phone)) {
      newErrors.phone = LABELS[lang].invalidPhone
      hasErrors = true
    }

    // Validate email
    if (!contactData.email.trim()) {
      newErrors.email = LABELS[lang].emailRequired
      hasErrors = true
    } else if (!validateEmail(contactData.email)) {
      newErrors.email = LABELS[lang].invalidEmail
      hasErrors = true
    }

    if (hasErrors) {
      setErrors(newErrors)
      return
    }

    console.log('✅ Form validated successfully! Submitting:', contactData)
    onContactSubmit(contactData)
  }

  const isFormValid = contactData.name.trim() && contactData.phone.trim() && contactData.email.trim() && 
    validateName(contactData.name) && validatePhone(contactData.phone) && validateEmail(contactData.email)

  return (
    <div className="flex-1 p-4 md:p-6 bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center overflow-y-auto">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6 md:mb-8">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden mx-auto mb-3 md:mb-4 shadow-lg">
            <img 
              src="/logo.jpg" 
              alt="Quick Air" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="text-xl md:text-2xl font-bold text-gray-800 mb-2 md:mb-3" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            {LABELS[lang].contactInfo}
          </div>
          <div className="text-xs md:text-sm text-gray-600 px-4" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            {LABELS[lang].contactDescription}
          </div>
        </div>
        
        <div className="space-y-4">
          {/* Name Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              {lang === 'ar' ? 'الاسم الكامل' : 'Full Name'}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                type="text"
                value={contactData.name}
                onChange={(e) => updateField('name', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 md:py-4 border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-800/20 transition-all duration-200 ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-red-600 bg-white shadow-sm'
                }`}
                placeholder={PLACEHOLDERS[lang].name}
                dir={lang === 'ar' ? 'rtl' : 'ltr'}
              />
            </div>
            {errors.name && (
              <p className="text-red-500 text-xs mt-1" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                {errors.name}
              </p>
            )}
          </div>

          {/* Phone Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              {LABELS[lang].phoneNumber}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <input
                type="tel"
                value={contactData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 md:py-4 border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-800/20 transition-all duration-200 ${
                  errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-red-600 bg-white shadow-sm'
                }`}
                placeholder={PLACEHOLDERS[lang].phone}
                dir={lang === 'ar' ? 'rtl' : 'ltr'}
              />
            </div>
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                {errors.phone}
              </p>
            )}
          </div>

          {/* Email Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              {LABELS[lang].emailAddress}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input
                type="email"
                value={contactData.email}
                onChange={(e) => updateField('email', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 md:py-4 border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-800/20 transition-all duration-200 ${
                  errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-red-600 bg-white shadow-sm'
                }`}
                placeholder={PLACEHOLDERS[lang].email}
                dir={lang === 'ar' ? 'rtl' : 'ltr'}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                {errors.email}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className={`w-full py-4 px-4 rounded-xl font-medium text-sm transition-all duration-200 ${
              isFormValid
                ? 'bg-red-800 text-white hover:bg-red-900 hover:shadow-lg transform hover:-translate-y-0.5'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
          >
            {LABELS[lang].continue}
          </button>
        </div>
        
        <div className="text-center mt-6">
          <div className="text-xs text-gray-500" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            {LABELS[lang].secureInfo}
          </div>
        </div>
      </div>
    </div>
  )
}

// Support Modal Component
interface SupportModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { name: string; email: string; phone: string; message: string }) => Promise<void>
  isSending: boolean
  lang: Language
  contactInfo?: { phone: string; email: string }
}

export const SupportModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isSending, 
  lang,
  contactInfo
}: SupportModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: contactInfo?.email || '',
    phone: contactInfo?.phone || '',
    message: ''
  })

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    await onSubmit(formData)
    setFormData({ name: '', email: '', phone: '', message: '' })
  }

  const isFormValid = (formData.email || formData.phone) && formData.message.trim()

  if (!isOpen) return null

  return (
    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="w-[90%] max-w-md bg-white rounded-xl shadow-lg p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-semibold" style={{ color: 'var(--chat-bot-bg)' }}>
            {LABELS[lang].customerSupportRequest}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-1 gap-2">
          <input 
            value={formData.name} 
            onChange={(e) => updateField('name', e.target.value)} 
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
            placeholder={PLACEHOLDERS[lang].name} 
            dir={lang === 'ar' ? 'rtl' : 'ltr'} 
          />
          <input 
            value={formData.email} 
            onChange={(e) => updateField('email', e.target.value)} 
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
            placeholder={PLACEHOLDERS[lang].email} 
            dir={lang === 'ar' ? 'rtl' : 'ltr'} 
          />
          <input 
            value={formData.phone} 
            onChange={(e) => updateField('phone', e.target.value)} 
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
            placeholder={PLACEHOLDERS[lang].phone} 
            dir={lang === 'ar' ? 'rtl' : 'ltr'} 
          />
          <textarea 
            value={formData.message} 
            onChange={(e) => updateField('message', e.target.value)} 
            rows={4} 
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
            placeholder={PLACEHOLDERS[lang].issue} 
            dir={lang === 'ar' ? 'rtl' : 'ltr'} 
          />
          <button
            disabled={isSending || !isFormValid}
            onClick={handleSubmit}
            className="mt-2 h-11 rounded-lg text-white text-sm disabled:opacity-50 transition-colors duration-200 hover:opacity-90"
            style={{ background: 'var(--chat-bot-bg)' }}
          >
            {isSending ? LABELS[lang].sending : LABELS[lang].send}
          </button>
        </div>
      </div>
    </div>
  )
}

// ============ LANGUAGE SELECTOR (from LanguageSelector.tsx) ============

interface LanguageSelectorProps {
  onSelectLanguage: (lang: Language) => void
}

export const LanguageSelector = ({ onSelectLanguage }: LanguageSelectorProps) => {
  const languages = [
    { 
      code: 'en' as Language, 
      name: 'English', 
      flag: '🇬🇧', 
      description: 'English language',
      dir: 'ltr'
    },
    { 
      code: 'ar' as Language, 
      name: 'العربية', 
      flag: '🇪🇬', 
      description: 'اللغة العربية',
      dir: 'rtl'
    }
  ]

  return (
    <div className="flex-1 p-6 bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-4 shadow-lg">
            <img 
              src="/logo.jpg" 
              alt="Quick Air" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="text-2xl font-bold text-gray-800 mb-3">
            Choose your language
          </div>
          <div className="text-sm text-gray-600">
            {LABELS.en.youCanChangeLater}
          </div>
        </div>
        
        <div className="space-y-4">
          {languages.map((lang) => (
            <button 
              key={lang.code}
              onClick={() => onSelectLanguage(lang.code)}
              className="w-full border-2 rounded-xl py-5 px-5 font-medium transition-all duration-200 hover:border-red-600 hover:bg-red-50 hover:shadow-lg border-gray-200 group bg-white"
              dir={lang.dir}
            >
              <div className="flex items-center justify-center gap-4">
                <span className="text-2xl">{lang.flag}</span>
                <div className="text-center">
                  <div className="font-semibold text-gray-800 text-lg">
                    {lang.name}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {lang.description}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <div className="text-sm text-gray-500">
            Required to continue
          </div>
        </div>
      </div>
    </div>
  )
}

// ============ TOGGLE BUTTON (from ToggleButton.tsx) ============

interface ToggleButtonProps {
  onOpen: () => void
}

export const ToggleButton = ({ onOpen }: ToggleButtonProps) => {
  return (
    <button
      onClick={onOpen}
      className="flex items-center gap-2 md:gap-3 px-3 py-3 md:px-5 md:py-4 rounded-2xl shadow-lg bg-white border border-gray-100 transition-all duration-200 hover:bg-gray-50 hover:shadow-xl hover:-translate-y-1"
    >
      <div className="relative">
        {/* Logo */}
        <div className="w-10 h-10 md:w-10 md:h-10 rounded-full overflow-hidden shadow-lg">
          <img 
            src="/logo.jpg" 
            alt="Quick Air" 
            className="w-full h-full object-cover" 
          />
        </div>
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
      </div>
      <div className="text-left hidden md:block">
        <div className="text-base font-semibold text-gray-800">
          Quick Air Assistant
        </div>
        <div className="text-sm text-gray-600">
          Ask about flights, deals, visas
        </div>
      </div>
    </button>
  )
}

// ============ TRIP CARD (from TripCard.tsx) ============

interface TripCardProps {
  lang: Language
  data: {
    dest: string
    offer: any
  }
  onMore?: () => void
  onSelectHotel?: (hotelName: string) => void
}

export const TripCard = ({ lang, data, onMore, onSelectHotel }: TripCardProps) => {
  const { offer, dest } = data
  const hotels = Array.isArray(offer.hotels) ? offer.hotels.slice(0, 3) : []
  const tours = Array.isArray(offer.optional_tours) ? offer.optional_tours.slice(0, 2) : []

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
          <img
            src={dest === 'bali' ? '/bali.jpg' : '/istanbul.jpg'}
            alt={dest}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{offer.title || dest}</h3>
          {offer.validity_text && (
            <p className="text-xs text-gray-500">{offer.validity_text}</p>
          )}
        </div>
      </div>

      {hotels.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-gray-700 mb-1">{lang === 'ar' ? 'أفضل الفنادق' : 'Top Hotels'}</h4>
          <ul className="space-y-1">
            {hotels.map((h: any) => (
              <li key={h.hotel_name} className="text-xs flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectHotel && onSelectHotel(h.hotel_name)}
                  className="text-left flex-1 hover:underline"
                >
                  {h.hotel_name} {h.rating ? `(${h.rating})` : ''}
                </button>
                {h.price_usd && (
                  <span className="text-[11px] text-gray-600">${h.price_usd}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {tours.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-gray-700 mb-1">{lang === 'ar' ? 'رحلات اختيارية' : 'Optional Tours'}</h4>
          <ul className="space-y-1">
            {tours.map((t: any) => (
              <li key={t.name_en} className="text-xs">
                {lang === 'ar' ? t.name_ar : t.name_en} {t.price_usd ? `($${t.price_usd})` : ''}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap gap-2 pt-1">
        {onMore && (
          <button
            onClick={onMore}
            className="px-3 py-1.5 text-xs rounded-lg bg-gray-900 text-white hover:bg-black transition"
          >
            {lang === 'ar' ? 'تفاصيل أكثر' : 'More details'}
          </button>
        )}
      </div>
    </div>
  )
}

// ============ UI COMPONENTS (from UIComponents.tsx) ============

// Support CTA Component
interface SupportCTAProps {
  onOpenSupport: () => void
  lang: Language
}

export const SupportCTA = ({ onOpenSupport, lang }: SupportCTAProps) => {
  return (
    <div className="mt-3 text-[12px] text-gray-500">
      <button 
        onClick={onOpenSupport} 
        className="underline hover:text-gray-700"
      >
        {LABELS[lang].needSupport}
      </button>
    </div>
  )
}

// Typing Indicator Component
interface TypingIndicatorProps {
  isVisible: boolean
  lang: 'en' | 'ar'
}

export const TypingIndicator = ({ isVisible, lang }: TypingIndicatorProps) => {
  if (!isVisible) return null

  return (
    <div className="flex items-end gap-3">
      <div className="w-8 h-8 rounded-full overflow-hidden shadow-sm">
        <img src="/logo.jpg" alt="AI" className="w-full h-full object-cover" />
      </div>
      
      <div className="max-w-[72%] flex flex-col items-start">
        <div className="relative px-4 py-3 rounded-xl rounded-bl-md shadow-sm bg-gray-100">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <span className="text-xs text-gray-500">
              {lang === 'ar' ? 'يكتب...' : 'typing...'}
            </span>
          </div>
          <span className="absolute left-1 -bottom-1 -rotate-45 w-2 h-2 bg-gray-100" />
        </div>
      </div>
    </div>
  )
}

 // Skeleton bubble to show loading placeholder
export const SkeletonBubble = () => {
  return (
    <div className="flex items-start gap-3 px-4">
      <div className="w-8 h-8 bg-gray-200 rounded-full" />
      <div className="bg-white border border-gray-200 rounded-2xl p-3 shadow-sm w-64">
        <div className="h-3 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
        <div className="h-3 bg-gray-200 rounded w-full mb-2 animate-pulse" />
        <div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse" />
      </div>
    </div>
  )
}

// Skeleton Components
interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
  rounded?: boolean
}

export const Skeleton = ({ 
  className = '', 
  width = '100%', 
  height = '1rem', 
  rounded = true 
}: SkeletonProps) => {
  return (
    <div
      className={`
        bg-gray-200 animate-pulse
        ${rounded ? 'rounded' : ''}
        ${className}
      `}
      style={{ width, height }}
    />
  )
}

interface MessageSkeletonProps {
  isUser?: boolean
}

export const MessageSkeleton = ({ isUser = false }: MessageSkeletonProps) => {
  return (
    <div className={`flex items-end gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
      
      <div className={`max-w-[72%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className={`
          px-4 py-3 rounded-xl shadow-sm bg-gray-200 animate-pulse
          ${isUser ? 'rounded-br-md' : 'rounded-bl-md'}
        `}>
          <div className="space-y-2">
            <Skeleton width="80%" height="0.875rem" />
            <Skeleton width="60%" height="0.875rem" />
            {Math.random() > 0.5 && (
              <Skeleton width="40%" height="0.875rem" />
            )}
          </div>
        </div>
        <Skeleton width="3rem" height="0.75rem" className="mt-2" />
      </div>
    </div>
  )
}

interface ChatSkeletonProps {
  messageCount?: number
}

export const ChatSkeleton = ({ messageCount = 3 }: ChatSkeletonProps) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: messageCount }).map((_, index) => (
        <MessageSkeleton key={index} isUser={index % 2 === 0} />
      ))}
    </div>
  )
}
