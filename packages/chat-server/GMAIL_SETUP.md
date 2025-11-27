# 📧 Gmail Setup - 2 Minutes Only!

## Super Easy Steps

### 1️⃣ Get App Password

**Open this link**: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)

- Sign in to Gmail
- Enable 2-Step Verification (if asked)
- Create App Password:
  - App: **Mail**
  - Device: **Other** → Type "ChatBot"
- **Copy** the 16-character password

### 2️⃣ Update .env

Open `.env` file and add:

```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
```

**Replace with your actual email and the password you just copied!**

### 3️⃣ Restart Server

```bash
npm run dev
```

### ✅ Done!

You'll see:
```
✅ Gmail ready! (using App Password)
📧 Sending from: your-email@gmail.com
```

Now all emails will be sent from your Gmail! 🎉

---

## Example .env File

```env
GEMINI_KEY=AIzaSyDktGPEDjr2NJytQReJFu6nFkL31XuSDo4
GOOGLE_API_KEY=AIzaSyDktGPEDjr2NJytQReJFu6nFkL31XuSDo4
MODEL=gemini-2.0-flash-001

WHATSAPP_NOTIFY_TO=201120592366

# Gmail Setup
GMAIL_USER=yourname@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
```

---

## Don't Have Gmail?

**No problem!** Just run `npm run dev` without any setup.

The system will auto-create a test email account and show preview URLs! 🚀

---

## Troubleshooting

### "Invalid credentials"
- Double-check email address
- Make sure you're using App Password (not regular password)
- Regenerate App Password and try again

### "2-Step Verification required"
- Go to [Google Account Security](https://myaccount.google.com/security)
- Enable 2-Step Verification
- Then create App Password

### Need help?
- Check logs for error messages
- Make sure `.env` file is in the correct location
- Restart server after editing `.env`

---

🎉 **That's it!** Easiest email setup ever!
