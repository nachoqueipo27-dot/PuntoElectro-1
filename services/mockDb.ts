
import { Product, Category, Brand, Service, SiteConfig, Order, User } from '../types';
import { supabase } from './supabaseClient';
import { ProductDAO } from './db/products';
import { CategoryDAO } from './db/categories';
import { BrandDAO } from './db/brands';
import { ServiceDAO } from './db/servicesRepo';
import { OrderDAO } from './db/orders';
import { UserDAO } from './db/users';
import { ConfigDAO } from './db/config';

export const MockDb = {
    // Config
    getConfig: async (): Promise<SiteConfig> => {
        try {
            const { data, error } = await supabase
                .from('site_config')
                .select('data')
                .eq('id', 1)
                .single();

            if (data && data.data) {
                const defaults = ConfigDAO.getConfig();
                const fetched = data.data as any; // Cast to access properties flexibly

                // Deep merge or specific field fallback to ensure safety
                return {
                    ...defaults,
                    ...fetched,
                    // Ensure arrays are never null/undefined even if DB has them as null
                    banners: fetched.banners || defaults.banners || [],
                    branches: fetched.branches || defaults.branches || [],
                    features: fetched.features || defaults.features || [],
                    checkout: {
                        ...defaults.checkout,
                        ...(fetched.checkout || {}),
                        fields: fetched.checkout?.fields || defaults.checkout?.fields || [],
                        paymentMethods: fetched.checkout?.paymentMethods || defaults.checkout?.paymentMethods || []
                    },
                    hero: { ...defaults.hero, ...(fetched.hero || {}) },
                    categoriesSection: { ...defaults.categoriesSection, ...(fetched.categoriesSection || {}) },
                    promoBanner: { ...defaults.promoBanner, ...(fetched.promoBanner || {}) },
                    contact: { ...defaults.contact, ...(fetched.contact || {}) },
                    footer: { ...defaults.footer, ...(fetched.footer || {}) }
                } as SiteConfig;
            }

            // If no config exists in DB, try to seed it with local default
            const localConfig = ConfigDAO.getConfig();
            await supabase.from('site_config').upsert({ id: 1, data: localConfig });
            return localConfig;

        } catch (e) {
            console.warn("Supabase (Config): Offline or Error. Using local fallback.");
            return ConfigDAO.getConfig();
        }
    },
    saveConfig: async (config: SiteConfig) => {
        try {
            const { error } = await supabase
                .from('site_config')
                .upsert({ id: 1, data: config });

            if (error) throw error;
        } catch (e) {
            console.error("SUPABASE ERROR (saveConfig):", e);
            ConfigDAO.saveConfig(config);
        }
    },

    // Products
    getProducts: async (): Promise<Product[]> => {
        try {
            const { data, error } = await supabase.from('products').select('*');
            if (error) throw error;
            return data || [];
        } catch (e) {
            console.warn("Supabase (Products): Using local fallback.");
            return ProductDAO.getProducts();
        }
    },
    addProduct: async (p: Product) => {
        try {
            const { error } = await supabase.from('products').insert(p);
            if (error) throw error;
        } catch (e) {
            console.error("SUPABASE ERROR (addProduct):", e);
            // Local fallback
            const products = ProductDAO.getProducts();
            products.push(p);
            ProductDAO.saveProducts(products);
        }
    },
    updateProduct: async (p: Product) => {
        try {
            const { error } = await supabase.from('products').update(p).eq('id', p.id);
            if (error) throw error;
        } catch (e) {
            console.error("SUPABASE ERROR (updateProduct):", e);
            const products = ProductDAO.getProducts();
            const index = products.findIndex(prod => prod.id === p.id);
            if (index !== -1) {
                products[index] = p;
                ProductDAO.saveProducts(products);
            }
        }
    },
    deleteProduct: async (id: string) => {
        try {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) throw error;
        } catch (e) {
            console.error("SUPABASE ERROR (deleteProduct):", e);
            const products = ProductDAO.getProducts();
            ProductDAO.saveProducts(products.filter(p => p.id !== id));
        }
    },

    // Bulk Updates (Discounts)
    updateProductsDiscountByCategory: async (cat: string, discount: number) => {
        try {
            const { error } = await supabase
                .from('products')
                .update({ discount })
                .eq('category', cat);
            if (error) throw error;
        } catch (e) {
            console.error("SUPABASE ERROR (updateProductsDiscountByCategory):", e);
            const products = ProductDAO.getProducts();
            const updated = products.map(p => p.category === cat ? { ...p, discount } : p);
            ProductDAO.saveProducts(updated);
        }
    },
    updateProductsDiscountByBrand: async (brand: string, discount: number) => {
        try {
            const { error } = await supabase
                .from('products')
                .update({ discount })
                .eq('brand', brand);
            if (error) throw error;
        } catch (e) {
            console.error("SUPABASE ERROR (updateProductsDiscountByBrand):", e);
            const products = ProductDAO.getProducts();
            const updated = products.map(p => p.brand === brand ? { ...p, discount } : p);
            ProductDAO.saveProducts(updated);
        }
    },
    updateProductDiscount: async (id: string, discount: number) => {
        try {
            const { error } = await supabase
                .from('products')
                .update({ discount })
                .eq('id', id);
            if (error) throw error;
        } catch (e) {
            console.error("SUPABASE ERROR (updateProductDiscount):", e);
            const products = ProductDAO.getProducts();
            const updated = products.map(p => p.id === id ? { ...p, discount } : p);
            ProductDAO.saveProducts(updated);
        }
    },

    // Categories
    getCategories: async (): Promise<Category[]> => {
        try {
            const { data, error } = await supabase.from('categories').select('*');
            if (error) throw error;
            return data || [];
        } catch (e) {
            return CategoryDAO.getCategories();
        }
    },
    addCategory: async (c: Category) => {
        try {
            const { error } = await supabase.from('categories').insert(c);
            if (error) throw error;
        } catch (e) {
            console.error("SUPABASE ERROR (addCategory):", e);
            const categories = CategoryDAO.getCategories();
            categories.push(c);
            CategoryDAO.saveCategories(categories);
        }
    },
    updateCategory: async (c: Category) => {
        try {
            const { error } = await supabase.from('categories').update(c).eq('id', c.id);
            if (error) throw error;
        } catch (e) {
            console.error("SUPABASE ERROR (updateCategory):", e);
            const categories = CategoryDAO.getCategories();
            const index = categories.findIndex(cat => cat.id === c.id);
            if (index !== -1) {
                categories[index] = c;
                CategoryDAO.saveCategories(categories);
            }
        }
    },
    deleteCategory: async (id: string) => {
        try {
            const { error } = await supabase.from('categories').delete().eq('id', id);
            if (error) throw error;
        } catch (e) {
            console.error("SUPABASE ERROR (deleteCategory):", e);
            const categories = CategoryDAO.getCategories();
            CategoryDAO.saveCategories(categories.filter(c => c.id !== id));
        }
    },

    // Brands
    getBrands: async (): Promise<Brand[]> => {
        try {
            const { data, error } = await supabase.from('brands').select('*');
            if (error) throw error;
            return data || [];
        } catch (e) {
            return BrandDAO.getBrands();
        }
    },
    addBrand: async (b: Brand) => {
        try {
            const { error } = await supabase.from('brands').insert(b);
            if (error) throw error;
        } catch (e) {
            console.error("SUPABASE ERROR (addBrand):", e);
            const brands = BrandDAO.getBrands();
            brands.push(b);
            BrandDAO.saveBrands(brands);
        }
    },
    updateBrand: async (b: Brand) => {
        try {
            const { error } = await supabase.from('brands').update(b).eq('id', b.id);
            if (error) throw error;
        } catch (e) {
            console.error("SUPABASE ERROR (updateBrand):", e);
            const brands = BrandDAO.getBrands();
            const index = brands.findIndex(brand => brand.id === b.id);
            if (index !== -1) {
                brands[index] = b;
                BrandDAO.saveBrands(brands);
            }
        }
    },
    deleteBrand: async (id: string) => {
        try {
            const { error } = await supabase.from('brands').delete().eq('id', id);
            if (error) throw error;
        } catch (e) {
            console.error("SUPABASE ERROR (deleteBrand):", e);
            const brands = BrandDAO.getBrands();
            BrandDAO.saveBrands(brands.filter(b => b.id !== id));
        }
    },

    // Services
    getServices: async (): Promise<Service[]> => {
        try {
            const { data, error } = await supabase.from('services').select('*');
            if (error) throw error;
            return data || [];
        } catch (e) {
            return ServiceDAO.getServices();
        }
    },
    addService: async (s: Service) => {
        try {
            const { error } = await supabase.from('services').insert(s);
            if (error) throw error;
        } catch (e) {
            console.error("SUPABASE ERROR (addService):", e);
            const services = ServiceDAO.getServices();
            services.push(s);
            ServiceDAO.saveServices(services);
        }
    },
    updateService: async (s: Service) => {
        try {
            const { error } = await supabase.from('services').update(s).eq('id', s.id);
            if (error) throw error;
        } catch (e) {
            console.error("SUPABASE ERROR (updateService):", e);
            const services = ServiceDAO.getServices();
            const index = services.findIndex(ser => ser.id === s.id);
            if (index !== -1) {
                services[index] = s;
                ServiceDAO.saveServices(services);
            }
        }
    },
    deleteService: async (id: string) => {
        try {
            const { error } = await supabase.from('services').delete().eq('id', id);
            if (error) throw error;
        } catch (e) {
            console.error("SUPABASE ERROR (deleteService):", e);
            const services = ServiceDAO.getServices();
            ServiceDAO.saveServices(services.filter(s => s.id !== id));
        }
    },

    // Orders
    getOrders: async (): Promise<Order[]> => {
        try {
            const { data, error } = await supabase.from('orders').select('*').order('date', { ascending: false });
            if (error) throw error;
            return data || [];
        } catch (e) {
            return OrderDAO.getOrders();
        }
    },
    addOrder: async (o: Order) => {
        try {
            const { error } = await supabase.from('orders').insert(o);
            if (error) throw error;
        } catch (e) {
            console.error("SUPABASE ERROR (addOrder):", e);
            OrderDAO.addOrder(o);
        }
    },
    updateOrder: async (o: Order) => {
        try {
            const { error } = await supabase.from('orders').update(o).eq('id', o.id);
            if (error) throw error;
        } catch (e) {
            console.error("SUPABASE ERROR (updateOrder):", e);
            const orders = OrderDAO.getOrders();
            const index = orders.findIndex(ord => ord.id === o.id);
            if (index !== -1) {
                orders[index] = o;
                OrderDAO.saveOrders(orders);
            }
        }
    },

    // Users
    getUsers: async (): Promise<User[]> => {
        try {
            const { data, error } = await supabase.from('users').select('*');
            if (error) throw error;
            return data || [];
        } catch (e) {
            return UserDAO.getUsers();
        }
    },
    addUser: async (u: User) => {
        try {
            const { error } = await supabase.from('users').insert(u);
            if (error) throw error;
        } catch (e) {
            console.error("SUPABASE ERROR (addUser):", e);
            UserDAO.addUser(u);
        }
    },
    findUserByEmail: async (email: string): Promise<User | undefined> => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .ilike('email', email) // Case insensitive
                .maybeSingle();

            if (error) throw error;
            return data || undefined;
        } catch (e) {
            return UserDAO.findUserByEmail(email);
        }
    }
};
