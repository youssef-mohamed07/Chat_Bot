import type { Language } from '../types'

interface ToggleButtonProps {
  onOpen: () => void
}

export const ToggleButton = ({ onOpen }: ToggleButtonProps) => {
  return (
    <button
      onClick={onOpen}
      className="popup-animate flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl bg-white hover:shadow-2xl transition-all border border-gray-200 hover:-translate-y-0.5"
    >
      <div className="relative">
        <img src="/logo.jpg" alt="Quick Air" className="w-9 h-9 rounded-xl object-cover shadow-md" />
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
      </div>
      <div className="text-left">
        <div className="text-sm font-semibold brand-text-gradient">Quick Air Assistant</div>
        <div className="text-[11px] text-gray-500">Ask flights, deals, visas</div>
      </div>
    </button>
  )
}
