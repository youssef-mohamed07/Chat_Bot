# Multi-Platform Support Configuration

This chatbot now supports multiple platforms for customer support:

## 📱 Supported Platforms

### 1. WhatsApp Business API
- **Purpose**: Direct messaging via WhatsApp
- **Emoji**: 📱
- **API**: Facebook Graph API

### 2. Instagram Direct Messages
- **Purpose**: Direct messaging via Instagram
- **Emoji**: 📸
- **API**: Facebook Graph API

### 3. Facebook Messenger
- **Purpose**: Direct messaging via Messenger
- **Emoji**: 💬
- **API**: Facebook Graph API

## 🔧 Environment Variables

Add these to your `.env` file in the server directory:

```env
# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_BUSINESS_PHONE_NUMBER=your_business_phone_number_here

# Instagram API
INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token_here
FACEBOOK_PAGE_ID=your_facebook_page_id_here
INSTAGRAM_ACCOUNT_ID=your_instagram_account_id_here

# Messenger API
MESSENGER_ACCESS_TOKEN=your_messenger_access_token_here
MESSENGER_USER_ID=your_messenger_user_id_here
```

## 🚀 How It Works

### Automatic Platform Detection
When a user requests support, the system:
1. **Detects support keywords** (دعم, خدمة عملاء, customer support, etc.)
2. **Checks available platforms** (WhatsApp, Instagram, Messenger)
3. **Sends message to ALL available platforms** simultaneously
4. **Creates support ticket** in database
5. **Sends notifications** to console and logs

### Platform Selection
- **Default**: Send to all available platforms
- **Manual**: Can specify specific platform via API
- **Fallback**: If no platforms available, saves ticket only

## 📊 API Endpoints

### Platform Management
- `GET /platforms/status` - Check which platforms are configured
- `GET /platforms/info` - Get platform information and availability
- `POST /platforms/test` - Send test message to platforms

### Support Tickets
- `GET /tickets` - Get all support tickets
- `GET /tickets/stats` - Get ticket statistics
- `PUT /tickets/:id/status` - Update ticket status

## 🎯 User Experience

### Arabic Response
```
✅ تم إرسال رسالتك إلى فريق الدعم عبر المنصات المتاحة.

📋 رقم التذكرة: #1
📱 واتساب, 📸 إنستجرام, 💬 ماسنجر
📱 يمكنك متابعة المحادثة هنا في البوت أو انتظار ردنا على المنصات المتاحة.
```

### English Response
```
✅ Your message has been sent to our support team via available platforms.

📋 Ticket Number: #1
📱 WhatsApp, 📸 Instagram, 💬 Messenger
📱 You can continue the conversation here in the bot or wait for our response on available platforms.
```

## 🔍 Console Output

When a support request is received:
```
🚨 ===== NEW SUPPORT TICKET =====
📋 Ticket ID: 1
👤 User: Guest (test-user)
🌐 Language: ar
💬 Message: دعم
📊 Status: pending
================================

📊 Platform Results for Ticket #1:
  whatsapp: ✅ msg_123456789
  instagram: ✅ msg_987654321
  messenger: ❌ API Error: Invalid token
```

## 🛠️ Setup Instructions

### 1. Facebook Developer Console
1. Go to [Facebook Developer Console](https://developers.facebook.com/)
2. Create a new app
3. Add WhatsApp Business API, Instagram Basic Display, and Messenger products
4. Get access tokens for each platform

### 2. WhatsApp Setup
- Get WhatsApp Business API credentials
- Add phone number ID and business phone number

### 3. Instagram Setup
- Connect Instagram account to Facebook page
- Get Instagram account ID
- Generate access token

### 4. Messenger Setup
- Set up Messenger webhook
- Get page access token
- Configure user ID for receiving messages

## 🎉 Benefits

- **Multi-channel support**: Reach customers on their preferred platform
- **Redundancy**: If one platform fails, others continue working
- **Unified management**: All platforms managed from one system
- **Automatic failover**: System adapts to available platforms
- **Comprehensive logging**: Track all platform interactions

## 🔧 Testing

Test the multi-platform system:
```bash
# Check platform status
curl http://localhost:3000/platforms/status

# Send test message
curl -X POST http://localhost:3000/platforms/test \
  -H "Content-Type: application/json" \
  -d '{"platform": "all", "message": "Test message"}'

# Test support detection
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "دعم", "lang": "ar", "userId": "test-user"}'
```
