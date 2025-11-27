# 💡 Usage Examples

Complete examples for using @youssefmohamed07/chat-widget in different scenarios.

---

## 📱 React (Vite / Create React App)

### Basic Setup

```tsx
// src/App.tsx
import { ChatWidget } from '@youssefmohamed07/chat-widget';
import '@youssefmohamed07/chat-widget/dist/style.css';

export default function App() {
  return (
    <div className="app">
      <header>
        <h1>My Travel Website</h1>
      </header>
      
      <main>
        {/* Your content */}
      </main>
      
      {/* Chat Widget */}
      <ChatWidget 
        apiBaseURL="https://api.example.com"
        initialOpen={false}
      />
    </div>
  );
}
```

### With Custom Styling

```tsx
import { ChatWidget } from '@youssefmohamed07/chat-widget';
import '@youssefmohamed07/chat-widget/dist/style.css';
import './custom-chat.css';

export default function App() {
  return (
    <ChatWidget 
      apiBaseURL="https://api.example.com"
      className="my-custom-chat"
    />
  );
}
```

```css
/* custom-chat.css */
.my-custom-chat {
  /* Custom position */
  bottom: 20px;
  right: 20px;
}

/* Override colors */
.chat-window {
  --primary-color: #ff6b6b;
}
```

---

## ⚡ Next.js (App Router)

### Client Component

```tsx
// app/components/ChatWidget.tsx
'use client'

import dynamic from 'next/dynamic';
import '@youssefmohamed07/chat-widget/dist/style.css';

const ChatWidget = dynamic(
  () => import('@youssefmohamed07/chat-widget').then(mod => mod.ChatWidget),
  { 
    ssr: false,
    loading: () => <div>Loading chat...</div>
  }
);

export default function ChatWidgetWrapper() {
  return (
    <ChatWidget 
      apiBaseURL={process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9090'}
      initialOpen={false}
    />
  );
}
```

### Usage in Layout

```tsx
// app/layout.tsx
import ChatWidgetWrapper from './components/ChatWidget';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <ChatWidgetWrapper />
      </body>
    </html>
  );
}
```

### Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_URL=https://api.production.com
```

---

## 📄 Next.js (Pages Router)

### _app.tsx Setup

```tsx
// pages/_app.tsx
import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import '@youssefmohamed07/chat-widget/dist/style.css';

const ChatWidget = dynamic(
  () => import('@youssefmohamed07/chat-widget').then(mod => mod.ChatWidget),
  { ssr: false }
);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <ChatWidget apiBaseURL="https://api.example.com" />
    </>
  );
}
```

---

## 🎨 Standalone Widget

Perfect for single-page implementations or different user flows.

```tsx
import { StandaloneChatWidget } from '@youssefmohamed07/chat-widget';
import '@youssefmohamed07/chat-widget/dist/style.css';

export default function ChatPage() {
  return (
    <div style={{ height: '100vh' }}>
      <StandaloneChatWidget 
        apiBaseURL="https://api.example.com"
        initialOpen={true}
      />
    </div>
  );
}
```

---

## 🔧 TypeScript Integration

### Full Type Safety

```tsx
import { ChatWidget } from '@youssefmohamed07/chat-widget';
import type { 
  ChatMessage, 
  ChatRequest, 
  ChatResponse,
  Language 
} from '@youssefmohamed07/chat-widget';
import '@youssefmohamed07/chat-widget/dist/style.css';

interface AppProps {
  apiUrl: string;
  defaultLanguage?: Language;
}

export default function App({ apiUrl, defaultLanguage }: AppProps) {
  return <ChatWidget apiBaseURL={apiUrl} />;
}
```

### Custom API Service

```tsx
import { ApiService } from '@youssefmohamed07/chat-widget';
import type { ChatRequest, ChatResponse } from '@youssefmohamed07/chat-widget';

// Create custom instance
const api = new ApiService('https://api.example.com');

// Use it
async function sendMessage(message: string) {
  const request: ChatRequest = {
    message,
    lang: 'ar',
    customerInfo: {
      name: 'أحمد',
      email: 'ahmed@example.com',
      phone: '+201234567890'
    }
  };
  
  const response: ChatResponse = await api.sendMessage(request);
  console.log(response.reply);
}
```

---

## 🌐 Multi-Language Support

The widget automatically handles Arabic and English based on user selection.

```tsx
import { ChatWidget } from '@youssefmohamed07/chat-widget';
import '@youssefmohamed07/chat-widget/dist/style.css';

export default function App() {
  return (
    <ChatWidget 
      apiBaseURL="https://api.example.com"
      // Language is selected by user in the UI
    />
  );
}
```

---

## 🎯 Conditional Rendering

Show widget only on specific pages:

```tsx
import { usePathname } from 'next/navigation';
import { ChatWidget } from '@youssefmohamed07/chat-widget';
import '@youssefmohamed07/chat-widget/dist/style.css';

export default function ConditionalChat() {
  const pathname = usePathname();
  
  // Only show on certain routes
  const shouldShowChat = ['/tours', '/booking', '/contact'].includes(pathname);
  
  if (!shouldShowChat) return null;
  
  return <ChatWidget apiBaseURL="https://api.example.com" />;
}
```

---

## 📊 With Analytics

Track chat interactions:

```tsx
import { ChatWidget } from '@youssefmohamed07/chat-widget';
import '@youssefmohamed07/chat-widget/dist/style.css';
import { useEffect } from 'react';

export default function AnalyticsChat() {
  useEffect(() => {
    // Track when chat is loaded
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'chat_widget_loaded');
    }
  }, []);
  
  return <ChatWidget apiBaseURL="https://api.example.com" />;
}
```

---

## 🛡️ Error Boundaries

Wrap widget in error boundary for production:

```tsx
import { Component, ReactNode } from 'react';
import { ChatWidget } from '@youssefmohamed07/chat-widget';
import '@youssefmohamed07/chat-widget/dist/style.css';

class ChatErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div>Chat widget failed to load</div>;
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ChatErrorBoundary>
      <ChatWidget apiBaseURL="https://api.example.com" />
    </ChatErrorBoundary>
  );
}
```

---

## 🚀 Production Deployment

### Vercel / Netlify

```tsx
// Use environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || 
                process.env.REACT_APP_API_URL || 
                'http://localhost:9090';

<ChatWidget apiBaseURL={API_URL} />
```

### Docker

```dockerfile
# Build args
ARG VITE_API_URL=https://api.production.com

# Environment
ENV VITE_API_URL=$VITE_API_URL
```

---

## 📚 Resources

- [API Documentation](https://github.com/youssef-mohamed07/Chat_Bot)
- [Backend Example](https://github.com/youssef-mohamed07/Chat_Bot/tree/main/packages/chat-server)
- [TypeScript Types](https://github.com/youssef-mohamed07/Chat_Bot/tree/main/packages/chat-widget/src/types)

---

Need help? [Open an issue](https://github.com/youssef-mohamed07/Chat_Bot/issues)
