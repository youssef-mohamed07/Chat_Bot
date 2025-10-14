import { useState, useEffect } from 'react'
import type { Language } from '../types'
import { useSoundEffects } from '../utils'

interface ToggleButtonProps {
  onOpen: () => void
}

export const ToggleButton = ({ onOpen }: ToggleButtonProps) => {
  const { playClick } = useSoundEffects()

  const handleClick = () => {
    playClick()
    onOpen()
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-3 px-5 py-4 rounded-xl shadow-lg bg-white border border-gray-200 transition-all duration-200 hover:bg-gray-50 hover:shadow-xl hover:-translate-y-1"
    >
      <div className="relative">
        <img 
          src="/logo.jpg" 
          alt="Quick Air" 
          className="w-10 h-10 rounded-xl object-cover shadow-sm" 
        />
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
      </div>
      <div className="text-left">
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
