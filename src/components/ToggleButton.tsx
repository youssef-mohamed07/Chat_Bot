import { useState, useEffect } from 'react'
import type { Language } from '../types'
import { useSoundEffects } from '../utils'

interface ToggleButtonProps {
  onOpen: () => void
}

export const ToggleButton = ({ onOpen }: ToggleButtonProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isPulsing, setIsPulsing] = useState(false)
  const { playClick, playHover } = useSoundEffects()

  useEffect(() => {
    // Start pulsing animation after 2 seconds
    const timer = setTimeout(() => {
      setIsPulsing(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleClick = () => {
    // Add wiggle animation on click
    setIsPulsing(false)
    setTimeout(() => setIsPulsing(true), 100)
    playClick()
    onOpen()
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
    playHover()
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  return (
    <button
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`
        popup-animate flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl bg-white 
        border border-gray-200 btn-interactive hover-lift
        ${isPulsing ? 'pulse-animation' : ''}
        ${isHovered ? 'hover-scale' : ''}
        transition-all duration-300 ease-out
      `}
      style={{
        background: isHovered 
          ? 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)'
          : 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)'
      }}
    >
      <div className="relative">
        <img 
          src="/logo.jpg" 
          alt="Quick Air" 
          className={`
            w-9 h-9 rounded-xl object-cover shadow-md transition-all duration-300
            ${isHovered ? 'scale-110 rotate-3' : 'scale-100 rotate-0'}
          `} 
        />
        <span className={`
          absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white
          transition-all duration-300
          ${isHovered ? 'scale-125 shadow-lg' : 'scale-100'}
        `} />
        {/* Animated ring around the status dot */}
        <span className={`
          absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white
          animate-ping opacity-75
        `} />
      </div>
      <div className="text-left">
        <div className={`
          text-sm font-semibold transition-all duration-300
          ${isHovered ? 'gradient-text-animated' : 'brand-text-gradient'}
        `}>
          Quick Air Assistant
        </div>
        <div className={`
          text-[11px] transition-all duration-300
          ${isHovered ? 'text-gray-600' : 'text-gray-500'}
        `}>
          Ask flights, deals, visas
        </div>
      </div>
      
      {/* Floating particles effect */}
      {isHovered && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-2 left-2 w-1 h-1 bg-blue-400 rounded-full animate-ping opacity-60"></div>
          <div className="absolute top-4 right-3 w-1 h-1 bg-purple-400 rounded-full animate-ping opacity-60" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-3 left-4 w-1 h-1 bg-pink-400 rounded-full animate-ping opacity-60" style={{ animationDelay: '1s' }}></div>
        </div>
      )}
    </button>
  )
}
