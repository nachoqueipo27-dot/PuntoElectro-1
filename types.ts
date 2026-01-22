
export interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    brand?: string;
    description: string;
    image: string;
    featured: boolean;
    stock: number;
    discount?: number;
}

export interface CartItem extends Product {
    quantity: number;
}

export interface Category {
    id: string;
    name: string;
    image: string;
}

export interface Brand {
    id: string;
    name: string;
    category?: string; // Linked category
}

export interface Service {
    id: string;
    title: string;
    description: string;
    icon: string;
}

export interface Branch {
    id: string;
    name: string;
    address: string;
    phone: string;
    mapUrl: string;
    embedUrl?: string; // New field for Iframe
}

export interface Banner {
    id: string;
    image: string;
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
}

export interface CheckoutField {
    id: string;
    label: string;
    type: 'text' | 'email' | 'tel' | 'number' | 'textarea';
    required: boolean;
    placeholder: string;
    width: 'full' | 'half';
}

export interface PaymentMethod {
    id: string;
    label: string;
    subLabel: string;
    icon: string;
    active: boolean;
    discountPercent: number;
}

export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    password?: string;
    role: 'admin' | 'user';
}

export interface AuthResponse {
    success: boolean;
    message: string;
    user?: User;
}

export interface Order {
    id: string;
    customerEmail: string;
    customerName: string;
    customerPhone: string;
    items: CartItem[];
    total: number;
    status: 'pending' | 'completed' | 'cancelled';
    date: string;
    deliveryMethod: 'shipping' | 'pickup';
    deliveryAddress?: string;
    paymentMethod: string;
    notes?: string;
}

export interface SiteConfig {
    theme: {
        background: string;
        primary: string;
        secondary: string;
        text: string;
    };
    hero: {
        badgeText: string;
    };
    categoriesSection: {
        title: string;
        subtitle: string;
    };
    features: {
        icon: string;
        title: string;
        subtitle: string;
    }[];
    sectionBackgrounds: {
        trustIndicators: string;
        categories: string;
    };
    bestSellers: {
        title: string;
        backgroundColor: string;
        backgroundImage: string;
        textColor: string;
        productIds: string[];
        enableAnimations: boolean;
        marqueeSpeed: number;
    };
    promoBanner: {
        image: string;
        title: string;
        text: string;
        ctaText: string;
        tagText: string;
    };
    checkout: {
        whatsappNumber: string;
        viewCartTitle: string;
        checkoutTitle: string;
        successMessage: string;
        styles: {
            headerBg: string;
            headerText: string;
            checkoutBtnBg: string;
            checkoutBtnText: string;
            fontFamily: string;
        };
        fields: CheckoutField[];
        paymentMethods: PaymentMethod[];
    };
    footer: {
        description: string;
        titleNavigation: string;
        titleContact: string;
        titleHours: string;
        labelCustomerService: string;
        labelShipping: string;
        textShippingHours: string;
        copyrightText: string;
    };
    banners: Banner[];
    contact: {
        phone: string;
        email: string;
        address: string;
        hours: string;
        instagram?: string; // Added
        facebook?: string; // Added
        actionButton: {
            text: string;
            url: string;
        };
    };
    branches: Branch[];
}

export enum GeminiModel {
    IMAGE_GEN_PRO = 'gemini-3-pro-image-preview',
    IMAGE_EDIT_FLASH = 'gemini-2.5-flash-image'
}

export interface FlyingItemState {
    id: number;
    src: string;
    start: {
        top: number;
        left: number;
        width: number;
    };
    target: {
        top: number;
        left: number;
    };
}
