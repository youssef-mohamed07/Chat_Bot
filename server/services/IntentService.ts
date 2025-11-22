import { logger } from '../utils/logger.js';

export interface Intent {
  type: IntentType;
  confidence: number;
  entities: Entities;
  suggestions: string[];
}

export type IntentType =
  | 'greeting'
  | 'search_hotels'
  | 'price_inquiry'
  | 'hotel_comparison'
  | 'booking_request'
  | 'location_inquiry'
  | 'amenities_inquiry'
  | 'help_request'
  | 'date_change'
  | 'budget_inquiry'
  | 'recommendation_request'
  | 'general_question'
  | 'unknown';

export interface Entities {
  destination?: string;
  hotelName?: string;
  hotelNames?: string[];
  stars?: number;
  priceRange?: { min?: number; max?: number };
  dates?: { start?: string; end?: string };
  travelers?: number;
  budget?: number;
  mealPlan?: string;
  roomType?: string;
  amenities?: string[];
  language?: 'ar' | 'en';
}

export class IntentService {
  private static instance: IntentService;

  private constructor() {}

  public static getInstance(): IntentService {
    if (!IntentService.instance) {
      IntentService.instance = new IntentService();
    }
    return IntentService.instance;
  }

  /**
   * تحليل رسالة المستخدم لاستخراج النية والكيانات
   */
  public analyzeMessage(message: string, conversationContext?: any): Intent {
    const normalizedMessage = message.toLowerCase().trim();
    
    // استخراج اللغة
    const language = this.detectLanguage(message);
    
    // استخراج الكيانات أولاً
    const entities = this.extractEntities(normalizedMessage, conversationContext);
    entities.language = language;

    // تحديد النية بناءً على الكلمات المفتاحية والكيانات
    const intent = this.detectIntent(normalizedMessage, entities, conversationContext);
    
    // توليد اقتراحات بناءً على النية
    const suggestions = this.generateSuggestions(intent.type, entities, language);

    logger.info('Intent', `Detected: ${intent.type} (${(intent.confidence * 100).toFixed(0)}%)`, { entities });

    return {
      type: intent.type,
      confidence: intent.confidence,
      entities,
      suggestions
    };
  }

  /**
   * كشف اللغة المستخدمة
   */
  private detectLanguage(message: string): 'ar' | 'en' {
    const arabicPattern = /[\u0600-\u06FF]/;
    return arabicPattern.test(message) ? 'ar' : 'en';
  }

  /**
   * تحديد نوع النية
   */
  private detectIntent(
    message: string,
    entities: Entities,
    context?: any
  ): { type: IntentType; confidence: number } {
    let maxScore = 0;
    let detectedIntent: IntentType = 'unknown';

    // قواعد كشف النوايا مع النقاط
    const intentPatterns: Array<{
      type: IntentType;
      patterns: RegExp[];
      requiredEntities?: (keyof Entities)[];
      contextualBoost?: (ctx: any) => number;
    }> = [
      {
        type: 'greeting',
        patterns: [
          /^(مرحب|هلا|اهلا|السلام|صباح|مساء|hello|hi|hey|good morning|good evening)/i,
        ],
      },
      {
        type: 'search_hotels',
        patterns: [
          /(عايز|ابحث|ابغى|اريد|بدي|looking for|search|find|show me).*(فندق|فنادق|hotel)/i,
          /(فندق|فنادق|hotel).*(في|at|in)/i,
          /عرض.*الفنادق/i,
        ],
      },
      {
        type: 'price_inquiry',
        patterns: [
          /(كام|كم|بكام|بكم|سعر|تكلفة|أسعار|how much|price|cost)/i,
          /(الأسعار|prices|pricing)/i,
        ],
        contextualBoost: (ctx) => (ctx?.selectedHotel ? 0.3 : 0),
      },
      {
        type: 'hotel_comparison',
        patterns: [
          /(قارن|مقارنة|compare|vs|versus|الفرق بين)/i,
        ],
        requiredEntities: ['hotelNames'],
      },
      {
        type: 'booking_request',
        patterns: [
          /(احجز|حجز|book|reserve|reservation|confirm)/i,
        ],
      },
      {
        type: 'location_inquiry',
        patterns: [
          /(فين|وين|where|موقع|مكان|location|area)/i,
        ],
      },
      {
        type: 'amenities_inquiry',
        patterns: [
          /(مرافق|خدمات|facilities|amenities|services)/i,
          /(حمام سباحة|pool|شاطئ|beach|مطعم|restaurant)/i,
        ],
      },
      {
        type: 'help_request',
        patterns: [
          /(مساعدة|ساعد|help|assist|support)/i,
        ],
      },
      {
        type: 'date_change',
        patterns: [
          /(غير|تغيير|change|modify).*(التاريخ|الموعد|date)/i,
          /(بدل|instead).*(التاريخ|date)/i,
        ],
      },
      {
        type: 'budget_inquiry',
        patterns: [
          /(ميزانية|budget|في حدود|within|maximum|max)/i,
        ],
      },
      {
        type: 'recommendation_request',
        patterns: [
          /(اقترح|انصح|recommend|suggest|best|أفضل|احسن)/i,
        ],
      },
      {
        type: 'general_question',
        patterns: [
          /(ايه|شو|what|which|when|متى|كيف|how)/i,
        ],
      },
    ];

    for (const intentPattern of intentPatterns) {
      let score = 0;

      // فحص الأنماط
      for (const pattern of intentPattern.patterns) {
        if (pattern.test(message)) {
          score += 0.5;
        }
      }

      // فحص الكيانات المطلوبة
      if (intentPattern.requiredEntities) {
        const hasAllEntities = intentPattern.requiredEntities.every(
          (entity) => entities[entity] !== undefined && entities[entity] !== null
        );
        if (hasAllEntities) {
          score += 0.3;
        } else if (score > 0) {
          score -= 0.2; // تقليل النقاط إذا كانت هناك أنماط لكن كيانات ناقصة
        }
      }

      // دعم السياق
      if (intentPattern.contextualBoost && context) {
        score += intentPattern.contextualBoost(context);
      }

      // تحديث النية إذا كانت النقاط أعلى
      if (score > maxScore) {
        maxScore = score;
        detectedIntent = intentPattern.type;
      }
    }

    // حساب الثقة (0-1)
    const confidence = Math.min(maxScore, 1.0);

    // إذا كانت الثقة منخفضة جداً، نرجع unknown
    if (confidence < 0.3) {
      return { type: 'unknown', confidence };
    }

    return { type: detectedIntent, confidence };
  }

  /**
   * استخراج الكيانات من الرسالة
   */
  private extractEntities(message: string, context?: any): Entities {
    const entities: Entities = {};

    // استخراج الوجهات
    entities.destination = this.extractDestination(message);

    // استخراج أسماء الفنادق
    const hotelExtraction = this.extractHotelNames(message);
    if (hotelExtraction.single) {
      entities.hotelName = hotelExtraction.single;
    }
    if (hotelExtraction.multiple && hotelExtraction.multiple.length > 0) {
      entities.hotelNames = hotelExtraction.multiple;
    }

    // استخراج عدد النجوم
    entities.stars = this.extractStars(message);

    // استخراج نطاق السعر
    entities.priceRange = this.extractPriceRange(message);

    // استخراج التواريخ
    entities.dates = this.extractDates(message);

    // استخراج عدد المسافرين
    entities.travelers = this.extractTravelers(message);

    // استخراج الميزانية
    entities.budget = this.extractBudget(message);

    // استخراج نوع الوجبة
    entities.mealPlan = this.extractMealPlan(message);

    // استخراج نوع الغرفة
    entities.roomType = this.extractRoomType(message);

    // استخراج المرافق
    entities.amenities = this.extractAmenities(message);

    // استخدام السياق للإشارات الضمنية
    if (context) {
      if (!entities.destination && context.lastDest) {
        entities.destination = context.lastDest;
      }
      if (!entities.hotelName && context.selectedHotel) {
        entities.hotelName = context.selectedHotel;
      }
    }

    return entities;
  }

  /**
   * استخراج الوجهة
   */
  private extractDestination(message: string): string | undefined {
    const destinations = [
      { name: 'Sharm El Sheikh', patterns: ['شرم', 'شرم الشيخ', 'sharm'] },
      { name: 'Hurghada', patterns: ['الغردقة', 'غردقة', 'hurghada'] },
      { name: 'Dahab', patterns: ['دهب', 'dahab'] },
      { name: 'Ain Sokhna', patterns: ['العين السخنة', 'عين سخنة', 'ain sokhna', 'sokhna'] },
      { name: 'Sahl Hasheesh', patterns: ['سهل حشيش', 'sahl hasheesh', 'hasheesh'] },
      { name: 'Istanbul', patterns: ['اسطنبول', 'istanbul'] },
      { name: 'Bali', patterns: ['بالي', 'bali'] },
      { name: 'Beirut', patterns: ['بيروت', 'beirut'] },
    ];

    for (const dest of destinations) {
      for (const pattern of dest.patterns) {
        if (message.includes(pattern.toLowerCase())) {
          return dest.name;
        }
      }
    }

    return undefined;
  }

  /**
   * استخراج أسماء الفنادق
   */
  private extractHotelNames(message: string): { single?: string; multiple?: string[] } {
    const hotelKeywords = ['hotel', 'فندق', 'resort', 'منتجع'];
    
    // بحث عن أسماء فنادق شهيرة
    const knownHotels = [
      'movenpick', 'موفنبيك',
      'hilton', 'هيلتون',
      'sheraton', 'شيراتون',
      'marriott', 'ماريوت',
      'intercontinental',
      'albatros', 'الباتروس',
      'pickalbatros',
      'sunrise',
      'jaz',
      'cleopatra', 'كليوباترا',
      'dreams',
      'xperience',
      'charmillion',
      'concorde',
      'parrotel',
      'tamra',
      'marina',
    ];

    const foundHotels: string[] = [];

    for (const hotel of knownHotels) {
      if (message.includes(hotel.toLowerCase())) {
        foundHotels.push(hotel);
      }
    }

    // إذا تم العثور على "vs" أو "و" بين فندقين
    const comparisonPattern = /([\w\s]+)\s+(vs|versus|و|مقابل)\s+([\w\s]+)/i;
    const comparisonMatch = message.match(comparisonPattern);
    
    if (comparisonMatch && foundHotels.length >= 2) {
      return { multiple: foundHotels.slice(0, 2) };
    }

    if (foundHotels.length === 1) {
      return { single: foundHotels[0] };
    } else if (foundHotels.length > 1) {
      return { multiple: foundHotels };
    }

    return {};
  }

  /**
   * استخراج عدد النجوم
   */
  private extractStars(message: string): number | undefined {
    const starsPatterns = [
      /(\d)\s*(?:نجوم|نجمة|stars?)/i,
      /(\d)\s*(?:\*|★)/,
    ];

    for (const pattern of starsPatterns) {
      const match = message.match(pattern);
      if (match) {
        const stars = parseInt(match[1]);
        if (stars >= 1 && stars <= 5) {
          return stars;
        }
      }
    }

    return undefined;
  }

  /**
   * استخراج نطاق السعر
   */
  private extractPriceRange(message: string): { min?: number; max?: number } | undefined {
    const priceRange: { min?: number; max?: number } = {};

    // نمط: "من 5000 إلى 10000"
    const rangePattern = /(?:من|from)\s*(\d+)\s*(?:إلى|الى|to|[-–])\s*(\d+)/i;
    const rangeMatch = message.match(rangePattern);
    
    if (rangeMatch) {
      priceRange.min = parseInt(rangeMatch[1]);
      priceRange.max = parseInt(rangeMatch[2]);
      return priceRange;
    }

    // نمط: "أقل من 10000" أو "تحت 10000"
    const maxPattern = /(?:أقل من|اقل من|تحت|under|less than|below|maximum|max)\s*(\d+)/i;
    const maxMatch = message.match(maxPattern);
    
    if (maxMatch) {
      priceRange.max = parseInt(maxMatch[1]);
      return priceRange;
    }

    // نمط: "أكثر من 5000" أو "فوق 5000"
    const minPattern = /(?:أكثر من|اكثر من|فوق|above|more than|over|minimum|min)\s*(\d+)/i;
    const minMatch = message.match(minPattern);
    
    if (minMatch) {
      priceRange.min = parseInt(minMatch[1]);
      return priceRange;
    }

    // نمط: "في حدود 8000" أو "حوالي 8000"
    const aroundPattern = /(?:في حدود|حوالي|تقريبا|around|about|approximately)\s*(\d+)/i;
    const aroundMatch = message.match(aroundPattern);
    
    if (aroundMatch) {
      const price = parseInt(aroundMatch[1]);
      priceRange.min = price * 0.8;
      priceRange.max = price * 1.2;
      return priceRange;
    }

    return Object.keys(priceRange).length > 0 ? priceRange : undefined;
  }

  /**
   * استخراج التواريخ
   */
  private extractDates(message: string): { start?: string; end?: string } | undefined {
    const dates: { start?: string; end?: string } = {};

    // نمط: أرقام التواريخ (مثل: 15/11 أو 15-11)
    const datePattern = /(\d{1,2})[\/\-](\d{1,2})/g;
    const dateMatches = Array.from(message.matchAll(datePattern));

    if (dateMatches.length >= 1) {
      dates.start = dateMatches[0][0];
      if (dateMatches.length >= 2) {
        dates.end = dateMatches[1][0];
      }
    }

    // نمط: أسماء الأشهر
    const months = {
      ar: ['يناير', 'فبراير', 'مارس', 'ابريل', 'مايو', 'يونيو', 'يوليو', 'اغسطس', 'سبتمبر', 'اكتوبر', 'نوفمبر', 'ديسمبر'],
      en: ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'],
    };

    for (let i = 0; i < months.ar.length; i++) {
      if (message.includes(months.ar[i]) || message.includes(months.en[i])) {
        dates.start = months.en[i];
        break;
      }
    }

    return Object.keys(dates).length > 0 ? dates : undefined;
  }

  /**
   * استخراج عدد المسافرين
   */
  private extractTravelers(message: string): number | undefined {
    const travelersPatterns = [
      /(\d+)\s*(?:أشخاص|شخص|persons?|people|travelers?|guests?)/i,
      /(?:عائلة|family)\s*(?:من)?\s*(\d+)/i,
    ];

    for (const pattern of travelersPatterns) {
      const match = message.match(pattern);
      if (match) {
        return parseInt(match[1]);
      }
    }

    // كلمات مفتاحية خاصة
    if (/(زوجين|couple|اثنين|2)/i.test(message)) return 2;
    if (/(عائلة|family)/i.test(message)) return 4;
    if (/(مجموعة|group)/i.test(message)) return 6;

    return undefined;
  }

  /**
   * استخراج الميزانية
   */
  private extractBudget(message: string): number | undefined {
    const budgetPattern = /(?:ميزانية|budget)\s*(?:من|of)?\s*(\d+)/i;
    const match = message.match(budgetPattern);
    
    if (match) {
      return parseInt(match[1]);
    }

    return undefined;
  }

  /**
   * استخراج نوع الوجبة
   */
  private extractMealPlan(message: string): string | undefined {
    const mealPlans = [
      { code: 'AI', patterns: ['all inclusive', 'شامل', 'شامل كل شيء', 'الشامل'] },
      { code: 'FB', patterns: ['full board', 'فطار وغدا وعشا', 'ثلاث وجبات'] },
      { code: 'HB', patterns: ['half board', 'فطار وغدا', 'نص شامل', 'وجبتين'] },
      { code: 'BB', patterns: ['bed and breakfast', 'فطار فقط', 'الفطار'] },
    ];

    for (const plan of mealPlans) {
      for (const pattern of plan.patterns) {
        if (message.includes(pattern.toLowerCase())) {
          return plan.code;
        }
      }
    }

    return undefined;
  }

  /**
   * استخراج نوع الغرفة
   */
  private extractRoomType(message: string): string | undefined {
    const roomTypes = [
      { code: 'single', patterns: ['single', 'فردي', 'فردية', 'شخص واحد'] },
      { code: 'double', patterns: ['double', 'مزدوج', 'مزدوجة', 'شخصين'] },
      { code: 'triple', patterns: ['triple', 'ثلاثي', 'ثلاثية', 'ثلاث اشخاص'] },
      { code: 'family', patterns: ['family', 'عائلية', 'عائلي'] },
    ];

    for (const room of roomTypes) {
      for (const pattern of room.patterns) {
        if (message.includes(pattern.toLowerCase())) {
          return room.code;
        }
      }
    }

    return undefined;
  }

  /**
   * استخراج المرافق المطلوبة
   */
  private extractAmenities(message: string): string[] | undefined {
    const amenitiesList = [
      { name: 'pool', patterns: ['pool', 'حمام سباحة', 'مسبح'] },
      { name: 'beach', patterns: ['beach', 'شاطئ', 'بحر'] },
      { name: 'spa', patterns: ['spa', 'سبا', 'مساج'] },
      { name: 'gym', patterns: ['gym', 'جيم', 'رياضة', 'fitness'] },
      { name: 'wifi', patterns: ['wifi', 'واي فاي', 'انترنت', 'internet'] },
      { name: 'restaurant', patterns: ['restaurant', 'مطعم', 'dining'] },
      { name: 'kids_club', patterns: ['kids club', 'نادي اطفال', 'children'] },
      { name: 'water_park', patterns: ['water park', 'مدينة مائية', 'aqua park'] },
    ];

    const foundAmenities: string[] = [];

    for (const amenity of amenitiesList) {
      for (const pattern of amenity.patterns) {
        if (message.includes(pattern.toLowerCase())) {
          foundAmenities.push(amenity.name);
          break;
        }
      }
    }

    return foundAmenities.length > 0 ? foundAmenities : undefined;
  }

  /**
   * توليد اقتراحات بناءً على النية
   */
  private generateSuggestions(
    intent: IntentType,
    entities: Entities,
    language: 'ar' | 'en'
  ): string[] {
    const suggestions: Record<IntentType, { ar: string[]; en: string[] }> = {
      greeting: {
        ar: ['ابحث عن فندق', 'عرض العروض المتاحة', 'أفضل الفنادق'],
        en: ['Search for hotels', 'Show available offers', 'Best hotels'],
      },
      search_hotels: {
        ar: ['فنادق 5 نجوم', 'فنادق شرم الشيخ', 'أرخص الأسعار'],
        en: ['5-star hotels', 'Sharm El Sheikh hotels', 'Cheapest prices'],
      },
      price_inquiry: {
        ar: ['مقارنة الأسعار', 'أسعار نوفمبر', 'عروض خاصة'],
        en: ['Compare prices', 'November prices', 'Special offers'],
      },
      hotel_comparison: {
        ar: ['تفاصيل الفنادق', 'الفروقات بين الفنادق', 'أيهما أفضل'],
        en: ['Hotel details', 'Differences', 'Which is better'],
      },
      booking_request: {
        ar: ['تأكيد الحجز', 'تفاصيل التواصل', 'طرق الدفع'],
        en: ['Confirm booking', 'Contact details', 'Payment methods'],
      },
      location_inquiry: {
        ar: ['الموقع على الخريطة', 'المسافة من المطار', 'معالم قريبة'],
        en: ['Location on map', 'Distance from airport', 'Nearby landmarks'],
      },
      amenities_inquiry: {
        ar: ['المرافق المتاحة', 'الخدمات الإضافية', 'أنشطة الفندق'],
        en: ['Available facilities', 'Extra services', 'Hotel activities'],
      },
      help_request: {
        ar: ['كيف أحجز؟', 'ما هي الخطوات؟', 'تحدث مع موظف'],
        en: ['How to book?', 'What are the steps?', 'Talk to agent'],
      },
      date_change: {
        ar: ['شهر نوفمبر', 'شهر ديسمبر', 'عطلة نهاية الأسبوع'],
        en: ['November', 'December', 'Weekend getaway'],
      },
      budget_inquiry: {
        ar: ['فنادق اقتصادية', 'فنادق فاخرة', 'متوسطة السعر'],
        en: ['Budget hotels', 'Luxury hotels', 'Mid-range'],
      },
      recommendation_request: {
        ar: ['أفضل فندق للعائلات', 'فنادق رومانسية', 'فنادق الشباب'],
        en: ['Best for families', 'Romantic hotels', 'Youth hotels'],
      },
      general_question: {
        ar: ['معلومات السفر', 'الطقس', 'التأشيرة'],
        en: ['Travel info', 'Weather', 'Visa'],
      },
      unknown: {
        ar: ['ابحث عن فندق', 'اعرض الأسعار', 'احتاج مساعدة'],
        en: ['Search hotels', 'Show prices', 'Need help'],
      },
    };

    return suggestions[intent]?.[language] || suggestions.unknown[language];
  }

  /**
   * التحقق من صحة النية والكيانات
   */
  public validateIntent(intent: Intent): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // التحقق من الكيانات المطلوبة لكل نية
    switch (intent.type) {
      case 'hotel_comparison':
        if (!intent.entities.hotelNames || intent.entities.hotelNames.length < 2) {
          errors.push('Hotel comparison requires at least 2 hotel names');
        }
        break;

      case 'booking_request':
        if (!intent.entities.hotelName && !intent.entities.destination) {
          errors.push('Booking requires hotel name or destination');
        }
        break;
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export default IntentService.getInstance();
