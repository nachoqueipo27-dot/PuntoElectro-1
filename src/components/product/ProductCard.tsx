import { Check, AlertTriangle, XCircle, Plus, Minus, ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import type { Product } from '../../lib/supabase'

// ============================================
// STOCK INDICATOR
// ============================================
interface StockIndicatorProps {
    stock: number
    trackInventory: boolean
}

function StockIndicator({ stock, trackInventory }: StockIndicatorProps) {
    if (!trackInventory) return null

    if (stock <= 0) {
        return (
            <span className="product-card__stock product-card__stock--out">
                <XCircle size={12} />
                Sin stock
            </span>
        )
    }

    if (stock <= 5) {
        return (
            <span className="product-card__stock product-card__stock--low">
                <AlertTriangle size={12} />
                Últimas {stock} unidades
            </span>
        )
    }

    return (
        <span className="product-card__stock product-card__stock--available">
            <Check size={12} />
            En stock ({stock})
        </span>
    )
}

// ============================================
// QUANTITY SELECTOR
// ============================================
interface QuantitySelectorProps {
    quantity: number
    min?: number
    max?: number
    onChange: (qty: number) => void
}

function QuantitySelector({ quantity, min = 1, max = 99, onChange }: QuantitySelectorProps) {
    const decrease = () => onChange(Math.max(min, quantity - 1))
    const increase = () => onChange(Math.min(max, quantity + 1))

    return (
        <div className="quantity-selector">
            <button
                onClick={decrease}
                disabled={quantity <= min}
                className="quantity-selector__btn disabled:opacity-50"
                aria-label="Disminuir cantidad"
            >
                <Minus size={14} />
            </button>
            <input
                type="number"
                value={quantity}
                onChange={(e) => {
                    const val = parseInt(e.target.value) || min
                    onChange(Math.max(min, Math.min(max, val)))
                }}
                className="quantity-selector__input"
                min={min}
                max={max}
            />
            <button
                onClick={increase}
                disabled={quantity >= max}
                className="quantity-selector__btn disabled:opacity-50"
                aria-label="Aumentar cantidad"
            >
                <Plus size={14} />
            </button>
        </div>
    )
}

// ============================================
// PRODUCT CARD
// ============================================
interface ProductCardProps {
    product: Product
    onAddToCart?: (product: Product, quantity: number) => void
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
    const [quantity, setQuantity] = useState(product.min_quantity || 1)

    const discount = product.compare_at_price
        ? Math.round((1 - product.price / product.compare_at_price) * 100)
        : 0

    const isOutOfStock = product.track_inventory && product.stock <= 0
    const maxQty = product.max_quantity || (product.track_inventory ? product.stock : 99)

    const handleAddToCart = () => {
        if (onAddToCart && !isOutOfStock) {
            onAddToCart(product, quantity)
            setQuantity(product.min_quantity || 1)
        }
    }

    return (
        <article className="product-card">
            {/* Image Section */}
            <div className="product-card__image">
                {/* Discount Badge */}
                {discount > 0 && (
                    <span className="product-card__badge">-{discount}%</span>
                )}

                {/* Product Image */}
                {product.image_url ? (
                    <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-contain"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ShoppingCart size={48} />
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="flex flex-col flex-1 p-3 gap-2">
                {/* Brand */}
                {product.brand && (
                    <span className="product-card__brand">{product.brand.name}</span>
                )}

                {/* Title */}
                <h3 className="product-card__title">
                    <a href={`/producto/${product.slug}`} className="hover:underline">
                        {product.name}
                    </a>
                </h3>

                {/* SKU */}
                <span className="product-card__sku">SKU: {product.sku}</span>

                {/* Stock */}
                <StockIndicator stock={product.stock} trackInventory={product.track_inventory} />

                {/* Spacer */}
                <div className="flex-1" />

                {/* Price */}
                <div className="product-card__price">
                    {product.compare_at_price && (
                        <span className="product-card__price-original">
                            ${product.compare_at_price.toLocaleString('es-AR')}
                        </span>
                    )}
                    <span className="product-card__price-current">
                        ${product.price.toLocaleString('es-AR')}
                    </span>
                </div>

                {/* Add to Cart */}
                <div className="flex items-center gap-2 mt-2">
                    <QuantitySelector
                        quantity={quantity}
                        min={product.min_quantity || 1}
                        max={maxQty}
                        onChange={setQuantity}
                    />
                    <button
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                        className="btn-quick-add flex-1"
                    >
                        <ShoppingCart size={16} />
                        <span className="hidden sm:inline">Agregar</span>
                    </button>
                </div>
            </div>
        </article>
    )
}

// ============================================
// PRODUCT GRID
// ============================================
interface ProductGridProps {
    products: Product[]
    onAddToCart?: (product: Product, quantity: number) => void
}

export function ProductGrid({ products, onAddToCart }: ProductGridProps) {
    if (products.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                No se encontraron productos
            </div>
        )
    }

    return (
        <div className="grid-products">
            {products.map(product => (
                <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={onAddToCart}
                />
            ))}
        </div>
    )
}
