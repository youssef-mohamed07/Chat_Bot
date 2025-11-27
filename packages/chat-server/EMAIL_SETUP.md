# 📧 Email Setup Guide - Quick Air Chat Bot

## 🚀 Super Easy Gmail Setup (2 Minutes!)

### Step 1: Get Gmail App Password

1. **Go to**: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. **Sign in** to your Gmail account
3. **Enable 2-Step Verification** (if not already enabled)
4. **Create App Password**:
   - App: Select "Mail"
   - Device: Select "Other" → Type "QuickAir ChatBot"
5. **Copy** the 16-character password (looks like: `abcd efgh ijkl mnop`)

### Step 2: Update .env File

```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
```

### Step 3: Restart & Done! 🎉

```bash
npm run dev
```

You'll see:
```
✅ Gmail ready! (using App Password)
📧 Sending from: your-email@gmail.com
```

**That's it!** Real emails will be sent from your Gmail! 📨

---

## Alternative: Zero Configuration (Default)

Don't want to setup Gmail? **No problem!**

Just run:
```bash
npm run dev
```

The system will:
- ✅ Auto-create a test email account
- ✅ Show preview URLs for all emails
- ✅ Work instantly without setup!

Output:
```
📧 Creating test email account (Ethereal)...
✅ Test email account created!
🔗 Preview emails at: https://ethereal.email/messages
```

---

## Overview
The chat bot sends beautiful welcome emails automatically!
## Features

- ✅ **Zero Configuration**: Works out of the box with test emails
- ✅ **Welcome Email**: Sent automatically when customer submits info
- ✅ **Beautiful HTML Design**: Modern, responsive templates
- ✅ **Bilingual Support**: Arabic and English
- ✅ **Non-blocking**: Emails sent in background
- ✅ **Auto Preview**: Get URLs to preview sent emails

### Email Templates Include:

## Troubleshooting

### Check Email Status in Logs

```
✅ SendGrid email service ready           // Production ready
✅ Test email account created!            // Development mode
⚠️  Email service not ready               // Something wrong
```

### Common Issues

**1. "Email service not ready"**
- Check if server finished initializing
- Wait a few seconds after startup

**2. SendGrid emails not sending**
- Verify API key is correct
- Check sender email is verified in SendGrid
- Check SendGrid dashboard for errors

**3. Want to see test emails?**
- Click the preview URL in console
- Or visit: https://ethereal.email/messages
- Login with credentials shown in console

## Development vs Production

### Development (Default)
- ✅ No setup needed
- ✅ Preview emails via Ethereal
- ✅ Test without sending real emails
- ✅ Perfect for testing

### Production (SendGrid)
- ✅ Real email delivery
- ✅ 100 emails/day free
- ✅ Professional headers
- ✅ Analytics dashboard

## Alternative Services

### Mailgun (5,000 emails/month free)
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASS=your-mailgun-smtp-password
```

### Amazon SES (Very cheap)
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
```

## Quick Start Summary

**For Development (Instant):**
```bash
# No setup needed!
npm run dev
# Check console for preview URLs
```

**For Production (5 minutes):**
```bash
# 1. Get SendGrid API key (free)
# 2. Add to .env:
SENDGRID_API_KEY=SG.xxx...
SENDGRID_FROM_EMAIL=noreply@quickair.com
# 3. Restart server
npm run dev
```

---

🎉 **That's it!** Emails work automatically - no complex SMTP setup required!
