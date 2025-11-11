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
          {lang === 'ar' ? ' تأكيد عدد المسافرين' : ' Confirm Travelers'}
        </button>
      </div>
    </div>
  )
}
