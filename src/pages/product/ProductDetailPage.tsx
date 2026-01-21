import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShoppingCart, MessageCircle, Package, ChevronRight, Minus, Plus, Loader2, ArrowLeft } from 'lucide-react'
import { supabase, type Product, type BundleItem } from '../../lib/supabase'
import { useCartStore } from '../../stores/cartStore'

export default function ProductDetailPage() {
    const { slug } = useParams<{ slug: string }>()
    const { addItem } = useCartStore()

    const [product, setProduct] = useState<Product | null>(null)
    const [bundleItems, setBundleItems] = useState<BundleItem[]>([])
    const [quantity, setQuantity] = useState(1)
    const [isLoading, setIsLoading] = useState(true)
    const [isAdding, setIsAdding] = useState(false)

    useEffect(() => {
        async function fetchProduct() {
            if (!slug) return

            setIsLoading(true)
            try {
                // Fetch product by slug
                const { data: productData, error } = await supabase
                    .from('products')
                    .select(`
                        *,
                        brand:brands(*),
                        category:categories(*)
                    `)
                    .eq('slug', slug)
                    .eq('is_active', true)
                    .single()

                if (error) throw error

                // Map the response to match our Product type
                const mappedProduct: Product = {
                    id: productData.id,
                    sku: productData.sku,
                    name: productData.name,
                    slug: productData.slug,
                    description: productData.description || productData.short_description,
                    category_id: productData.category_id,
                    price_list: Number(productData.price),
                    price_wholesale: productData.compare_at_price ? Number(productData.compare_at_price) : null,
                    stock: productData.stock,
                    main_image: productData.image_url,
                    images: productData.images || [],
                    specs: {},
                    is_active: productData.is_active,
                    is_featured: productData.is_featured,
                    is_bundle: productData.is_bundle,
                    created_at: productData.created_at,
                    updated_at: productData.updated_at,
                    brand: productData.brand,
                    category: productData.category,
                }

                setProduct(mappedProduct)

                // If it's a bundle, fetch bundle items
                if (productData.is_bundle) {
                    const { data: bundleData } = await supabase
                        .from('bundle_items')
                        .select(`
                            *,
                            product:products(id, name, sku, image_url, price)
                        `)
                        .eq('bundle_id', productData.id)

                    if (bundleData) {
                        setBundleItems(bundleData.map(item => ({
                            ...item,
                            product: item.product ? {
                                ...item.product,
                                price_list: Number(item.product.price),
                                main_image: item.product.image_url,
                            } : undefined
                        })))
                    }
                }
            } catch (error) {
                console.error('Error fetching product:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchProduct()
    }, [slug])

    const handleAddToCart = async () => {
        if (!product) return
        setIsAdding(true)

        // Simulate a small delay for feedback
        await new Promise(resolve => setTimeout(resolve, 300))

        addItem(product, quantity)
        setIsAdding(false)
    }

    const handleWhatsApp = () => {
        if (!product) return
        const message = encodeURIComponent(
            `Hola! Me interesa el producto: ${product.name} (SKU: ${product.sku})`
        )
        window.open(`https://wa.me/5491141412148?text=${message}`, '_blank')
    }

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 size={40} className="animate-spin text-[var(--color-primary)]" />
            </div>
        )
    }

    if (!product) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
                <Package size={64} className="text-[var(--color-text-light)] mb-4" />
                <h2 className="text-xl font-bold text-[var(--color-text)] mb-2">Producto no encontrado</h2>
                <p className="text-[var(--color-text-muted)] mb-6">El producto que buscás no existe o fue removido.</p>
                <Link to="/tienda" className="btn btn--primary">
                    Volver a la tienda
                </Link>
            </div>
        )
    }

    return (
        <div className="container-modern py-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] mb-8">
                <Link to="/" className="hover:text-[var(--color-primary)]">Inicio</Link>
                <ChevronRight size={14} />
                <Link to="/tienda" className="hover:text-[var(--color-primary)]">Tienda</Link>
                {product.category && (
                    <>
                        <ChevronRight size={14} />
                        <Link to={`/categoria/${product.category.slug}`} className="hover:text-[var(--color-primary)]">
                            {product.category.name}
                        </Link>
                    </>
                )}
                <ChevronRight size={14} />
                <span className="text-[var(--color-text)]">{product.name}</span>
            </nav>

            <div className="grid lg:grid-cols-2 gap-12">
                {/* Image Section */}
                <div className="space-y-4">
                    <div className="aspect-square bg-[var(--color-bg)] rounded-3xl flex items-center justify-center overflow-hidden border border-[var(--color-border)]">
                        {product.main_image ? (
                            <img
                                src={product.main_image}
                                alt={product.name}
                                className="w-full h-full object-contain p-8"
                            />
                        ) : (
                            <Package size={120} className="text-[var(--color-text-light)]" />
                        )}
                    </div>

                    {/* Thumbnail Gallery */}
                    {product.images && product.images.length > 0 && (
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            {product.images.map((img, idx) => (
                                <button
                                    key={idx}
                                    className="w-20 h-20 flex-shrink-0 rounded-xl border-2 border-[var(--color-border)] overflow-hidden hover:border-[var(--color-primary)] transition-colors"
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="space-y-6">
                    {/* Badge */}
                    {product.is_bundle && (
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--color-accent)] text-[var(--color-primary)] text-sm font-semibold rounded-full">
                            <Package size={14} />
                            Kit Completo
                        </span>
                    )}

                    {/* Brand */}
                    {product.brand && (
                        <p className="text-sm text-[var(--color-text-muted)] uppercase tracking-wider">
                            {product.brand.name}
                        </p>
                    )}

                    {/* Title */}
                    <h1 className="text-3xl lg:text-4xl font-bold text-[var(--color-primary)] font-heading">
                        {product.name}
                    </h1>

                    {/* SKU */}
                    <p className="text-sm text-[var(--color-text-muted)]">
                        SKU: {product.sku}
                    </p>

                    {/* Price */}
                    <div className="flex items-baseline gap-4">
                        <span className="text-4xl font-bold text-[var(--color-primary)]">
                            ${product.price_list.toLocaleString('es-AR')}
                        </span>
                        {product.price_wholesale && (
                            <span className="text-lg text-[var(--color-text-muted)] line-through">
                                ${product.price_wholesale.toLocaleString('es-AR')}
                            </span>
                        )}
                    </div>

                    {/* Stock Status */}
                    <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-sm font-medium">
                            {product.stock > 0 ? `${product.stock} en stock` : 'Sin stock'}
                        </span>
                    </div>

                    {/* Description */}
                    {product.description && (
                        <p className="text-[var(--color-text-muted)] leading-relaxed">
                            {product.description}
                        </p>
                    )}

                    {/* Bundle Items */}
                    {product.is_bundle && bundleItems.length > 0 && (
                        <div className="bg-[var(--color-bg)] rounded-2xl p-6 border border-[var(--color-border)]">
                            <h3 className="font-bold text-[var(--color-primary)] mb-4 flex items-center gap-2">
                                <Package size={20} />
                                Este Kit Incluye:
                            </h3>
                            <ul className="space-y-3">
                                {bundleItems.map((item) => (
                                    <li key={item.id} className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-[var(--color-border)] overflow-hidden">
                                            {item.product?.main_image ? (
                                                <img
                                                    src={item.product.main_image}
                                                    alt=""
                                                    className="w-full h-full object-contain p-1"
                                                />
                                            ) : (
                                                <Package size={20} className="text-[var(--color-text-light)]" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-[var(--color-text)]">
                                                {item.product?.name || 'Producto'}
                                            </p>
                                            <p className="text-sm text-[var(--color-text-muted)]">
                                                Cantidad: {item.quantity}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-[var(--color-text)]">Cantidad:</span>
                        <div className="flex items-center border border-[var(--color-border)] rounded-xl overflow-hidden">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="w-10 h-10 flex items-center justify-center hover:bg-[var(--color-bg)] transition-colors"
                            >
                                <Minus size={16} />
                            </button>
                            <span className="w-12 text-center font-medium">{quantity}</span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="w-10 h-10 flex items-center justify-center hover:bg-[var(--color-bg)] transition-colors"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <button
                            onClick={handleAddToCart}
                            disabled={isAdding || product.stock <= 0}
                            className="flex-1 h-14 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isAdding ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <>
                                    <ShoppingCart size={20} />
                                    Agregar al Carrito
                                </>
                            )}
                        </button>

                        <button
                            onClick={handleWhatsApp}
                            className="h-14 px-6 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all"
                        >
                            <MessageCircle size={20} />
                            WhatsApp
                        </button>
                    </div>

                    {/* Back Link */}
                    <Link
                        to="/tienda"
                        className="inline-flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Seguir comprando
                    </Link>
                </div>
            </div>
        </div>
    )
}
