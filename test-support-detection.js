// Test script to verify support detection
const testMessages = [
  { message: 'خدمة عملاء', lang: 'ar', expected: true },
  { message: 'أريد مساعدة', lang: 'ar', expected: true },
  { message: 'customer support', lang: 'en', expected: true },
  { message: 'need help', lang: 'en', expected: true },
  { message: 'أريد حجز طيران', lang: 'ar', expected: false },
  { message: 'book a flight', lang: 'en', expected: false },
  { message: 'دعم', lang: 'ar', expected: true },
  { message: 'support', lang: 'en', expected: true }
]

console.log('Testing support detection:')
testMessages.forEach(({ message, lang, expected }) => {
  console.log(`Message: "${message}" (${lang}) - Expected: ${expected}`)
})
