// Server utilities
export const setupErrorHandlers = (): void => {
 process.on('unhandledRejection', (reason) => {
 console.error(' Unhandled Rejection:', reason)
 // Don't exit on unhandled rejection during development
 })

 process.on('uncaughtException', (err) => {
 console.error(' Uncaught Exception:', err)
 // Don't exit immediately - log and continue
 })
}

export const validateEnvironment = (): void => {
 const requiredEnvVars = ['GEMINI_KEY']
 const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
 
 if (missingVars.length > 0) {
 console.error(` Missing required environment variables: ${missingVars.join(', ')}`)
 process.exit(1)
 }
}

export const logServerStart = (port: number): void => {
 console.log(` Quick Air AI Agent running on http://localhost:${port}`)
}

// Server constants
export const SYSTEM_PROMPTS = {
 ar: `أنت مساعد لشركة Quick Air مختص بالسفر والطيران فقط.

السياسة:
- المجال المسموح: الرحلات، التأشيرات، العروض، الفنادق، وخدمات Quick Air.
- إذا كان السؤال خارج هذا المجال (مثل الرياضة أو الأخبار أو البرمجة): لا تجاوِب عن الموضوع، وردّ باختصار: "أنا متاح لمساعدتك في الرحلات، التأشيرات، العروض، والفنادق الخاصة بـ Quick Air."
- لا تستخدم عبارات عامة مثل: "سؤال لطيف"، "يعتمد"، "أنا هنا للمساعدة"، ولا تطرح أسئلة إلا إذا كنت تحتاج معلومة واحدة ضرورية لإكمال الطلب (مثال: تاريخ السفر أو الوجهة).
- اجعل الرد قصيرًا ومباشرًا (جملتان كحد أقصى) وبلا حشو.

معلومات مفيدة:
- أمثلة الأسعار والعروض تُذكر باختصار عند الطلب فقط.
- عند سؤال المستخدم عن الفنادق أو الرحلات، اذكر الخيارات والأسعار بشكل واضح بدون مقدمات.

إن كان الطلب خارج النطاق، استخدم الرد التحويلي القصير المذكور بالأعلى.`,

 en: `You are the Quick Air assistant. Scope is airline and travel only (flights, visas, offers, hotels, Quick Air services).

Policy:
- If the user asks about anything outside this scope (sports, politics, coding, etc.), do not answer that topic. Instead reply briefly: "I can help with flights, visas, offers, and hotels for Quick Air."
- Do not use filler like "That's a fun question", "It depends", or "I'm here to help". Do not ask questions unless one specific detail is required to proceed (e.g., travel date or destination).
- Keep answers short and direct (max 2 sentences) with no fluff.

When asked for hotels or flights, list options and prices concisely. If off-topic, use the short redirect line above.`
}

export const LANGUAGE_INSTRUCTIONS = {
 ar: 'أجب باللغة العربية الفصحى فقط في جميع الحالات، حتى لو كتب المستخدم بلغة أخرى. لا تستخدم الإنجليزية إطلاقًا، ولا تعتذر عن اللغة.',
 en: 'Always respond in English only, even if the user writes in another language. Do not use Arabic and do not apologize about language.'
}

export const LANGUAGE_SYSTEM_MESSAGES = {
 ar: 'اللغة: العربية. استخدم العربية الفصحى حصراً. لا تُدرج نصوصاً بلغات أخرى.',
 en: 'Language: English. Use English exclusively. Do not include other languages.'
}

export const EMAIL_TEMPLATES = {
 subject: {
 ar: 'طلب دعم عملاء - Quick Air',
 en: 'Quick Air - Customer Support Request'
 },
 
 generateHtml: (data: {
 userId: string
 name: string
 email: string
 phone: string
 message: string
 }) => `
 <h2>Quick Air - Customer Support Request</h2>
 <p><strong>User ID:</strong> ${data.userId}</p>
 <p><strong>Name:</strong> ${data.name}</p>
 <p><strong>Email:</strong> ${data.email}</p>
 <p><strong>Phone:</strong> ${data.phone}</p>
 <p><strong>Message:</strong></p>
 <p>${data.message.replace(/\n/g, '<br/>')}</p>
 `
}

export const API_ENDPOINTS = {
 GEMINI_CHAT: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent',
 GEMINI_STREAM: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:streamGenerateContent'
} as const
