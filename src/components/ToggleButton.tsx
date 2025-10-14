interface ToggleButtonProps {
  onOpen: () => void
}

export const ToggleButton = ({ onOpen }: ToggleButtonProps) => {
  return (
    <button
      onClick={onOpen}
      className="flex items-center gap-3 px-5 py-4 rounded-2xl shadow-lg bg-white border border-gray-100 transition-all duration-200 hover:bg-gray-50 hover:shadow-xl hover:-translate-y-1"
    >
      <div className="relative">
        {/* Logo */}
        <div className="w-10 h-10 rounded-full overflow-hidden shadow-lg">
          <img 
            src="/logo.jpg" 
            alt="Quick Air" 
            className="w-full h-full object-cover" 
          />
        </div>
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
