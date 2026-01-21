import { useState, useEffect } from 'react'
import {
    Phone,
    Mail,
    MapPin,
    Menu,
    Search,
    User,
    ShoppingCart,
    ChevronDown,
    X
} from 'lucide-react'
import type { Category } from '../../lib/supabase'

// ============================================
// TOPBAR (Level 1)
// ============================================
function TopBar() {
    return (
        <div className="topbar">
            <div className="container-retail h-full">
                <div className="flex items-center justify-between h-full text-xs">
                    {/* Left: Contact Info */}
                    <div className="flex items-center gap-4">
                        <a href="tel:+541112345678" className="flex items-center gap-1 hover:text-accent transition-colors">
                            <Phone size={12} />
                            <span>(011) 1234-5678</span>
                        </a>
                        <a href="mailto:ventas@puntoelectro.com" className="hidden sm:flex items-center gap-1 hover:text-accent transition-colors">
                            <Mail size={12} />
                            <span>ventas@puntoelectro.com</span>
                        </a>
                    </div>

                    {/* Right: Location & Links */}
                    <div className="flex items-center gap-4">
                        <span className="hidden md:flex items-center gap-1">
                            <MapPin size={12} />
                            <span>CABA, Argentina</span>
                        </span>
                        <span className="text-accent font-medium">
                            Envíos a todo el país
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ============================================
// MAIN HEADER (Level 2)
// ============================================
interface MainHeaderProps {
    cartCount: number
    cartTotal: number
    onMenuToggle: () => void
}

function MainHeader({ cartCount, cartTotal, onMenuToggle }: MainHeaderProps) {
    const [searchQuery, setSearchQuery] = useState('')

    return (
        <div className="main-header">
            <div className="container-retail h-full">
                <div className="flex items-center justify-between h-full gap-4">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={onMenuToggle}
                        className="lg:hidden p-2 hover:bg-gray-100 rounded transition-colors"
                        aria-label="Abrir menú"
                    >
                        <Menu size={24} className="text-primary" />
                    </button>

                    {/* Logo */}
                    <a href="/" className="flex-shrink-0">
                        <h1 className="text-xl md:text-2xl font-heading font-bold text-primary">
                            Punto<span className="text-accent-dark">Electro</span>
                        </h1>
                    </a>

                    {/* Search Bar */}
                    <div className="hidden md:flex flex-1 max-w-2xl mx-4">
                        <div className="relative w-full">
                            <input
                                type="text"
                                placeholder="Buscar productos..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input pr-12"
                            />
                            <button
                                className="absolute right-1 top-1 bottom-1 px-3 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors"
                                aria-label="Buscar"
                            >
                                <Search size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {/* My Account */}
                        <button className="hidden sm:flex items-center gap-2 p-2 hover:bg-gray-100 rounded transition-colors">
                            <User size={20} className="text-primary" />
                            <span className="hidden lg:block text-sm text-primary">Mi Cuenta</span>
                        </button>

                        {/* Cart */}
                        <button className="cart-icon flex items-center gap-2">
                            <div className="relative">
                                <ShoppingCart size={22} className="text-primary" />
                                {cartCount > 0 && (
                                    <span className="cart-badge">{cartCount}</span>
                                )}
                            </div>
                            <span className="hidden lg:block text-sm font-medium text-primary">
                                ${cartTotal.toLocaleString('es-AR')}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ============================================
// CATEGORY NAV (Level 3)
// ============================================
interface CategoryNavProps {
    categories: Category[]
}

function CategoryNav({ categories }: CategoryNavProps) {
    const [megaMenuOpen, setMegaMenuOpen] = useState(false)
    const [activeCategory, setActiveCategory] = useState<Category | null>(null)

    return (
        <div className="category-nav relative">
            <div className="container-retail h-full">
                <div className="flex items-center h-full gap-1">
                    {/* Categories Button (Mega Menu Trigger) */}
                    <div
                        className="relative"
                        onMouseEnter={() => setMegaMenuOpen(true)}
                        onMouseLeave={() => {
                            setMegaMenuOpen(false)
                            setActiveCategory(null)
                        }}
                    >
                        <button
                            className="btn-categories h-10"
                            onClick={() => setMegaMenuOpen(!megaMenuOpen)}
                        >
                            <Menu size={18} />
                            <span className="hidden sm:inline">Categorías</span>
                            <ChevronDown size={14} className={`transition-transform ${megaMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Mega Menu - positioned relative to button but full width */}
                        {megaMenuOpen && (
                            <div
                                className="fixed left-0 right-0 bg-white shadow-xl border-t-4 border-accent z-50"
                                style={{ top: 'var(--header-total, 144px)' }}
                                onMouseEnter={() => setMegaMenuOpen(true)}
                                onMouseLeave={() => {
                                    setMegaMenuOpen(false)
                                    setActiveCategory(null)
                                }}
                            >
                                <div className="max-w-7xl mx-auto px-4 py-6">
                                    <div className="grid grid-cols-4 gap-8">
                                        {/* Category List */}
                                        <div className="col-span-1 border-r border-gray-100 pr-4">
                                            {categories.map(cat => (
                                                <button
                                                    key={cat.id}
                                                    className={`w-full text-left px-3 py-2 rounded hover:bg-primary-50 transition-colors ${activeCategory?.id === cat.id ? 'bg-primary-50 text-primary font-medium' : 'text-gray-700'
                                                        }`}
                                                    onMouseEnter={() => setActiveCategory(cat)}
                                                >
                                                    {cat.name}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Subcategories */}
                                        <div className="col-span-3">
                                            {activeCategory ? (
                                                <div>
                                                    <h3 className="font-heading font-bold text-primary text-lg mb-4">
                                                        {activeCategory.name}
                                                    </h3>
                                                    <div className="grid grid-cols-3 gap-4">
                                                        {activeCategory.children?.map(sub => (
                                                            <a
                                                                key={sub.id}
                                                                href={`/categoria/${sub.slug}`}
                                                                className="text-sm text-gray-600 hover:text-primary hover:underline block py-1"
                                                            >
                                                                {sub.name}
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-gray-400 text-center py-8">
                                                    Pasa el mouse sobre una categoría para ver subcategorías
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Navigation Links */}
                    <nav className="hidden lg:flex items-center ml-4">
                        <a href="/ofertas" className="nav-link">Ofertas</a>
                        <a href="/nuevos" className="nav-link">Nuevos</a>
                        <a href="/marcas" className="nav-link">Marcas</a>
                        <a href="/b2b" className="nav-link">
                            <span className="px-2 py-0.5 bg-accent text-primary-dark text-xs font-bold rounded mr-1">B2B</span>
                            Profesionales
                        </a>
                        <a href="/listas" className="nav-link">Listas de Obra</a>
                    </nav>
                </div>
            </div>
        </div>
    )
}

// ============================================
// MOBILE MENU
// ============================================
interface MobileMenuProps {
    isOpen: boolean
    onClose: () => void
    categories: Category[]
}

function MobileMenu({ isOpen, onClose, categories }: MobileMenuProps) {
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
            />

            {/* Menu Panel */}
            <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h2 className="font-heading font-bold text-primary text-lg">Menú</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Search (Mobile) */}
                <div className="p-4 border-b border-gray-100">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Buscar productos..."
                            className="search-input text-sm"
                        />
                        <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>

                {/* Categories */}
                <div className="py-2">
                    {categories.map(cat => (
                        <div key={cat.id}>
                            <button
                                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50"
                                onClick={() => setExpandedCategory(
                                    expandedCategory === cat.id ? null : cat.id
                                )}
                            >
                                <span className="font-medium text-primary">{cat.name}</span>
                                {cat.children && cat.children.length > 0 && (
                                    <ChevronDown
                                        size={16}
                                        className={`transition-transform ${expandedCategory === cat.id ? 'rotate-180' : ''}`}
                                    />
                                )}
                            </button>

                            {expandedCategory === cat.id && cat.children && (
                                <div className="bg-gray-50 py-2">
                                    {cat.children.map(sub => (
                                        <a
                                            key={sub.id}
                                            href={`/categoria/${sub.slug}`}
                                            className="block px-8 py-2 text-sm text-gray-600 hover:text-primary"
                                        >
                                            {sub.name}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Links */}
                <div className="border-t border-gray-100 py-2">
                    <a href="/ofertas" className="block px-4 py-3 text-primary hover:bg-gray-50">Ofertas</a>
                    <a href="/b2b" className="block px-4 py-3 text-primary hover:bg-gray-50">
                        <span className="px-2 py-0.5 bg-accent text-primary-dark text-xs font-bold rounded mr-2">B2B</span>
                        Profesionales
                    </a>
                    <a href="/listas" className="block px-4 py-3 text-primary hover:bg-gray-50">Listas de Obra</a>
                </div>
            </div>
        </div>
    )
}

// ============================================
// HEADER RETAIL (Main Export)
// ============================================
interface HeaderRetailProps {
    categories?: Category[]
    cartCount?: number
    cartTotal?: number
}

export default function HeaderRetail({
    categories = [],
    cartCount = 0,
    cartTotal = 0
}: HeaderRetailProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    // Close mobile menu on resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setMobileMenuOpen(false)
            }
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        document.body.style.overflow = mobileMenuOpen ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [mobileMenuOpen])

    return (
        <header className="sticky top-0 z-40">
            <TopBar />
            <MainHeader
                cartCount={cartCount}
                cartTotal={cartTotal}
                onMenuToggle={() => setMobileMenuOpen(true)}
            />
            <CategoryNav categories={categories} />

            <MobileMenu
                isOpen={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
                categories={categories}
            />
        </header>
    )
}
