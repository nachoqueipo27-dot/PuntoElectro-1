import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X, ChevronDown, Loader2, Package } from 'lucide-react'
import { supabase, type Product, type Category } from '../../lib/supabase'
import ProductCardModern from '../../components/product/ProductCardModern'
import { useCartStore } from '../../stores/cartStore'

export default function CatalogPage() {
    const [searchParams, setSearchParams] = useSearchParams()
    const { addItem } = useCartStore()

    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showFilters, setShowFilters] = useState(false)

    // Filter states
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoria') || '')
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000])
    const [sortBy, setSortBy] = useState(searchParams.get('orden') || 'newest')

    // Fetch categories
    useEffect(() => {
        async function fetchCategories() {
            const { data } = await supabase
                .from('categories')
                .select('*')
                .eq('is_active', true)
                .order('display_order')

            if (data) {
                // Build tree structure
                const map = new Map<string, Category>()
                const roots: Category[] = []

                data.forEach(cat => {
                    map.set(cat.id, { ...cat, children: [] })
                })

                map.forEach(cat => {
                    if (cat.parent_id && map.has(cat.parent_id)) {
                        map.get(cat.parent_id)!.children!.push(cat)
                    } else {
                        roots.push(cat)
                    }
                })

                setCategories(roots)
            }
        }

        fetchCategories()
    }, [])

    // Fetch products
    useEffect(() => {
        async function fetchProducts() {
            setIsLoading(true)
            try {
                let query = supabase
                    .from('products')
                    .select(`
                        *,
                        brand:brands(*),
                        category:categories(*)
                    `)
                    .eq('is_active', true)

                // Apply category filter
                if (selectedCategory) {
                    query = query.eq('category_id', selectedCategory)
                }

                // Apply search
                if (searchQuery) {
                    query = query.or(`name.ilike.%${searchQuery}%,sku.ilike.%${searchQuery}%`)
                }

                // Apply sorting
                switch (sortBy) {
                    case 'price-asc':
                        query = query.order('price', { ascending: true })
                        break
                    case 'price-desc':
                        query = query.order('price', { ascending: false })
                        break
                    case 'name':
                        query = query.order('name', { ascending: true })
                        break
                    default:
                        query = query.order('created_at', { ascending: false })
                }

                const { data, error } = await query

                if (error) throw error

                // Map to Product type
                const mappedProducts: Product[] = (data || []).map(p => ({
                    id: p.id,
                    sku: p.sku,
                    name: p.name,
                    slug: p.slug,
                    description: p.description,
                    category_id: p.category_id,
                    price_list: Number(p.price),
                    price_wholesale: p.compare_at_price ? Number(p.compare_at_price) : null,
                    stock: p.stock,
                    main_image: p.image_url,
                    images: p.images || [],
                    specs: {},
                    is_active: p.is_active,
                    is_featured: p.is_featured,
                    is_bundle: p.is_bundle,
                    created_at: p.created_at,
                    updated_at: p.updated_at,
                    brand: p.brand,
                    category: p.category,
                }))

                setProducts(mappedProducts)
            } catch (error) {
                console.error('Error fetching products:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchProducts()
    }, [selectedCategory, sortBy])

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery) {
                setSearchParams({ q: searchQuery })
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [searchQuery, setSearchParams])

    // Filter products by search and price
    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = !searchQuery ||
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.sku.toLowerCase().includes(searchQuery.toLowerCase())

            const matchesPrice = p.price_list >= priceRange[0] && p.price_list <= priceRange[1]

            return matchesSearch && matchesPrice
        })
    }, [products, searchQuery, priceRange])

    const handleCategorySelect = (categoryId: string) => {
        setSelectedCategory(categoryId === selectedCategory ? '' : categoryId)
    }

    return (
        <div className="min-h-screen bg-[var(--color-bg)]">
            {/* Header */}
            <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)]">
                <div className="container-modern py-8">
                    <h1 className="text-3xl font-bold text-[var(--color-primary)] font-heading mb-4">
                        Catálogo de Productos
                    </h1>

                    {/* Search Bar */}
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-light)]" size={20} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar productos..."
                                className="w-full h-12 pl-12 pr-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] placeholder:text-[var(--color-text-light)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-accent-glow)] transition-all"
                            />
                        </div>

                        {/* Mobile Filter Toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="lg:hidden h-12 px-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl flex items-center gap-2 text-[var(--color-text)]"
                        >
                            <SlidersHorizontal size={20} />
                            Filtros
                        </button>
                    </div>
                </div>
            </div>

            <div className="container-modern py-8">
                <div className="flex gap-8">
                    {/* Sidebar Filters */}
                    <aside className={`
                        fixed lg:relative inset-0 z-50 lg:z-auto
                        w-80 lg:w-64 flex-shrink-0
                        bg-[var(--color-surface)] lg:bg-transparent
                        transform transition-transform lg:transform-none
                        ${showFilters ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    `}>
                        {/* Mobile Header */}
                        <div className="lg:hidden flex items-center justify-between p-4 border-b border-[var(--color-border)]">
                            <h2 className="font-bold text-[var(--color-primary)]">Filtros</h2>
                            <button onClick={() => setShowFilters(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-4 lg:p-0 space-y-6 overflow-y-auto max-h-[calc(100vh-80px)] lg:max-h-none">
                            {/* Categories */}
                            <div className="bg-[var(--color-surface)] rounded-2xl p-5 border border-[var(--color-border)]">
                                <h3 className="font-bold text-[var(--color-primary)] mb-4">Categorías</h3>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => setSelectedCategory('')}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!selectedCategory
                                            ? 'bg-[var(--color-primary)] text-white'
                                            : 'hover:bg-[var(--color-bg)] text-[var(--color-text)]'
                                            }`}
                                    >
                                        Todas las categorías
                                    </button>
                                    {categories.map(cat => (
                                        <div key={cat.id}>
                                            <button
                                                onClick={() => handleCategorySelect(cat.id)}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === cat.id
                                                    ? 'bg-[var(--color-primary)] text-white'
                                                    : 'hover:bg-[var(--color-bg)] text-[var(--color-text)]'
                                                    }`}
                                            >
                                                {cat.name}
                                            </button>
                                            {cat.children && cat.children.length > 0 && (
                                                <div className="ml-4 mt-1 space-y-1">
                                                    {cat.children.map(child => (
                                                        <button
                                                            key={child.id}
                                                            onClick={() => handleCategorySelect(child.id)}
                                                            className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${selectedCategory === child.id
                                                                ? 'bg-[var(--color-accent)] text-[var(--color-primary)]'
                                                                : 'hover:bg-[var(--color-bg)] text-[var(--color-text-muted)]'
                                                                }`}
                                                        >
                                                            {child.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div className="bg-[var(--color-surface)] rounded-2xl p-5 border border-[var(--color-border)]">
                                <h3 className="font-bold text-[var(--color-primary)] mb-4">Precio</h3>
                                <div className="space-y-4">
                                    <div className="flex gap-3">
                                        <div className="flex-1">
                                            <label className="text-xs text-[var(--color-text-muted)]">Mínimo</label>
                                            <input
                                                type="number"
                                                value={priceRange[0]}
                                                onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                                                className="w-full h-10 px-3 mt-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-xs text-[var(--color-text-muted)]">Máximo</label>
                                            <input
                                                type="number"
                                                value={priceRange[1]}
                                                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                                                className="w-full h-10 px-3 mt-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Backdrop for mobile */}
                    {showFilters && (
                        <div
                            className="lg:hidden fixed inset-0 bg-black/50 z-40"
                            onClick={() => setShowFilters(false)}
                        />
                    )}

                    {/* Main Content */}
                    <main className="flex-1">
                        {/* Toolbar */}
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-[var(--color-text-muted)]">
                                {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''}
                            </p>

                            {/* Sort */}
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="appearance-none h-10 pl-4 pr-10 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)] cursor-pointer"
                                >
                                    <option value="newest">Más recientes</option>
                                    <option value="price-asc">Precio: menor a mayor</option>
                                    <option value="price-desc">Precio: mayor a menor</option>
                                    <option value="name">Nombre A-Z</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" size={16} />
                            </div>
                        </div>

                        {/* Products Grid */}
                        {isLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 size={40} className="animate-spin text-[var(--color-primary)]" />
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="text-center py-20">
                                <Package size={64} className="mx-auto text-[var(--color-text-light)] mb-4" />
                                <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">
                                    No se encontraron productos
                                </h3>
                                <p className="text-[var(--color-text-muted)] mb-6">
                                    Probá ajustar los filtros o la búsqueda
                                </p>
                                <button
                                    onClick={() => {
                                        setSearchQuery('')
                                        setSelectedCategory('')
                                        setPriceRange([0, 500000])
                                    }}
                                    className="btn btn--secondary"
                                >
                                    Limpiar filtros
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredProducts.map(product => (
                                    <ProductCardModern
                                        key={product.id}
                                        product={product}
                                        onAddToCart={addItem}
                                    />
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    )
}
