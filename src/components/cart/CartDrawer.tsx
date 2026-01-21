import { X, Plus, Minus, Trash2, FolderPlus, ShoppingBag, MessageCircle } from 'lucide-react'
import { useCartStore } from '../../stores/cartStore'
import { useUIStore } from '../../stores/uiStore'

export default function CartDrawer() {
    const { items, isOpen, closeCart, updateQuantity, removeItem, getTotal, clearCart } = useCartStore()
    const { openSaveProjectModal } = useUIStore()

    if (!isOpen) return null

    const total = getTotal()
    const isEmpty = items.length === 0

    const handleSaveAsProject = () => {
        closeCart()
        openSaveProjectModal()
    }

    // WhatsApp Checkout Handler
    const handleWhatsAppCheckout = () => {
        const WHATSAPP_NUMBER = '5491141412148'

        // Build formatted message
        let message = '¡Hola Punto Electro! 👋\n\n'
        message += 'Quiero realizar el siguiente pedido:\n\n'

        items.forEach(item => {
            const subtotal = (item.product.price_list || 0) * item.quantity
            message += `• ${item.quantity}x ${item.product.name}\n`
            message += `  📦 SKU: ${item.product.sku}\n`
            message += `  💰 Subtotal: $${subtotal.toLocaleString('es-AR')}\n\n`
        })

        message += `━━━━━━━━━━━━━━━━━━━━\n`
        message += `💵 *Total Estimado: $${total.toLocaleString('es-AR')}*\n\n`
        message += `¡Gracias!`

        // Encode and open WhatsApp
        const encodedMessage = encodeURIComponent(message)
        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`

        window.open(whatsappUrl, '_blank')
    }

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={closeCart}
            />

            {/* Drawer */}
            <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
                    <h2 className="font-heading text-xl font-bold text-[var(--color-primary)]">
                        Mi Carrito
                    </h2>
                    <button
                        onClick={closeCart}
                        className="p-2 hover:bg-[var(--color-surface-hover)] rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-6">
                    {isEmpty ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <ShoppingBag size={48} className="text-[var(--color-text-light)] mb-4" />
                            <p className="text-[var(--color-text-muted)]">Tu carrito está vacío</p>
                            <button
                                onClick={closeCart}
                                className="mt-4 btn btn--secondary"
                            >
                                Seguir comprando
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {items.map((item) => (
                                <div
                                    key={item.productId}
                                    className="flex gap-4 p-4 bg-[var(--color-bg)] rounded-xl"
                                >
                                    {/* Product Image */}
                                    <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                                        {item.product.main_image ? (
                                            <img
                                                src={item.product.main_image}
                                                alt={item.product.name}
                                                className="w-full h-full object-contain p-2"
                                            />
                                        ) : (
                                            <ShoppingBag size={24} className="text-[var(--color-text-light)]" />
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-[var(--color-text)] text-sm line-clamp-2">
                                            {item.product.name}
                                        </h3>
                                        <p className="text-[var(--color-primary)] font-bold mt-1">
                                            ${(item.product.price_list || 0).toLocaleString('es-AR')}
                                        </p>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center gap-2 mt-2">
                                            <button
                                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                className="w-8 h-8 flex items-center justify-center bg-white rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] transition-colors"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                className="w-8 h-8 flex items-center justify-center bg-white rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] transition-colors"
                                            >
                                                <Plus size={14} />
                                            </button>
                                            <button
                                                onClick={() => removeItem(item.productId)}
                                                className="ml-auto p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {!isEmpty && (
                    <div className="border-t border-[var(--color-border)] p-6 space-y-4">
                        {/* Total */}
                        <div className="flex justify-between items-center">
                            <span className="text-[var(--color-text-muted)]">Subtotal</span>
                            <span className="text-2xl font-bold text-[var(--color-primary)]">
                                ${total.toLocaleString('es-AR')}
                            </span>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3">
                            <button
                                onClick={handleWhatsAppCheckout}
                                className="btn btn--lg w-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center gap-2"
                            >
                                <MessageCircle size={20} />
                                Pedir por WhatsApp
                            </button>

                            <button
                                onClick={handleSaveAsProject}
                                className="btn btn--secondary w-full flex items-center justify-center gap-2"
                            >
                                <FolderPlus size={18} />
                                Guardar como Proyecto
                            </button>
                        </div>

                        {/* Clear Cart */}
                        <button
                            onClick={clearCart}
                            className="w-full text-center text-sm text-[var(--color-text-muted)] hover:text-red-500 transition-colors"
                        >
                            Vaciar carrito
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
