# WhatsApp Integration Setup

This chatbot now supports WhatsApp integration for customer support. When users mention "customer support" or "خدمة عملاء" or click support buttons, they will be redirected to WhatsApp for direct communication.

## WhatsApp Business API Setup

### 1. Create Facebook App
1. Go to [Facebook Developer Console](https://developers.facebook.com/)
2. Create a new app and select "Business" type
3. Add WhatsApp Business API product to your app

### 2. Get Required Credentials
You'll need these three values from your Facebook app:

- **Access Token**: From WhatsApp > API Setup
- **Phone Number ID**: From WhatsApp > API Setup  
- **Business Phone Number**: Your WhatsApp Business phone number

### 3. Environment Variables
Add these to your `.env` file:

```env
# WhatsApp Business API Configuration
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_BUSINESS_PHONE_NUMBER=your_business_phone_number_here
```

### 4. Features

#### Automatic Support Detection
The chatbot automatically detects when users ask for support using these keywords:

**Arabic:**
- خدمة عملاء
- خدمة العملاء
- دعم عملاء
- دعم العملاء
- موظف دعم
- موظف الدعم
- اتصل بدعم
- اتصل بالدعم
- أريد مساعدة
- أحتاج مساعدة
- مساعدة بشرية
- تكلم مع موظف
- تكلم مع موظف دعم
- موظف بشري

**English:**
- customer support
- customer service
- support agent
- human agent
- talk to agent
- speak to agent
- contact support
- need help
- want help
- human help
- live agent
- real person

#### Support Button Integration
Users can also click the "Need help from a human agent?" button to get WhatsApp support.

#### WhatsApp Link Generation
When support is requested, the system:
1. Generates a pre-filled WhatsApp message with user details
2. Opens WhatsApp in a new tab
3. Allows direct communication with support team

### 5. API Endpoints

- `POST /whatsapp/support` - Generate WhatsApp support link
- `POST /whatsapp/send` - Send message directly via WhatsApp API

### 6. Testing

To test the integration:
1. Start the server with WhatsApp credentials configured
2. Send a message containing support keywords
3. Or click the support button
4. Verify WhatsApp opens with pre-filled message

### 7. Fallback

If WhatsApp is not configured, the system will show an error message asking to configure WhatsApp settings.
