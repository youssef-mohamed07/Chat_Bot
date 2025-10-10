# Chatbot Application - Clean Architecture

This React chatbot application has been refactored into a clean, modular architecture with proper separation of concerns for both frontend and backend.

## Project Structure

```
├── src/                          # Frontend React application
│   ├── types/
│   │   └── index.ts              # TypeScript type definitions
│   ├── constants/
│   │   └── index.ts              # Static data and configuration
│   ├── utils/
│   │   └── index.ts              # Utility functions
│   ├── hooks/
│   │   ├── useChatWidget.ts      # Main chat widget logic
│   │   └── useSupportModal.ts    # Support modal state management
│   ├── components/
│   │   ├── index.ts              # Component exports
│   │   ├── LanguageSelector.tsx  # Language selection component
│   │   ├── MessageBubble.tsx    # Individual message display
│   │   ├── MessagesList.tsx     # Messages container
│   │   ├── ChatInput.tsx        # Input field with suggestions
│   │   ├── ChatHeader.tsx       # Chat window header
│   │   ├── ChatFooter.tsx       # Input and support CTA
│   │   ├── ChatWindow.tsx       # Main chat interface
│   │   ├── SupportModal.tsx     # Support request modal
│   │   ├── SupportCTA.tsx       # Support call-to-action
│   │   └── ToggleButton.tsx     # Chat widget toggle button
│   └── App.tsx                   # Main application component
├── server/                        # Backend Express server
│   ├── types/
│   │   └── index.ts              # Server-side type definitions
│   ├── config/
│   │   └── index.ts              # Configuration and environment setup
│   ├── constants/
│   │   └── index.ts              # Server constants and templates
│   ├── services/
│   │   ├── index.ts              # Service exports
│   │   ├── OpenRouterService.ts  # AI API integration
│   │   ├── EmailService.ts       # Email functionality
│   │   └── SessionManager.ts    # User session management
│   ├── controllers/
│   │   ├── index.ts              # Controller exports
│   │   ├── ChatController.ts     # Chat endpoint handlers
│   │   └── SupportController.ts  # Support request handlers
│   ├── middleware/
│   │   └── index.ts              # Express middleware
│   ├── routes/
│   │   └── index.ts              # Route definitions
│   └── utils/
│       └── index.ts              # Server utility functions
├── server.js                     # Main server entry point
└── package.json                  # Dependencies and scripts
```

## Key Features

### 🏗️ **Clean Architecture**
- **Separation of Concerns**: Logic, UI, and data are properly separated
- **Single Responsibility**: Each component has a single, well-defined purpose
- **Reusability**: Components are modular and reusable
- **Full-Stack Modularity**: Both frontend and backend follow clean architecture principles

### 📁 **Frontend Organization** (`src/`)

#### **Types** (`src/types/`)
- `ChatMessage`: Message structure with text, user flag, and timestamp
- `Language`: Supported languages ('ar' | 'en')
- `SupportRequest`: Support form data structure
- `ChatStreamResponse`: API response type for streaming

#### **Constants** (`src/constants/`)
- `WELCOME_MESSAGES`: Language-specific welcome messages
- `SUGGESTION_CHIPS`: Smart suggestion buttons
- `PLACEHOLDERS`: Form field placeholders
- `LABELS`: UI text labels
- `API_ENDPOINTS`: Backend API endpoints

#### **Utils** (`src/utils/`)
- `formatTime`: Time formatting with locale support
- `generateUserId`: Unique user ID generation
- `copyToClipboard`: Clipboard functionality

#### **Hooks** (`src/hooks/`)
- `useChatWidget`: Main chat functionality and state
- `useSupportModal`: Support modal state management

#### **Components** (`src/components/`)
- **Atomic Components**: Small, focused UI pieces
- **Composite Components**: Larger components that combine smaller ones
- **Container Components**: Components that manage state and logic

### 🖥️ **Backend Organization** (`server/`)

#### **Types** (`server/types/`)
- `ChatRequest/Response`: API request/response interfaces
- `SupportRequest/Response`: Support form interfaces
- `ServerConfig`: Server configuration type
- `EmailConfig`: Email service configuration

#### **Config** (`server/config/`)
- Environment variable management
- Configuration validation
- Service initialization

#### **Services** (`server/services/`)
- `OpenRouterService`: AI API integration with streaming support
- `EmailService`: SMTP email functionality
- `SessionManager`: User session and conversation history

#### **Controllers** (`server/controllers/`)
- `ChatController`: Handles chat and streaming endpoints
- `SupportController`: Manages support request submissions

#### **Middleware** (`server/middleware/`)
- Error handling
- Request logging
- CORS configuration

#### **Routes** (`server/routes/`)
- Route definitions and endpoint mapping
- Controller integration

## Benefits of This Architecture

### ✅ **Maintainability**
- Easy to locate and modify specific functionality
- Clear dependencies between modules
- Reduced code duplication
- Consistent patterns across frontend and backend

### ✅ **Testability**
- Each component can be tested in isolation
- Hooks can be tested independently
- Services can be mocked easily
- Clear interfaces make testing straightforward

### ✅ **Scalability**
- Easy to add new features without affecting existing code
- Components can be reused across different parts of the app
- Services can be extended or replaced independently
- Clear patterns for extending functionality

### ✅ **Developer Experience**
- IntelliSense support with proper TypeScript types
- Clear file organization makes navigation intuitive
- Consistent patterns across the codebase
- Separation of concerns reduces cognitive load

## Usage

### Frontend Usage
The main `App.tsx` now serves as a simple orchestrator that:
1. Manages high-level state (widget open/closed, language selection)
2. Uses custom hooks for complex logic
3. Renders appropriate components based on state

```tsx
function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [lang, setLang] = useState<Language | null>(null)
  
  const chatWidget = useChatWidget()
  const supportModal = useSupportModal(lang)
  
  // Simple, clean component composition
  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && <ToggleButton onOpen={() => setIsOpen(true)} />}
      {isOpen && (
        <div className="chat-container">
          {lang === null ? (
            <LanguageSelector onSelectLanguage={handleLanguageSelect} />
          ) : (
            <ChatWindow {...chatProps} />
          )}
        </div>
      )}
    </div>
  )
}
```

### Backend Usage
The main `server.js` is now a clean entry point that:
1. Validates configuration
2. Sets up middleware
3. Registers routes
4. Handles errors

```javascript
import express from 'express'
import { config, validateConfig } from './server/config'
import { setupErrorHandlers, logServerStart } from './server/utils'
import { errorHandler, notFoundHandler, requestLogger } from './server/middleware'
import routes from './server/routes'

const app = express()

validateConfig()
setupErrorHandlers()

app.use(cors())
app.use(bodyParser.json())
app.use(requestLogger)
app.use('/', routes)
app.use(notFoundHandler)
app.use(errorHandler)

app.listen(config.port, () => logServerStart(config.port))
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- OpenRouter API key

### Installation
```bash
npm install
```

### Environment Setup
Create a `.env` file in the root directory:
```env
OPENROUTER_KEY=your_openrouter_api_key_here
PORT=3000
MODEL=openai/gpt-4o-mini

# Optional: Email configuration for support requests
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SUPPORT_TO=support@yourcompany.com
```

### Running the Application
```bash
# Start the backend server
npm run server

# Start the frontend development server (in another terminal)
npm run dev

# Or start both with development mode
npm run server:dev
```

This architecture makes the codebase much more maintainable, testable, and scalable while preserving all the original functionality across both frontend and backend.
#   C h a t _ B o t  
 