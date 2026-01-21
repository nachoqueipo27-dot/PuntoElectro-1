import { ShoppingCart, Plus } from 'lucide-react'
import type { Product } from '../../lib/supabase'

interface ProductCardModernProps {
    product: Product
    onAddToCart?: (product: Product) => void
}

export default function ProductCardModern({ product, onAddToCart }: ProductCardModernProps) {

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault()
        onAddToCart?.(product)
    }

    return (
        <article className="product-card-modern group">
            {/* Product Image */}
            <div className="product-card-modern__image">
                {product.main_image ? (
                    <img
                        src={product.main_image}
                        alt={product.name}
                        loading="lazy"
                    />
                ) : (
                    <ShoppingCart size={48} className="text-[var(--color-text-light)]" />
                )}
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col">
                {/* Brand */}
                {product.brand && (
                    <span className="product-card-modern__brand">{product.brand.name}</span>
                )}

                {/* Title */}
                <h3 className="product-card-modern__title">
                    <a href={`/producto/${product.slug}`}>{product.name}</a>
                </h3>

                {/* Price */}
                <div className="product-card-modern__price">
                    <span className="product-card-modern__price-current">
                        ${product.price_list.toLocaleString('es-AR')}
                    </span>
                    {product.price_wholesale && (
                        <span className="product-card-modern__price-original text-xs text-[var(--color-text-muted)]">
                            Mayorista: ${product.price_wholesale.toLocaleString('es-AR')}
                        </span>
                    )}
                </div>

                {/* Add to Cart Button - Appears on hover */}
                <div className="product-card-modern__actions">
                    <button
                        onClick={handleAddToCart}
                        className="product-card-modern__btn"
                    >
                        <Plus size={18} />
                        Agregar
                    </button>
                </div>
            </div>
        </article>
    )
}

// Product Grid Component
interface ProductGridModernProps {
    products: Product[]
    onAddToCart?: (product: Product) => void
}

export function ProductGridModern({ products, onAddToCart }: ProductGridModernProps) {
    if (products.length === 0) {
        return (
            <div className="text-center py-16">
                <p className="text-[var(--color-text-muted)]">No se encontraron productos</p>
            </div>
        )
    }

    return (
        <div className="grid-products">
            {products.map(product => (
                <ProductCardModern
                    key={product.id}
                    product={product}
                    onAddToCart={onAddToCart}
                />
            ))}
        </div>
    )
}
