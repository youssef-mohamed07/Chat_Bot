# 🚀 QuickAir Chat - Deployment Guide

## ✅ Separation Complete

Your project has been successfully separated into:

```
Chat_Bot/
├── packages/
│   ├── chat-widget/     ✅ Frontend (ready for npm)
│   ├── chat-server/     ✅ Backend (ready for server)
│   └── shared/          ✅ Shared types
└── package.json         ✅ Workspace root
```

---

## 📦 Package 1: Frontend Widget (npm)

### Location
`packages/chat-widget/`

### Build
```bash
cd packages/chat-widget
npm run build
```

### Publish to npm
```bash
# Login to npm (one time)
npm login

# Publish package
npm publish --access public
```

### Package Name
`@quickair/chat-widget`

### Usage After Publishing
```bash
npm install @quickair/chat-widget
```

```tsx
import { ChatWidget } from '@quickair/chat-widget';
import '@quickair/chat-widget/styles';

function App() {
  return (
    <ChatWidget apiBaseURL="https://your-api-server.com" />
  );
}
```

---

## 🖥️ Package 2: Backend Server

### Location
`packages/chat-server/`

### Configuration
1. Copy environment file:
   ```bash
   cd packages/chat-server
   cp .env.example .env
   ```

2. Edit `.env` with your credentials:
   ```env
   GEMINI_KEY=your_actual_key_here
   ULTRAMSG_INSTANCE=your_instance
   ULTRAMSG_TOKEN=your_token
   PORT=9090
   ```

### Build
```bash
cd packages/chat-server
npm run build
```

### Run Locally
```bash
npm run dev      # Development mode (auto-reload)
npm start        # Production mode
```

### Deploy to Server

#### Option 1: Railway
1. Install Railway CLI: `npm install -g railway`
2. Login: `railway login`
3. Deploy:
   ```bash
   cd packages/chat-server
   railway up
   ```
4. Add environment variables in Railway dashboard

#### Option 2: Render
1. Connect your GitHub repo
2. Select `packages/chat-server` as root directory
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Add environment variables in Render dashboard

#### Option 3: VPS (DigitalOcean, AWS, etc.)
```bash
# SSH into your server
ssh user@your-server.com

# Clone and setup
git clone https://github.com/your-username/Chat_Bot.git
cd Chat_Bot/packages/chat-server
npm install
npm run build

# Create .env file
nano .env
# (paste your environment variables)

# Start with PM2
npm install -g pm2
pm2 start dist/server.js --name chat-server
pm2 save
pm2 startup
```

---

## 🔧 Development Workflow

### Run Both Locally
From the root directory:
```bash
# Install all dependencies
npm install

# Run both frontend and backend
npm run dev

# Or run separately:
npm run dev:widget   # Frontend on http://localhost:5173
npm run dev:server   # Backend on http://localhost:9090
```

### Frontend connects to Backend
The widget uses `.env.local` to configure API URL:
```env
VITE_API_URL=http://localhost:9090
```

For production, update this to your deployed backend URL:
```env
VITE_API_URL=https://api.yourserver.com
```

---

## 🌐 CORS Configuration

After deploying, update CORS in backend to allow your frontend domain:

Edit `packages/chat-server/src/config/index.ts`:
```typescript
export const CORS_CONFIG = {
  origin: [
    'http://localhost:5173',
    'https://yourfrontend.com',  // Add your domain
    'https://www.yourfrontend.com'
  ],
  credentials: true
}
```

---

## 📋 Checklist

### Before Publishing Frontend to npm:
- [✅] Build passes (`npm run build`)
- [ ] Update package version in `package.json`
- [ ] Test package locally (`npm link`)
- [ ] Update README with usage instructions
- [ ] Add LICENSE file
- [ ] Configure npm scope (organization or personal)

### Before Deploying Backend:
- [✅] Build passes (`npm run build`)
- [ ] Environment variables configured
- [ ] API keys secured (never commit .env)
- [ ] Database/storage configured (if needed)
- [ ] CORS allows frontend domain
- [ ] Test all endpoints

---

## 🎯 Next Steps

1. **Test Frontend Package Locally**
   ```bash
   cd packages/chat-widget
   npm link
   
   # In another project
   npm link @quickair/chat-widget
   ```

2. **Deploy Backend First**
   - Choose hosting (Railway/Render/VPS)
   - Deploy and get URL (e.g., `https://api.quickair.com`)

3. **Update Frontend Configuration**
   - Set `VITE_API_URL` to your backend URL
   - Build and publish to npm

4. **Update CORS**
   - Add frontend domains to backend CORS config

---

## 🔐 Security Notes

### ❌ NEVER commit:
- `.env` files
- API keys
- Tokens
- Passwords

### ✅ Always use:
- Environment variables
- `.env.example` as template
- `.gitignore` to exclude sensitive files

---

## 📞 Support

For issues or questions:
- Check README files in each package
- Review error logs
- Test endpoints with Postman/Thunder Client

---

**Congratulations! Your Chat Bot is now separated and ready for deployment! 🎉**
