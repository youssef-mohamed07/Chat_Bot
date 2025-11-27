# 🤖 @youssefmohamed07/chat-widget

A fully customizable, AI-powered chat widget built with React and TypeScript. Perfect for customer support, travel booking, and interactive conversations.

![NPM Version](https://img.shields.io/npm/v/@youssefmohamed07/chat-widget)
![License](https://img.shields.io/npm/l/@youssefmohamed07/chat-widget)
![Bundle Size](https://img.shields.io/bundlephobia/minzip/@youssefmohamed07/chat-widget)

## ✨ Features

- 🎨 **Fully Customizable** - Adapt the widget to match your brand
- 🌍 **Multilingual** - Built-in Arabic and English support
- 📱 **Responsive** - Works seamlessly on mobile, tablet, and desktop
- ⚡ **TypeScript** - Full type safety and IntelliSense support
- 🎯 **Rich UI Components** - Date pickers, traveler selectors, hotel cards, and more
- 🔌 **Easy Integration** - Drop-in component for React applications
- 🚀 **Lightweight** - Optimized bundle size with tree-shaking support
- 🎭 **Flexible Theming** - Tailwind CSS-based styling

## 📦 Installation

```bash
npm install @youssefmohamed07/chat-widget
```

or with yarn:

```bash
yarn add @youssefmohamed07/chat-widget
```

or with pnpm:

```bash
pnpm add @youssefmohamed07/chat-widget
```

## 🚀 Quick Start

### Basic Usage

```tsx
import { ChatWidget } from '@youssefmohamed07/chat-widget';
import '@youssefmohamed07/chat-widget/dist/style.css';

function App() {
  return (
    <div>
      <h1>My Website</h1>
      <ChatWidget apiBaseURL="https://your-api.com" />
    </div>
  );
}

export default App;
```

### With Next.js (App Router)

```tsx
'use client'

import dynamic from 'next/dynamic';
import '@youssefmohamed07/chat-widget/dist/style.css';

const ChatWidget = dynamic(
  () => import('@youssefmohamed07/chat-widget').then(mod => mod.ChatWidget),
  { ssr: false }
);

export default function Page() {
  return (
    <div>
      <h1>My Next.js App</h1>
      <ChatWidget apiBaseURL="https://your-api.com" />
    </div>
  );
}
```

### Standalone Widget (Alternative Flow)

```tsx
import { StandaloneChatWidget } from '@youssefmohamed07/chat-widget';
import '@youssefmohamed07/chat-widget/dist/style.css';

function App() {
  return <StandaloneChatWidget apiBaseURL="https://your-api.com" />;
}
```

## ⚙️ Configuration

### Props

#### ChatWidget

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `apiBaseURL` | `string` | ✅ Yes | - | Your backend API base URL |
| `initialOpen` | `boolean` | ❌ No | `false` | Whether to open the widget on mount |
| `className` | `string` | ❌ No | `''` | Additional CSS classes |

#### StandaloneChatWidget

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `apiBaseURL` | `string` | ✅ Yes | - | Your backend API base URL |
| `initialOpen` | `boolean` | ❌ No | `false` | Whether to open the widget on mount |

### API Endpoints

Your backend API should implement these endpoints:

#### 1. Chat Endpoint: `POST /chat`

**Request:**
```typescript
{
  message: string;
  userId?: string;
  lang?: 'ar' | 'en';
  customerInfo?: {
    name: string;
    phone: string;
    email: string;
  };
}
```

**Response:**
```typescript
{
  reply: string;
  ui?: {
    blocks?: Array<UIBlock>; // Rich UI components
  };
}
```

#### 2. Support Request: `POST /support/request`

**Request:**
```typescript
{
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  userId?: string;
  lang?: 'ar' | 'en';
}
```

**Response:**
```typescript
{
  ok: boolean;
  error?: string;
  message?: string;
}
```

## 🎨 Styling

The widget uses Tailwind CSS for styling. The compiled CSS is included in the package.

### Import Styles

```tsx
import '@quickair/chat-widget/dist/style.css';
```

### Custom Styling

You can override the default styles using CSS:

```css
/* Override chat window background */
.chat-window {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Customize button colors */
.chat-send-button {
  background-color: #4f46e5;
}
```

## 🔧 Advanced Usage

### Using Custom API Service

```tsx
import { ApiService } from '@youssefmohamed07/chat-widget';

// Create a custom instance
const customApi = new ApiService('https://my-custom-api.com');

// Use it in your application
const response = await customApi.sendMessage({
  message: 'Hello',
  lang: 'en'
});
```

### TypeScript Support

The package includes full TypeScript definitions:

```tsx
import type { 
  ChatMessage, 
  ChatRequest, 
  ChatResponse,
  Language,
  UIBlock
} from '@youssefmohamed07/chat-widget';

const message: ChatMessage = {
  role: 'user',
  content: 'Hello'
};
```

## 📖 UI Blocks

The widget supports rich UI components through the `ui.blocks` response:

### Text Block
```typescript
{ type: 'text', text: 'Hello!' }
```

### Buttons
```typescript
{ 
  type: 'buttons', 
  text: 'Choose an option:',
  buttons: [
    { text: 'Option 1', value: 'opt1' },
    { text: 'Option 2', value: 'opt2' }
  ]
}
```

### Date Range Picker
```typescript
{ 
  type: 'dateRange',
  heading: 'Select your travel dates',
  minDate: '2025-01-01',
  maxDate: '2025-12-31'
}
```

### Traveler Selector
```typescript
{ 
  type: 'travellers',
  heading: 'How many travelers?',
  min: 1,
  max: 10,
  default: 2
}
```

### Hotel Cards
```typescript
{ 
  type: 'hotelCards',
  hotels: [
    {
      hotel_name_ar: 'فندق النخيل',
      hotel_name_en: 'Palm Hotel',
      priceEGP: 5000,
      rating: 5,
      amenities: ['WiFi', 'Pool', 'Spa']
    }
  ]
}
```

[See full UI blocks documentation →](https://github.com/youssef-mohamed07/Chat_Bot)

## 🌍 Internationalization

The widget supports Arabic and English out of the box:

```tsx
// User selects language in the UI
// All labels automatically switch based on selection
```

### Adding Custom Languages

Extend the `Language` type and add translations to the config:

```typescript
// Not directly supported yet - coming in future versions
```

## 🔒 Security

- All user data is sent securely to your backend
- No data is stored in the widget itself
- Customer information is optional and user-controlled

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](https://github.com/youssef-mohamed07/Chat_Bot/blob/main/CONTRIBUTING.md) first.

## 📝 License

MIT © [QuickAir](https://github.com/youssef-mohamed07)

## 🐛 Issues

Found a bug? Please [open an issue](https://github.com/youssef-mohamed07/Chat_Bot/issues).

## 📚 Resources

- [GitHub Repository](https://github.com/youssef-mohamed07/Chat_Bot)
- [Example Backend Implementation](https://github.com/youssef-mohamed07/Chat_Bot/tree/main/packages/chat-server)
- [Full Documentation](https://github.com/youssef-mohamed07/Chat_Bot#readme)

## 💬 Support

Need help? Reach out:
- GitHub Issues: [Chat_Bot Issues](https://github.com/youssef-mohamed07/Chat_Bot/issues)
- Email: support@quickair.com

---

Made with ❤️ by QuickAir Team
