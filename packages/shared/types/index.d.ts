export type Language = 'ar' | 'en';
export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
export interface ChatRequest {
    message: string;
    userId?: string;
    lang?: Language;
    customerInfo?: {
        name: string;
        phone: string;
        email: string;
    };
}
export interface ChatResponse {
    reply: string;
    ui?: {
        blocks?: UIBlock[];
    };
}
export type UIBlock = {
    type: 'text';
    text: string;
} | {
    type: 'buttons';
    text?: string;
    buttons: Array<{
        text: string;
        value: string;
    }>;
} | {
    type: 'card';
    cardType: 'trip';
    data: {
        dest: string;
        offer: any;
    };
} | {
    type: 'images';
    urls: string[];
} | {
    type: 'dateRange';
    heading?: string;
    minDate?: string;
    maxDate?: string;
    label_ar?: string;
    label_en?: string;
    nights?: number;
} | {
    type: 'travellers';
    heading?: string;
    min?: number;
    max?: number;
    default?: number;
    label_ar?: string;
    label_en?: string;
    options?: Array<{
        value: number;
        label_ar: string;
        label_en: string;
        icon: string;
    }>;
} | {
    type: 'destinations';
    title?: string;
    categories?: DestinationCategory[];
} | {
    type: 'budget';
    title_ar?: string;
    title_en?: string;
    ranges: BudgetRange[];
} | {
    type: 'hotelCards';
    hotels: HotelCard[];
} | {
    type: 'quickReplies';
    title_ar?: string;
    title_en?: string;
    options: QuickReply[];
} | {
    type: 'hotelFilters';
    title_ar?: string;
    title_en?: string;
    filters: HotelFilters;
} | {
    type: 'mealPlans';
    title_ar?: string;
    title_en?: string;
    options: MealPlan[];
} | {
    type: 'roomTypes';
    title_ar?: string;
    title_en?: string;
    options: RoomType[];
} | {
    type: 'bookingSummary';
    title_ar?: string;
    title_en?: string;
    data: BookingSummaryData;
    actions?: BookingAction[];
} | {
    type: 'contactInfo';
    title_ar?: string;
    title_en?: string;
};
export interface DestinationCategory {
    title: string;
    destinations: Array<{
        id: string;
        name: string;
        name_en: string;
        emoji: string;
        image?: string;
    }>;
}
export interface BudgetRange {
    label_ar: string;
    label_en: string;
    min: number;
    max: number;
    icon: string;
    description_ar?: string;
    description_en?: string;
    popular?: boolean;
}
export interface HotelCard {
    hotel_id?: string;
    hotel_name_ar: string;
    hotel_name_en: string;
    priceEGP: number;
    priceUSD?: number;
    rating?: number;
    amenities?: string[];
    description_ar?: string;
    description_en?: string;
    image?: string;
    area_ar?: string;
    area_en?: string;
}
export interface QuickReply {
    label_ar: string;
    label_en: string;
    value: string;
    emoji?: string;
}
export interface HotelFilters {
    stars?: Array<{
        value: number;
        label: string;
    }>;
    mealPlans?: Array<{
        value: string;
        label_ar: string;
        label_en: string;
    }>;
    areas?: Array<{
        value: string;
        label_ar: string;
        label_en: string;
    }>;
}
export interface MealPlan {
    value: string;
    label_ar: string;
    label_en: string;
    icon: string;
    description_ar?: string;
    description_en?: string;
}
export interface RoomType {
    value: string;
    label_ar: string;
    label_en: string;
    icon: string;
    capacity?: number;
    description_ar?: string;
    description_en?: string;
}
export interface BookingSummaryData {
    destination: string;
    hotel: string;
    mealPlan: string;
    roomType: string;
    travelers?: number;
    startDate?: string;
    endDate?: string;
    budget?: any;
}
export interface BookingAction {
    text_ar: string;
    text_en: string;
    value: string;
    variant?: string;
}
export interface SupportRequest {
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
    userId?: string;
    lang?: Language;
}
export interface SupportResponse {
    ok: boolean;
    error?: string;
    message?: string;
}
export interface ContactInfo {
    name: string;
    phone: string;
    email: string;
}
export interface ButtonOption {
    text: string;
    value: string;
}
export interface Attachment {
    name: string;
    size: number;
    type: string;
    previewUrl?: string;
}
//# sourceMappingURL=index.d.ts.map