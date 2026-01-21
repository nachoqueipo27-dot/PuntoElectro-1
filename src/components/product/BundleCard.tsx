import { ShoppingCart, Package } from 'lucide-react'

interface BundleProduct {
    id: string
    name: string
    image_url?: string | null
    icon?: string
}

interface BundleCardProps {
    title: string
    products: BundleProduct[]
    originalPrice: number
    salePrice: number
    description: string
    onAddToCart?: () => void
}

export default function BundleCard({
    title,
    products,
    originalPrice,
    salePrice,
    description,
    onAddToCart
}: BundleCardProps) {
    const savings = Math.round((1 - salePrice / originalPrice) * 100)
    const visibleProducts = products.slice(0, 4)
    const remainingCount = products.length - 4

    return (
        <div className="bundle-card">
            <div className="bundle-card__header">
                <h3 className="bundle-card__title">{title}</h3>
                <span className="bundle-card__savings">-{savings}%</span>
            </div>

            {/* Product Thumbnails */}
            <div className="bundle-card__products">
                {visibleProducts.map((product, index) => (
                    <div
                        key={product.id}
                        className="bundle-card__product-thumb"
                        style={{ zIndex: visibleProducts.length - index }}
                    >
                        {product.image_url ? (
                            <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-contain p-2"
                            />
                        ) : product.icon ? (
                            <span>{product.icon}</span>
                        ) : (
                            <Package size={24} className="text-[var(--color-text-light)]" />
                        )}
                    </div>
                ))}
                {remainingCount > 0 && (
                    <div className="bundle-card__more">+{remainingCount}</div>
                )}
            </div>

            {/* Description */}
            <p className="bundle-card__contents">{description}</p>

            {/* Pricing */}
            <div className="bundle-card__price">
                <span className="bundle-card__price-original">
                    ${originalPrice.toLocaleString('es-AR')}
                </span>
                <span className="bundle-card__price-current">
                    ${salePrice.toLocaleString('es-AR')}
                </span>
            </div>

            {/* Add to Cart */}
            <button onClick={onAddToCart} className="bundle-card__btn">
                <ShoppingCart size={20} />
                Agregar Kit
            </button>
        </div>
    )
}

// Featured Bundles Section
interface FeaturedBundlesProps {
    bundles: Array<{
        id: string
        title: string
        products: BundleProduct[]
        originalPrice: number
        salePrice: number
        description: string
    }>
    onAddToCart?: (bundleId: string) => void
}

export function FeaturedBundles({ bundles, onAddToCart }: FeaturedBundlesProps) {
    if (bundles.length === 0) return null

    return (
        <section className="section bg-white">
            <div className="container-modern">
                <h2 className="section-title">Kits Recomendados</h2>
                <p className="section-subtitle">
                    Paquetes armados con todo lo que necesitas y ahorro incluido
                </p>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bundles.map(bundle => (
                        <BundleCard
                            key={bundle.id}
                            title={bundle.title}
                            products={bundle.products}
                            originalPrice={bundle.originalPrice}
                            salePrice={bundle.salePrice}
                            description={bundle.description}
                            onAddToCart={() => onAddToCart?.(bundle.id)}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}
