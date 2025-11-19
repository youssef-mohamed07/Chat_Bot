# 🌍 Quick Air - AI Travel Chatbot

> **Intelligent travel booking assistant powered by Google Gemini AI**  
> Seamless multi-step booking flow with RAG (Retrieval-Augmented Generation) for real hotel data

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## ✨ Features

### 🤖 **AI-Powered Conversations**
- **Google Gemini 2.0 Flash** integration with function calling
- **Natural language understanding** - detects destinations, dates, budgets from free text
- **Context-aware responses** - maintains conversation history and booking state
- **Multi-language support** - Arabic & English with proper RTL handling

### 🎯 **Smart Booking Flow**
1. 📍 **Destination Selection** - 8+ destinations (Bali, Istanbul, Sharm, Hurghada, etc.)
2. 📅 **Date Range Picker** - Interactive calendar widget
3. 👥 **Travelers Count** - Dynamic selector with icons
4. 💰 **Budget Ranges** - Budget/Standard/Luxury categories with EGP prices
5. 🏨 **Hotel Cards** - Real data with images, ratings, amenities
6. 🍽️ **Meal Plans** - Room Only, Breakfast, Half Board, All-Inclusive
7. 🛏️ **Room Types** - Single, Double, Twin, Triple, Family

### 🎨 **Modern UI/UX**
- ✅ **Progressive disclosure** - Show 3 hotels + "Show More" to reduce overwhelm
- ✅ **Progress indicator** - Visual step tracker (Step X/7)
- ✅ **Typography system** - Cairo/Tajawal (AR) + Inter/Roboto (EN)
- ✅ **Responsive design** - Carousel on mobile, Grid on desktop
- ✅ **Empty states** - Helpful suggestions when no results
- ✅ **Voice input** - Web Speech API for hands-free booking
- ✅ **Animations** - Typing effects, smooth transitions

### 📊 **RAG System**
- **Vector-based retrieval** from JSON hotel databases
- **Real-time filtering** by budget, stars, area, meal plans
- **Structured data** - Hotels, tours, visa info, pricing
- **8 destinations** with 50+ hotels total

---

## 🏗️ Architecture

### **Tech Stack**
```
Frontend:  React 18 + TypeScript + Vite + TailwindCSS
Backend:   Node.js + Express + TypeScript
AI:        Google Gemini 2.0 Flash API
Data:      JSON-based RAG with structured hotel/tour data
State:     In-memory session management
Voice:     Web Speech API (browser-based)
```

### **Project Structure**
```
Chat_Bot/
├── src/                          # Frontend React application
│   ├── components/
│   │   ├── ChatWindow.tsx        # Main chat interface
│   │   ├── ChatComponents.tsx    # Input, Header, Footer (with voice)
│   │   ├── MessagesList.tsx      # Messages + widgets renderer
│   │   ├── ChatWidgets.tsx       # All widget components
│   │   └── FormComponents.tsx    # Support modal
│   ├── hooks/
│   │   └── useChatWidget.ts      # Chat state management
│   ├── types/
│   │   └── index.ts              # TypeScript definitions
│   └── utils/
│       └── eventBus.ts           # Event system
│
├── server/                       # Backend Express server
│   ├── controllers/
│   │   ├── ChatController.ts     # 🎯 Main chat logic + UI generation
│   │   └── SupportController.ts  # Email support handler
│   ├── services/
│   │   ├── GeminiService.ts      # AI API integration
│   │   ├── RAGService.ts         # 📚 Hotel data retrieval
│   │   ├── PromptService.ts      # System prompts
│   │   ├── SessionManager.ts     # User sessions
│   │   ├── EmailService.ts       # Nodemailer
│   │   └── TourService.ts        # Tours data
│   ├── tours/                    # JSON databases
│   │   ├── bali.json
│   │   ├── istanbul.json
│   │   ├── sharm_el_sheikh.json
│   │   └── ... (8 destinations)
│   └── types/
│       └── index.ts              # Server types
│
└── public/                       # Static assets
```

---

## 🚀 Quick Start

### **Prerequisites**
```bash
Node.js >= 20.x
npm >= 10.x
```

### **Installation**

1. **Clone the repository**
```bash
git clone https://github.com/youssef-mohamed07/Chat_Bot.git
cd Chat_Bot
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment setup**

Create `.env` file in the root:
```env
# Google Gemini API
GEMINI_KEY=your_gemini_api_key_here
MODEL=gemini-2.0-flash-001

# Email (optional - for support form)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Server
PORT=3000
NODE_ENV=development
```

**Get your Gemini API key:**
- Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
- Create a new API key
- Copy to `.env`

4. **Run development server**
```bash
# Start both frontend & backend
npm run dev

# Or separately:
npm run client    # Frontend only (http://localhost:5173)
npm run server    # Backend only (http://localhost:3000)
```

5. **Build for production**
```bash
npm run build
npm start
```

---

## 📖 Usage

### **Basic Chat Flow**

```typescript
// User opens chat
User: "I want to travel to Bali"

// AI detects destination + shows date picker
AI: "Great! When would you like to travel?"
Widget: [Date Range Picker]

// User selects dates
User: [Selects dates: Dec 15-22]

// AI asks for travelers
AI: "Perfect! How many travelers?"
Widget: [Travelers Selector: 1-10]

// User selects travelers
User: [Selects 2 people]

// AI asks for budget
AI: "What's your budget per person?"
Widget: [Budget Ranges: Economy/Standard/Luxury/All]

// User selects budget
User: [Selects Standard: 15,000-30,000 EGP]

// AI shows filtered hotels
AI: "Found 12 hotels! Here are the top 3:"
Widget: [Hotel Cards x3] + [Show 9 more hotels]

// User selects hotel
User: [Clicks "Select" on Grand Mirage Resort]

// AI asks for meal plan
AI: "Great choice! What meal plan?"
Widget: [Room Only / Breakfast / Half Board / Full Board / All-Inclusive]

// User selects meal
User: [Selects All-Inclusive]

// AI asks for room type
AI: "Almost done! Room type?"
Widget: [Single / Double / Twin / Triple / Family]

// User completes booking
User: [Selects Double Room]

// AI shows summary + next steps
AI: "Perfect! Here's your booking summary..."
Widget: [✅ Confirm Booking] [📞 WhatsApp] [🔙 Modify]
```

### **Voice Input**

Click the 🎤 microphone button and speak:
- "I want to go to Sharm El Sheikh"
- "Two travelers"
- "Show me luxury hotels"

Speech automatically converts to text and processes like regular chat.

---

## 🎨 Widget System

### **Available Widgets**

| Widget | Type | Description |
|--------|------|-------------|
| **Destinations** | Grid | 8 destinations with categories (International/Local) |
| **Date Range** | Calendar | Interactive date picker with min/max dates |
| **Travelers** | Counter | 1-10 travelers with icons |
| **Budget** | Cards | 4 ranges with EGP prices |
| **Hotel Cards** | Grid/Carousel | Hotel info, images, ratings, amenities |
| **Meal Plans** | Options | 5 meal plan types |
| **Room Types** | Options | 5 room types with capacity |
| **Progress** | Steps | Visual progress indicator (Step X/7) |
| **Empty State** | Alert | No results + suggested actions |
| **Section Header** | Title | Category titles with counts |

### **Widget Logic**

```typescript
// ChatController.ts - generateSmartUI()

// Show widget if:
✅ step === 'initial' (always show destinations)
✅ isButtonAction (user clicked a button)
✅ isDetectedAction (AI detected intent from text)

// Hide widget if:
❌ Free text conversation (Q&A mode)
❌ No relevant step data
```

---

## 🧩 Key Components

### **Frontend**

#### **`ChatController.ts`** - Main AI Logic
```typescript
// Handles:
- Message routing (button clicks vs free text)
- Step management (7-step booking flow)
- AI context building (RAG + user data)
- Widget generation (smart UI based on step)
- Natural language detection (destinations, budgets, etc.)
```

#### **`RAGService.ts`** - Data Retrieval
```typescript
// Features:
- Load 8 destination JSON files
- Filter hotels by budget, stars, area
- Search hotels with criteria
- Chunk-based retrieval for AI context
```

#### **`GeminiService.ts`** - AI Integration
```typescript
// Capabilities:
- Google Gemini 2.0 Flash API
- Function calling support
- Streaming responses
- Retry logic with exponential backoff
- Rate limit handling
```

#### **`SessionManager.ts`** - State Management
```typescript
// Stores:
- Conversation history (messages)
- User metadata (step, selections, budget, etc.)
- Session-based (in-memory, can be extended to Redis)
```

### **Backend**

#### **`useChatWidget.ts`** - Chat Hook
```typescript
// Manages:
- Messages state
- Input handling
- API calls
- Voice input integration
- Widget interactions
```

#### **`ChatWidgets.tsx`** - Widget Renderer
```typescript
// Renders:
- All 10+ widget types
- Responsive layouts
- Language switching
- Event handling
```

---

## 🔧 Configuration

### **Model Settings**

```typescript
// server/services/GeminiService.ts

generationConfig: {
  temperature: 0.7,        // Creativity (0-1)
  topP: 0.9,              // Nucleus sampling
  topK: 40,               // Token selection
  maxOutputTokens: 2048,  // Response length
  responseMimeType: 'text/plain'
}
```

### **System Prompts**

```typescript
// server/services/PromptService.ts

// Arabic Prompt:
"أنت مساعد ذكي لوكالة Quick Air للسفر..."

// English Prompt:
"You are Quick Air's intelligent travel assistant..."
```

### **Typography**

```typescript
// ChatController.ts - getTypographyConfig()

Arabic:  'Cairo', 'Tajawal', 'IBM Plex Sans Arabic'
English: 'Inter', 'Roboto', system-ui

Sizes:   12px → 24px (xs → 2xl)
Weights: 400 → 700 (normal → bold)
```

---

## 📊 Data Structure

### **Hotel JSON Format**

```json
{
  "destination": "bali",
  "hotels": [
    {
      "hotel_name_en": "Grand Mirage Resort",
      "hotel_name_ar": "منتجع جراند ميراج",
      "stars": 5,
      "area": "Nusa Dua",
      "price_egp": 25000,
      "price_usd_reference": 500,
      "amenities": ["Pool", "Spa", "Beach Access"],
      "description_ar": "منتجع فاخر على الشاطئ",
      "description_en": "Luxury beachfront resort",
      "image": "/images/hotels/bali/grand-mirage.jpg"
    }
  ]
}
```

---

## 🛠️ API Endpoints

### **Chat**
```http
POST /chat
Content-Type: application/json

{
  "message": "I want to travel to Bali",
  "userId": "user_123",
  "lang": "en"
}

Response:
{
  "reply": "Great! When would you like to travel?",
  "ui": {
    "blocks": [
      { "type": "text", "text": "..." },
      { "type": "dateRange", "minDate": "2025-11-19", ... }
    ]
  }
}
```

### **Support**
```http
POST /support
Content-Type: application/json

{
  "name": "Ahmed",
  "email": "ahmed@example.com",
  "phone": "+201234567890",
  "message": "Need help with booking"
}

Response:
{
  "success": true,
  "message": "Support request sent!"
}
```

---

## 🧪 Testing

### **Manual Testing**

1. **Natural Language Detection**
```
✅ "I want to go to Bali" → Detects destination
✅ "2 people" → Detects travelers count
✅ "Budget around 20000" → Detects budget
```

2. **Widget Flow**
```
✅ Initial → Destinations grid
✅ Destination selected → Date picker
✅ Dates → Travelers selector
✅ Travelers → Budget ranges
✅ Budget → Hotel cards (3 + show more)
✅ Hotel → Meal plans
✅ Meal → Room types
```

3. **Error Handling**
```
✅ No hotels in budget → Empty state with actions
✅ Invalid API key → Fallback response
✅ Rate limit → Retry with backoff
```

---

## 🚧 Roadmap

### **Phase 1: Core Features** ✅
- [x] Multi-step booking flow
- [x] RAG with hotel data
- [x] Natural language detection
- [x] Voice input
- [x] Arabic/English support
- [x] Progress indicator
- [x] Empty states

### **Phase 2: Enhancements** 🚀
- [ ] Payment integration (Stripe/Fawry)
- [ ] Email confirmation with booking details
- [ ] Admin dashboard for bookings
- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] User authentication (Firebase/Auth0)
- [ ] WhatsApp integration
- [ ] PDF itinerary generation

### **Phase 3: Scale** 📈
- [ ] Redis for session management
- [ ] CDN for images
- [ ] Analytics dashboard
- [ ] A/B testing
- [ ] Multi-agent conversation flow
- [ ] Flight booking integration

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 👨‍💻 Author

**Youssef Mohamed**  
GitHub: [@youssef-mohamed07](https://github.com/youssef-mohamed07)

---

## 🙏 Acknowledgments

- **Google Gemini AI** for powerful language model
- **React** & **TypeScript** for robust frontend
- **Vite** for lightning-fast dev experience
- **TailwindCSS** for beautiful UI

---

**Made with ❤️ for Quick Air Travel Agency**

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
#   C h a t _ B o t 
 
 