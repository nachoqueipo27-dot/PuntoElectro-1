import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Menu, X, ShoppingCart, FolderOpen, User, ChevronDown } from 'lucide-react'
import { useCartStore } from '../../stores/cartStore'
import { useAuthStore } from '../../stores/authStore'
import type { Category } from '../../lib/supabase'

interface ModernNavbarProps {
    categories?: Category[]
}

export default function ModernNavbar({
    categories = [],
}: ModernNavbarProps) {
    const { toggleCart, getTotal, getItemCount } = useCartStore()
    const { user } = useAuthStore()
    const cartCount = getItemCount()
    const cartTotal = getTotal()
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        document.body.style.overflow = isMobileMenuOpen ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [isMobileMenuOpen])

    return (
        <>
            <nav className={`navbar ${isScrolled ? 'navbar--scrolled' : ''}`}>
                <div className="container-modern h-full">
                    <div className="flex items-center justify-between h-full gap-6">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden navbar__btn"
                            aria-label="Abrir menú"
                        >
                            <Menu size={22} />
                        </button>

                        {/* Logo */}
                        <a href="/" className="navbar__logo">
                            <span className="text-2xl">⚡</span>
                            <span>Punto<span className="navbar__logo-accent">Electro</span></span>
                        </a>

                        {/* Navigation Links (Desktop) */}
                        <div className="hidden lg:flex items-center gap-1">
                            <div
                                className="relative"
                                onMouseEnter={() => setIsMegaMenuOpen(true)}
                                onMouseLeave={() => setIsMegaMenuOpen(false)}
                            >
                                <button className="navbar__btn">
                                    Categorías
                                    <ChevronDown size={16} className={`transition-transform duration-300 ${isMegaMenuOpen ? 'rotate-180' : ''}`} />
                                </button>
                            </div>
                            <a href="/tienda" className="navbar__btn">Tienda</a>
                            <a href="/kits" className="navbar__btn">Kits</a>
                            <a href="/ofertas" className="navbar__btn">
                                <span className="px-2 py-0.5 bg-[var(--color-accent)] text-[var(--color-primary)] text-xs font-bold rounded-full">HOT</span>
                                Ofertas
                            </a>
                        </div>

                        {/* Search Bar */}
                        <div className="hidden md:block navbar__search">
                            <Search size={18} className="navbar__search-icon" />
                            <input
                                type="text"
                                placeholder="Buscar productos..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="navbar__search-input"
                            />
                        </div>

                        {/* Actions */}
                        <div className="navbar__actions">
                            {/* My Projects (Mi Obra) */}
                            <a href="/dashboard/lists" className="hidden sm:flex navbar__btn">
                                <FolderOpen size={20} />
                                <span className="hidden lg:inline">Mi Obra</span>
                            </a>

                            {/* Account */}
                            {/* Account */}
                            <Link
                                to={user ? "/dashboard" : "/auth/login"}
                                className="hidden sm:flex navbar__btn"
                                title={user ? "Mi Cuenta" : "Iniciar Sesión"}
                            >
                                <User size={20} />
                            </Link>

                            {/* Cart */}
                            <button onClick={toggleCart} className="navbar__btn navbar__btn--primary relative">
                                <ShoppingCart size={20} />
                                {cartCount > 0 && (
                                    <span className="navbar__cart-badge">{cartCount}</span>
                                )}
                                <span className="hidden lg:inline">
                                    ${cartTotal.toLocaleString('es-AR')}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mega Menu */}
            <div
                className={`mega-menu-modern ${isMegaMenuOpen ? 'mega-menu-modern--open' : ''}`}
                onMouseEnter={() => setIsMegaMenuOpen(true)}
                onMouseLeave={() => setIsMegaMenuOpen(false)}
            >
                <div className="container-modern">
                    <div className="mega-menu-modern__content">
                        {categories.map(cat => (
                            <div key={cat.id} className="mega-menu-modern__category">
                                <h3 className="mega-menu-modern__title">{cat.name}</h3>
                                <div className="mega-menu-modern__links">
                                    {cat.children?.map(sub => (
                                        <a
                                            key={sub.id}
                                            href={`/categoria/${sub.slug}`}
                                            className="mega-menu-modern__link"
                                        >
                                            {sub.name}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />

                    {/* Menu Panel */}
                    <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white overflow-y-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
                            <span className="navbar__logo">
                                <span className="text-2xl">⚡</span>
                                <span>Punto<span className="navbar__logo-accent">Electro</span></span>
                            </span>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 hover:bg-[var(--color-surface-hover)] rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Search (Mobile) */}
                        <div className="p-4 border-b border-[var(--color-border)]">
                            <div className="relative">
                                <Search size={18} className="navbar__search-icon" />
                                <input
                                    type="text"
                                    placeholder="Buscar productos..."
                                    className="navbar__search-input"
                                />
                            </div>
                        </div>

                        {/* Categories & Links */}
                        <div className="py-4">
                            <div className="px-4 pb-2">
                                <span className="text-xs font-semibold text-[var(--color-text-light)] uppercase tracking-wider">
                                    Categorías
                                </span>
                            </div>
                            {categories.map(cat => (
                                <a
                                    key={cat.id}
                                    href={`/categoria/${cat.slug}`}
                                    className="flex items-center gap-3 px-6 py-3 hover:bg-[var(--color-surface-hover)] transition-colors"
                                >
                                    <span className="text-lg">{getCategoryIcon(cat.slug)}</span>
                                    <span className="font-medium text-[var(--color-text)]">{cat.name}</span>
                                </a>
                            ))}

                            <div className="my-4 mx-4 border-t border-[var(--color-border)]" />

                            <a href="/tienda" className="flex items-center gap-3 px-6 py-3 hover:bg-[var(--color-surface-hover)]">
                                <span className="font-medium text-[var(--color-text)]">Tienda</span>
                            </a>
                            <a href="/kits" className="flex items-center gap-3 px-6 py-3 hover:bg-[var(--color-surface-hover)]">
                                <span className="font-medium text-[var(--color-text)]">Kits</span>
                            </a>
                            <a href="/ofertas" className="flex items-center gap-3 px-6 py-3 hover:bg-[var(--color-surface-hover)]">
                                <span className="px-2 py-0.5 bg-[var(--color-accent)] text-[var(--color-primary)] text-xs font-bold rounded-full mr-2">HOT</span>
                                <span className="font-medium text-[var(--color-text)]">Ofertas</span>
                            </a>

                            <div className="my-4 mx-4 border-t border-[var(--color-border)]" />

                            <a href="/dashboard/lists" className="flex items-center gap-3 px-6 py-3 hover:bg-[var(--color-surface-hover)]">
                                <FolderOpen size={20} className="text-[var(--color-primary)]" />
                                <span className="font-medium text-[var(--color-text)]">Mis Proyectos</span>
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

// Helper function to get category icons
function getCategoryIcon(slug: string): string {
    const icons: Record<string, string> = {
        'iluminacion': '💡',
        'electricidad': '⚡',
        'herramientas': '🔧',
        'camaras-seguridad': '📹',
    }
    return icons[slug] || '📦'
}
