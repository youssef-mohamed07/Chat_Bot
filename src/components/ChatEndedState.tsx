import { useState } from 'react'
import type { Language } from '../types'

interface ChatEndedStateProps {
  lang: Language
  onRestartChat: () => void
}

export const ChatEndedState = ({ onRestartChat }: ChatEndedStateProps) => {
  const [selectedRating, setSelectedRating] = useState<number | null>(null)

  const ratings = [
    { emoji: '😄', value: 5, label: 'Very Happy' },
    { emoji: '😊', value: 4, label: 'Happy' },
    { emoji: '😐', value: 3, label: 'Neutral' },
    { emoji: '😔', value: 2, label: 'Sad' },
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
