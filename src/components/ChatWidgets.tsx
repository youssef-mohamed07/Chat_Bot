import { useState, useEffect } from 'react'
import type { Language } from '../types'

// Helper to format date as YYYY-MM-DD
const formatDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Helper to add days to a date
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export const DateRangeWidget = ({
  heading,
  minDate,
  maxDate,
  lang,
  onConfirm
}: {
  heading?: string
  minDate?: string
  maxDate?: string
  lang: Language
  onConfirm: (start: string, end: string) => void
}) => {
  // Initialize with today and +7 days
  const today = new Date()
  const weekLater = addDays(today, 7)
  
  const [start, setStart] = useState<string>(formatDate(today))
  const [end, setEnd] = useState<string>(formatDate(weekLater))
  
  // Set min/max dates - default to today for min
  const effectiveMinDate = minDate || formatDate(today)
  const effectiveMaxDate = maxDate
  
  useEffect(() => {
    // Initialize default values
    setStart(formatDate(today))
    setEnd(formatDate(weekLater))
  }, [])
  
  const canConfirm = !!start && !!end && start >= effectiveMinDate && start <= end
  
  return (
    <div className="mt-3 p-4 border-2 rounded-xl shadow-sm" style={{ 
      borderColor: '#7A0C2E20',
      background: 'linear-gradient(135deg, #FFF5F7 0%, #ffffff 100%)'
    }}>
      {heading ? (
        <div className="flex items-center gap-2 mb-3" dir={lang==='ar'?'rtl':'ltr'}>
          <svg className="w-4 h-4" style={{ color: '#7A0C2E' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm font-semibold" style={{ color: '#7A0C2E' }}>{heading}</span>
        </div>
      ) : null}
      
      <div className="space-y-3" dir={lang==='ar'?'rtl':'ltr'}>
        {/* Start Date */}
        <div className="space-y-1">
          <label className="block text-xs font-medium" style={{ color: '#991B1B' }}>
            {lang === 'ar' ? '📅 تاريخ المغادرة' : '📅 Departure Date'}
          </label>
          <input 
            type="date" 
            value={start} 
            min={effectiveMinDate} 
            max={effectiveMaxDate}
            onChange={(e) => {
              setStart(e.target.value)
              // Auto-adjust end date if needed
              if (e.target.value > end) {
                const newEnd = addDays(new Date(e.target.value), 7)
                setEnd(formatDate(newEnd))
              }
            }}
            className="w-full border-2 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 transition-all" 
            style={{
              borderColor: '#7A0C2E40',
              outlineColor: '#7A0C2E',
              color: '#374151'
            }}
          />
        </div>
        
        {/* End Date */}
        <div className="space-y-1">
          <label className="block text-xs font-medium" style={{ color: '#991B1B' }}>
            {lang === 'ar' ? '🏁 تاريخ العودة' : '🏁 Return Date'}
          </label>
          <input 
            type="date" 
            value={end} 
            min={start || effectiveMinDate} 
            max={effectiveMaxDate}
            onChange={(e) => setEnd(e.target.value)}
            className="w-full border-2 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 transition-all" 
            style={{
              borderColor: '#7A0C2E40',
              outlineColor: '#7A0C2E',
              color: '#374151'
            }}
          />
        </div>
        
        {/* Duration Display */}
        {start && end && start <= end && (
          <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg border" style={{
            backgroundColor: '#FFF5F7',
            borderColor: '#7A0C2E30'
          }}>
            <svg className="w-4 h-4" style={{ color: '#7A0C2E' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-semibold" style={{ color: '#7A0C2E' }}>
              {Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24))} {lang === 'ar' ? 'يوم' : 'days'}
            </span>
          </div>
        )}
        
        {/* Confirm Button */}
        <button 
          disabled={!canConfirm} 
          onClick={() => onConfirm(start, end)}
          className="w-full px-4 py-2.5 text-sm font-semibold rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
          style={{
            backgroundColor: canConfirm ? '#7A0C2E' : '#9CA3AF'
          }}
          onMouseEnter={(e) => canConfirm && (e.currentTarget.style.backgroundColor = '#991B1B')}
          onMouseLeave={(e) => canConfirm && (e.currentTarget.style.backgroundColor = '#7A0C2E')}
        >
          {lang === 'ar' ? ' تأكيد التواريخ' : ' Confirm Dates'}
        </button>
      </div>
    </div>
  )
}

export const TravellersWidget = ({
  heading,
  min = 1,
  max = 9,
  initial = 2,
  lang,
  onConfirm
}: {
  heading?: string
  min?: number
  max?: number
  initial?: number
  lang: Language
  onConfirm: (pax: number) => void
}) => {
  const clamp = (n: number) => Math.max(min, Math.min(max, n))
  const [pax, setPax] = useState<number>(clamp(initial))
  const dec = () => setPax(p => clamp(p - 1))
  const inc = () => setPax(p => clamp(p + 1))
  
  return (
    <div className="mt-3 p-4 border-2 rounded-xl shadow-sm" dir={lang==='ar'?'rtl':'ltr'} style={{
      borderColor: '#7A0C2E20',
      background: 'linear-gradient(135deg, #FFF5F7 0%, #ffffff 100%)'
    }}>
      {heading ? (
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4" style={{ color: '#7A0C2E' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="text-sm font-semibold" style={{ color: '#7A0C2E' }}>{heading}</span>
        </div>
      ) : null}
      
      <div className="space-y-3">
        <div className="flex items-center justify-center gap-4 py-3 px-4 bg-white rounded-lg border-2" style={{ borderColor: '#7A0C2E30' }}>
          <button 
            onClick={dec} 
            disabled={pax <= min}
            className="w-10 h-10 rounded-full border-2 bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center font-bold text-xl"
            style={{ 
              borderColor: '#7A0C2E',
              color: '#7A0C2E'
            }}
            onMouseEnter={(e) => pax > min && (e.currentTarget.style.backgroundColor = '#FFF5F7')}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
          >
            −
          </button>
          
          <div className="flex flex-col items-center min-w-[80px]">
            <span className="text-3xl font-bold" style={{ color: '#7A0C2E' }}>{pax}</span>
            <span className="text-xs text-gray-500 mt-1">
              {lang === 'ar' 
                ? (pax === 1 ? 'مسافر' : pax === 2 ? 'مسافران' : 'مسافرين')
                : (pax === 1 ? 'traveler' : 'travelers')
              }
            </span>
          </div>
          
          <button 
            onClick={inc} 
            disabled={pax >= max}
            className="w-10 h-10 rounded-full border-2 bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center font-bold text-xl"
            style={{ 
              borderColor: '#7A0C2E',
              color: '#7A0C2E'
            }}
            onMouseEnter={(e) => pax < max && (e.currentTarget.style.backgroundColor = '#FFF5F7')}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
          >
            +
          </button>
        </div>
        
        <button 
          onClick={() => onConfirm(pax)}
          className="w-full px-4 py-2.5 text-sm font-semibold rounded-lg text-white transition-all shadow-sm hover:shadow-md"
          style={{ backgroundColor: '#7A0C2E' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#991B1B'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#7A0C2E'}
        >
          {lang === 'ar' ? '✓ تأكيد عدد المسافرين' : '✓ Confirm Travelers'}
        </button>
      </div>
    </div>
  )
}

// Quick Replies Widget - أزرار اختيار سريعة
export const QuickRepliesWidget = ({
  title_ar,
  title_en,
  options,
  lang,
  onSelect
}: {
  title_ar?: string
  title_en?: string
  options: Array<{ label_ar: string; label_en: string; value: string; emoji?: string }>
  lang: Language
  onSelect: (value: string, label: string) => void
}) => {
  return (
    <div className="mt-3 p-4 border-2 rounded-xl shadow-sm" style={{
      borderColor: '#7A0C2E20',
      background: 'linear-gradient(135deg, #FFF5F7 0%, #ffffff 100%)'
    }}>
      {(title_ar || title_en) && (
        <div className="mb-3" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          <span className="text-sm font-semibold" style={{ color: '#7A0C2E' }}>
            {lang === 'ar' ? title_ar : title_en}
          </span>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-2">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => onSelect(option.value, lang === 'ar' ? option.label_ar : option.label_en)}
            className="flex items-center gap-3 px-4 py-3 rounded-lg border-2 bg-white transition-all hover:shadow-md"
            style={{ borderColor: '#7A0C2E30' }}
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#7A0C2E'
              e.currentTarget.style.backgroundColor = '#FFF5F7'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#7A0C2E30'
              e.currentTarget.style.backgroundColor = 'white'
            }}
          >
            {option.emoji && <span className="text-xl">{option.emoji}</span>}
            <span className="text-sm font-medium" style={{ color: '#374151' }}>
              {lang === 'ar' ? option.label_ar : option.label_en}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

// Meal Plans Widget - اختيار نظام الوجبات
export const MealPlanWidget = ({
  title_ar,
  title_en,
  options,
  lang,
  onSelect
}: {
  title_ar?: string
  title_en?: string
  options: Array<{ 
    value: string
    label_ar: string
    label_en: string
    icon: string
    description_ar?: string
    description_en?: string
  }>
  lang: Language
  onSelect: (value: string, label: string) => void
}) => {
  return (
    <div className="mt-2 p-3 border-2 rounded-xl shadow-sm" style={{
      borderColor: '#7A0C2E20',
      background: 'linear-gradient(135deg, #FFF5F7 0%, #ffffff 100%)'
    }}>
      {(title_ar || title_en) && (
        <div className="mb-2" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          <span className="text-xs font-semibold" style={{ color: '#7A0C2E' }}>
            {lang === 'ar' ? title_ar : title_en}
          </span>
        </div>
      )}
      
      <div className="space-y-1">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => onSelect(option.value, lang === 'ar' ? option.label_ar : option.label_en)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border-2 bg-white transition-all hover:shadow-md"
            style={{ borderColor: '#7A0C2E30' }}
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#7A0C2E'
              e.currentTarget.style.backgroundColor = '#FFF5F7'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#7A0C2E30'
              e.currentTarget.style.backgroundColor = 'white'
            }}
          >
            <span className="text-xl">{option.icon}</span>
            <div className="flex-1 text-left" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              <div className="text-[10px] font-semibold" style={{ color: '#374151' }}>
                {lang === 'ar' ? option.label_ar : option.label_en}
              </div>
              {(option.description_ar || option.description_en) && (
                <div className="text-[9px] text-gray-500 mt-0.5">
                  {lang === 'ar' ? option.description_ar : option.description_en}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// Room Types Widget - اختيار نوع الغرفة
export const RoomTypesWidget = ({
  title_ar,
  title_en,
  options,
  lang,
  onSelect
}: {
  title_ar?: string
  title_en?: string
  options: Array<{ 
    value: string
    label_ar: string
    label_en: string
    icon: string
    capacity?: number
    description_ar?: string
    description_en?: string
  }>
  lang: Language
  onSelect: (value: string, label: string) => void
}) => {
  return (
    <div className="mt-2 p-3 border-2 rounded-xl shadow-sm" style={{
      borderColor: '#7A0C2E20',
      background: 'linear-gradient(135deg, #FFF5F7 0%, #ffffff 100%)'
    }}>
      {(title_ar || title_en) && (
        <div className="mb-2" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          <span className="text-xs font-semibold" style={{ color: '#7A0C2E' }}>
            {lang === 'ar' ? title_ar : title_en}
          </span>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-2">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => onSelect(option.value, lang === 'ar' ? option.label_ar : option.label_en)}
            className="flex flex-col items-center gap-1 px-2 py-2 rounded-lg border-2 bg-white transition-all hover:shadow-md"
            style={{ borderColor: '#7A0C2E30' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#7A0C2E'
              e.currentTarget.style.backgroundColor = '#FFF5F7'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#7A0C2E30'
              e.currentTarget.style.backgroundColor = 'white'
            }}
          >
            <span className="text-xl">{option.icon}</span>
            <div className="text-center">
              <div className="text-[10px] font-semibold" style={{ color: '#374151' }}>
                {lang === 'ar' ? option.label_ar : option.label_en}
              </div>
              {option.capacity && (
                <div className="text-[9px] text-gray-500 mt-0.5">
                  {option.capacity} {lang === 'ar' ? 'شخص' : 'person'}
                  {option.capacity > 1 && lang === 'en' ? 's' : ''}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// Hotel Filters Widget - فلاتر الفنادق
export const HotelFiltersWidget = ({
  title_ar,
  title_en,
  filters,
  lang,
  onFilterChange
}: {
  title_ar?: string
  title_en?: string
  filters: {
    stars?: Array<{ value: number; label: string }>
    mealPlans?: Array<{ value: string; label_ar: string; label_en: string }>
    areas?: Array<{ value: string; label_ar: string; label_en: string }>
  }
  lang: Language
  onFilterChange: (filterType: string, value: string) => void
}) => {
  return (
    <div className="mt-3 p-4 border-2 rounded-xl shadow-sm" style={{
      borderColor: '#7A0C2E20',
      background: 'linear-gradient(135deg, #FFF5F7 0%, #ffffff 100%)'
    }}>
      {(title_ar || title_en) && (
        <div className="mb-3" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          <span className="text-sm font-semibold" style={{ color: '#7A0C2E' }}>
            {lang === 'ar' ? title_ar : title_en}
          </span>
        </div>
      )}
      
      <div className="space-y-3">
        {/* Star Rating Filter */}
        {filters.stars && filters.stars.length > 0 && (
          <div>
            <div className="text-xs font-medium mb-2 text-gray-600" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              {lang === 'ar' ? 'التقييم:' : 'Rating:'}
            </div>
            <div className="flex gap-2 flex-wrap">
              {filters.stars.map((star) => (
                <button
                  key={star.value}
                  onClick={() => onFilterChange('stars', star.value.toString())}
                  className="px-3 py-1.5 rounded-md border-2 bg-white text-xs font-medium transition-all"
                  style={{ borderColor: '#7A0C2E30' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#7A0C2E'
                    e.currentTarget.style.backgroundColor = '#FFF5F7'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#7A0C2E30'
                    e.currentTarget.style.backgroundColor = 'white'
                  }}
                >
                  {star.label}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Meal Plans Filter */}
        {filters.mealPlans && filters.mealPlans.length > 0 && (
          <div>
            <div className="text-xs font-medium mb-2 text-gray-600" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              {lang === 'ar' ? 'نظام الوجبات:' : 'Meal Plan:'}
            </div>
            <div className="flex gap-2 flex-wrap">
              {filters.mealPlans.map((meal) => (
                <button
                  key={meal.value}
                  onClick={() => onFilterChange('mealPlans', meal.value)}
                  className="px-3 py-1.5 rounded-md border-2 bg-white text-xs font-medium transition-all"
                  style={{ borderColor: '#7A0C2E30' }}
                  dir={lang === 'ar' ? 'rtl' : 'ltr'}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#7A0C2E'
                    e.currentTarget.style.backgroundColor = '#FFF5F7'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#7A0C2E30'
                    e.currentTarget.style.backgroundColor = 'white'
                  }}
                >
                  {lang === 'ar' ? meal.label_ar : meal.label_en}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Areas Filter */}
        {filters.areas && filters.areas.length > 0 && (
          <div>
            <div className="text-xs font-medium mb-2 text-gray-600" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              {lang === 'ar' ? 'المنطقة:' : 'Area:'}
            </div>
            <div className="flex gap-2 flex-wrap">
              {filters.areas.map((area) => (
                <button
                  key={area.value}
                  onClick={() => onFilterChange('areas', area.value)}
                  className="px-3 py-1.5 rounded-md border-2 bg-white text-xs font-medium transition-all"
                  style={{ borderColor: '#7A0C2E30' }}
                  dir={lang === 'ar' ? 'rtl' : 'ltr'}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#7A0C2E'
                    e.currentTarget.style.backgroundColor = '#FFF5F7'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#7A0C2E30'
                    e.currentTarget.style.backgroundColor = 'white'
                  }}
                >
                  {lang === 'ar' ? area.label_ar : area.label_en}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Budget Widget
interface BudgetWidgetProps {
  title_ar?: string
  title_en?: string
  ranges: Array<{
    label_ar: string
    label_en: string
    min: number
    max: number
    icon: string
    description_ar?: string
    description_en?: string
    popular?: boolean
  }>
  lang: 'ar' | 'en'
  onSelect: (range: { min: number; max: number; label: string }) => void
}

export const BudgetWidget = ({
  title_ar = 'اختر ميزانيتك',
  title_en = 'Choose Your Budget',
  ranges,
  lang,
  onSelect
}: BudgetWidgetProps) => {
  return (
    <div className="my-2 w-full max-w-2xl mx-auto" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="mb-2 text-center px-2">
        <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#7A0C2E] to-[#991B1B] text-white px-3 py-1.5 rounded-full shadow-md mb-1.5">
          <span className="text-sm">💰</span>
          <h3 className="text-xs font-bold">
            {lang === 'ar' ? title_ar : title_en}
          </h3>
        </div>
        <p className="text-[10px] text-gray-600 mt-1">
          {lang === 'ar' ? 'السعر شامل الإقامة والإفطار (بالجنيه المصري)' : 'Price includes accommodation and breakfast (in EGP)'}
        </p>
      </div>

      {/* Budget Cards Grid - 2x2 Modern Grid */}
      <div className="grid grid-cols-2 gap-2 px-2">
        {ranges.map((range, index) => (
          <button
            key={index}
            onClick={() =>
              onSelect({
                min: range.min,
                max: range.max,
                label: lang === 'ar' ? range.label_ar : range.label_en
              })
            }
            className={`
              relative p-2.5 rounded-xl transition-all duration-300 overflow-hidden
              ${range.popular 
                ? 'bg-gradient-to-br from-[#7A0C2E] to-[#991B1B] text-white shadow-lg scale-[1.02]' 
                : 'bg-white border-2 border-gray-200 hover:border-[#7A0C2E] hover:shadow-md'
              }
              hover:scale-[1.01] active:scale-95
              flex flex-col items-center gap-1
            `}
          >
            {/* Popular Ribbon */}
            {range.popular && (
              <div className="absolute -right-6 top-2 w-20 bg-yellow-400 text-[#7A0C2E] text-[8px] font-bold py-0.5 text-center rotate-45 shadow-md">
                BEST
              </div>
            )}

            {/* Icon Circle */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
              range.popular ? 'bg-white/20' : 'bg-gradient-to-br from-[#7A0C2E]/10 to-[#991B1B]/10'
            }`}>
              {range.icon}
            </div>

            {/* Title */}
            <h4 className={`font-bold text-[10px] text-center leading-tight ${
              range.popular ? 'text-white' : 'text-gray-800'
            }`}>
              {lang === 'ar' ? range.label_ar : range.label_en}
            </h4>

            {/* Price Range - K Format */}
            <div className={`text-sm font-bold text-center ${
              range.popular ? 'text-white' : 'text-[#7A0C2E]'
            }`}>
              {range.max === 999999
                ? `${(range.min / 1000).toFixed(0)}K+`
                : range.min === 0
                ? `${(range.max / 1000).toFixed(0)}K`
                : `${(range.min / 1000).toFixed(0)}-${(range.max / 1000).toFixed(0)}K`
              }
            </div>
            
            {/* Currency Label */}
            <div className={`text-[9px] ${
              range.popular ? 'text-white/80' : 'text-gray-500'
            }`}>
              {lang === 'ar' ? 'ج.م' : 'EGP'}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// Hotel Cards Widget
interface HotelCardsWidgetProps {
  hotels: Array<{
    hotel_id?: string
    hotel_name_ar: string
    hotel_name_en: string
    priceEGP: number
    priceUSD?: number
    rating?: number
    amenities?: string[]
    description_ar?: string
    description_en?: string
    image?: string
    area_ar?: string
    area_en?: string
    lazy?: boolean
  }>
  lang: 'ar' | 'en'
  onSelectHotel: (hotel: any) => void
  layout?: 'grid' | 'carousel'
  responsive?: {
    mobile?: { layout: 'carousel' | 'grid'; showCount?: number; columns?: number }
    tablet?: { layout: 'carousel' | 'grid'; columns?: number }
    desktop?: { layout: 'carousel' | 'grid'; columns?: number }
  }
}

export const HotelCardsWidget = ({ hotels, lang, onSelectHotel, responsive }: HotelCardsWidgetProps) => {
  const renderStars = (rating: number = 4) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg key={i} className="w-4 h-4 inline" fill={i < rating ? '#fbbf24' : '#d1d5db'} viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))
  }

  // Determine layout classes based on responsive config
  const getLayoutClasses = () => {
    // Default to carousel on mobile
    let baseClass = "flex overflow-x-auto gap-4 px-4 pb-2 snap-x snap-mandatory hide-scrollbar"
    
    // Apply desktop/tablet grid if configured
    if (responsive?.desktop?.layout === 'grid') {
      baseClass += " lg:grid lg:gap-4 lg:overflow-x-visible"
      const cols = responsive.desktop.columns || 3
      baseClass += ` lg:grid-cols-${cols}`
    }
    
    if (responsive?.tablet?.layout === 'grid') {
      baseClass += " md:grid md:gap-4 md:overflow-x-visible"
      const cols = responsive.tablet.columns || 2
      baseClass += ` md:grid-cols-${cols}`
    }
    
    if (responsive?.mobile?.layout === 'grid') {
      baseClass = "grid gap-4 px-4"
      const cols = responsive.mobile.columns || 1
      baseClass += ` grid-cols-${cols}`
    }
    
    return baseClass
  }

  const getCardClasses = () => {
    // Default carousel card width
    if (responsive?.mobile?.layout === 'grid') {
      return "bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group"
    }
    return "w-[280px] flex-shrink-0 snap-start bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group"
  }

  return (
    <div className="my-2 w-full" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="mb-2 text-center px-2">
        <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#7A0C2E] to-[#991B1B] text-white px-3 py-1.5 rounded-full shadow-md">
          <span className="text-sm">🏨</span>
          <h3 className="text-xs font-bold">
            {lang === 'ar' ? 'الفنادق المتاحة' : 'Available Hotels'}
          </h3>
          <span className="bg-white/20 text-[10px] px-1.5 py-0.5 rounded-full">({hotels.length})</span>
        </div>
      </div>

      {/* Hotels - Responsive Layout */}
      <div className={getLayoutClasses()} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {hotels.map((hotel, index) => (
          <div
            key={hotel.hotel_id || index}
            onClick={() => onSelectHotel(hotel)}
            className={getCardClasses()}
          >
            {/* Hotel Image with Gradient Overlay */}
            <div className="relative h-32 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
              {hotel.image ? (
                <img
                  src={hotel.image}
                  alt={lang === 'ar' ? hotel.hotel_name_ar : hotel.hotel_name_en}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading={hotel.lazy ? 'lazy' : 'eager'}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl">
                  🏨
                </div>
              )}
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Price Badge - Floating */}
              <div className="absolute bottom-2 right-2 bg-gradient-to-r from-[#7A0C2E] to-[#991B1B] text-white px-2 py-1 rounded-lg shadow-md">
                <div className="text-[9px] opacity-90">{lang === 'ar' ? 'من' : 'From'}</div>
                <div className="text-sm font-bold">{(hotel.priceEGP / 1000).toFixed(0)}K</div>
                <div className="text-[8px] opacity-80">{lang === 'ar' ? 'ج.م' : 'EGP'}</div>
              </div>
              
              {/* Stars Badge - Top Left */}
              <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                {renderStars(hotel.rating)}
              </div>
            </div>

            {/* Hotel Info */}
            <div className="p-2.5">
              {/* Name */}
              <h4 className="font-bold text-xs text-gray-800 mb-1 line-clamp-1">
                {lang === 'ar' ? hotel.hotel_name_ar : hotel.hotel_name_en}
              </h4>

              {/* Location with SVG Icon */}
              {(hotel.area_ar || hotel.area_en) && (
                <div className="flex items-center gap-1 mb-2 text-gray-600">
                  <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[10px] line-clamp-1">{lang === 'ar' ? hotel.area_ar : hotel.area_en}</span>
                </div>
              )}

              {/* Amenities Pills */}
              {hotel.amenities && hotel.amenities.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {hotel.amenities.slice(0, 2).map((amenity, idx) => (
                    <span
                      key={idx}
                      className="text-[9px] bg-gradient-to-r from-[#7A0C2E]/10 to-[#991B1B]/10 text-[#7A0C2E] border border-[#7A0C2E]/20 px-1.5 py-0.5 rounded-full font-medium"
                    >
                      {amenity}
                    </span>
                  ))}
                  {hotel.amenities.length > 2 && (
                    <span className="text-[9px] text-gray-500 px-1.5 py-0.5">
                      +{hotel.amenities.length - 2}
                    </span>
                  )}
                </div>
              )}

              {/* CTA Button with Arrow Icon */}
              <button className="w-full bg-gradient-to-r from-[#7A0C2E] to-[#991B1B] text-white py-2 rounded-lg text-[10px] font-semibold hover:shadow-md transition-all duration-200 group-hover:scale-[1.01] flex items-center justify-center gap-1.5">
                <span>{lang === 'ar' ? 'اختر الفندق' : 'Select Hotel'}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Scroll Indicators */}
      <div className="flex justify-center gap-1.5 mt-3">
        {hotels.slice(0, Math.min(5, hotels.length)).map((_, idx) => (
          <div key={idx} className="w-1.5 h-1.5 rounded-full bg-gray-300" />
        ))}
      </div>
    </div>
  )
}

// Booking Summary Widget
export const BookingSummaryWidget = ({
  title_ar,
  title_en,
  data,
  actions,
  lang,
  onActionClick
}: {
  title_ar?: string
  title_en?: string
  data: {
    destination: string
    hotel: string
    mealPlan: string
    roomType: string
    travelers?: number
    startDate?: string
    endDate?: string
    budget?: any
  }
  actions?: Array<{ text_ar: string; text_en: string; value: string; variant?: string }>
  lang: Language
  onActionClick: (value: string, text: string) => void
}) => {
  const title = lang === 'ar' ? (title_ar || 'ملخص الحجز') : (title_en || 'Booking Summary')
  
  const formatDestination = (dest: string) => {
    const names: Record<string, { ar: string; en: string }> = {
      'bali': { ar: 'بالي', en: 'Bali' },
      'istanbul': { ar: 'إسطنبول', en: 'Istanbul' },
      'beirut': { ar: 'بيروت', en: 'Beirut' },
      'dahab': { ar: 'دهب', en: 'Dahab' },
      'sharm_el_sheikh': { ar: 'شرم الشيخ', en: 'Sharm El Sheikh' },
      'hurghada': { ar: 'الغردقة', en: 'Hurghada' },
      'ain_sokhna': { ar: 'العين السخنة', en: 'Ain Sokhna' },
      'sahl_hashish': { ar: 'سهل حشيش', en: 'Sahl Hasheesh' }
    }
    return names[dest]?.[lang] || dest
  }

  const calculateNights = () => {
    if (!data.startDate || !data.endDate) return null
    const start = new Date(data.startDate)
    const end = new Date(data.endDate)
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  const nights = calculateNights()

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-2 border-2 border-[#7A0C2E]/20 shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2 pb-2 border-b-2 border-[#7A0C2E]/10">
        <div className="bg-gradient-to-br from-[#7A0C2E] to-[#991B1B] p-1.5 rounded-lg">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-xs font-bold text-gray-800">{title}</h3>
      </div>

      {/* Summary Items */}
      <div className="space-y-1 mb-2">
        {/* Destination */}
        <div className="flex items-start gap-2 bg-white rounded-lg p-2 shadow-sm">
          <span className="text-lg">🌍</span>
          <div className="flex-1">
            <p className="text-[9px] text-gray-500 mb-0.5">{lang === 'ar' ? 'الوجهة' : 'Destination'}</p>
            <p className="font-semibold text-[10px] text-gray-800">{formatDestination(data.destination)}</p>
          </div>
        </div>

        {/* Hotel */}
        <div className="flex items-start gap-2 bg-white rounded-lg p-2 shadow-sm">
          <span className="text-lg">🏨</span>
          <div className="flex-1">
            <p className="text-[9px] text-gray-500 mb-0.5">{lang === 'ar' ? 'الفندق' : 'Hotel'}</p>
            <p className="font-semibold text-[10px] text-gray-800">{data.hotel}</p>
          </div>
        </div>

        {/* Meal Plan */}
        <div className="flex items-start gap-2 bg-white rounded-lg p-2 shadow-sm">
          <span className="text-lg">🍽️</span>
          <div className="flex-1">
            <p className="text-[9px] text-gray-500 mb-0.5">{lang === 'ar' ? 'نظام الوجبات' : 'Meal Plan'}</p>
            <p className="font-semibold text-[10px] text-gray-800">{data.mealPlan}</p>
          </div>
        </div>

        {/* Room Type */}
        <div className="flex items-start gap-2 bg-white rounded-lg p-2 shadow-sm">
          <span className="text-lg">🛏️</span>
          <div className="flex-1">
            <p className="text-[9px] text-gray-500 mb-0.5">{lang === 'ar' ? 'نوع الغرفة' : 'Room Type'}</p>
            <p className="font-semibold text-[10px] text-gray-800">{data.roomType}</p>
          </div>
        </div>

        {/* Dates */}
        {data.startDate && data.endDate && (
          <div className="flex items-start gap-2 bg-white rounded-lg p-2 shadow-sm">
            <span className="text-lg">📅</span>
            <div className="flex-1">
              <p className="text-[9px] text-gray-500 mb-0.5">{lang === 'ar' ? 'تواريخ السفر' : 'Travel Dates'}</p>
              <p className="font-semibold text-[10px] text-gray-800">
                {data.startDate} → {data.endDate}
                {nights && <span className="text-[9px] text-gray-500 ml-2">({nights} {lang === 'ar' ? 'ليلة' : 'nights'})</span>}
              </p>
            </div>
          </div>
        )}

        {/* Travelers */}
        {data.travelers && (
          <div className="flex items-start gap-2 bg-white rounded-lg p-2 shadow-sm">
            <span className="text-lg">👥</span>
            <div className="flex-1">
              <p className="text-[9px] text-gray-500 mb-0.5">{lang === 'ar' ? 'عدد المسافرين' : 'Travelers'}</p>
              <p className="font-semibold text-[10px] text-gray-800">
                {data.travelers} {lang === 'ar' ? (data.travelers > 1 ? 'مسافرين' : 'مسافر') : (data.travelers > 1 ? 'travelers' : 'traveler')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {actions && actions.length > 0 && (
        <div className="flex flex-col gap-1 pt-2 border-t-2 border-gray-100">
          {actions.map((action, idx) => {
            const text = lang === 'ar' ? action.text_ar : action.text_en
            const isPrimary = action.variant === 'primary'
            const isSecondary = action.variant === 'secondary'
            
            return (
              <button
                key={idx}
                onClick={() => onActionClick(action.value, text)}
                className={`
                  w-full py-2 px-3 rounded-lg font-semibold text-[10px] transition-all duration-200
                  ${isPrimary ? 'bg-gradient-to-r from-[#7A0C2E] to-[#991B1B] text-white hover:shadow-lg hover:scale-[1.02]' : ''}
                  ${isSecondary ? 'bg-green-600 text-white hover:bg-green-700 hover:shadow-md' : ''}
                  ${!isPrimary && !isSecondary ? 'bg-white border-2 border-gray-200 text-gray-700 hover:border-[#7A0C2E]/30 hover:bg-gray-50' : ''}
                `}
              >
                {text}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
