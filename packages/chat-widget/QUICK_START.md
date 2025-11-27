# 🚀 دليل النشر السريع - Quick Publishing Guide

## خطوات النشر على NPM

### 1️⃣ التسجيل والإعداد

```bash
# إنشاء حساب على NPM (مرة واحدة فقط)
# زيارة: https://www.npmjs.com/signup

# تسجيل الدخول
npm login

# التحقق من تسجيل الدخول
npm whoami
```

### 2️⃣ التحقق من اسم الـ Package

```bash
# تحقق من توفر اسم الـ package
npm view @youssefmohamed07/chat-widget

# إذا كان موجود، غير الاسم في package.json:
# "@your-username/chat-widget"
```

### 3️⃣ Build نهائي

```bash
cd E:\Blur\BOT\Chat_Bot\packages\chat-widget

# تنظيف وبناء
Remove-Item dist -Recurse -Force -ErrorAction SilentlyContinue
npm run build
```

### 4️⃣ اختبار الـ Package

```bash
# إنشاء tarball للاختبار
npm pack

# سيُنشئ: quickair-chat-widget-1.0.0.tgz
```

### 5️⃣ النشر

```bash
# للـ public scoped package
npm publish --access public

# أو للـ unscoped package
npm publish
```

### 6️⃣ التحقق من النشر

```bash
# عرض معلومات الـ package
npm info @youssefmohamed07/chat-widget

# زيارة الصفحة
# https://www.npmjs.com/package/@youssefmohamed07/chat-widget
```

---

## 📖 استخدام الـ Package

### التثبيت

```bash
npm install @youssefmohamed07/chat-widget
```

### الاستخدام الأساسي

```tsx
import { ChatWidget } from '@youssefmohamed07/chat-widget';
import '@youssefmohamed07/chat-widget/dist/style.css';

function App() {
  return (
    <ChatWidget apiBaseURL="https://your-api.com" />
  );
}
```

### مع Next.js

```tsx
'use client'

import dynamic from 'next/dynamic';
import '@quickair/chat-widget/dist/style.css';

const ChatWidget = dynamic(
  () => import('@quickair/chat-widget').then(mod => mod.ChatWidget),
  { ssr: false }
);

export default function Page() {
  return <ChatWidget apiBaseURL="https://your-api.com" />;
}
```

---

## 🔄 تحديث الإصدار

```bash
# Bug fixes: 1.0.0 → 1.0.1
npm version patch

# New features: 1.0.0 → 1.1.0
npm version minor

# Breaking changes: 1.0.0 → 2.0.0
npm version major

# النشر بعد التحديث
npm publish --access public
```

---

## 📋 Checklist قبل النشر

- ✅ تم اختبار الـ build
- ✅ تم تحديث README.md
- ✅ تم تحديث CHANGELOG.md
- ✅ لا توجد errors في TypeScript
- ✅ تم اختبار الـ package محلياً
- ✅ رقم الإصدار صحيح

---

## 🆘 مشاكل شائعة

### Package name already taken
**الحل:** غير الاسم في `package.json`

### Not logged in
**الحل:** 
```bash
npm logout
npm login
```

### 403 Forbidden
**الحل:** أضف `--access public`
```bash
npm publish --access public
```

---

## 📦 حجم الـ Package

- **Total Size:** 119.6 KB (compressed)
- **ESM Bundle:** 175 KB
- **UMD Bundle:** 122 KB
- **CSS:** 41 KB
- **Type Definitions:** Included ✅

---

## 🎯 الإصدار الحالي

**Version:** 1.0.0  
**Status:** Ready to publish ✅  
**Build:** Successful ✅  
**Documentation:** Complete ✅

---

تم بنجاح! Package جاهز للنشر 🎉
