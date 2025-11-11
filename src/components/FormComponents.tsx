import { useState } from 'react'
import type { Language } from '../types'
import { LABELS, PLACEHOLDERS } from '../utils'

// Contact Info Component
interface ContactInfoProps {
  onContactSubmit: (contact: { phone: string; email: string }) => void
  lang: Language
}

export const ContactInfo = ({ onContactSubmit, lang }: ContactInfoProps) => {
  const [contactData, setContactData] = useState({
    phone: '',
    email: ''
  })
  const [errors, setErrors] = useState({
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

  const updateField = (field: 'phone' | 'email', value: string) => {
    setContactData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSubmit = () => {
    let hasErrors = false
    const newErrors = { phone: '', email: '' }

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

    onContactSubmit(contactData)
  }

  const isFormValid = contactData.phone.trim() && contactData.email.trim() && 
                     validatePhone(contactData.phone) && validateEmail(contactData.email)

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
          <div className="text-2xl font-bold text-gray-800 mb-3" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            {LABELS[lang].contactInfo}
          </div>
          <div className="text-sm text-gray-600" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            {LABELS[lang].contactDescription}
          </div>
        </div>
        
        <div className="space-y-4">
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
                className={`w-full pl-10 pr-4 py-4 border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-800/20 transition-all duration-200 ${
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
                className={`w-full pl-10 pr-4 py-4 border-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-800/20 transition-all duration-200 ${
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

// Date range widget (inline in chat)
// (Moved DateRangeWidget and TravellersWidget to ChatWidgets.tsx)
