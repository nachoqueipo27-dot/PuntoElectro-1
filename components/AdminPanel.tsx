
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Product, SiteConfig, Order, Category, Service, Brand, Banner, CheckoutField, PaymentMethod, CartItem, Branch } from '../types';
import { MockDb } from '../services/mockDb';
import { Trash2, Edit, Plus, Save, Image, Package, Home, List, Phone, AlertTriangle, X, LogOut, ArrowLeft, ChevronLeft, ChevronRight, Zap, Truck, ShieldCheck, Headset, CreditCard, MapPin, Palette, LayoutTemplate, BatteryCharging, Menu, Sun, Moon, Star, CheckSquare, Square, Search, Layers, Percent, ToggleLeft, ToggleRight, Clock, Mail, Monitor, ExternalLink, MessageCircle, Layout, Gauge, Tag, Upload, ClipboardList, CheckCircle, ShoppingCart, Banknote, Landmark, Wallet, Bitcoin, DollarSign, Type, Settings, Filter, User, Minus, XCircle, ChevronDown, ChevronUp, Sparkles, Percent as PercentIcon, ImageIcon, Link as LinkIcon, Globe, QrCode, Smartphone, PaintBucket, Store, Wrench, PenTool } from 'lucide-react';

// Import SVG Logo from Layout or redefine local
const PuntoLogo = ({ size = 64 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="50" fill="#006CFF" />
        <path d="M58 20L28 56H48L40 82L74 42H52Z" fill="white" />
    </svg>
);

interface AdminPanelProps {
    onLogout: () => void;
    onGoHome: () => void;
    onDataUpdate?: () => void; // New prop for triggering data refresh in App
}

// Helper UI for Image URL Input
const ImageUrlInputUI = ({ currentImage, onChange, label, isDarkMode }: { currentImage?: string, onChange: (val: string) => void, label: string, isDarkMode: boolean }) => {
    return (
        <div>
            <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{label}</label>
            <div className={`flex flex-col gap-3 p-3 rounded-xl border transition-all ${isDarkMode ? 'border-slate-600 bg-slate-900' : 'border-slate-300 bg-slate-50'}`}>
                <div className="flex gap-2 items-center">
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-white text-slate-500 border border-slate-200'}`}>
                        <LinkIcon size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="https://ejemplo.com/imagen.jpg"
                        className={`flex-1 p-2 bg-transparent border-none outline-none text-sm font-mono ${isDarkMode ? 'text-white placeholder-slate-600' : 'text-slate-800 placeholder-slate-400'}`}
                        value={currentImage || ''}
                        onChange={(e) => onChange(e.target.value)}
                    />
                </div>
                {currentImage && (
                    <div className="relative w-full h-40 rounded-lg overflow-hidden bg-black/5 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                        <img
                            src={currentImage}
                            className="h-full object-contain"
                            alt="Preview"
                            onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                        />
                    </div>
                )}
            </div>
            <p className="text-[10px] text-slate-500 mt-1 pl-1">Pega la URL directa de la imagen.</p>
        </div>
    );
};

// Helper for Icons in Services
const IconSelector = ({ selected, onChange, isDarkMode }: { selected: string, onChange: (v: string) => void, isDarkMode: boolean }) => {
    const icons = ['Zap', 'Truck', 'ShieldCheck', 'Headset', 'CreditCard', 'BatteryCharging', 'Wrench', 'Package', 'Clock', 'Award'];

    return (
        <div>
            <label className="block font-bold mb-2 text-sm">Icono</label>
            <div className="grid grid-cols-5 gap-2">
                {icons.map(icon => (
                    <button
                        key={icon}
                        type="button"
                        onClick={() => onChange(icon)}
                        className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-1 transition ${selected === icon ? 'bg-blue-100 border-blue-500 text-blue-600' : isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                    >
                        <div className="scale-75"><Zap size={24} /></div> {/* Generic placeholder icon, would need IconRenderer here or just rely on text */}
                        <span className="text-[10px] font-bold">{icon}</span>
                    </button>
                ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">Selecciona un icono representativo.</p>
        </div>
    );
};

export const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout, onGoHome, onDataUpdate }) => {
    const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'brands' | 'services' | 'branches' | 'config' | 'checkout' | 'banners' | 'orders' | 'discounts' | 'branding'>('products');
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [config, setConfig] = useState<SiteConfig | null>(null);

    // Scroll Ref
    const mainRef = useRef<HTMLElement>(null);

    // Theme State
    const [isDarkMode, setIsDarkMode] = useState(true);

    // Mobile Menu State
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Edit States
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

    // Discount State
    const [discountType, setDiscountType] = useState<'category' | 'brand' | 'product'>('category');
    const [selectedDiscountTarget, setSelectedDiscountTarget] = useState<string>('');
    const [discountValue, setDiscountValue] = useState<number>(0);

    // Banner Edit Extra State
    const [bannerLinkType, setBannerLinkType] = useState<string>('custom');

    // Order Modal Specific States
    const [orderProductSearch, setOrderProductSearch] = useState('');

    // Search States
    const [productSearch, setProductSearch] = useState('');
    const [categorySearch, setCategorySearch] = useState('');
    const [orderSearch, setOrderSearch] = useState('');

    // Sorting State
    const [sortField, setSortField] = useState<keyof Product | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    // Bulk Actions
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [deleteTarget, setDeleteTarget] = useState<{ id: string, type: string, name: string } | null>(null);

    useEffect(() => {
        refreshData();
    }, []);

    // Scroll to top when active tab changes
    useEffect(() => {
        if (mainRef.current) {
            mainRef.current.scrollTo(0, 0);
        }
    }, [activeTab]);

    // Clear selection when changing tabs
    useEffect(() => {
        setSelectedIds(new Set());
    }, [activeTab]);

    const refreshData = async () => {
        try {
            const [p, c, b, s, o, conf] = await Promise.all([
                MockDb.getProducts(),
                MockDb.getCategories(),
                MockDb.getBrands(),
                MockDb.getServices(),
                MockDb.getOrders(),
                MockDb.getConfig()
            ]);
            setProducts(p);
            setCategories(c);
            setBrands(b);
            setServices(s);
            setOrders(o);
            setConfig(conf);
        } catch (e) {
            console.error("Error loading admin data", e);
        }
    };

    // handleImageUpload function removed - now using direct URL input

    const handleSaveProductReal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;

        const exists = products.find(p => p.id === editingProduct.id);

        if (exists) {
            await MockDb.updateProduct(editingProduct);
        } else {
            await MockDb.addProduct(editingProduct);
        }
        setEditingProduct(null);
        refreshData();
        if (onDataUpdate) onDataUpdate();
    };

    const handleSaveOrderReal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingOrder) return;

        const total = editingOrder.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const orderToSave = { ...editingOrder, total };

        const exists = orders.find(o => o.id === orderToSave.id);

        if (exists) {
            await MockDb.updateOrder(orderToSave);
        } else {
            await MockDb.addOrder(orderToSave);
        }
        setEditingOrder(null);
        refreshData();
        if (onDataUpdate) onDataUpdate();
    };

    const handleSaveCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCategory) return;

        const exists = categories.find(c => c.id === editingCategory.id);
        if (exists) {
            await MockDb.updateCategory(editingCategory);
        } else {
            await MockDb.addCategory(editingCategory);
        }

        setEditingCategory(null);
        refreshData();
        if (onDataUpdate) onDataUpdate();
    };

    const handleSaveBrand = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBrand) return;

        const exists = brands.find(b => b.id === editingBrand.id);
        if (exists) {
            await MockDb.updateBrand(editingBrand);
        } else {
            await MockDb.addBrand(editingBrand);
        }

        setEditingBrand(null);
        refreshData();
        if (onDataUpdate) onDataUpdate();
    };

    const handleSaveService = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingService) return;

        const exists = services.find(s => s.id === editingService.id);
        if (exists) {
            await MockDb.updateService(editingService);
        } else {
            await MockDb.addService(editingService);
        }

        setEditingService(null);
        refreshData();
        if (onDataUpdate) onDataUpdate();
    };

    const handleSaveBranch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBranch || !config) return;

        const updatedBranches = [...config.branches];
        const index = updatedBranches.findIndex(b => b.id === editingBranch.id);

        if (index !== -1) {
            updatedBranches[index] = editingBranch;
        } else {
            updatedBranches.push(editingBranch);
        }

        const newConfig = { ...config, branches: updatedBranches };
        await MockDb.saveConfig(newConfig);
        setConfig(newConfig);
        setEditingBranch(null);
        if (onDataUpdate) onDataUpdate();
    };

    const handleDeleteBranch = async (id: string) => {
        if (!config || !window.confirm('¿Eliminar sucursal?')) return;
        const newBranches = config.branches.filter(b => b.id !== id);
        const newConfig = { ...config, branches: newBranches };
        await MockDb.saveConfig(newConfig);
        setConfig(newConfig);
        if (onDataUpdate) onDataUpdate();
    };

    const handleSaveBanner = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBanner || !config) return;

        const updatedBanners = [...(config.banners || [])];
        const index = updatedBanners.findIndex(b => b.id === editingBanner.id);

        if (index !== -1) {
            updatedBanners[index] = editingBanner;
        } else {
            updatedBanners.push(editingBanner);
        }

        const newConfig = { ...config, banners: updatedBanners };
        await MockDb.saveConfig(newConfig);
        setConfig(newConfig);
        setEditingBanner(null);
        if (onDataUpdate) onDataUpdate();
    };

    const handleDeleteBanner = async (id: string) => {
        if (!config || !window.confirm('¿Eliminar Banner?')) return;
        const newBanners = (config.banners || []).filter(b => b.id !== id);
        const newConfig = { ...config, banners: newBanners };
        await MockDb.saveConfig(newConfig);
        setConfig(newConfig);
        if (onDataUpdate) onDataUpdate();
    };

    const handleConfigChange = (section: keyof SiteConfig, key: string, value: any) => {
        setConfig(prev => {
            if (!prev) return prev;
            const newConfig = { ...prev };

            // Handle deeply nested updates
            if (section === 'contact' && key.startsWith('actionButton.')) {
                const subKey = key.split('.')[1];
                newConfig.contact = {
                    ...newConfig.contact,
                    actionButton: {
                        ...newConfig.contact.actionButton,
                        [subKey]: value
                    }
                };
            } else if (['theme', 'hero', 'categoriesSection', 'footer', 'contact', 'promoBanner', 'bestSellers', 'checkout'].includes(section as string)) {
                (newConfig as any)[section] = { ...(newConfig as any)[section], [key]: value };
            } else {
                (newConfig as any)[section] = value;
            }
            MockDb.saveConfig(newConfig);
            if (onDataUpdate) onDataUpdate();
            return newConfig;
        });
    };

    const handleCheckoutChange = (subSection: string, value: any) => {
        if (!config) return;
        const newConfig = { ...config };
        (newConfig.checkout as any)[subSection] = value;
        setConfig(newConfig);
        MockDb.saveConfig(newConfig);
        if (onDataUpdate) onDataUpdate();
    };

    const handleCheckoutStyleChange = (styleKey: string, value: string) => {
        if (!config) return;
        const newConfig = { ...config };
        if (!newConfig.checkout.styles) {
            newConfig.checkout.styles = {
                headerBg: '#ffffff',
                headerText: '#1e293b',
                checkoutBtnBg: '#0f172a',
                checkoutBtnText: '#ffffff',
                fontFamily: 'Inter'
            };
        }
        (newConfig.checkout.styles as any)[styleKey] = value;
        setConfig(newConfig);
        MockDb.saveConfig(newConfig);
        if (onDataUpdate) onDataUpdate();
    };

    const handlePaymentMethodChange = (id: string, field: string, value: any) => {
        if (!config) return;
        const newMethods = config.checkout.paymentMethods.map(m => m.id === id ? { ...m, [field]: value } : m);
        handleConfigChange('checkout', 'paymentMethods', newMethods);
    };

    const togglePaymentMethod = (id: string) => {
        if (!config) return;
        const newMethods = config.checkout.paymentMethods.map(m => m.id === id ? { ...m, active: !m.active } : m);
        handleConfigChange('checkout', 'paymentMethods', newMethods);
    };

    const deletePaymentMethod = (id: string) => {
        if (!config || !window.confirm("¿Eliminar método de pago?")) return;
        const newMethods = config.checkout.paymentMethods.filter(m => m.id !== id);
        handleConfigChange('checkout', 'paymentMethods', newMethods);
    }

    const addPaymentMethod = () => {
        if (!config) return;
        const newMethod: PaymentMethod = {
            id: crypto.randomUUID(),
            label: 'Nuevo Método',
            subLabel: 'Descripción',
            icon: 'CreditCard',
            active: true,
            discountPercent: 0
        };
        handleConfigChange('checkout', 'paymentMethods', [...config.checkout.paymentMethods, newMethod]);
    };

    // Special handler for Best Sellers Product Selection
    const toggleBestSellerProduct = (productId: string) => {
        if (!config) return;
        const currentIds = config.bestSellers.productIds || [];
        const newIds = currentIds.includes(productId)
            ? currentIds.filter(id => id !== productId)
            : [...currentIds, productId];

        handleConfigChange('bestSellers', 'productIds', newIds);
    };

    const handleUpdateOrderStatus = async (orderId: string, newStatus: 'pending' | 'completed' | 'cancelled') => {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        // STOCK DEDUCTION LOGIC
        if (newStatus === 'completed' && order.status !== 'completed') {
            const confirmDeduction = window.confirm("Al marcar como completado se descontará el stock de los productos. ¿Continuar?");
            if (!confirmDeduction) return;

            // Iterate and deduct
            for (const item of order.items) {
                const product = products.find(p => p.id === item.id);
                if (product) {
                    const newStock = Math.max(0, product.stock - item.quantity);
                    const updatedProduct = { ...product, stock: newStock };

                    // Update DB
                    await MockDb.updateProduct(updatedProduct);

                    // Update Local State immediately
                    setProducts(prev => prev.map(p => p.id === item.id ? updatedProduct : p));
                }
            }
        }

        const updatedOrder = { ...order, status: newStatus };
        setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
        await MockDb.updateOrder(updatedOrder);

        if (onDataUpdate) onDataUpdate();
    };

    const handleApplyDiscount = async () => {
        if (!window.confirm(`¿Aplicar ${discountValue}% de descuento a ${selectedDiscountTarget || 'todos'}?`)) return;

        if (discountType === 'category') {
            await MockDb.updateProductsDiscountByCategory(selectedDiscountTarget, discountValue);
        } else if (discountType === 'brand') {
            await MockDb.updateProductsDiscountByBrand(selectedDiscountTarget, discountValue);
        } else if (discountType === 'product') {
            await MockDb.updateProductDiscount(selectedDiscountTarget, discountValue);
        }

        alert('Descuentos aplicados correctamente');
        refreshData();
        if (onDataUpdate) onDataUpdate();
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        const { id, type } = deleteTarget;

        if (type === 'product') {
            await MockDb.deleteProduct(id);
            setProducts(prev => prev.filter(p => p.id !== id));
        } else if (type === 'category') {
            await MockDb.deleteCategory(id);
            setCategories(prev => prev.filter(c => c.id !== id));
        } else if (type === 'brand') {
            await MockDb.deleteBrand(id);
            setBrands(prev => prev.filter(b => b.id !== id));
        } else if (type === 'service') {
            await MockDb.deleteService(id);
            setServices(prev => prev.filter(s => s.id !== id));
        }
        setDeleteTarget(null);
        if (onDataUpdate) onDataUpdate();
    };

    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const toggleSelectAll = (items: { id: string }[]) => {
        const allSelected = items.length > 0 && items.every(i => selectedIds.has(i.id));
        const newSet = new Set(selectedIds);
        if (allSelected) items.forEach(i => newSet.delete(i.id));
        else items.forEach(i => newSet.add(i.id));
        setSelectedIds(newSet);
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`¿Estás seguro de que quieres eliminar ${selectedIds.size} elementos seleccionados?`)) return;
        if (activeTab === 'products') {
            for (const id of Array.from(selectedIds)) {
                await MockDb.deleteProduct(id as string);
            }
            refreshData();
            if (onDataUpdate) onDataUpdate();
        }
        setSelectedIds(new Set<string>());
    };

    const handleSort = (field: keyof Product) => { if (sortField === field) setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); else { setSortField(field); setSortDirection('asc'); } };
    const handleNavClick = (tab: any) => { setActiveTab(tab); setIsMobileMenuOpen(false); };

    const addProductToOrder = (product: Product) => {
        if (!editingOrder) return;
        const existingItem = (editingOrder.items || []).find(i => i.id === product.id);
        let newItems;
        if (existingItem) newItems = editingOrder.items.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
        else newItems = [...(editingOrder.items || []), { ...product, quantity: 1 }];
        setEditingOrder({ ...editingOrder, items: newItems });
    };
    const removeProductFromOrder = (productId: string) => { if (!editingOrder) return; setEditingOrder({ ...editingOrder, items: editingOrder.items.filter(i => i.id !== productId) }); };
    const updateOrderProductQty = (productId: string, delta: number) => { if (!editingOrder) return; setEditingOrder({ ...editingOrder, items: editingOrder.items.map(i => { if (i.id === productId) return { ...i, quantity: Math.max(1, i.quantity + delta) }; return i; }) }); };

    const sortedProducts = useMemo(() => {
        let data = products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()));
        if (sortField) {
            data = [...data].sort((a, b) => {
                const valA = a[sortField];
                const valB = b[sortField];
                if (typeof valA === 'string' && typeof valB === 'string') return sortDirection === 'asc' ? valA.localeCompare(valB as string) : (valB as string).localeCompare(valA as string);
                if (valA === undefined || valB === undefined) return 0;
                if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
                if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return data;
    }, [products, productSearch, sortField, sortDirection]);

    const filteredCategories = categories.filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase()));
    const filteredOrders = orders.filter(o => o.id.includes(orderSearch) || o.customerName?.toLowerCase().includes(orderSearch.toLowerCase()) || o.customerPhone?.includes(orderSearch));

    // Calculate Banner Link Type Logic
    useEffect(() => {
        if (editingBanner) {
            const link = editingBanner.ctaLink;
            if (['#/home', '#/shop', '#/services', '#/branches', '#/contact'].includes(link)) {
                setBannerLinkType(link);
            } else if (link.startsWith('#/shop?cat=')) {
                setBannerLinkType('category');
            } else {
                setBannerLinkType('custom');
            }
        }
    }, [editingBanner]);

    const handleBannerLinkTypeChange = (type: string) => {
        setBannerLinkType(type);
        if (type !== 'category' && type !== 'custom') {
            setEditingBanner(prev => prev ? { ...prev, ctaLink: type } : null);
        } else if (type === 'category') {
            // Default first category
            const firstCat = categories[0]?.name || '';
            setEditingBanner(prev => prev ? { ...prev, ctaLink: `#/shop?cat=${firstCat}` } : null);
        }
    };

    const handleBannerCategoryChange = (catName: string) => {
        setEditingBanner(prev => prev ? { ...prev, ctaLink: `#/shop?cat=${catName}` } : null);
    };

    if (!config) return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">Cargando panel...</div>;

    return (
        <div className={`min-h-screen flex flex-col md:flex-row ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-900'}`}>
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-[260px] border-r transform transition-transform duration-300 flex flex-col
                md:translate-x-0 md:static md:h-screen md:sticky md:top-0
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}
            `}>
                <div className={`p-5 flex justify-between items-center flex-shrink-0 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Package className="text-white" size={18} />
                        </div>
                        <span>Admin</span>
                    </h2>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"><X size={18} /></button>
                </div>
                <nav className="p-3 space-y-0.5 overflow-y-auto flex-1 custom-scrollbar">
                    {[
                        { id: 'products', label: 'Productos', icon: Package },
                        { id: 'categories', label: 'Categorías', icon: List },
                        { id: 'brands', label: 'Marcas', icon: Tag },
                        { id: 'services', label: 'Servicios', icon: Zap },
                        { id: 'banners', label: 'Banners', icon: ImageIcon },
                        { id: 'branches', label: 'Sucursales', icon: MapPin },
                        { id: 'discounts', label: 'Descuentos', icon: PercentIcon },
                        { id: 'orders', label: 'Pedidos', icon: ClipboardList },
                        { id: 'checkout', label: 'Checkout', icon: CreditCard },
                        { id: 'config', label: 'Configuración', icon: Settings },
                        { id: 'branding', label: 'Branding', icon: PenTool },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => handleNavClick(item.id)}
                            className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 text-sm font-medium transition-all duration-150 ${activeTab === item.id
                                ? isDarkMode
                                    ? 'bg-slate-800 text-white shadow-sm'
                                    : 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
                                : isDarkMode
                                    ? 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                }`}
                        >
                            <item.icon size={18} className={activeTab === item.id ? 'text-blue-500' : ''} /> {item.label}
                        </button>
                    ))}
                </nav>
                <div className={`p-3 border-t mt-auto flex-shrink-0 space-y-1 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                    <button onClick={() => setIsDarkMode(!isDarkMode)} className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition ${isDarkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-50'}`}>
                        {isDarkMode ? <Sun size={16} /> : <Moon size={16} />} {isDarkMode ? 'Claro' : 'Oscuro'}
                    </button>
                    <button onClick={onGoHome} className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition ${isDarkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-50'}`}><ArrowLeft size={16} /> Volver</button>
                    <button onClick={onLogout} className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"><LogOut size={16} /> Salir</button>
                </div>
            </aside>

            <main ref={mainRef} className={`flex-1 p-6 md:p-8 overflow-y-auto h-[calc(100vh-65px)] md:h-screen custom-scrollbar ${isDarkMode ? 'bg-slate-950' : 'bg-slate-100'}`}>

                {/* --- BRANDING / ASSETS TAB --- */}
                {activeTab === 'branding' && (
                    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-3xl font-bold">Identidad de Marca</h2>
                                <p className="text-sm opacity-60">Logotipo oficial y recursos visuales para redes sociales y enlaces.</p>
                            </div>
                        </div>

                        <div className={`p-8 rounded-2xl border flex flex-col items-center text-center space-y-6 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                            <div className="p-10 bg-white rounded-3xl shadow-xl">
                                <PuntoLogo size={256} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold mb-2">Logotipo Principal</h3>
                                <p className="opacity-70 max-w-md mx-auto">
                                    Isotipo vectorial escalable. Círculo Azul Eléctrico (#006CFF) con rayo blanco minimalista formando la 'P' de Punto.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mt-8">
                                <div className="p-6 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                                    <h4 className="font-bold mb-4">Uso en Fondo Claro</h4>
                                    <div className="flex justify-center p-8 bg-white rounded-xl border border-dashed border-slate-300">
                                        <PuntoLogo size={128} />
                                    </div>
                                </div>
                                <div className="p-6 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                                    <h4 className="font-bold mb-4">Uso en Fondo Oscuro</h4>
                                    <div className="flex justify-center p-8 bg-slate-950 rounded-xl border border-dashed border-slate-700">
                                        <PuntoLogo size={128} />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700 w-full text-left">
                                <h4 className="font-bold mb-4 flex items-center gap-2"><Globe size={20} /> Open Graph & Favicon</h4>
                                <p className="text-sm opacity-70 mb-4">
                                    Este logo ya está configurado como el <strong>Favicon</strong> del sitio web y se utilizará automáticamente en las tarjetas de vista previa de enlaces (WhatsApp, Facebook, etc).
                                </p>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500">
                                        <CheckCircle size={18} />
                                        <span className="text-sm font-bold">Favicon Activo (32x32)</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500">
                                        <CheckCircle size={18} />
                                        <span className="text-sm font-bold">SVG Vectorial Listo</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'products' && (
                    <div className="max-w-6xl mx-auto">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                            <div>
                                <h2 className="text-2xl font-semibold">Productos</h2>
                                <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{sortedProducts.length} productos registrados</p>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                {selectedIds.size > 0 && <button onClick={handleBulkDelete} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition"><Trash2 size={16} /> Eliminar ({selectedIds.size})</button>}
                                <button onClick={() => setEditingProduct({ id: crypto.randomUUID(), name: '', price: 0, category: categories[0]?.name || '', brand: '', description: '', image: '', featured: false, stock: 0 })} className="bg-slate-900 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition"><Plus size={16} /> Nuevo Producto</button>
                            </div>
                        </div>
                        <div className={`relative mb-4`}>
                            <Search size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                            <input type="text" placeholder="Buscar productos..." className={`w-full pl-10 pr-4 py-3 rounded-xl border-0 text-sm transition focus:ring-2 focus:ring-blue-500/20 ${isDarkMode ? 'bg-slate-800 text-white placeholder-slate-500' : 'bg-white text-slate-900 placeholder-slate-400 shadow-sm'}`} value={productSearch} onChange={e => setProductSearch(e.target.value)} />
                        </div>

                        <div className={`rounded-xl overflow-hidden ${isDarkMode ? 'bg-slate-900 ring-1 ring-slate-800' : 'bg-white ring-1 ring-slate-200 shadow-sm'}`}>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className={isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}>
                                            <th className="px-4 py-3 w-10"><input type="checkbox" className="w-4 h-4 rounded border-slate-300" checked={sortedProducts.length > 0 && sortedProducts.every(p => selectedIds.has(p.id))} onChange={() => toggleSelectAll(sortedProducts)} /></th>
                                            <th className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Imagen</th>
                                            <th className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:text-blue-500 transition ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} onClick={() => handleSort('name')}>Nombre</th>
                                            <th className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:text-blue-500 transition ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} onClick={() => handleSort('category')}>Categoría</th>
                                            <th className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:text-blue-500 transition ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} onClick={() => handleSort('price')}>Precio</th>
                                            <th className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Stock</th>
                                            <th className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-right ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
                                        {sortedProducts.map(p => (
                                            <tr key={p.id} className={`transition ${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/50'}`}>
                                                <td className="px-4 py-4"><input type="checkbox" className="w-4 h-4 rounded border-slate-300" checked={selectedIds.has(p.id)} onChange={() => toggleSelection(p.id)} /></td>
                                                <td className="px-4 py-4"><div className="w-10 h-10 rounded-lg bg-white border border-slate-100 flex items-center justify-center overflow-hidden"><img src={p.image} className="w-full h-full object-contain" alt="" /></div></td>
                                                <td className="px-4 py-4"><span className="font-medium">{p.name}</span></td>
                                                <td className={`px-4 py-4 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{p.category}</td>
                                                <td className="px-4 py-4 font-medium">${p.price.toLocaleString()}</td>
                                                <td className={`px-4 py-4 ${p.stock < 5 ? 'text-red-500 font-semibold' : ''}`}>{p.stock}</td>
                                                <td className="px-4 py-4 text-right">
                                                    <button onClick={() => setEditingProduct(p)} className={`p-2 rounded-lg transition ${isDarkMode ? 'hover:bg-slate-700 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'}`}><Edit size={16} /></button>
                                                    <button onClick={() => setDeleteTarget({ id: p.id, type: 'product', name: p.name })} className={`p-2 rounded-lg transition ${isDarkMode ? 'hover:bg-red-900/30 text-slate-400 hover:text-red-400' : 'hover:bg-red-50 text-slate-400 hover:text-red-500'}`}><Trash2 size={16} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'categories' && (
                    <div className="max-w-4xl mx-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-3xl font-bold">Categorías</h2>
                            <button onClick={() => setEditingCategory({ id: crypto.randomUUID(), name: '', image: '' })} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex gap-2"><Plus size={20} /> Nueva</button>
                        </div>
                        <input type="text" placeholder="Buscar categoría..." className={`w-full p-3 rounded-lg mb-4 border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`} value={categorySearch} onChange={e => setCategorySearch(e.target.value)} />

                        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`}>
                            {filteredCategories.map(c => (
                                <div key={c.id} className={`p-4 rounded-xl border flex items-center gap-4 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                                    <img src={c.image} className="w-16 h-16 rounded-lg object-cover bg-slate-100" alt={c.name} />
                                    <div className="flex-1">
                                        <h3 className="font-bold">{c.name}</h3>
                                        <p className="text-xs opacity-60">ID: {c.id}</p>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <button onClick={() => setEditingCategory(c)} className="p-2 text-blue-500 bg-blue-50 dark:bg-slate-700 rounded-lg"><Edit size={16} /></button>
                                        <button onClick={() => setDeleteTarget({ id: c.id, type: 'category', name: c.name })} className="p-2 text-red-500 bg-red-50 dark:bg-slate-700 rounded-lg"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'brands' && (
                    <div className="max-w-4xl mx-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-3xl font-bold">Marcas</h2>
                            <button onClick={() => setEditingBrand({ id: crypto.randomUUID(), name: '', category: categories[0]?.name || '' })} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex gap-2"><Plus size={20} /> Nueva</button>
                        </div>

                        <div className={`rounded-xl border overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                            <table className="w-full text-left">
                                <thead className={`text-xs uppercase ${isDarkMode ? 'bg-slate-900 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                                    <tr>
                                        <th className="p-4">Nombre</th>
                                        <th className="p-4">Categoría Principal</th>
                                        <th className="p-4 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {brands.map(b => (
                                        <tr key={b.id} className={isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-blue-50'}>
                                            <td className="p-4 font-bold">{b.name}</td>
                                            <td className="p-4 text-sm opacity-80">{b.category}</td>
                                            <td className="p-4 text-right flex justify-end gap-2">
                                                <button onClick={() => setEditingBrand(b)} className="p-2 text-blue-500"><Edit size={18} /></button>
                                                <button onClick={() => setDeleteTarget({ id: b.id, type: 'brand', name: b.name })} className="p-2 text-red-500"><Trash2 size={18} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'services' && (
                    <div className="max-w-5xl mx-auto">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-3xl font-bold">Servicios</h2>
                                <p className="text-sm opacity-60">Gestiona los servicios visibles en la página web.</p>
                            </div>
                            <button onClick={() => setEditingService({ id: crypto.randomUUID(), title: '', description: '', icon: 'Zap' })} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex gap-2"><Plus size={20} /> Nuevo Servicio</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {services.map(s => (
                                <div key={s.id} className={`p-6 rounded-2xl border transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-750' : 'bg-white border-slate-200 hover:shadow-md'} flex flex-col justify-between`}>
                                    <div className="mb-4">
                                        <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${isDarkMode ? 'bg-slate-700 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                            <Zap size={24} /> {/* Placeholder, in real app render dynamic icon */}
                                            <span className="sr-only">{s.icon}</span>
                                        </div>
                                        <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                                        <p className="text-sm opacity-70 line-clamp-3">{s.description}</p>
                                    </div>
                                    <div className="flex gap-2 pt-4 border-t border-slate-700/50">
                                        <button onClick={() => setEditingService(s)} className="flex-1 py-2 text-sm font-bold rounded-lg bg-blue-50 text-blue-600 dark:bg-slate-700 dark:text-blue-400 hover:opacity-80">Editar</button>
                                        <button onClick={() => setDeleteTarget({ id: s.id, type: 'service', name: s.title })} className="flex-1 py-2 text-sm font-bold rounded-lg bg-red-50 text-red-600 dark:bg-slate-700 dark:text-red-400 hover:opacity-80">Eliminar</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'banners' && (
                    <div className="max-w-4xl mx-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-3xl font-bold">Banners (Carrusel)</h2>
                            <button onClick={() => setEditingBanner({ id: crypto.randomUUID(), image: '', title: '', subtitle: '', ctaText: 'Ver Más', ctaLink: '#/shop' })} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex gap-2"><Plus size={20} /> Nuevo</button>
                        </div>
                        <div className="space-y-6">
                            {config.banners.map((b, index) => (
                                <div key={b.id} className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                                    <div className="h-40 w-full relative">
                                        <img src={b.image} className="w-full h-full object-cover" alt="Banner" />
                                        <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs font-bold">Slide {index + 1}</div>
                                    </div>
                                    <div className="p-6 flex justify-between items-center">
                                        <div>
                                            <h3 className="font-bold text-xl">{b.title}</h3>
                                            <p className="opacity-70">{b.subtitle}</p>
                                            <div className="mt-2 text-sm text-blue-500 font-bold">{b.ctaText} → {b.ctaLink}</div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => setEditingBanner(b)} className="p-3 text-blue-500 bg-blue-50 dark:bg-slate-700 rounded-xl"><Edit size={20} /></button>
                                            <button onClick={() => handleDeleteBanner(b.id)} className="p-3 text-red-500 bg-red-50 dark:bg-slate-700 rounded-xl"><Trash2 size={20} /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'discounts' && (
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold mb-6 flex items-center gap-2"><PercentIcon className="text-blue-500" /> Gestión de Descuentos</h2>
                        <div className={`p-8 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wide opacity-50 mb-2">1. Selecciona el Tipo de Objetivo</label>
                                    <div className="flex gap-4">
                                        <button onClick={() => { setDiscountType('category'); setSelectedDiscountTarget(''); }} className={`flex-1 py-3 px-4 rounded-xl font-bold border-2 transition ${discountType === 'category' ? 'border-blue-500 bg-blue-500/10 text-blue-500' : 'border-slate-600 text-slate-400'}`}>Categoría</button>
                                        <button onClick={() => { setDiscountType('brand'); setSelectedDiscountTarget(''); }} className={`flex-1 py-3 px-4 rounded-xl font-bold border-2 transition ${discountType === 'brand' ? 'border-blue-500 bg-blue-500/10 text-blue-500' : 'border-slate-600 text-slate-400'}`}>Marca</button>
                                        <button onClick={() => { setDiscountType('product'); setSelectedDiscountTarget(''); }} className={`flex-1 py-3 px-4 rounded-xl font-bold border-2 transition ${discountType === 'product' ? 'border-blue-500 bg-blue-500/10 text-blue-500' : 'border-slate-600 text-slate-400'}`}>Producto Individual</button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wide opacity-50 mb-2">2. Selecciona el Elemento</label>
                                    <select
                                        className={`w-full p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50'}`}
                                        value={selectedDiscountTarget}
                                        onChange={(e) => setSelectedDiscountTarget(e.target.value)}
                                    >
                                        <option value="">-- Seleccionar --</option>
                                        {discountType === 'category' && categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                        {discountType === 'brand' && brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                                        {discountType === 'product' && products.sort((a, b) => a.name.localeCompare(b.name)).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wide opacity-50 mb-2">3. Porcentaje de Descuento (%)</label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            className={`w-32 p-4 rounded-xl border font-bold text-center text-xl ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50'}`}
                                            value={discountValue}
                                            onChange={(e) => setDiscountValue(Number(e.target.value))}
                                        />
                                        <span className="text-2xl font-bold">%</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">Ingresa 0 para quitar el descuento.</p>
                                </div>

                                <div className="pt-4 border-t border-slate-700">
                                    <button
                                        onClick={handleApplyDiscount}
                                        disabled={!selectedDiscountTarget}
                                        className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
                                    >
                                        Aplicar Descuento
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="max-w-6xl mx-auto">
                        <div className="flex justify-between mb-6">
                            <h2 className="text-3xl font-bold">Pedidos</h2>
                            <button onClick={() => setEditingOrder({ id: crypto.randomUUID(), customerName: '', customerPhone: '', customerEmail: '', items: [], total: 0, status: 'pending', date: new Date().toLocaleDateString(), deliveryMethod: 'pickup', paymentMethod: 'Efectivo' })} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex gap-2"><Plus size={20} /> Nuevo</button>
                        </div>
                        <input type="text" placeholder="Buscar pedido..." className={`w-full p-3 rounded-lg mb-4 border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`} value={orderSearch} onChange={e => setOrderSearch(e.target.value)} />
                        <div className={`rounded-xl border overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                            <table className="w-full text-left">
                                <thead className={`text-xs uppercase ${isDarkMode ? 'bg-slate-900 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                                    <tr>
                                        <th className="p-4">ID</th>
                                        <th className="p-4">Fecha</th>
                                        <th className="p-4">Cliente</th>
                                        <th className="p-4">Total</th>
                                        <th className="p-4">Productos</th>
                                        <th className="p-4">Estado</th>
                                        <th className="p-4 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.map(o => (
                                        <tr key={o.id} className={isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-blue-50'}>
                                            <td className="p-4 font-mono text-sm">{o.id}</td>
                                            <td className="p-4 text-sm">{o.date}</td>
                                            <td className="p-4">
                                                <div className="font-bold text-sm">{o.customerName}</div>
                                                <div className="text-xs opacity-60">{o.customerPhone}</div>
                                            </td>
                                            <td className="p-4 font-bold">${o.total.toLocaleString()}</td>
                                            <td className="p-4 text-sm">{o.items?.length || 0} items</td>
                                            <td className="p-4"><select value={o.status} onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as any)} className="p-1 rounded border bg-transparent"><option value="pending">Pendiente</option><option value="completed">Completado</option><option value="cancelled">Cancelado</option></select></td>
                                            <td className="p-4 text-right"><button onClick={() => setEditingOrder(o)} className="p-2 text-blue-500"><Edit size={18} /></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* --- NUEVA PESTAÑA: EDITOR CHECKOUT --- */}
                {activeTab === 'checkout' && (
                    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <h2 className="text-3xl font-bold">Editor de Checkout</h2>
                            <p className="text-sm opacity-60">Personaliza la experiencia de compra y los métodos de pago.</p>
                        </div>

                        {/* Configuración General del Checkout */}
                        <div className={`p-8 rounded-2xl border space-y-6 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                            <h3 className="font-bold text-xl border-b pb-4 flex items-center gap-2 text-blue-500"><Settings size={20} /> Configuración General</h3>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-xs font-bold mb-2 opacity-70 uppercase tracking-wide">Número WhatsApp (Receptor)</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" size={18} />
                                        <input type="text" className={`w-full pl-10 p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50'}`} value={config.checkout.whatsappNumber} onChange={(e) => handleCheckoutChange('whatsappNumber', e.target.value)} placeholder="54911..." />
                                    </div>
                                    <p className="text-[10px] mt-1 opacity-50">Sin espacios, guiones ni símbolo +.</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold mb-2 opacity-70 uppercase tracking-wide">Título de la Página</label>
                                    <input type="text" className={`w-full p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50'}`} value={config.checkout.checkoutTitle} onChange={(e) => handleCheckoutChange('checkoutTitle', e.target.value)} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold mb-2 opacity-70 uppercase tracking-wide">Mensaje de Éxito</label>
                                    <input type="text" className={`w-full p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50'}`} value={config.checkout.successMessage} onChange={(e) => handleCheckoutChange('successMessage', e.target.value)} />
                                </div>
                            </div>
                        </div>

                        {/* Estilos Visuales */}
                        <div className={`p-8 rounded-2xl border space-y-6 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                            <h3 className="font-bold text-xl border-b pb-4 flex items-center gap-2 text-purple-500"><PaintBucket size={20} /> Estilo Visual</h3>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-xs font-bold mb-2 opacity-70">Fondo Encabezado</label>
                                    <div className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900">
                                        <input type="color" className="h-8 w-8 rounded cursor-pointer border-none bg-transparent" value={config.checkout.styles?.headerBg || '#ffffff'} onChange={(e) => handleCheckoutStyleChange('headerBg', e.target.value)} />
                                        <span className="text-xs font-mono opacity-80">{config.checkout.styles?.headerBg}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold mb-2 opacity-70">Texto Encabezado</label>
                                    <div className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900">
                                        <input type="color" className="h-8 w-8 rounded cursor-pointer border-none bg-transparent" value={config.checkout.styles?.headerText || '#000000'} onChange={(e) => handleCheckoutStyleChange('headerText', e.target.value)} />
                                        <span className="text-xs font-mono opacity-80">{config.checkout.styles?.headerText}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold mb-2 opacity-70">Botón Checkout</label>
                                    <div className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900">
                                        <input type="color" className="h-8 w-8 rounded cursor-pointer border-none bg-transparent" value={config.checkout.styles?.checkoutBtnBg || '#000000'} onChange={(e) => handleCheckoutStyleChange('checkoutBtnBg', e.target.value)} />
                                        <span className="text-xs font-mono opacity-80">{config.checkout.styles?.checkoutBtnBg}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Métodos de Pago */}
                        <div className={`p-8 rounded-2xl border space-y-6 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                            <div className="flex justify-between items-center border-b pb-4">
                                <h3 className="font-bold text-xl flex items-center gap-2 text-green-500"><CreditCard size={20} /> Métodos de Pago</h3>
                                <button onClick={addPaymentMethod} className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-green-700 transition shadow-lg shadow-green-600/20 text-sm">
                                    <Plus size={18} /> Agregar Método
                                </button>
                            </div>

                            <div className="space-y-4">
                                {config.checkout.paymentMethods.map(method => (
                                    <div key={method.id} className={`p-5 rounded-2xl border transition-all ${isDarkMode ? 'bg-slate-900 border-slate-700 hover:border-slate-500' : 'bg-slate-50 border-slate-200 hover:border-slate-300'} flex flex-col md:flex-row gap-6 items-start md:items-center`}>

                                        {/* Active Toggle & Label */}
                                        <div className="flex items-center gap-4 flex-1">
                                            <button
                                                onClick={() => togglePaymentMethod(method.id)}
                                                className={`p-3 rounded-xl transition-colors ${method.active ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-200 text-slate-400 dark:bg-slate-800'}`}
                                            >
                                                {method.active ? <CheckSquare size={24} /> : <Square size={24} />}
                                            </button>
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    className={`text-lg font-bold bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 outline-none w-full transition-colors ${!method.active && 'opacity-50'}`}
                                                    value={method.label}
                                                    onChange={(e) => handlePaymentMethodChange(method.id, 'label', e.target.value)}
                                                    placeholder="Nombre del método"
                                                />
                                            </div>
                                        </div>

                                        {/* Details */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full md:w-auto">
                                            <div>
                                                <label className="block text-[10px] font-bold uppercase opacity-50 mb-1">Subtítulo</label>
                                                <input type="text" className={`w-full p-2 rounded-lg text-sm bg-transparent border ${isDarkMode ? 'border-slate-700 focus:border-blue-500' : 'border-slate-300 focus:border-blue-500'}`} value={method.subLabel} onChange={(e) => handlePaymentMethodChange(method.id, 'subLabel', e.target.value)} placeholder="Ej: 10% OFF" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold uppercase opacity-50 mb-1">Desc %</label>
                                                <div className="relative">
                                                    <input type="number" className={`w-full p-2 pl-2 pr-6 rounded-lg text-sm bg-transparent border ${isDarkMode ? 'border-slate-700 focus:border-blue-500' : 'border-slate-300 focus:border-blue-500'}`} value={method.discountPercent} onChange={(e) => handlePaymentMethodChange(method.id, 'discountPercent', Number(e.target.value))} />
                                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs opacity-50">%</span>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold uppercase opacity-50 mb-1">Icono</label>
                                                <select className={`w-full p-2 rounded-lg text-sm bg-transparent border ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-300 bg-white'}`} value={method.icon} onChange={(e) => handlePaymentMethodChange(method.id, 'icon', e.target.value)}>
                                                    <option value="Banknote">Billete</option>
                                                    <option value="Landmark">Banco</option>
                                                    <option value="CreditCard">Tarjeta</option>
                                                    <option value="QrCode">QR / Link</option>
                                                    <option value="Smartphone">Celular (MP)</option>
                                                    <option value="Wallet">Billetera</option>
                                                    <option value="DollarSign">Dólar</option>
                                                    <option value="Bitcoin">Cripto</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <button onClick={() => deletePaymentMethod(method.id)} className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition self-end md:self-center">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'config' && (
                    <div className="max-w-4xl mx-auto space-y-8">
                        <div className="mb-6">
                            <h2 className="text-3xl font-bold">Configuración del Sitio</h2>
                            <p className="text-sm opacity-60">Gestiona la información visible en la página de inicio y pie de página.</p>
                        </div>

                        {/* --- CONTACTO --- */}
                        <div className={`p-6 rounded-2xl border space-y-6 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                            <h3 className="font-bold text-xl border-b pb-2 flex items-center gap-2"><Phone size={20} /> Información de Contacto</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div><label className="block text-xs font-bold mb-1 opacity-70">Teléfono Visible</label><input type="text" className={`w-full p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50'}`} value={config.contact.phone} onChange={(e) => handleConfigChange('contact', 'phone', e.target.value)} /></div>
                                <div><label className="block text-xs font-bold mb-1 opacity-70">Email de Ventas</label><input type="text" className={`w-full p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50'}`} value={config.contact.email} onChange={(e) => handleConfigChange('contact', 'email', e.target.value)} /></div>
                                <div className="md:col-span-2"><label className="block text-xs font-bold mb-1 opacity-70">Dirección Física</label><input type="text" className={`w-full p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50'}`} value={config.contact.address} onChange={(e) => handleConfigChange('contact', 'address', e.target.value)} /></div>
                                <div className="md:col-span-2"><label className="block text-xs font-bold mb-1 opacity-70">Horarios de Atención</label><input type="text" className={`w-full p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50'}`} value={config.contact.hours} onChange={(e) => handleConfigChange('contact', 'hours', e.target.value)} /></div>
                            </div>

                            <div className="border-t pt-4 border-slate-200 dark:border-slate-700">
                                <h4 className="font-bold text-sm mb-4 text-blue-500">Botón de WhatsApp (Fijo en Contacto)</h4>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold mb-1 opacity-70">Texto del Botón</label>
                                        <input type="text" className={`w-full p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50'}`} value={config.contact.actionButton?.text || ''} onChange={(e) => handleConfigChange('contact', 'actionButton.text', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold mb-1 opacity-70">Enlace WhatsApp (https://wa.me/...)</label>
                                        <input type="text" className={`w-full p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50'}`} value={config.contact.actionButton?.url || ''} onChange={(e) => handleConfigChange('contact', 'actionButton.url', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* --- MÁS VENDIDOS / DESTACADOS --- */}
                        <div className={`p-6 rounded-2xl border space-y-6 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                            {/* ... (Existing best sellers code remains unchanged) ... */}
                            <h3 className="font-bold text-xl border-b pb-2 flex items-center gap-2"><Star size={20} /> Sección "Más Vendidos"</h3>

                            <div className="grid md:grid-cols-3 gap-6">
                                <div><label className="block text-xs font-bold mb-1 opacity-70">Título de la Sección</label><input type="text" className={`w-full p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50'}`} value={config.bestSellers.title} onChange={(e) => handleConfigChange('bestSellers', 'title', e.target.value)} /></div>
                                <div><label className="block text-xs font-bold mb-1 opacity-70">Color de Fondo (Hex)</label><div className="flex gap-2"><input type="color" className="h-12 w-12 rounded cursor-pointer" value={config.bestSellers.backgroundColor} onChange={(e) => handleConfigChange('bestSellers', 'backgroundColor', e.target.value)} /><input type="text" className={`flex-1 p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50'}`} value={config.bestSellers.backgroundColor} onChange={(e) => handleConfigChange('bestSellers', 'backgroundColor', e.target.value)} /></div></div>
                                <div><label className="block text-xs font-bold mb-1 opacity-70">Color de Texto (Hex)</label><div className="flex gap-2"><input type="color" className="h-12 w-12 rounded cursor-pointer" value={config.bestSellers.textColor} onChange={(e) => handleConfigChange('bestSellers', 'textColor', e.target.value)} /><input type="text" className={`flex-1 p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50'}`} value={config.bestSellers.textColor} onChange={(e) => handleConfigChange('bestSellers', 'textColor', e.target.value)} /></div></div>
                            </div>

                            <ImageUrlInputUI label="Imagen de Fondo (Opcional)" currentImage={config.bestSellers.backgroundImage} onChange={(val) => handleConfigChange('bestSellers', 'backgroundImage', val)} isDarkMode={isDarkMode} />

                            <div className="grid md:grid-cols-2 gap-6">
                                <div><label className="block text-xs font-bold mb-1 opacity-70">Velocidad Carrusel (segundos)</label><input type="number" className={`w-full p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50'}`} value={config.bestSellers.marqueeSpeed} onChange={(e) => handleConfigChange('bestSellers', 'marqueeSpeed', Number(e.target.value))} /></div>
                                <div className="flex items-center gap-4 h-full pt-4">
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={config.bestSellers.enableAnimations} onChange={(e) => handleConfigChange('bestSellers', 'enableAnimations', e.target.checked)} />
                                        <span className="font-bold">Habilitar Animaciones</span>
                                    </label>
                                </div>
                            </div>

                            <div className="border-t pt-4 border-slate-200 dark:border-slate-700">
                                <label className="block text-sm font-bold mb-4 opacity-80">Seleccionar Productos Destacados</label>
                                <div className={`max-h-60 overflow-y-auto rounded-xl border p-2 custom-scrollbar ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
                                    {products.map(p => (
                                        <label key={p.id} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-black/5 dark:hover:bg-white/5`}>
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded text-blue-600"
                                                checked={(config.bestSellers.productIds || []).includes(p.id)}
                                                onChange={() => toggleBestSellerProduct(p.id)}
                                            />
                                            <img src={p.image} className="w-8 h-8 rounded object-contain bg-white" alt="" />
                                            <div className="flex-1">
                                                <div className="text-sm font-bold">{p.name}</div>
                                                <div className="text-xs opacity-60">{p.brand} - ${p.price}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                                <p className="text-xs text-slate-500 mt-2">Selecciona los productos que aparecerán en el carrusel de inicio.</p>
                            </div>
                        </div>

                        {/* --- PROMO BANNER (Industrial) --- */}
                        <div className={`p-6 rounded-2xl border space-y-6 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                            <h3 className="font-bold text-xl border-b pb-2 flex items-center gap-2"><Zap size={20} /> Banner Promocional (Industrial)</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div><label className="block text-xs font-bold mb-1 opacity-70">Etiqueta (Tag)</label><input type="text" className={`w-full p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50'}`} value={config.promoBanner.tagText} onChange={(e) => handleConfigChange('promoBanner', 'tagText', e.target.value)} /></div>
                                <div><label className="block text-xs font-bold mb-1 opacity-70">Título</label><input type="text" className={`w-full p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50'}`} value={config.promoBanner.title} onChange={(e) => handleConfigChange('promoBanner', 'title', e.target.value)} /></div>
                                <div className="md:col-span-2"><label className="block text-xs font-bold mb-1 opacity-70">Descripción</label><textarea className={`w-full p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50'}`} value={config.promoBanner.text} onChange={(e) => handleConfigChange('promoBanner', 'text', e.target.value)} /></div>
                                <div><label className="block text-xs font-bold mb-1 opacity-70">Texto del Botón</label><input type="text" className={`w-full p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50'}`} value={config.promoBanner.ctaText} onChange={(e) => handleConfigChange('promoBanner', 'ctaText', e.target.value)} /></div>
                            </div>
                            <ImageUrlInputUI label="Imagen de Fondo" currentImage={config.promoBanner.image} onChange={(val) => handleConfigChange('promoBanner', 'image', val)} isDarkMode={isDarkMode} />
                        </div>

                        {/* --- HERO TEXTOS --- */}
                        <div className={`p-6 rounded-2xl border space-y-6 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                            <h3 className="font-bold text-xl border-b pb-2">Textos Hero Section</h3>
                            <div><label className="block text-xs font-bold mb-1 opacity-70">Badge Superior</label><input type="text" className={`w-full p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50'}`} value={config.hero.badgeText} onChange={(e) => handleConfigChange('hero', 'badgeText', e.target.value)} /></div>
                        </div>
                    </div>
                )}

                {activeTab === 'branches' && (
                    <div className="max-w-4xl mx-auto">
                        <div className="flex justify-between mb-6">
                            <h2 className="text-3xl font-bold">Sucursales</h2>
                            <button onClick={() => setEditingBranch({ id: crypto.randomUUID(), name: '', address: '', phone: '', mapUrl: '', embedUrl: '' })} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex gap-2"><Plus size={20} /> Nueva</button>
                        </div>
                        <div className="space-y-4">
                            {config.branches.map(b => (
                                <div key={b.id} className={`p-4 rounded-xl border flex justify-between items-center ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                                    <div>
                                        <h3 className="font-bold">{b.name}</h3>
                                        <p className="text-sm opacity-70">{b.address}</p>
                                        <div className="flex gap-2 mt-1">
                                            {b.mapUrl && <a href={b.mapUrl} target="_blank" className="text-xs text-blue-500 hover:underline flex items-center gap-1"><ExternalLink size={10} /> Ver Mapa</a>}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setEditingBranch(b)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg"><Edit size={18} /></button>
                                        <button onClick={() => handleDeleteBranch(b.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-slate-700 rounded-lg"><Trash2 size={18} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* MODALS */}
            {editingProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className={`w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white'}`}>
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="text-2xl font-bold">{editingProduct.id.length > 10 ? 'Nuevo Producto' : 'Editar Producto'}</h3>
                            <button onClick={() => setEditingProduct(null)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><X /></button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                            <form id="product-form" onSubmit={handleSaveProductReal} className="space-y-6">
                                <div><label className="block font-bold mb-2 text-sm">Nombre</label><input type="text" required className={`w-full p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50 border-slate-200'}`} value={editingProduct.name} onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })} /></div>
                                <div className="grid grid-cols-2 gap-4"><div><label className="block font-bold mb-2 text-sm">Precio</label><input type="number" className={`w-full p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50 border-slate-200'}`} value={editingProduct.price} onChange={e => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })} /></div><div><label className="block font-bold mb-2 text-sm">Stock</label><input type="number" className={`w-full p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50 border-slate-200'}`} value={editingProduct.stock} onChange={e => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })} /></div></div>
                                <div className="grid grid-cols-2 gap-4"><div><label className="block font-bold mb-2 text-sm">Categoría</label><select className={`w-full p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50'}`} value={editingProduct.category} onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })}>{categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</select></div><div><label className="block font-bold mb-2 text-sm">Marca</label><select className={`w-full p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50'}`} value={editingProduct.brand || ''} onChange={e => setEditingProduct({ ...editingProduct, brand: e.target.value })}>{brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}</select></div></div>
                                <div><label className="block font-bold mb-2 text-sm">Descripción</label><textarea className={`w-full p-3 rounded-xl border h-24 ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50'}`} value={editingProduct.description} onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}></textarea></div>
                                <ImageUrlInputUI label="Imagen" currentImage={editingProduct.image} onChange={(val) => setEditingProduct(prev => prev ? { ...prev, image: val } : null)} isDarkMode={isDarkMode} />
                            </form>
                        </div>
                        <div className="p-6 border-t border-slate-100 dark:border-slate-700">
                            <button type="submit" form="product-form" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition">Guardar Cambios</button>
                        </div>
                    </div>
                </div>
            )}

            {editingOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className={`w-full max-w-4xl rounded-3xl shadow-xl flex flex-col max-h-[90vh] ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white'}`}>
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold">Gestionar Pedido: {editingOrder.id}</h3>
                            <button onClick={() => setEditingOrder(null)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"><X /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            <div className="grid md:grid-cols-2 gap-8 mb-8">
                                <div className="space-y-4">
                                    <h4 className="font-bold border-b pb-2 mb-4">Datos del Cliente</h4>
                                    <div><label className="block text-xs font-bold mb-1 opacity-70">Nombre Cliente</label><input type="text" className={`w-full p-2 rounded-lg border ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50'}`} value={editingOrder.customerName} onChange={e => setEditingOrder({ ...editingOrder, customerName: e.target.value })} /></div>
                                    <div><label className="block text-xs font-bold mb-1 opacity-70">Estado</label><select className={`w-full p-2 rounded-lg border ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50'}`} value={editingOrder.status} onChange={e => setEditingOrder({ ...editingOrder, status: e.target.value as any })}><option value="pending">Pendiente</option><option value="completed">Completado</option><option value="cancelled">Cancelado</option></select></div>
                                </div>
                            </div>

                            {/* --- IMPROVED PRODUCT LIST IN MODAL --- */}
                            <div className="space-y-4 mb-8">
                                <h4 className="font-bold border-b pb-2 mb-2">Productos Solicitados</h4>
                                <div className={`border rounded-xl overflow-hidden ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                                    {(editingOrder.items || []).map(item => (
                                        <div key={item.id} className={`flex items-center gap-4 p-3 border-b last:border-none ${isDarkMode ? 'border-slate-700 bg-slate-900' : 'border-slate-100 bg-white'}`}>
                                            <img src={item.image} className="w-12 h-12 object-contain bg-white rounded-lg border border-slate-200" alt="" />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-sm truncate">{item.name}</div>
                                                <div className="text-xs opacity-60 flex gap-2">
                                                    <span>${item.price.toLocaleString()} x {item.quantity}</span>
                                                    {item.discount ? <span className="text-red-500">(-{item.discount}%)</span> : null}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-sm">${(item.price * item.quantity).toLocaleString()}</div>
                                                <div className="flex items-center justify-end gap-2 mt-1">
                                                    <button onClick={() => updateOrderProductQty(item.id, -1)} className="p-1 rounded bg-slate-200 text-slate-600 hover:bg-slate-300"><Minus size={12} /></button>
                                                    <button onClick={() => updateOrderProductQty(item.id, 1)} className="p-1 rounded bg-slate-200 text-slate-600 hover:bg-slate-300"><Plus size={12} /></button>
                                                    <button onClick={() => removeProductFromOrder(item.id)} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {(editingOrder.items || []).length === 0 && (
                                        <div className="p-8 text-center opacity-50 text-sm">Sin productos agregados.</div>
                                    )}
                                </div>
                            </div>

                            <div className="mb-4 relative">
                                <label className="block text-xs font-bold mb-2 opacity-70">Agregar Producto al Pedido</label>
                                <div className="relative">
                                    <input type="text" placeholder="Buscar producto..." className={`w-full p-3 pl-10 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50'}`} value={orderProductSearch} onChange={e => setOrderProductSearch(e.target.value)} />
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" size={18} />
                                </div>
                                {orderProductSearch && (
                                    <div className={`absolute top-full left-0 right-0 mt-2 max-h-48 overflow-y-auto rounded-xl shadow-xl border z-20 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
                                        {products.filter(p => p.name.toLowerCase().includes(orderProductSearch.toLowerCase())).map(p => (
                                            <button key={p.id} onClick={() => { addProductToOrder(p); setOrderProductSearch(''); }} className="w-full text-left p-3 hover:bg-blue-50 dark:hover:bg-slate-700 flex justify-between items-center border-b dark:border-slate-700 last:border-none">
                                                <div className="flex items-center gap-2">
                                                    <img src={p.image} className="w-8 h-8 object-contain bg-white rounded" alt="" />
                                                    <span className="text-sm font-medium">{p.name}</span>
                                                </div>
                                                <span className="font-bold text-sm">${p.price}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 dark:border-slate-700">
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-bold">Total Estimado:</span>
                                <span className="text-2xl font-black">${editingOrder.items.reduce((acc, i) => acc + (i.price * i.quantity), 0).toLocaleString()}</span>
                            </div>
                            <button onClick={handleSaveOrderReal} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition">Guardar Cambios del Pedido</button>
                        </div>
                    </div>
                </div>
            )}

            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className={`w-full max-w-sm p-6 rounded-2xl shadow-2xl ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white'}`}>
                        <h3 className="text-xl font-bold text-center mb-2">¿Eliminar elemento?</h3>
                        <p className="text-center opacity-70 mb-6">"{deleteTarget.name}"</p>
                        <div className="flex gap-4">
                            <button onClick={() => setDeleteTarget(null)} className="flex-1 py-3 rounded-xl font-bold border hover:bg-slate-100 text-slate-600">Cancelar</button>
                            <button onClick={confirmDelete} className="flex-1 py-3 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700">Eliminar</button>
                        </div>
                    </div>
                </div>
            )}

            {editingCategory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className={`w-full max-w-lg rounded-3xl shadow-xl ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white'}`}>
                        <div className="p-6 border-b flex justify-between items-center"><h3 className="text-xl font-bold">Editar Categoría</h3><button onClick={() => setEditingCategory(null)}><X /></button></div>
                        <form onSubmit={handleSaveCategory} className="p-6 space-y-4">
                            <div><label className="block font-bold mb-2 text-sm">Nombre</label><input type="text" required className={`w-full p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50'}`} value={editingCategory.name} onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })} /></div>
                            <ImageUrlInputUI label="Imagen" currentImage={editingCategory.image} onChange={(val) => setEditingCategory(prev => prev ? { ...prev, image: val } : null)} isDarkMode={isDarkMode} />
                            <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl mt-4">Guardar</button>
                        </form>
                    </div>
                </div>
            )}

            {editingBrand && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className={`w-full max-w-lg rounded-3xl shadow-xl ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white'}`}>
                        <div className="p-6 border-b flex justify-between items-center"><h3 className="text-xl font-bold">Editar Marca</h3><button onClick={() => setEditingBrand(null)}><X /></button></div>
                        <form onSubmit={handleSaveBrand} className="p-6 space-y-4">
                            <div><label className="block font-bold mb-2 text-sm">Nombre</label><input type="text" required className={`w-full p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50'}`} value={editingBrand.name} onChange={e => setEditingBrand({ ...editingBrand, name: e.target.value })} /></div>
                            <div>
                                <label className="block font-bold mb-2 text-sm">Categoría</label>
                                <select className={`w-full p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50'}`} value={editingBrand.category || ''} onChange={e => setEditingBrand({ ...editingBrand, category: e.target.value })}>
                                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>
                            <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl mt-4">Guardar</button>
                        </form>
                    </div>
                </div>
            )}

            {editingService && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className={`w-full max-w-lg rounded-3xl shadow-xl ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white'}`}>
                        <div className="p-6 border-b flex justify-between items-center"><h3 className="text-xl font-bold">Editar Servicio</h3><button onClick={() => setEditingService(null)}><X /></button></div>
                        <form onSubmit={handleSaveService} className="p-6 space-y-4">
                            <div><label className="block font-bold mb-2 text-sm">Título</label><input type="text" required className={`w-full p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50'}`} value={editingService.title} onChange={e => setEditingService({ ...editingService, title: e.target.value })} /></div>
                            <div><label className="block font-bold mb-2 text-sm">Descripción</label><textarea required className={`w-full p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50'}`} value={editingService.description} onChange={e => setEditingService({ ...editingService, description: e.target.value })} /></div>
                            <IconSelector selected={editingService.icon} onChange={(icon) => setEditingService({ ...editingService, icon })} isDarkMode={isDarkMode} />
                            <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl mt-4">Guardar</button>
                        </form>
                    </div>
                </div>
            )}

            {editingBranch && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className={`w-full max-w-lg rounded-3xl shadow-xl ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white'}`}>
                        <div className="p-6 border-b flex justify-between items-center"><h3 className="text-xl font-bold">Editar Sucursal</h3><button onClick={() => setEditingBranch(null)}><X /></button></div>
                        <form onSubmit={handleSaveBranch} className="p-6 space-y-4">
                            <div><label className="block font-bold mb-2 text-sm">Nombre</label><input type="text" required className={`w-full p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50'}`} value={editingBranch.name} onChange={e => setEditingBranch({ ...editingBranch, name: e.target.value })} /></div>
                            <div><label className="block font-bold mb-2 text-sm">Dirección</label><input type="text" required className={`w-full p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50'}`} value={editingBranch.address} onChange={e => setEditingBranch({ ...editingBranch, address: e.target.value })} /></div>
                            <div><label className="block font-bold mb-2 text-sm">Teléfono</label><input type="text" className={`w-full p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50'}`} value={editingBranch.phone} onChange={e => setEditingBranch({ ...editingBranch, phone: e.target.value })} /></div>
                            <div><label className="block font-bold mb-2 text-sm">Link Mapa (Google Maps)</label><input type="text" placeholder="https://maps.app.goo.gl/..." className={`w-full p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50'}`} value={editingBranch.mapUrl} onChange={e => setEditingBranch({ ...editingBranch, mapUrl: e.target.value })} /></div>
                            <div><label className="block font-bold mb-2 text-sm">Link Embed (Iframe src)</label><input type="text" placeholder="https://www.google.com/maps/embed?..." className={`w-full p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50'}`} value={editingBranch.embedUrl || ''} onChange={e => setEditingBranch({ ...editingBranch, embedUrl: e.target.value })} />
                                <p className="text-xs text-slate-500 mt-1">Copia la URL del 'src' del iframe de Google Maps.</p></div>
                            <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl mt-4">Guardar</button>
                        </form>
                    </div>
                </div>
            )}

            {editingBanner && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className={`w-full max-w-lg rounded-3xl shadow-xl ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white'}`}>
                        <div className="p-6 border-b flex justify-between items-center"><h3 className="text-xl font-bold">Editar Banner</h3><button onClick={() => setEditingBanner(null)}><X /></button></div>
                        <form onSubmit={handleSaveBanner} className="p-6 space-y-4">
                            <div><label className="block font-bold mb-2 text-sm">Título</label><input type="text" required className={`w-full p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50'}`} value={editingBanner.title} onChange={e => setEditingBanner({ ...editingBanner, title: e.target.value })} /></div>
                            <div><label className="block font-bold mb-2 text-sm">Subtítulo</label><input type="text" className={`w-full p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50'}`} value={editingBanner.subtitle} onChange={e => setEditingBanner({ ...editingBanner, subtitle: e.target.value })} /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block font-bold mb-2 text-sm">Texto Botón</label><input type="text" className={`w-full p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50'}`} value={editingBanner.ctaText} onChange={e => setEditingBanner({ ...editingBanner, ctaText: e.target.value })} /></div>
                                <div>
                                    <label className="block font-bold mb-2 text-sm">Acción Botón</label>
                                    <select
                                        className={`w-full p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50'}`}
                                        value={bannerLinkType}
                                        onChange={(e) => handleBannerLinkTypeChange(e.target.value)}
                                    >
                                        <option value="#/home">Inicio (Home)</option>
                                        <option value="#/shop">Catálogo Completo</option>
                                        <option value="category">Categoría Específica</option>
                                        <option value="#/services">Servicios</option>
                                        <option value="#/branches">Sucursales</option>
                                        <option value="#/contact">Contacto</option>
                                        <option value="custom">URL Personalizada</option>
                                    </select>
                                </div>
                            </div>

                            {/* Conditional Inputs based on Banner Link Type */}
                            {bannerLinkType === 'category' && (
                                <div>
                                    <label className="block font-bold mb-2 text-sm">Seleccionar Categoría</label>
                                    <select
                                        className={`w-full p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50'}`}
                                        value={editingBanner.ctaLink.replace('#/shop?cat=', '')}
                                        onChange={(e) => handleBannerCategoryChange(e.target.value)}
                                    >
                                        {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                                    </select>
                                </div>
                            )}

                            {bannerLinkType === 'custom' && (
                                <div>
                                    <label className="block font-bold mb-2 text-sm">Link Personalizado</label>
                                    <input
                                        type="text"
                                        className={`w-full p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-slate-50'}`}
                                        value={editingBanner.ctaLink}
                                        onChange={e => setEditingBanner({ ...editingBanner, ctaLink: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>
                            )}

                            <ImageUrlInputUI label="Imagen de Fondo" currentImage={editingBanner.image} onChange={(val) => setEditingBanner(prev => prev ? { ...prev, image: val } : null)} isDarkMode={isDarkMode} />
                            <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl mt-4">Guardar</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
