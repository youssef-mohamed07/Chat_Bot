import { logger } from '../utils/logger.js';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  correctedValue?: any;
}

export class ValidationService {
  private static instance: ValidationService;

  private constructor() {}

  public static getInstance(): ValidationService {
    if (!ValidationService.instance) {
      ValidationService.instance = new ValidationService();
    }
    return ValidationService.instance;
  }

  /**
   * التحقق من صحة التاريخ
   */
  public validateDate(dateString: string, language: 'ar' | 'en' = 'ar'): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let correctedValue: string | undefined;

    try {
      // محاولة تحويل النص إلى تاريخ
      const date = this.parseDate(dateString);

      if (!date || isNaN(date.getTime())) {
        errors.push(
          language === 'ar'
            ? 'التاريخ غير صحيح. الرجاء إدخال تاريخ صحيح (مثال: 15/11 أو 15 نوفمبر)'
            : 'Invalid date format. Please enter a valid date (e.g., 15/11 or 15 November)'
        );
        return { valid: false, errors, warnings };
      }

      // التحقق من أن التاريخ ليس في الماضي
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (date < today) {
        errors.push(
          language === 'ar'
            ? 'لا يمكن اختيار تاريخ في الماضي'
            : 'Cannot select a date in the past'
        );
        return { valid: false, errors, warnings };
      }

      // التحقق من أن التاريخ ليس بعيداً جداً (أكثر من سنة)
      const oneYearFromNow = new Date(today);
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

      if (date > oneYearFromNow) {
        warnings.push(
          language === 'ar'
            ? 'التاريخ المحدد بعيد جداً. قد لا تكون العروض متاحة'
            : 'Selected date is very far. Offers may not be available'
        );
      }

      correctedValue = date.toISOString().split('T')[0];

      return { valid: true, errors, warnings, correctedValue };
    } catch (error) {
      errors.push(
        language === 'ar'
          ? 'حدث خطأ في التحقق من التاريخ'
          : 'Error validating date'
      );
      return { valid: false, errors, warnings };
    }
  }

  /**
   * التحقق من صحة نطاق التواريخ
   */
  public validateDateRange(
    startDate: string,
    endDate: string,
    language: 'ar' | 'en' = 'ar'
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // التحقق من كل تاريخ على حدة
    const startValidation = this.validateDate(startDate, language);
    const endValidation = this.validateDate(endDate, language);

    if (!startValidation.valid) {
      errors.push(...startValidation.errors);
    }

    if (!endValidation.valid) {
      errors.push(...endValidation.errors);
    }

    if (errors.length > 0) {
      return { valid: false, errors, warnings };
    }

    // التحقق من أن تاريخ البداية قبل تاريخ النهاية
    const start = this.parseDate(startDate);
    const end = this.parseDate(endDate);

    if (start && end && start >= end) {
      errors.push(
        language === 'ar'
          ? 'تاريخ البداية يجب أن يكون قبل تاريخ النهاية'
          : 'Start date must be before end date'
      );
      return { valid: false, errors, warnings };
    }

    // التحقق من مدة الإقامة
    if (start && end) {
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

      if (days < 2) {
        warnings.push(
          language === 'ar'
            ? 'مدة الإقامة قصيرة جداً. الحد الأدنى الموصى به هو ليلتان'
            : 'Stay duration is very short. Minimum recommended is 2 nights'
        );
      }

      if (days > 30) {
        warnings.push(
          language === 'ar'
            ? 'مدة الإقامة طويلة جداً. قد تحتاج لتأكيد خاص'
            : 'Stay duration is very long. May require special confirmation'
        );
      }
    }

    return { valid: true, errors, warnings };
  }

  /**
   * التحقق من صحة السعر
   */
  public validatePrice(price: number, language: 'ar' | 'en' = 'ar'): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (typeof price !== 'number' || isNaN(price)) {
      errors.push(
        language === 'ar' ? 'السعر يجب أن يكون رقماً' : 'Price must be a number'
      );
      return { valid: false, errors, warnings };
    }

    if (price < 0) {
      errors.push(
        language === 'ar' ? 'السعر لا يمكن أن يكون سالباً' : 'Price cannot be negative'
      );
      return { valid: false, errors, warnings };
    }

    if (price < 1000) {
      warnings.push(
        language === 'ar'
          ? 'السعر منخفض جداً. قد لا تتوفر عروض بهذا السعر'
          : 'Price is very low. Offers may not be available at this price'
      );
    }

    if (price > 100000) {
      warnings.push(
        language === 'ar'
          ? 'السعر مرتفع جداً. هل أنت متأكد؟'
          : 'Price is very high. Are you sure?'
      );
    }

    return { valid: true, errors, warnings };
  }

  /**
   * التحقق من صحة نطاق السعر
   */
  public validatePriceRange(
    min: number | undefined,
    max: number | undefined,
    language: 'ar' | 'en' = 'ar'
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (min !== undefined) {
      const minValidation = this.validatePrice(min, language);
      if (!minValidation.valid) {
        errors.push(...minValidation.errors);
      }
    }

    if (max !== undefined) {
      const maxValidation = this.validatePrice(max, language);
      if (!maxValidation.valid) {
        errors.push(...maxValidation.errors);
      }
    }

    if (min !== undefined && max !== undefined && min > max) {
      errors.push(
        language === 'ar'
          ? 'الحد الأدنى للسعر يجب أن يكون أقل من الحد الأقصى'
          : 'Minimum price must be less than maximum price'
      );
      return { valid: false, errors, warnings };
    }

    return { valid: true, errors, warnings };
  }

  /**
   * التحقق من صحة عدد المسافرين
   */
  public validateTravelers(count: number, language: 'ar' | 'en' = 'ar'): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (typeof count !== 'number' || isNaN(count)) {
      errors.push(
        language === 'ar'
          ? 'عدد المسافرين يجب أن يكون رقماً'
          : 'Number of travelers must be a number'
      );
      return { valid: false, errors, warnings };
    }

    if (!Number.isInteger(count)) {
      errors.push(
        language === 'ar'
          ? 'عدد المسافرين يجب أن يكون رقماً صحيحاً'
          : 'Number of travelers must be an integer'
      );
      return { valid: false, errors, warnings };
    }

    if (count < 1) {
      errors.push(
        language === 'ar'
          ? 'يجب أن يكون هناك مسافر واحد على الأقل'
          : 'Must have at least 1 traveler'
      );
      return { valid: false, errors, warnings };
    }

    if (count > 10) {
      warnings.push(
        language === 'ar'
          ? 'عدد المسافرين كبير. قد تحتاج لتأكيد خاص للمجموعات'
          : 'Large number of travelers. May need special confirmation for groups'
      );
    }

    return { valid: true, errors, warnings };
  }

  /**
   * التحقق من صحة عدد النجوم
   */
  public validateStars(stars: number, language: 'ar' | 'en' = 'ar'): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (typeof stars !== 'number' || isNaN(stars)) {
      errors.push(
        language === 'ar'
          ? 'عدد النجوم يجب أن يكون رقماً'
          : 'Stars must be a number'
      );
      return { valid: false, errors, warnings };
    }

    if (!Number.isInteger(stars)) {
      errors.push(
        language === 'ar'
          ? 'عدد النجوم يجب أن يكون رقماً صحيحاً'
          : 'Stars must be an integer'
      );
      return { valid: false, errors, warnings };
    }

    if (stars < 1 || stars > 5) {
      errors.push(
        language === 'ar'
          ? 'عدد النجوم يجب أن يكون بين 1 و 5'
          : 'Stars must be between 1 and 5'
      );
      return { valid: false, errors, warnings };
    }

    return { valid: true, errors, warnings };
  }

  /**
   * التحقق من صحة البريد الإلكتروني
   */
  public validateEmail(email: string, language: 'ar' | 'en' = 'ar'): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      errors.push(
        language === 'ar'
          ? 'البريد الإلكتروني غير صحيح'
          : 'Invalid email address'
      );
      return { valid: false, errors, warnings };
    }

    // التحقق من المجالات الشائعة الخاطئة
    const commonTypos: Record<string, string> = {
      'gmial.com': 'gmail.com',
      'gmai.com': 'gmail.com',
      'yahooo.com': 'yahoo.com',
      'hotmial.com': 'hotmail.com',
    };

    const domain = email.split('@')[1];
    if (commonTypos[domain]) {
      warnings.push(
        language === 'ar'
          ? `هل تقصد ${email.replace(domain, commonTypos[domain])}؟`
          : `Did you mean ${email.replace(domain, commonTypos[domain])}?`
      );
    }

    return { valid: true, errors, warnings };
  }

  /**
   * التحقق من صحة رقم الهاتف
   */
  public validatePhone(phone: string, language: 'ar' | 'en' = 'ar'): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // إزالة المسافات والشرطات
    const cleanPhone = phone.replace(/[\s\-()]/g, '');

    // التحقق من أن الرقم يحتوي على أرقام فقط (مع +)
    if (!/^[\+]?[0-9]+$/.test(cleanPhone)) {
      errors.push(
        language === 'ar'
          ? 'رقم الهاتف يجب أن يحتوي على أرقام فقط'
          : 'Phone number must contain only digits'
      );
      return { valid: false, errors, warnings };
    }

    // التحقق من الطول
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      errors.push(
        language === 'ar'
          ? 'رقم الهاتف يجب أن يكون بين 10 و 15 رقماً'
          : 'Phone number must be between 10 and 15 digits'
      );
      return { valid: false, errors, warnings };
    }

    // التحقق من الأرقام المصرية
    if (cleanPhone.startsWith('01') || cleanPhone.startsWith('+201')) {
      if (!cleanPhone.startsWith('+201') && cleanPhone.length === 11) {
        warnings.push(
          language === 'ar'
            ? 'يفضل إضافة رمز الدولة (+20)'
            : 'Consider adding country code (+20)'
        );
      }
    }

    return { valid: true, errors, warnings, correctedValue: cleanPhone };
  }

  /**
   * التحقق من صحة الاسم
   */
  public validateName(name: string, language: 'ar' | 'en' = 'ar'): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!name || name.trim().length === 0) {
      errors.push(
        language === 'ar' ? 'الاسم مطلوب' : 'Name is required'
      );
      return { valid: false, errors, warnings };
    }

    if (name.trim().length < 2) {
      errors.push(
        language === 'ar'
          ? 'الاسم قصير جداً'
          : 'Name is too short'
      );
      return { valid: false, errors, warnings };
    }

    if (name.trim().length > 100) {
      errors.push(
        language === 'ar'
          ? 'الاسم طويل جداً'
          : 'Name is too long'
      );
      return { valid: false, errors, warnings };
    }

    // التحقق من وجود أحرف خاصة غير مقبولة
    if (/[^a-zA-Z\u0600-\u06FF\s\-']/.test(name)) {
      warnings.push(
        language === 'ar'
          ? 'الاسم يحتوي على أحرف غير مألوفة'
          : 'Name contains unusual characters'
      );
    }

    return { valid: true, errors, warnings, correctedValue: name.trim() };
  }

  /**
   * تحليل التاريخ من صيغ مختلفة
   */
  private parseDate(dateString: string): Date | null {
    try {
      // محاولة التحليل المباشر
      let date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date;
      }

      // محاولة تحليل صيغة DD/MM
      const ddmmPattern = /(\d{1,2})[\/\-](\d{1,2})/;
      const ddmmMatch = dateString.match(ddmmPattern);
      if (ddmmMatch) {
        const day = parseInt(ddmmMatch[1]);
        const month = parseInt(ddmmMatch[2]) - 1;
        const year = new Date().getFullYear();
        date = new Date(year, month, day);
        
        // إذا كان التاريخ في الماضي، استخدم السنة القادمة
        if (date < new Date()) {
          date.setFullYear(year + 1);
        }
        
        if (!isNaN(date.getTime())) {
          return date;
        }
      }

      // محاولة تحليل أسماء الأشهر
      const months = {
        january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
        july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
        يناير: 0, فبراير: 1, مارس: 2, ابريل: 3, مايو: 4, يونيو: 5,
        يوليو: 6, اغسطس: 7, سبتمبر: 8, اكتوبر: 9, نوفمبر: 10, ديسمبر: 11,
      };

      for (const [monthName, monthIndex] of Object.entries(months)) {
        if (dateString.toLowerCase().includes(monthName)) {
          const year = new Date().getFullYear();
          const currentMonth = new Date().getMonth();
          
          // إذا كان الشهر قد مضى في السنة الحالية، استخدم السنة القادمة
          const targetYear = monthIndex < currentMonth ? year + 1 : year;
          
          date = new Date(targetYear, monthIndex, 1);
          if (!isNaN(date.getTime())) {
            return date;
          }
        }
      }

      return null;
    } catch (error) {
      logger.error('DateParsing', String(error));
      return null;
    }
  }

  /**
   * التحقق الشامل من بيانات الحجز
   */
  public validateBookingData(
    data: {
      destination?: string;
      startDate?: string;
      endDate?: string;
      travelers?: number;
      customerName?: string;
      customerEmail?: string;
      customerPhone?: string;
    },
    language: 'ar' | 'en' = 'ar'
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // التحقق من الوجهة
    if (!data.destination) {
      errors.push(
        language === 'ar' ? 'الوجهة مطلوبة' : 'Destination is required'
      );
    }

    // التحقق من التواريخ
    if (data.startDate && data.endDate) {
      const dateRangeValidation = this.validateDateRange(data.startDate, data.endDate, language);
      errors.push(...dateRangeValidation.errors);
      warnings.push(...dateRangeValidation.warnings);
    } else {
      errors.push(
        language === 'ar'
          ? 'تواريخ السفر مطلوبة'
          : 'Travel dates are required'
      );
    }

    // التحقق من عدد المسافرين
    if (data.travelers) {
      const travelersValidation = this.validateTravelers(data.travelers, language);
      errors.push(...travelersValidation.errors);
      warnings.push(...travelersValidation.warnings);
    } else {
      errors.push(
        language === 'ar'
          ? 'عدد المسافرين مطلوب'
          : 'Number of travelers is required'
      );
    }

    // التحقق من بيانات التواصل
    if (data.customerName) {
      const nameValidation = this.validateName(data.customerName, language);
      errors.push(...nameValidation.errors);
      warnings.push(...nameValidation.warnings);
    }

    if (data.customerEmail) {
      const emailValidation = this.validateEmail(data.customerEmail, language);
      errors.push(...emailValidation.errors);
      warnings.push(...emailValidation.warnings);
    }

    if (data.customerPhone) {
      const phoneValidation = this.validatePhone(data.customerPhone, language);
      errors.push(...phoneValidation.errors);
      warnings.push(...phoneValidation.warnings);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

export default ValidationService.getInstance();
