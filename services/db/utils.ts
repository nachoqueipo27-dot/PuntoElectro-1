
export const KEYS = {
    PRODUCTS: 'punto_electro_products',
    CATEGORIES: 'punto_electro_categories',
    BRANDS: 'punto_electro_brands',
    SERVICES: 'punto_electro_services',
    CONFIG: 'punto_electro_config',
    ORDERS: 'punto_electro_orders',
    USERS: 'punto_electro_users'
};

export function loadOrSet<T>(key: string, defaultVal: T): T {
    const stored = localStorage.getItem(key);
    if (stored) {
        try {
            if (key === KEYS.CONFIG) {
                let parsed;
                try {
                    parsed = JSON.parse(stored);
                } catch (e) {
                    console.error("Config parse error, resetting", e);
                    return JSON.parse(JSON.stringify(defaultVal));
                }

                // ROBUST DEEP MERGE with defaultVal
                const merged = { ...defaultVal, ...parsed } as any;

                // Ensure specific nested objects exist to avoid crashes on old configs
                if (!merged.theme) merged.theme = (defaultVal as any).theme;
                if (!merged.hero) merged.hero = (defaultVal as any).hero;
                if (!merged.categoriesSection) merged.categoriesSection = (defaultVal as any).categoriesSection;
                if (!merged.bestSellers) merged.bestSellers = (defaultVal as any).bestSellers;
                if (!merged.promoBanner) merged.promoBanner = (defaultVal as any).promoBanner;
                if (!merged.checkout) merged.checkout = (defaultVal as any).checkout;
                if (!merged.footer) merged.footer = (defaultVal as any).footer;
                if (!merged.banners) merged.banners = (defaultVal as any).banners;
                if (!merged.contact) merged.contact = (defaultVal as any).contact;
                if (!merged.branches) merged.branches = (defaultVal as any).branches;
                if (!merged.features) merged.features = (defaultVal as any).features;
                if (!merged.sectionBackgrounds) merged.sectionBackgrounds = (defaultVal as any).sectionBackgrounds;

                // Checkouts & Details
                if (!merged.checkout.styles) merged.checkout.styles = (defaultVal as any).checkout.styles;
                if (!merged.checkout.paymentMethods) merged.checkout.paymentMethods = (defaultVal as any).checkout.paymentMethods;
                if (!merged.contact.actionButton) merged.contact.actionButton = (defaultVal as any).contact.actionButton;
                
                return merged;
            }
            return JSON.parse(stored);
        } catch (e) {
            console.error(`Error parsing ${key}, resetting to default.`, e);
            // Fallthrough to return default
        }
    }
    
    // Return a COPY of the default value to ensure we don't pass references to frozen/const objects
    const copy = JSON.parse(JSON.stringify(defaultVal));
    localStorage.setItem(key, JSON.stringify(copy));
    return copy;
}
