// Import styles
import './index.css';

// Main exports for the chat widget package
export { ChatWidget } from './components/ChatWidget';
export { default as StandaloneChatWidget } from './components/StandaloneChatWidget';

// Export all ChatUI components
export * from './components/ChatUI';

// Export hooks
export { useChatWidget } from './hooks/useChatWidget';

// Export types
export type {
  ChatMessage,
  ChatRequest,
  ChatResponse,
  SupportRequest,
  SupportResponse,
  Language,
  FrontendChatMessage
} from './types';

// Export API service
export { apiService } from './services/api.service';
