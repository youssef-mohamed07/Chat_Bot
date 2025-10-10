import { useState } from 'react'
import type { Language } from '../types'
import { LABELS, PLACEHOLDERS } from '../constants'

interface SupportModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { name: string; email: string; phone: string; message: string }) => Promise<void>
  isSending: boolean
  lang: Language
}

export const SupportModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isSending, 
  lang 
}: SupportModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
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
      <div className="w-[90%] max-w-md bg-white rounded-2xl shadow-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-semibold" style={{ color: 'var(--chat-bot-bg)' }}>
            {LABELS[lang].customerSupportRequest}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>
        
        <div className="grid grid-cols-1 gap-2">
          <input 
            value={formData.name} 
            onChange={(e) => updateField('name', e.target.value)} 
            className="border rounded-lg px-3 py-2 text-sm" 
            placeholder={PLACEHOLDERS[lang].name} 
            dir={lang === 'ar' ? 'rtl' : 'ltr'} 
          />
          <input 
            value={formData.email} 
            onChange={(e) => updateField('email', e.target.value)} 
            className="border rounded-lg px-3 py-2 text-sm" 
            placeholder={PLACEHOLDERS[lang].email} 
            dir={lang === 'ar' ? 'rtl' : 'ltr'} 
          />
          <input 
            value={formData.phone} 
            onChange={(e) => updateField('phone', e.target.value)} 
            className="border rounded-lg px-3 py-2 text-sm" 
            placeholder={PLACEHOLDERS[lang].phone} 
            dir={lang === 'ar' ? 'rtl' : 'ltr'} 
          />
          <textarea 
            value={formData.message} 
            onChange={(e) => updateField('message', e.target.value)} 
            rows={4} 
            className="border rounded-lg px-3 py-2 text-sm" 
            placeholder={PLACEHOLDERS[lang].issue} 
            dir={lang === 'ar' ? 'rtl' : 'ltr'} 
          />
          <button
            disabled={isSending || !isFormValid}
            onClick={handleSubmit}
            className="mt-1 h-10 rounded-lg text-white text-sm disabled:opacity-50"
            style={{ background: 'var(--chat-bot-bg)' }}
          >
            {isSending ? LABELS[lang].sending : LABELS[lang].send}
          </button>
        </div>
      </div>
    </div>
  )
}
