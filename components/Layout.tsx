
import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
import { ShoppingCart, Menu, X, Search, Phone, Mail, MapPin, Zap, User, Settings, Home, Package, Truck, Info, ChevronRight, LogOut, ChevronLeft, ArrowRight, Star, AlertCircle, Trash2, ChevronDown, Sun, Moon, CreditCard, Banknote, Landmark, Minus, Plus, Wallet, Instagram, Facebook, ShieldCheck, FileText, Sparkles } from 'lucide-react';
import { SiteConfig, CartItem, Product, Category, Brand } from '../types';

// Navigation Items Configuration
const NAV_ITEMS = [
    { id: 'home', label: 'Inicio', icon: Home },
    // "Más Vendidos" removed as requested
    { id: 'shop', label: 'Productos', icon: Package }, // Contains Sub-menu
    { id: 'services', label: 'Servicios', icon: Zap },
    { id: 'branches', label: 'Sucursales', icon: MapPin },
    { id: 'contact', label: 'Contacto', icon: Phone },
];

// --- BRAND ASSET COMPONENT ---
export const PuntoLogo: React.FC<{ size?: number, className?: string }> = ({ size = 32, className }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="50" cy="50" r="50" fill="#006CFF" />
        <path d="M58 20L28 56H48L40 82L74 42H52Z" fill="white" />
    </svg>
);

interface HeaderProps {
    cartCount: number;
    onCartClick: () => void;
    onMenuClick: (page: string) => void;
    onMobileMenuClick: () => void;
    userEmail: string | null;
    userName: string | null; // Added
    onLogout: () => void;
    config: SiteConfig;
    activePage: string;
    products: Product[];
    onProductClick: (product: Product) => void;
    categories: Category[];
    onCategorySelect: (category: string | null) => void;
    onBrandSelect: (brand: string | null) => void;
    brands: Brand[];
    isDarkMode: boolean;
    onToggleTheme: () => void;
    hasActivePromo: boolean; // New prop for layout adjustment
    onSearchSubmit: (term: string) => void; // Added for global search
}

export const Header: React.FC<HeaderProps> = memo(({
    cartCount,
    onCartClick,
    onMenuClick,
    onMobileMenuClick,
    userEmail,
    userName,
    onLogout,
    config,
    activePage,
    products,
    onProductClick,
    categories,
    onCategorySelect,
    onBrandSelect,
    brands,
    isDarkMode,
    onToggleTheme,
    hasActivePromo,
    onSearchSubmit
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [animateCart, setAnimateCart] = useState(false);
    const [showMobileSearch, setShowMobileSearch] = useState(false);

    // Scroll Hide Logic State
    const [isVisible, setIsVisible] = useState(true);
    const lastScrollY = useRef(0);
    const ticking = useRef(false); // Throttling

    const prevCartCount = useRef(cartCount);
    const searchRef = useRef<HTMLDivElement>(null);
    const mobileSearchRef = useRef<HTMLInputElement>(null);

    const isAdmin = userEmail === 'nacho@admin.com';
    const isLoginPage = activePage === 'login';

    // Display Name Logic
    const displayName = isAdmin ? 'PuntoElectro' : (userName || userEmail?.split('@')[0]);

    // Handle Scroll for Auto-Hide - Throttled
    useEffect(() => {
        const handleScroll = () => {
            if (!ticking.current) {
                window.requestAnimationFrame(() => {
                    const currentScrollY = window.scrollY;

                    if (currentScrollY < 10) {
                        setIsVisible(true);
                    } else if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
                        setIsVisible(false);
                        setShowMobileSearch(false);
                    } else {
                        setIsVisible(true);
                    }

                    lastScrollY.current = currentScrollY;
                    ticking.current = false;
                });
                ticking.current = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Cart animation effect
    useEffect(() => {
        if (cartCount > prevCartCount.current) {
            setAnimateCart(true);
            const timer = setTimeout(() => setAnimateCart(false), 300);
            return () => clearTimeout(timer);
        }
        prevCartCount.current = cartCount;
    }, [cartCount]);

    // Optimize Search Filtering using useMemo
    const searchResults = useMemo(() => {
        if (searchTerm.trim() === '') return [];
        const term = searchTerm.toLowerCase();
        return products.filter(product =>
            product.name.toLowerCase().includes(term) ||
            product.category.toLowerCase().includes(term) ||
            product.brand?.toLowerCase().includes(term)
        ).slice(0, 5); // Limit results for dropdown preview
    }, [searchTerm, products]);

    // Show results when we have them
    useEffect(() => {
        if (searchTerm && searchResults.length > 0) {
            setShowResults(true);
        } else if (searchTerm && searchResults.length === 0) {
            setShowResults(true); // Show "No results" message
        } else {
            setShowResults(false);
        }
    }, [searchTerm, searchResults]);

    // Auto-focus mobile search input when opened
    useEffect(() => {
        if (showMobileSearch && mobileSearchRef.current) {
            mobileSearchRef.current.focus();
        }
    }, [showMobileSearch]);

    // Close search on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                if (!showMobileSearch) setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showMobileSearch]);

    const handleProductSelect = (product: Product) => {
        onProductClick(product);
        setShowResults(false);
        setSearchTerm('');
        setShowMobileSearch(false);
    };

    const handleSearchSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (searchTerm.trim()) {
            onSearchSubmit(searchTerm);
            setShowResults(false);
            setSearchTerm(''); // Optional: clear or keep
            setShowMobileSearch(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearchSubmit();
        }
    };

    return (
        <header
            className={`fixed left-0 right-0 z-40 transition-all duration-300 ease-in-out will-change-transform bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-900 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}
            style={{
                top: hasActivePromo ? '40px' : '0px'
            }}
        >
            {/* Main Header Area */}
            <div className="container mx-auto px-4 py-4 lg:py-6">
                <div className="flex items-center justify-between gap-4 lg:gap-8">
                    {/* Logo & Mobile Trigger */}
                    <div className="flex items-center gap-3 lg:gap-4 flex-shrink-0">
                        {!isLoginPage && (
                            <button
                                onClick={onMobileMenuClick}
                                className={`p-2 -ml-2 rounded-xl transition lg:hidden ${isDarkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'}`}
                            >
                                <Menu size={24} />
                            </button>
                        )}
                        <div
                            className="flex items-center gap-2 cursor-pointer group"
                            onClick={() => onMenuClick('home')}
                        >
                            <div className="transition-transform group-hover:scale-105 shadow-lg shadow-blue-600/20 rounded-full">
                                <PuntoLogo size={42} />
                            </div>
                            <div>
                                <h1 className={`text-xl lg:text-2xl font-bold tracking-tight leading-none ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>PUNTO<span className="text-blue-500">.</span></h1>
                                <p className={`text-[9px] lg:text-[10px] font-bold tracking-widest uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Electro</p>
                            </div>
                        </div>
                    </div>

                    {/* BIG Search Bar with Dropdown (Desktop) */}
                    {!isLoginPage && (
                        <div className="hidden lg:block flex-1 max-w-4xl px-4" ref={searchRef}>
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="Buscar productos, marcas o categorías..."
                                    className={`w-full pl-14 pr-6 py-4 border-2 rounded-2xl text-lg focus:outline-none focus:ring-4 transition-all duration-300 font-medium ${isDarkMode
                                        ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500 focus:bg-slate-800 focus:ring-blue-500/20 placeholder:text-slate-500'
                                        : 'bg-slate-50 border-slate-100 text-slate-900 focus:border-blue-500 focus:bg-white focus:ring-blue-500/10 placeholder:text-slate-400'
                                        }`}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onFocus={() => searchTerm && setShowResults(true)}
                                    onKeyDown={handleKeyDown}
                                />
                                <Search className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300 w-7 h-7 ${isDarkMode ? 'text-slate-500 group-focus-within:text-blue-400' : 'text-slate-400 group-focus-within:text-blue-500'}`} />

                                {/* Search Results Dropdown Desktop */}
                                {showResults && (
                                    <div className={`absolute top-full left-0 right-0 mt-2 rounded-2xl shadow-2xl border overflow-hidden z-50 animate-fadeIn max-h-[400px] overflow-y-auto custom-scrollbar ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                                        {searchResults.length > 0 ? (
                                            <>
                                                <div className={`p-3 text-xs font-bold uppercase tracking-wider sticky top-0 border-b ${isDarkMode ? 'bg-slate-900 text-slate-400 border-slate-700' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                                                    Resultados sugeridos
                                                </div>
                                                {searchResults.map(product => {
                                                    const hasDiscount = (product.discount || 0) > 0;
                                                    const finalPrice = hasDiscount ? product.price * (1 - product.discount! / 100) : product.price;

                                                    return (
                                                        <div
                                                            key={product.id}
                                                            onClick={() => handleProductSelect(product)}
                                                            className={`flex items-center gap-4 p-4 cursor-pointer transition border-b last:border-none group ${isDarkMode
                                                                ? 'hover:bg-slate-700 border-slate-700'
                                                                : 'hover:bg-blue-50 border-slate-50'
                                                                }`}
                                                        >
                                                            <img src={product.image} className={`w-12 h-12 object-contain rounded-lg border ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-100'}`} alt={product.name} />
                                                            <div className="flex-1">
                                                                <div className={`font-bold transition ${isDarkMode ? 'text-white group-hover:text-blue-400' : 'text-slate-800 group-hover:text-blue-600'}`}>{product.name}</div>
                                                                <div className="flex gap-2 text-sm">
                                                                    <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>{product.category}</span>
                                                                    {product.brand && (
                                                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${isDarkMode ? 'bg-slate-900 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>{product.brand}</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                {hasDiscount && (
                                                                    <div className="text-xs text-red-500 font-bold mb-0.5">-{product.discount}%</div>
                                                                )}
                                                                <div className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>${finalPrice.toLocaleString()}</div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                                <button
                                                    onClick={() => handleSearchSubmit()}
                                                    className={`w-full p-4 text-center text-sm font-bold transition hover:underline ${isDarkMode ? 'text-blue-400 bg-slate-900' : 'text-blue-600 bg-slate-50'}`}
                                                >
                                                    Ver todos los resultados para "{searchTerm}"
                                                </button>
                                            </>
                                        ) : (
                                            <div className="p-8 text-center text-slate-500">
                                                <Package className="mx-auto mb-2 opacity-50" size={32} />
                                                <p>No encontramos sugerencias. Presiona Enter para buscar.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {!isLoginPage && NAV_ITEMS.map((item) => {
                            const isShop = item.id === 'shop';
                            return (
                                <div key={item.id} className="relative group/nav">
                                    <button
                                        onClick={() => onMenuClick(item.id)}
                                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all relative flex items-center gap-1 ${activePage === item.id
                                            ? 'bg-slate-900 text-white'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                            }`}
                                    >
                                        {item.label}
                                        {isShop && <ChevronDown size={14} className="opacity-50 group-hover/nav:rotate-180 transition-transform duration-300" />}
                                        {activePage === item.id && !isShop && (
                                            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-blue-500 rounded-full mb-1"></span>
                                        )}
                                    </button>

                                    {/* Dropdown for Shop (Interactive Hover) */}
                                    {isShop && (
                                        <div className="absolute top-full left-0 pt-4 opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all duration-300 transform translate-y-2 group-hover/nav:translate-y-0 w-64 z-50">
                                            {/* Invisible bridge to prevent closing gap */}
                                            <div className="absolute top-0 left-0 w-full h-4 bg-transparent"></div>

                                            <div className={`rounded-2xl shadow-xl border p-2 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                                                <div className="mb-2 pb-2 border-b border-slate-100 dark:border-slate-700">
                                                    <button
                                                        onClick={() => { onCategorySelect(null); onMenuClick('shop'); }}
                                                        className={`w-full text-left px-3 py-2 rounded-xl text-sm font-bold transition flex items-center justify-between group/item ${isDarkMode ? 'text-slate-300 hover:bg-slate-700 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'}`}
                                                    >
                                                        Ver Todo
                                                        <ArrowRight size={14} className="opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                                    </button>
                                                </div>
                                                <div className="space-y-1">
                                                    {categories.map(cat => {
                                                        const catBrands = brands.filter(b => b.category === cat.name);
                                                        const hasSubMenu = catBrands.length > 0;

                                                        return (
                                                            <div key={cat.id} className="relative group/category">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        onCategorySelect(cat.name);
                                                                        onMenuClick('shop');
                                                                    }}
                                                                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition flex items-center justify-between group-hover/category:bg-slate-100 dark:group-hover/category:bg-slate-700 ${isDarkMode ? 'text-slate-300 group-hover/category:text-white' : 'text-slate-500 group-hover/category:text-slate-900'}`}
                                                                >
                                                                    <span className="truncate">{cat.name}</span>
                                                                    {hasSubMenu && <ChevronRight size={14} className="opacity-50" />}
                                                                </button>

                                                                {/* Side Sub-menu for Brands - Hover based with Bridge */}
                                                                {hasSubMenu && (
                                                                    <div className="absolute left-full top-0 pl-1 opacity-0 invisible group-hover/category:opacity-100 group-hover/category:visible transition-all duration-200 w-56 z-50 -ml-1">
                                                                        {/* Invisible Bridge to prevent closing gap when moving diagonally */}
                                                                        <div className="absolute top-0 left-0 w-4 h-full -ml-3 bg-transparent"></div>

                                                                        <div className={`rounded-2xl shadow-xl border p-2 overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    onCategorySelect(cat.name);
                                                                                    onMenuClick('shop');
                                                                                }}
                                                                                className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wide transition border-b border-dashed mb-1 ${isDarkMode ? 'text-slate-500 border-slate-700 hover:text-blue-400' : 'text-slate-400 border-slate-100 hover:text-blue-600'}`}
                                                                            >
                                                                                Marcas en {cat.name}
                                                                            </button>
                                                                            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                                                                {catBrands.map(brand => (
                                                                                    <button
                                                                                        key={brand.id}
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            onCategorySelect(cat.name);
                                                                                            onBrandSelect(brand.name);
                                                                                            onMenuClick('shop');
                                                                                        }}
                                                                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition flex items-center justify-between group/brand ${isDarkMode ? 'text-slate-400 hover:bg-slate-700 hover:text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'}`}
                                                                                    >
                                                                                        {brand.name}
                                                                                        <ChevronRight size={12} className="opacity-0 group-hover/brand:opacity-50 -translate-x-1 group-hover/brand:translate-x-0 transition-all" />
                                                                                    </button>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </nav>

                    {/* Actions: Theme, Search (Mobile), User, Cart */}
                    <div className="flex items-center gap-2 lg:gap-3">
                        <button
                            onClick={onToggleTheme}
                            className={`p-2.5 rounded-full transition hidden lg:flex ${isDarkMode ? 'text-yellow-400 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-100 hover:text-yellow-500'}`}
                            title="Cambiar Tema"
                        >
                            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        {!isLoginPage && (
                            <button
                                onClick={() => setShowMobileSearch(!showMobileSearch)}
                                className={`p-2.5 rounded-full transition lg:hidden ${isDarkMode ? 'text-white hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'}`}
                            >
                                <Search size={22} />
                            </button>
                        )}

                        <div className="hidden lg:block h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

                        {userEmail ? (
                            <div className="relative group/user hidden lg:block">
                                <button className={`flex items-center gap-2 px-3 py-2 rounded-full transition border ${isAdmin ? 'bg-blue-600 text-white border-blue-600' : (isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-700')}`}>
                                    <User size={18} />
                                    <span className="text-sm font-bold max-w-[100px] truncate">{displayName}</span>
                                    <ChevronDown size={14} className="opacity-50 group-hover/user:rotate-180 transition-transform duration-300" />
                                </button>
                                <div className="absolute top-full right-0 pt-4 opacity-0 invisible group-hover/user:opacity-100 group-hover/user:visible transition-all duration-300 transform translate-y-2 group-hover/user:translate-y-0 w-48 z-50">
                                    {/* Invisible Bridge */}
                                    <div className="absolute top-0 right-0 h-4 w-full bg-transparent"></div>
                                    <div className={`rounded-2xl shadow-xl border p-2 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                                        {isAdmin && (
                                            <button
                                                onClick={() => onMenuClick('admin')}
                                                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 mb-1 ${isDarkMode ? 'text-slate-300 hover:bg-slate-700 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'}`}
                                            >
                                                <Settings size={16} /> Panel Admin
                                            </button>
                                        )}
                                        <button
                                            onClick={onLogout}
                                            className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20`}
                                        >
                                            <LogOut size={16} /> Cerrar Sesión
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            !isLoginPage && (
                                <div className="hidden lg:flex items-center gap-2">
                                    <button
                                        onClick={() => onMenuClick('login')}
                                        className={`px-3 py-2 rounded-full font-bold text-sm transition ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}
                                    >
                                        Ingresar
                                    </button>
                                    <button
                                        onClick={() => onMenuClick('register')}
                                        className="flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-sm bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition hover:scale-105 active:scale-95 whitespace-nowrap"
                                    >
                                        <Sparkles size={16} fill="currentColor" className="text-yellow-400" />
                                        Crear Cuenta (-10%)
                                    </button>
                                </div>
                            )
                        )}

                        {!isLoginPage && (
                            <button
                                onClick={onCartClick}
                                className={`relative p-3 rounded-full transition shadow-sm group ${isDarkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-white text-slate-800 hover:bg-slate-50 border border-slate-200'}`}
                            >
                                <ShoppingCart size={22} className={`transition-transform ${animateCart ? 'scale-110' : 'group-hover:scale-110'}`} />
                                {cartCount > 0 && (
                                    <span className={`absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full text-[10px] font-bold shadow-sm border-2 ${isDarkMode ? 'bg-blue-500 text-white border-slate-900' : 'bg-red-500 text-white border-white'} ${animateCart ? 'animate-bounce' : ''}`}>
                                        {cartCount}
                                    </span>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Mobile Search Bar Expand */}
                {showMobileSearch && !isLoginPage && (
                    <div className="mt-4 lg:hidden relative animate-slideDown">
                        <input
                            ref={mobileSearchRef}
                            type="text"
                            placeholder="Buscar..."
                            className={`w-full pl-10 pr-4 py-3 rounded-xl outline-none border focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />

                        {/* Mobile Search Results */}
                        {showResults && searchResults.length > 0 && (
                            <div className={`absolute top-full left-0 right-0 mt-2 rounded-xl shadow-xl border z-50 overflow-hidden max-h-[60vh] overflow-y-auto ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                                {searchResults.map(product => (
                                    <div
                                        key={product.id}
                                        onClick={() => handleProductSelect(product)}
                                        className={`flex items-center gap-3 p-3 border-b last:border-none ${isDarkMode ? 'border-slate-700' : 'border-slate-50'}`}
                                    >
                                        <img src={product.image} className="w-10 h-10 rounded object-contain bg-white" alt="" />
                                        <div className="flex-1 min-w-0">
                                            <div className={`font-medium truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{product.name}</div>
                                            <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>${product.price.toLocaleString()}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
});

export const Sidebar: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onNav: (page: string) => void;
    activePage: string;
    isMobile: boolean;
    categories: Category[];
    onCategorySelect: (cat: string | null) => void;
    onBrandSelect: (brand: string | null) => void;
    brands: Brand[];
    userEmail: string | null;
    userName: string | null; // Added
    onLogout: () => void;
}> = ({ isOpen, onClose, onNav, activePage, isMobile, categories, onCategorySelect, onBrandSelect, brands, userEmail, userName, onLogout }) => {

    // State to track expanded menu items (for dropdowns)
    const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null); // For nested brands in mobile

    const isAdmin = userEmail === 'nacho@admin.com';
    const displayName = isAdmin ? 'PuntoElectro' : (userName || userEmail?.split('@')[0]);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] transition-opacity duration-300"
                    onClick={onClose}
                />
            )}
            <aside className={`
                fixed top-0 left-0 h-full w-[280px] sm:w-[320px] bg-white dark:bg-slate-900 z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
                    <h2 className="text-xl font-bold dark:text-white">Menú</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 transition">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    <nav className="space-y-1 mb-8">
                        {NAV_ITEMS.map((item) => {
                            const isShop = item.id === 'shop';
                            const isExpanded = expandedMenu === item.id;

                            return (
                                <div key={item.id}>
                                    <button
                                        onClick={() => {
                                            if (isShop) {
                                                setExpandedMenu(isExpanded ? null : item.id);
                                            } else {
                                                onNav(item.id);
                                                onClose();
                                            }
                                        }}
                                        className={`w-full flex items-center justify-between p-3 rounded-xl font-bold transition ${activePage === item.id
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <item.icon size={20} />
                                            <span>{item.label}</span>
                                        </div>
                                        {isShop && (
                                            <ChevronDown size={16} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                        )}
                                    </button>

                                    {/* Sub-categories for Shop (Collapsible) */}
                                    {isShop && (
                                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                            <div className="ml-4 mt-1 pl-4 border-l border-slate-200 dark:border-slate-700 space-y-1">
                                                <button
                                                    onClick={() => { onCategorySelect(null); onNav('shop'); onClose(); }}
                                                    className="w-full text-left p-2 text-sm font-medium text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition"
                                                >
                                                    Ver Todo
                                                </button>
                                                {categories.map(cat => {
                                                    const catBrands = brands.filter(b => b.category === cat.name);
                                                    const hasSubMenu = catBrands.length > 0;
                                                    const isCatExpanded = expandedCategory === cat.id;

                                                    return (
                                                        <div key={cat.id}>
                                                            <button
                                                                onClick={() => {
                                                                    if (hasSubMenu) {
                                                                        setExpandedCategory(isCatExpanded ? null : cat.id);
                                                                    } else {
                                                                        onCategorySelect(cat.name);
                                                                        onNav('shop');
                                                                        onClose();
                                                                    }
                                                                }}
                                                                className="w-full text-left p-2 text-sm font-medium text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition flex items-center justify-between"
                                                            >
                                                                <span>{cat.name}</span>
                                                                {hasSubMenu && <ChevronDown size={14} className={`transition-transform ${isCatExpanded ? 'rotate-180' : ''}`} />}
                                                            </button>

                                                            {/* Nested Brands in Sidebar */}
                                                            {hasSubMenu && (
                                                                <div className={`overflow-hidden transition-all duration-300 ${isCatExpanded ? 'max-h-[300px]' : 'max-h-0'}`}>
                                                                    <div className="ml-3 pl-3 border-l border-slate-200 dark:border-slate-700">
                                                                        <button
                                                                            onClick={() => { onCategorySelect(cat.name); onNav('shop'); onClose(); }}
                                                                            className="w-full text-left py-2 text-xs font-bold text-slate-400 hover:text-blue-500 uppercase tracking-wide"
                                                                        >
                                                                            Ver todos {cat.name}
                                                                        </button>
                                                                        {catBrands.map(brand => (
                                                                            <button
                                                                                key={brand.id}
                                                                                onClick={() => {
                                                                                    onCategorySelect(cat.name);
                                                                                    onBrandSelect(brand.name);
                                                                                    onNav('shop');
                                                                                    onClose();
                                                                                }}
                                                                                className="w-full text-left py-2 text-xs text-slate-400 hover:text-blue-500 dark:hover:text-blue-300 transition block"
                                                                            >
                                                                                {brand.name}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800 shrink-0 flex flex-col gap-4">
                    {userEmail && (
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center">
                                <User size={20} />
                            </div>
                            <div className="overflow-hidden flex-1">
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Hola,</p>
                                <p className="font-bold text-slate-800 dark:text-white truncate">{displayName}</p>
                            </div>
                            {isAdmin && (
                                <button
                                    onClick={() => { onNav('admin'); onClose(); }}
                                    className="p-2 bg-white dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 shadow-sm hover:text-blue-600 dark:hover:text-blue-400 transition"
                                    title="Panel Admin"
                                >
                                    <Settings size={20} />
                                </button>
                            )}
                        </div>
                    )}

                    {userEmail ? (
                        <button
                            onClick={() => { onLogout(); onClose(); }}
                            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl font-bold text-red-500 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/30 transition"
                        >
                            <LogOut size={18} /> Cerrar Sesión
                        </button>
                    ) : (
                        <div className="space-y-3">
                            <button
                                onClick={() => { onNav('login'); onClose(); }}
                                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                            >
                                Ingresar
                            </button>
                            <button
                                onClick={() => { onNav('register'); onClose(); }}
                                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-lg"
                            >
                                <Sparkles size={18} fill="currentColor" className="text-yellow-400" /> Crear Cuenta (-10%)
                            </button>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
};

export const CartDrawer: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    items: CartItem[];
    onUpdateQty: (id: string, delta: number) => void;
    onRemoveItem: (id: string) => void;
    onGoToCheckout: () => void;
    onContinueShopping: () => void;
    config?: SiteConfig;
}> = ({ isOpen, onClose, items, onUpdateQty, onRemoveItem, onGoToCheckout, onContinueShopping, config }) => {

    // Default styles if config is not yet loaded
    const styles = config?.checkout?.styles || {
        headerBg: '#ffffff',
        headerText: '#1e293b',
        checkoutBtnBg: '#0f172a',
        checkoutBtnText: '#ffffff',
        fontFamily: 'Inter'
    };

    const title = config?.checkout?.viewCartTitle || 'Mi Carrito';

    const subtotal = items.reduce((acc, item) => {
        const finalPrice = (item.discount && item.discount > 0) ? item.price * (1 - item.discount / 100) : item.price;
        return acc + (finalPrice * item.quantity);
    }, 0);

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] transition-opacity"
                    onClick={onClose}
                />
            )}
            <div
                className={`
                    fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white dark:bg-slate-900 z-[70] shadow-2xl transform transition-transform duration-300 ease-out flex flex-col
                    ${isOpen ? 'translate-x-0' : 'translate-x-full'}
                `}
                style={{ fontFamily: styles.fontFamily }}
            >
                <div
                    className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shadow-sm relative z-10"
                    style={{ backgroundColor: styles.headerBg, color: styles.headerText }}
                >
                    <div className="flex items-center gap-3">
                        <ShoppingCart size={24} />
                        <h2 className="text-xl font-bold">{title}</h2>
                        <span className="bg-black/10 px-2 py-0.5 rounded-full text-xs font-bold">{items.length}</span>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-black/10 rounded-full transition">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50 dark:bg-slate-900">
                    {items.length > 0 ? (
                        <div className="space-y-4">
                            {items.map(item => {
                                const hasDiscount = (item.discount || 0) > 0;
                                const finalPrice = hasDiscount ? item.price * (1 - item.discount! / 100) : item.price;

                                return (
                                    <div key={item.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex gap-4 animate-fadeIn">
                                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-700 rounded-xl flex-shrink-0 p-1">
                                            <img src={item.image} className="w-full h-full object-contain" alt="" />
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start gap-2">
                                                    <h4 className="font-bold text-slate-800 dark:text-white text-sm line-clamp-2 leading-tight">{item.name}</h4>
                                                    <button onClick={() => onRemoveItem(item.id)} className="text-slate-400 hover:text-red-500 transition"><Trash2 size={16} /></button>
                                                </div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.brand}</div>
                                            </div>
                                            <div className="flex justify-between items-end mt-2">
                                                <div>
                                                    {hasDiscount ? (
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] text-slate-400 line-through">${item.price.toLocaleString()}</span>
                                                            <span className="font-bold text-slate-900 dark:text-white">${finalPrice.toLocaleString()}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="font-bold text-slate-900 dark:text-white">${item.price.toLocaleString()}</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg h-8">
                                                    <button onClick={() => onUpdateQty(item.id, -1)} className="px-2.5 h-full hover:bg-slate-200 dark:hover:bg-slate-600 rounded-l-lg transition"><Minus size={14} /></button>
                                                    <span className="w-8 text-center text-xs font-bold dark:text-white">{item.quantity}</span>
                                                    <button onClick={() => onUpdateQty(item.id, 1)} className="px-2.5 h-full hover:bg-slate-200 dark:hover:bg-slate-600 rounded-r-lg transition"><Plus size={14} /></button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
                            <ShoppingCart size={64} className="mb-4 text-slate-300 dark:text-slate-600" />
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Tu carrito está vacío</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">¡Agrega productos para comenzar tu pedido!</p>
                            <button onClick={onContinueShopping} className="bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-slate-300 dark:hover:bg-slate-700 transition">
                                Ver Productos
                            </button>
                        </div>
                    )}
                </div>

                {items.length > 0 && (
                    <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shadow-xl relative z-20">
                        <div className="flex justify-between items-end mb-4">
                            <span className="text-slate-500 dark:text-slate-400 font-medium">Subtotal</span>
                            <span className="text-2xl font-black text-slate-900 dark:text-white">${subtotal.toLocaleString()}</span>
                        </div>
                        <button
                            onClick={onGoToCheckout}
                            className="w-full py-4 rounded-xl font-bold text-lg shadow-lg hover:brightness-110 active:scale-[0.98] transition flex items-center justify-center gap-2"
                            style={{ backgroundColor: styles.checkoutBtnBg, color: styles.checkoutBtnText }}
                        >
                            Iniciar Compra <ArrowRight size={20} />
                        </button>
                        <p className="text-center text-[10px] text-slate-400 mt-3 flex items-center justify-center gap-1">
                            <Info size={12} /> Precios sujetos a confirmación
                        </p>
                    </div>
                )}
            </div>
        </>
    );
};

// --- LEGAL MODAL ---
export const LegalModal: React.FC<{
    type: 'terms' | 'privacy' | null;
    onClose: () => void;
}> = ({ type, onClose }) => {
    if (!type) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl shadow-2xl relative z-10 flex flex-col max-h-[85vh] animate-scaleIn">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                        {type === 'terms' ? <ShieldCheck className="text-blue-500" /> : <FileText className="text-blue-500" />}
                        {type === 'terms' ? 'Términos y Condiciones' : 'Política de Privacidad'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition dark:text-slate-400">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-8 overflow-y-auto custom-scrollbar text-slate-600 dark:text-slate-300 leading-relaxed space-y-4">
                    {type === 'terms' ? (
                        <>
                            <p><strong>1. Introducción:</strong> Bienvenido a Punto Electro. Al acceder y utilizar este sitio web, aceptas cumplir los siguientes términos y condiciones.</p>
                            <p><strong>2. Productos y Precios:</strong> Todos los precios están expresados en pesos argentinos e incluyen IVA salvo indicación contraria. Las fotos son ilustrativas. Nos reservamos el derecho de modificar precios sin previo aviso.</p>
                            <p><strong>3. Envíos:</strong> Los tiempos de entrega son estimados y pueden variar según la logística. No nos responsabilizamos por demoras de terceros.</p>
                            <p><strong>4. Garantía:</strong> Todos nuestros productos cuentan con garantía oficial de fábrica. Para validarla es necesario conservar la factura de compra.</p>
                            <p><strong>5. Devoluciones:</strong> Se aceptan devoluciones dentro de los 10 días de recibido el producto, siempre que esté en su embalaje original y sin uso.</p>
                        </>
                    ) : (
                        <>
                            <p><strong>1. Protección de Datos:</strong> En Punto Electro nos comprometemos a proteger tu privacidad. Tus datos personales serán utilizados únicamente para procesar tus pedidos y mejorar tu experiencia.</p>
                            <p><strong>2. Información Recopilada:</strong> Recopilamos nombre, email, teléfono y dirección para fines logísticos y de facturación. No almacenamos datos de tarjetas de crédito.</p>
                            <p><strong>3. Cookies:</strong> Utilizamos cookies para mejorar la navegación y personalizar el contenido. Puedes desactivarlas en tu navegador.</p>
                            <p><strong>4. Terceros:</strong> No compartimos tu información con terceros salvo proveedores logísticos necesarios para la entrega.</p>
                            <p><strong>5. Contacto:</strong> Para ejercer tus derechos de acceso, rectificación o eliminación de datos, contáctanos a nuestro email oficial.</p>
                        </>
                    )}
                </div>
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 text-right">
                    <button onClick={onClose} className="px-6 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-800 transition">Entendido</button>
                </div>
            </div>
        </div>
    );
};

export const Footer: React.FC<{
    config: SiteConfig;
    onNav: (page: string) => void;
    onOpenLegal: (type: 'terms' | 'privacy') => void;
}> = memo(({ config, onNav, onOpenLegal }) => {

    // Fallback if links are empty
    const instagramLink = config.contact.instagram || 'https://instagram.com';
    const facebookLink = config.contact.facebook || 'https://facebook.com';

    return (
        <footer className="bg-slate-900 text-white pt-16 pb-8 border-t border-slate-800">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-4 gap-12 mb-12">
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tighter">PUNTO<span className="text-blue-500">.</span></h2>
                            <p className="text-xs font-bold tracking-[0.3em] text-slate-500 uppercase">Electro</p>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            {config.footer?.description || 'Líderes en distribución de materiales eléctricos e iluminación. Calidad y asesoramiento para tus proyectos.'}
                        </p>
                        <div className="flex gap-4">
                            <a href={instagramLink} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition"><Instagram size={20} /></a>
                            <a href={facebookLink} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition"><Facebook size={20} /></a>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">{config.footer?.titleNavigation || 'Navegación'}</h3>
                        <ul className="space-y-3 text-sm text-slate-400">
                            <li><button onClick={() => onNav('home')} className="hover:text-blue-400 transition flex items-center gap-2"><ChevronRight size={14} /> Inicio</button></li>
                            <li><button onClick={() => onNav('shop')} className="hover:text-blue-400 transition flex items-center gap-2"><ChevronRight size={14} /> Catálogo</button></li>
                            <li><button onClick={() => onNav('services')} className="hover:text-blue-400 transition flex items-center gap-2"><ChevronRight size={14} /> Servicios</button></li>
                            <li><button onClick={() => onNav('contact')} className="hover:text-blue-400 transition flex items-center gap-2"><ChevronRight size={14} /> Contacto</button></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-lg mb-6">{config.footer?.titleContact || 'Contacto'}</h3>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li className="flex items-start gap-3">
                                <MapPin className="text-blue-500 mt-1 shrink-0" size={16} />
                                <span>{config.contact.address}</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="text-blue-500 shrink-0" size={16} />
                                <span>{config.contact.phone}</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="text-blue-500 shrink-0" size={16} />
                                <span>{config.contact.email}</span>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-lg mb-6">{config.footer?.titleHours || 'Horarios'}</h3>
                        <div className="space-y-4 text-sm">
                            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800">
                                <div className="flex items-center gap-2 text-slate-300 font-bold mb-1">
                                    <ClockIcon /> {config.footer?.labelCustomerService || 'Atención al Cliente'}
                                </div>
                                <p className="text-slate-400">{config.contact.hours}</p>
                            </div>
                            <div>
                                <p className="text-slate-500 font-bold mb-1">{config.footer?.labelShipping || 'Envíos'}</p>
                                <p className="text-slate-400">{config.footer?.textShippingHours || 'Lun a Sáb 8:00 - 20:00 hs'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                    <p>{config.footer?.copyrightText || '© 2024 Punto Electro. Todos los derechos reservados.'}</p>
                    <div className="flex items-center gap-6">
                        <button onClick={() => onOpenLegal('terms')} className="hover:text-white transition">Términos y Condiciones</button>
                        <button onClick={() => onOpenLegal('privacy')} className="hover:text-white transition">Política de Privacidad</button>
                    </div>
                </div>
            </div>
        </footer>
    );
});

const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);
