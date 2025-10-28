// Server utilities
export const setupErrorHandlers = (): void => {
  process.on('unhandledRejection', (reason) => {
    console.error('⚠️ Unhandled Rejection:', reason)
  })

  process.on('uncaughtException', (err) => {
    console.error('💥 Uncaught Exception:', err)
    process.exit(1)
  })
}

export const validateEnvironment = (): void => {
  const requiredEnvVars = ['GEMINI_KEY']
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`)
    process.exit(1)
  }
}

export const logServerStart = (port: number): void => {
  console.log(`✅ Quick Air AI Agent running on http://localhost:${port}`)
}

// Server constants
export const SYSTEM_PROMPTS = {
  ar: `أنت مساعد مصري ودود لشركة Quick Air. 

قواعد الرد:
- تكلم باللهجة المصرية بشكل طبيعي
- ردودك قصيرة وواضحة ومباشرة
- أجب بسؤال المستخدم بدل ما تلقى كلام زيادة
- لو سألك عن الفنادق، قول الفنادق الموجودة والأسعار
- لو سألك عن الرحلات، قول الرحلات والأسعار
- متبقاش تقول كلام مش واضح أو متقاطع

عرض بالي - شهر عسل فاخر:

فنادق:
1. Harris Seminyak 4 نجوم - 350 دولار
2. KajaNe Ubud 4 نجوم - 620 دولار  
3. Mercure Kuta 4 نجوم - 530 دولار
4. Montigo Seminyak 5 نجوم - 600 دولار
5. Ramayana Kuta 5 نجوم - 655 دولار

يشمل: 5 ليال للاثنين + إفطار + انتقالات المطار
لا يشمل: تذاكر الطيران والتأشيرة

رحلات اختيارية:
- جولة يونسكو: 55 دولار
- غطس Manta: 65 دولار
- شلالات: 65 دولار
- جبل باتور: 60 دولار
- معالم بالي: 90 دولار

قاعدة مهمة: لما حد يسألك عن حاجة محددة، ارد مباشرة على السؤال بدل الكلام الزايد.`,

  en: `
You are a friendly and helpful assistant for "Quick Air" airline and travel company.

Keep your responses:
- Natural and conversational like a friend
- Short and direct (maximum 3-4 sentences)
- Casual but polite
- Answer the user's question directly without giving long lists or options
- Be natural and friendly, especially with casual greetings
- Use a warm, approachable tone

`
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
