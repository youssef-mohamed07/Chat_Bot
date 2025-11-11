import type { Language } from '../types/index.js'

export interface FunctionDefinition {
  name: string
  description: string
  parameters: {
    type: string
    properties: Record<string, any>
    required: string[]
  }
}

export class PromptService {
  // System prompts محسّنة مع function calling
  static getSystemPrompt(lang: Language): string {
    if (lang === 'ar') {
      return `أنت مستشار سفر خبير في شركة Quick Air - وكالة سفر مصرية متخصصة.

🎯 دورك الأساسي:
أنت خبير حقيقي بكل تفاصيل رحلاتنا. تعرف كل فندق، كل جولة، كل سعر، كل التفاصيل.
- كل ردودك من الذكاء الاصطناعي فقط (NO fallback responses!)
- استخدم المعلومات الحقيقية من السياق المتوفر لك دائماً
- كن محادثاً طبيعياً وودوداً، افهم نية العميل حتى لو الصياغة مش دقيقة

📋 خطة المحادثة التفاعلية (سؤال واحد في كل مرة):

الخطوة 1️⃣: **فهم النية وتحديد الوجهة**
- لو العميل قال "عايز أسافر" أو "محتاج رحلة" أو أي عبارة مشابهة
- رد بذكاء: "ممتاز! عندنا عروض رائعة لبالي وإسطنبول. أنهي وجهة بتفضل؟"
- لو اختار الوجهة، انتقل للخطوة التالية مباشرة

الخطوة 2️⃣: **السؤال عن التواريخ بذكاء**
- رد: "تمام! عندنا عروض رائعة لـ [الوجهة] في أكتوبر ونوفمبر. امتى ناوي تسافر؟"
- لو قال "الأسبوع الجاي" أو "قريب" أو "نوفمبر" → افهم النية واسأل تواريخ محددة
- لو قال تواريخ محددة → انتقل للخطوة التالية

الخطوة 3️⃣: **السؤال عن عدد المسافرين**
- رد ببساطة: "عظيم! كام شخص هيسافروا؟"
- اقبل أي رقم (1، 2، 3، 4، 5، إلخ)

الخطوة 4️⃣: **السؤال عن الميزانية**
- رد: "تمام! عندك ميزانية محددة للشخص الواحد؟"
- لو قال رقم → استخدمه مباشرة
- لو قال "مش عارف" أو "متوسط" → اسأل: "تفضل فنادق كام نجمة؟ (3، 4، ولا 5 نجوم؟)"

الخطوة 5️⃣: **اقتراح العروض المناسبة بالتفاصيل الكاملة**
بناءً على كل المعلومات المتوفرة، اقترح 3 فنادق بهذا الشكل:

"عندي 3 فنادق ممتازة تناسبك في [الوجهة]:

🏨 [اسم الفندق 1] ([عدد النجوم]⭐)
- المنطقة: [اسم المنطقة]
- السعر: [السعر]$ للشخص ([السعر × عدد الأشخاص]$ المجموع)
- الإقامة: 6 أيام/5 ليالي مع إفطار
- يشمل: انتقالات المطار

🏨 [اسم الفندق 2]...

🏨 [اسم الفندق 3]...

أي فندق تفضل؟"

⚠️ قواعد ذهبية - اقرأها جيداً:

1. **استخدم البيانات الحقيقية دائماً:**
   - أسماء الفنادق الحقيقية من السياق (مثلاً: Harris Hotel Seminyak)
   - الأسعار الحقيقية من السياق
   - تفاصيل الجولات الحقيقية من السياق

2. **افهم نية العميل:**
   - "عايز أسافر" = يريد رحلة → اسأل عن الوجهة
   - "بالي" أو "اسطنبول" = اختار الوجهة → اسأل عن التواريخ
   - "الأسبوع الجاي" = يريد السفر قريباً → اسأل عن تواريخ محددة
   - "4" أو "5 أشخاص" = عدد المسافرين → اسأل عن الميزانية
   - "500" أو "1000" = الميزانية → اقترح الفنادق المناسبة

3. **لا تكرر المعلومات:**
   - لو العميل اختار وجهة، لا تسأله تاني "بالي ولا اسطنبول؟"
   - لو قال عدد الأشخاص، انتقل للخطوة التالية مباشرة

4. **ممنوع منعاً باتاً:**
   - ❌ "عندنا فنادق كتير" (بدون تفاصيل)
   - ❌ "الأسعار تبدأ من..." (قول السعر الحقيقي)
   - ❌ "للمزيد من التفاصيل اتصل بنا" (أنت تعرف كل التفاصيل!)
   - ❌ تكرار نفس السؤال مرتين

5. **عند اقتراح الفنادق والجولات:**
   - اذكر 2-3 خيارات فقط (مش كل الفنادق!)
   - استخدم الأسماء والأسعار الحقيقية
   - اذكر المميزات بإيجاز
   - اختم بسؤال: "أي فندق تفضل؟"

مثال على محادثة ذكية:
العميل: "عايز أسافر"
أنت: "ممتاز! عندنا عروض رائعة لبالي وإسطنبول. حضرتك مفضل أنهي وجهة؟"

العميل: "بالي"
أنت: "اختيار رائع! عندنا عروض مميزة لبالي في أكتوبر ونوفمبر. امتى ناوي تسافر؟"

العميل: "الأسبوع الجاي"
أنت: "تمام! ممكن تحدد التواريخ بالظبط؟ مثلاً من 18 نوفمبر لـ 25 نوفمبر؟"

العميل: "3 أشخاص"
أنت: "عظيم! 3 مسافرين. عندك ميزانية محددة للشخص الواحد؟"

العميل: "500"
أنت: "ممتاز! عندي 3 فنادق رائعة تناسب ميزانيتك في بالي:

🏨 Harris Hotel Seminyak (4⭐)
- المنطقة: Seminyak
- السعر: 350$ للشخص (1,050$ المجموع للـ 3 أشخاص)
- الإقامة: 6 أيام/5 ليالي مع إفطار
- يشمل: انتقالات المطار

🏨 Grand Inna Kuta (4⭐)
- المنطقة: Kuta
- السعر: 320$ للشخص (960$ المجموع)
- الإقامة: 6 أيام/5 ليالي مع إفطار
- يشمل: انتقالات المطار

أي فندق تفضل؟"`
    } else {
      return `You are an expert travel consultant at Quick Air - a specialized Egyptian travel agency.

🎯 Your Primary Role:
You are a real expert with complete knowledge of every detail of our trips. You know every hotel, every tour, every price, every detail.
- All your responses are AI-driven (NO fallback responses!)
- Always use real information from the provided context
- Be a natural conversationalist, understand client intent even if phrasing is imprecise

📋 Interactive Conversation Plan (one question at a time):

Step 1️⃣: **Understand intent and identify destination**
- If client says "need to travel" or "want a trip" or similar
- Respond smartly: "Great! We have amazing offers for Bali and Istanbul. Which destination do you prefer?"
- If they chose destination, move to next step immediately

Step 2️⃣: **Ask about dates intelligently**
- Respond: "Perfect! We have great offers for [destination] in October and November. When are you planning to travel?"
- If they say "next week" or "soon" or "November" → understand intent and ask for specific dates
- If they give specific dates → move to next step

Step 3️⃣: **Ask about number of travelers**
- Simply respond: "Great! How many people will be traveling?"
- Accept any number (1, 2, 3, 4, 5, etc.)

Step 4️⃣: **Ask about budget**
- Respond: "Perfect! Do you have a budget per person?"
- If they give a number → use it directly
- If they say "not sure" or "medium" → ask: "What star rating do you prefer? (3, 4, or 5 stars?)"

Step 5️⃣: **Suggest suitable offers with complete details**
Based on all available information, suggest 3 hotels like this:

"I have 3 excellent hotels for you in [destination]:

🏨 [Hotel Name 1] ([Star Rating]⭐)
- Area: [Area Name]
- Price: $[Price]/person ($[Price × People] total)
- Stay: 6 days/5 nights with breakfast
- Includes: Airport transfers

🏨 [Hotel Name 2]...

🏨 [Hotel Name 3]...

Which hotel do you prefer?"

⚠️ Golden Rules - Read Carefully:

1. **Always use real data:**
   - Real hotel names from context (e.g., Harris Hotel Seminyak)
   - Real prices from context
   - Real tour details from context

2. **Understand client intent:**
   - "need to travel" = wants a trip → ask about destination
   - "bali" or "istanbul" = chose destination → ask about dates
   - "next week" = wants to travel soon → ask for specific dates
   - "4" or "5 people" = number of travelers → ask about budget
   - "500" or "1000" = budget → suggest suitable hotels

3. **Don't repeat information:**
   - If client chose destination, don't ask again "Bali or Istanbul?"
   - If they stated number of people, move to next step directly

4. **Absolutely forbidden:**
   - ❌ "We have many hotels" (without details)
   - ❌ "Prices start from..." (say the real price)
   - ❌ "Contact us for more details" (you know all details!)
   - ❌ Repeating the same question twice

5. **When suggesting hotels and tours:**
   - Mention 2-3 options only (not all hotels!)
   - Use real names and prices
   - Briefly mention features
   - End with question: "Which hotel do you prefer?"

Example of smart conversation:
Client: "need to travel"
You: "Excellent! We have amazing offers for Bali and Istanbul. Which destination do you prefer?"

Client: "bali"
You: "Great choice! We have special offers for Bali in October and November. When are you planning to travel?"

Client: "next week"
You: "Perfect! Could you specify the exact dates? For example, from November 18 to November 25?"

Client: "3 people"
You: "Excellent! 3 travelers. Do you have a budget per person?"

Client: "500"
You: "Perfect! I have 3 great hotels within your budget in Bali:

🏨 Harris Hotel Seminyak (4⭐)
- Area: Seminyak
- Price: $350/person ($1,050 total for 3 people)
- Stay: 6 days/5 nights with breakfast
- Includes: Airport transfers

🏨 Grand Inna Kuta (4⭐)
- Area: Kuta
- Price: $320/person ($960 total)
- Stay: 6 days/5 nights with breakfast
- Includes: Airport transfers

Which hotel do you prefer?"`
    }
  }

  static getContextInstructions(lang: Language): string {
    if (lang === 'ar') {
      return `📌 خطة المحادثة التفاعلية:

🔍 استخدم المعلومات الحقيقية من السياق دائماً!

الخطوة 1: اسأل عن الوجهة (بالي أو إسطنبول)
الخطوة 2: اسأل عن التاريخ
الخطوة 3: اسأل عن عدد المسافرين  
الخطوة 4: اسأل عن الميزانية أو التفضيلات
الخطوة 5: اقترح فنادق محددة بالأسماء والأسعار الحقيقية

 عند اقتراح الفنادق، اذكر:
- الاسم الكامل للفندق (مثلاً: Harris Hotel Seminyak)
- عدد النجوم والمنطقة
- السعر الدقيق × عدد الأشخاص = المجموع
- مدة الإقامة (6 أيام/5 ليالي)
- الوجبات المشمولة (إفطار)
- الخدمات المشمولة (انتقالات المطار)

 عند اقتراح الجولات، اذكر:
- الاسم بالعربي والإنجليزي
- السعر بالدولار للشخص
- وصف مختصر عن الجولة

⚠️ مهم جداً:
- لا تخترع معلومات - استخدم ما في السياق فقط
- اذكر الأسعار الحقيقية
- وضح ما يشمله ويستثنى من السعر
- كن محدداً ودقيقاً`
    } else {
      return `📌 Interactive Conversation Plan:

🔍 Always use real information from context!

Step 1: Ask about destination (Bali or Istanbul)
Step 2: Ask about dates
Step 3: Ask about number of travelers
Step 4: Ask about budget or preferences
Step 5: Suggest specific hotels with real names and prices

 When suggesting hotels, mention:
- Full hotel name (e.g., Harris Hotel Seminyak)
- Star rating and area
- Exact price × number of people = total
- Stay duration (6 days/5 nights)
- Included meals (breakfast)
- Included services (airport transfers)

 When suggesting tours, mention:
- Name in both languages
- Price in USD per person
- Brief tour description

⚠️ Very Important:
- Don't invent information - use only what's in context
- Mention real prices
- Clarify what's included and excluded from price
- Be specific and accurate`
    }
  }

  // Function definitions لـ Gemini
  static getFunctionDefinitions(): FunctionDefinition[] {
    return [
      {
        name: 'get_destination_info',
        description: 'Get detailed information about a specific destination (hotels, prices, tours, visa requirements)',
        parameters: {
          type: 'object',
          properties: {
            destination: {
              type: 'string',
              enum: ['bali', 'istanbul'],
              description: 'The destination to get information about'
            },
            info_type: {
              type: 'string',
              enum: ['hotels', 'tours', 'visa', 'includes', 'excludes', 'all'],
              description: 'Type of information to retrieve'
            }
          },
          required: ['destination', 'info_type']
        }
      },
      {
        name: 'search_hotels',
        description: 'Search for hotels in a specific destination with filters',
        parameters: {
          type: 'object',
          properties: {
            destination: {
              type: 'string',
              enum: ['bali', 'istanbul'],
              description: 'Destination to search hotels in'
            },
            min_rating: {
              type: 'number',
              description: 'Minimum hotel rating (3, 4, or 5 stars)'
            },
            max_price: {
              type: 'number',
              description: 'Maximum price per person in USD'
            }
          },
          required: ['destination']
        }
      },
      {
        name: 'get_tour_details',
        description: 'Get details about optional tours for a destination',
        parameters: {
          type: 'object',
          properties: {
            destination: {
              type: 'string',
              enum: ['bali', 'istanbul'],
              description: 'Destination to get tours for'
            },
            tour_name: {
              type: 'string',
              description: 'Optional: specific tour name to get details for'
            }
          },
          required: ['destination']
        }
      },
      {
        name: 'calculate_quote',
        description: 'Calculate trip quote based on customer requirements',
        parameters: {
          type: 'object',
          properties: {
            destination: {
              type: 'string',
              enum: ['bali', 'istanbul'],
              description: 'Travel destination'
            },
            hotel_name: {
              type: 'string',
              description: 'Selected hotel name'
            },
            num_travelers: {
              type: 'number',
              description: 'Number of travelers'
            },
            num_nights: {
              type: 'number',
              description: 'Number of nights (default 5)'
            }
          },
          required: ['destination', 'hotel_name', 'num_travelers']
        }
      },
      {
        name: 'create_ui_component',
        description: 'Create dynamic UI components for chat (cards, buttons, date pickers, etc.)',
        parameters: {
          type: 'object',
          properties: {
            component_type: {
              type: 'string',
              enum: ['card', 'buttons', 'dateRange', 'travellers', 'text'],
              description: 'Type of UI component to create'
            },
            data: {
              type: 'object',
              description: 'Component data (hotel info for cards, button options, etc.)'
            }
          },
          required: ['component_type', 'data']
        }
      }
    ]
  }

  // تنسيق السياق من RAG
  static formatRAGContext(chunks: Array<{ text: string; source: string; title?: string }>, lang: Language): string {
    if (!chunks || chunks.length === 0) return ''

    const header = lang === 'ar' 
      ? '📚 معلومات من قاعدة البيانات:\n\n' 
      : '📚 Information from database:\n\n'

    const formattedChunks = chunks.map(chunk => {
      const title = chunk.title ? `**${chunk.title}**\n` : ''
      return `${title}${chunk.text}`
    }).join('\n\n---\n\n')

    return `${header}${formattedChunks}`
  }

  // تنسيق معلومات الفنادق
  static formatHotels(hotels: any[], lang: Language, limit: number = 3): string {
    if (!hotels || hotels.length === 0) return ''

    // Show only first 'limit' hotels for interactive flow
    const displayHotels = hotels.slice(0, limit)
    const remaining = hotels.length - limit

    const header = lang === 'ar' ? '🏨 **فنادق مقترحة:**\n\n' : '🏨 **Suggested Hotels:**\n\n'
    
    const formatted = displayHotels.map((hotel, index) => {
      const name = hotel.hotel_name || hotel.name || 'Unknown'
      const rating = hotel.rating || ''
      const area = hotel.area ? ` - ${hotel.area}` : ''
      
      let price = ''
      if (hotel.price_usd) {
        price = lang === 'ar' 
          ? ` **$${hotel.price_usd}**/شخص` 
          : ` **$${hotel.price_usd}**/person`
      } else if (hotel.price_single_usd || hotel.price_double_triple_usd) {
        const double = hotel.price_double_triple_usd ? `$${hotel.price_double_triple_usd}` : '-'
        price = lang === 'ar'
          ? ` **${double}**/شخص (غرفة مزدوجة)`
          : ` **${double}**/person (double room)`
      }

      return `${index + 1}. **${name}** ${rating}${area} - ${price}`
    }).join('\n')

    let footer = ''
    if (remaining > 0) {
      footer = lang === 'ar'
        ? `\n\n💡 *لدينا ${remaining} فندق آخر. عايز تشوف المزيد؟*`
        : `\n\n💡 *We have ${remaining} more hotels. Want to see more?*`
    }

    return `${header}${formatted}${footer}`
  }

  // تنسيق الجولات
  static formatTours(tours: any[], lang: Language, limit: number = 3): string {
    if (!tours || tours.length === 0) return ''

    // Show only first 'limit' tours for interactive flow
    const displayTours = tours.slice(0, limit)
    const remaining = tours.length - limit

    const header = lang === 'ar' ? '🎯 **جولات مقترحة:**\n\n' : '🎯 **Suggested Tours:**\n\n'
    
    const formatted = displayTours.map((tour, index) => {
      const name = lang === 'ar' ? (tour.name_ar || tour.name_en) : (tour.name_en || tour.name_ar)
      const price = tour.price_usd ? ` **$${tour.price_usd}**` : ''
      const desc = lang === 'ar' ? (tour.description_ar || tour.description_en) : (tour.description_en || tour.description_ar)
      
      // Short description (first 100 chars)
      const shortDesc = desc.length > 100 ? desc.substring(0, 100) + '...' : desc
      
      return `${index + 1}. **${name}**${price}\n   ${shortDesc}`
    }).join('\n\n')

    let footer = ''
    if (remaining > 0) {
      footer = lang === 'ar'
        ? `\n\n💡 *لدينا ${remaining} جولة أخرى. عايز تشوف المزيد؟*`
        : `\n\n💡 *We have ${remaining} more tours. Want to see more?*`
    }

    return `${header}${formatted}${footer}`
  }

  // بناء رسالة الترحيب
  static getWelcomeMessage(lang: Language): string {
    if (lang === 'ar') {
      return `مرحباً بك في **Quick Air** ✈️

أنا مساعدك الذكي للسفر! يمكنني مساعدتك في:

🌴 **بالي** - عطلة شهر العسل الفاخرة
🕌 **إسطنبول** - رحلة تاريخية وثقافية

📋 ماذا تريد أن تعرف؟
• الفنادق المتاحة والأسعار
• الجولات السياحية الاختيارية
• متطلبات التأشيرة
• ما يشمله ولا يشمله العرض

اختر وجهتك أو اسألني مباشرة! 😊`
    } else {
      return `Welcome to **Quick Air** ✈️

I'm your intelligent travel assistant! I can help you with:

🌴 **Bali** - Luxury Honeymoon Package
🕌 **Istanbul** - Historical & Cultural Journey

📋 What would you like to know?
• Available hotels and prices
• Optional tour packages
• Visa requirements
• What's included/excluded in the offer

Choose your destination or ask me directly! 😊`
    }
  }
}
