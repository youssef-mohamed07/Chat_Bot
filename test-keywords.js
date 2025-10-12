// Test the support detection logic
function isSupportRequest(message, lang) {
  const supportKeywords = {
    ar: [
      'خدمة عملاء', 'خدمة العملاء', 'دعم عملاء', 'دعم العملاء',
      'موظف دعم', 'موظف الدعم', 'اتصل بدعم', 'اتصل بالدعم',
      'أريد مساعدة', 'أحتاج مساعدة', 'مساعدة بشرية',
      'تكلم مع موظف', 'تكلم مع موظف دعم', 'موظف بشري',
      'خدمة', 'دعم', 'مساعدة', 'موظف', 'اتصل', 'تكلم'
    ],
    en: [
      'customer support', 'customer service', 'support agent',
      'human agent', 'talk to agent', 'speak to agent',
      'contact support', 'need help', 'want help',
      'human help', 'live agent', 'real person',
      'support', 'help', 'agent', 'human', 'contact'
    ]
  }

  const keywords = supportKeywords[lang]
  
  console.log(`🔍 Checking support keywords for message: "${message}"`)
  console.log(`🔍 Language: ${lang}`)
  console.log(`🔍 Keywords to check:`, keywords)
  
  if (lang === 'ar') {
    const found = keywords.some(keyword => {
      const contains = message.includes(keyword)
      console.log(`🔍 Checking "${keyword}": ${contains}`)
      return contains
    })
    console.log(`🔍 Arabic support detection result: ${found}`)
    return found
  } else {
    const lowerMessage = message.toLowerCase()
    const found = keywords.some(keyword => {
      const contains = lowerMessage.includes(keyword.toLowerCase())
      console.log(`🔍 Checking "${keyword}": ${contains}`)
      return contains
    })
    console.log(`🔍 English support detection result: ${found}`)
    return found
  }
}

// Test cases
console.log('Testing Arabic support detection:')
console.log('Test 1 - "دعم":', isSupportRequest('دعم', 'ar'))
console.log('Test 2 - "خدمة عملاء":', isSupportRequest('خدمة عملاء', 'ar'))
console.log('Test 3 - "أريد مساعدة":', isSupportRequest('أريد مساعدة', 'ar'))

console.log('\nTesting English support detection:')
console.log('Test 1 - "support":', isSupportRequest('support', 'en'))
console.log('Test 2 - "customer support":', isSupportRequest('customer support', 'en'))
console.log('Test 3 - "need help":', isSupportRequest('need help', 'en'))
