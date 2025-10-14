import type { Language } from '../types'

interface ChatHeaderProps {
  onClose: () => void
  lang: Language
  isChatEnded?: boolean
}

export const ChatHeader = ({ onClose, isChatEnded = false }: ChatHeaderProps) => {
  return (
    <div className="px-4 py-4 bg-white border-b border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="w-10 h-10 rounded-full overflow-hidden shadow-lg">
            <img 
              src="/logo.jpg" 
              alt="Quick Air" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">Online</span>
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
