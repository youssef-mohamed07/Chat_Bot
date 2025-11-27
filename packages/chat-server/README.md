# QuickAir Chat Server

Express.js backend server for the QuickAir AI chat widget. Powered by Google Gemini AI for intelligent travel assistance.

## Features

- 🤖 AI-powered chat using Google Gemini
- 📍 RAG (Retrieval Augmented Generation) for destination information
- 📧 Email support via Nodemailer
- 📱 WhatsApp notifications via Ultramsg
- 🔄 Session management
- ✅ Input validation
- 🎯 Intent detection

## Installation

```bash
npm install
```

## Configuration

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:
- `GEMINI_KEY` - Your Google Gemini API key
- `ULTRAMSG_INSTANCE` - Your Ultramsg instance ID
- `ULTRAMSG_TOKEN` - Your Ultramsg API token
- `PORT` - Server port (default: 9090)

## Development

```bash
# Build TypeScript
npm run build

# Run in development mode (with auto-reload)
npm run dev

# Run in production mode
npm start
```

## API Endpoints

### Chat
- `POST /chat` - Send a chat message
- `POST /chat/stream` - Streaming chat (SSE)

### Support
- `POST /support/request` - Submit a support ticket

### Offers
- `GET /offers/:destination` - Get offers for a destination

## Deployment

1. Build the project:
```bash
npm run build
```

2. Set environment variables on your server

3. Start the server:
```bash
npm start
```

## License

MIT
