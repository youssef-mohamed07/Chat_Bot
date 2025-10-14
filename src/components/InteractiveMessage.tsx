import type { ChatMessage, ButtonOption, CardData } from '../types'

interface InteractiveMessageProps {
  message: ChatMessage
  onButtonClick: (button: ButtonOption) => void
}

export const InteractiveMessage = ({ message, onButtonClick }: InteractiveMessageProps) => {
  const handleButtonClick = (button: ButtonOption) => {
    // Immediate response
    onButtonClick(button)
  }

  if (message.type === 'buttons' && message.buttons) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-gray-700">{message.text}</p>
        <div className="flex flex-wrap gap-2">
          {message.buttons.map((button) => (
            <button
              key={button.id}
              onClick={() => handleButtonClick(button)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150
                ${getButtonStyle(button.style)}
                hover:scale-105 active:scale-95
              `}
            >
              {button.text}
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (message.type === 'card' && message.card) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        {message.card.image && (
          <img 
            src={message.card.image} 
            alt={message.card.title}
            className="w-full h-32 object-cover rounded-lg mb-3"
          />
        )}
        <h3 className="font-semibold text-gray-900 mb-1">{message.card.title}</h3>
        {message.card.subtitle && (
          <p className="text-sm text-gray-600 mb-2">{message.card.subtitle}</p>
        )}
        {message.card.description && (
          <p className="text-sm text-gray-700 mb-3">{message.card.description}</p>
        )}
        {message.card.buttons && (
          <div className="flex flex-wrap gap-2">
            {message.card.buttons.map((button) => (
              <button
                key={button.id}
                onClick={() => handleButtonClick(button)}
                className={`
                  px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150
                  ${getButtonStyle(button.style)}
                  hover:scale-105 active:scale-95
                `}
              >
                {button.text}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (message.type === 'quick_replies' && message.quickReplies) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-gray-700">{message.text}</p>
        <div className="flex flex-wrap gap-2">
          {message.quickReplies.map((reply, index) => (
            <button
              key={index}
              onClick={() => handleButtonClick({
                id: `quick_${index}`,
                text: reply,
                action: 'postback',
                value: reply
              })}
              className="px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-sm hover:bg-blue-100 transition-all duration-150 hover:scale-105 active:scale-95"
            >
              {reply}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Default text message
  return <p className="text-sm text-gray-700">{message.text}</p>
}

function getButtonStyle(style?: string) {
  switch (style) {
    case 'primary':
      return 'bg-blue-600 text-white hover:bg-blue-700'
    case 'secondary':
      return 'bg-gray-200 text-gray-800 hover:bg-gray-300'
    case 'success':
      return 'bg-green-600 text-white hover:bg-green-700'
    case 'danger':
      return 'bg-red-600 text-white hover:bg-red-700'
    default:
      return 'bg-blue-600 text-white hover:bg-blue-700'
  }
}
