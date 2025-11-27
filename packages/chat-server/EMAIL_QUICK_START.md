# ⚡ Quick Start - Email Setup

## Choose Your Option:

### Option 1: Gmail (RECOMMENDED - 2 Minutes)

**Step 1**: Get App Password from [here](https://myaccount.google.com/apppasswords)

**Step 2**: Add to `.env`:
```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-password
```

**Step 3**: Restart server → Done! ✅

📧 **Sends real emails from your Gmail**

---

### Option 2: Auto Test Mode (NO SETUP!)

Just run: `npm run dev`

✅ **Works instantly**  
📧 **Preview URLs for all emails**  
🎨 **Perfect for testing**

---

## What Happens?

### With Gmail Setup:
```
✅ Gmail ready! (using App Password)
📧 Sending from: your-email@gmail.com
✅ Welcome email sent to customer@email.com via gmail
```

### Without Setup:
```
✅ Test email account created!
🔗 Preview emails at: https://ethereal.email/messages
✅ Welcome email sent to customer@email.com via ethereal
📧 Preview URL: https://ethereal.email/message/xxxxx
```

---

## Full Details

- Gmail Setup: See `GMAIL_SETUP.md`
- All Options: See `EMAIL_SETUP.md`

---

🚀 **That's it!** Choose what works for you!
