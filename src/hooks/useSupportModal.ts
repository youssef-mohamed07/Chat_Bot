import { useState } from 'react'
import type { Language } from '../types'

export const useSupportModal = (lang: Language | null) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })

  const updateFormData = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      message: ''
    })
  }

  const isFormValid = () => {
    return (formData.email || formData.phone) && formData.message.trim()
  }

  return {
    isOpen,
    setIsOpen,
    isSending,
    setIsSending,
    formData,
    updateFormData,
    resetForm,
    isFormValid
  }
}
