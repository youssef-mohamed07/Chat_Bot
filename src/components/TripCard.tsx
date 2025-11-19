import type { Language } from '../types'

interface TripCardProps {
 lang: Language
 data: {
 dest: string
 offer: any
 }
 onMore?: () => void
 onSelectHotel?: (hotelName: string) => void
}

export const TripCard = ({ lang, data, onMore, onSelectHotel }: TripCardProps) => {
 const { offer, dest } = data
 const hotels = Array.isArray(offer.hotels) ? offer.hotels.slice(0, 3) : []
 const tours = Array.isArray(offer.optional_tours) ? offer.optional_tours.slice(0, 2) : []

 return (
 <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4 space-y-3">
 <div className="flex items-center gap-3">
 <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
 <img
 src={dest === 'bali' ? '/bali.jpg' : '/istanbul.jpg'}
 alt={dest}
 className="w-full h-full object-cover"
 onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
 />
 </div>
 <div>
 <h3 className="text-sm font-semibold text-gray-900">{offer.title || dest}</h3>
 {offer.validity_text && (
 <p className="text-xs text-gray-500">{offer.validity_text}</p>
 )}
 </div>
 </div>

 {hotels.length > 0 && (
 <div>
 <h4 className="text-xs font-medium text-gray-700 mb-1">{lang === 'ar' ? 'أفضل الفنادق' : 'Top Hotels'}</h4>
 <ul className="space-y-1">
 {hotels.map((h: any) => (
 <li key={h.hotel_name} className="text-xs flex items-center justify-between gap-2">
 <button
 onClick={() => onSelectHotel && onSelectHotel(h.hotel_name)}
 className="text-left flex-1 hover:underline"
 >
 {h.hotel_name} {h.rating ? `(${h.rating})` : ''}
 </button>
 {h.price_usd && (
 <span className="text-[11px] text-gray-600">${h.price_usd}</span>
 )}
 </li>
 ))}
 </ul>
 </div>
 )}

 {tours.length > 0 && (
 <div>
 <h4 className="text-xs font-medium text-gray-700 mb-1">{lang === 'ar' ? 'رحلات اختيارية' : 'Optional Tours'}</h4>
 <ul className="space-y-1">
 {tours.map((t: any) => (
 <li key={t.name_en} className="text-xs">
 {lang === 'ar' ? t.name_ar : t.name_en} {t.price_usd ? `($${t.price_usd})` : ''}
 </li>
 ))}
 </ul>
 </div>
 )}

 <div className="flex flex-wrap gap-2 pt-1">
 {onMore && (
 <button
 onClick={onMore}
 className="px-3 py-1.5 text-xs rounded-lg bg-gray-900 text-white hover:bg-black transition"
 >
 {lang === 'ar' ? 'تفاصيل أكثر' : 'More details'}
 </button>
 )}
 </div>
 </div>
 )}
