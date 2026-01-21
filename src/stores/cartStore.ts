import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from '../lib/supabase'

export interface CartItem {
    productId: string
    product: Product
    quantity: number
}

interface CartStore {
    items: CartItem[]
    isOpen: boolean

    // Actions
    addItem: (product: Product, quantity?: number) => void
    removeItem: (productId: string) => void
    updateQuantity: (productId: string, quantity: number) => void
    clearCart: () => void
    toggleCart: () => void
    openCart: () => void
    closeCart: () => void

    // Computed (as functions)
    getTotal: () => number
    getItemCount: () => number
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,

            addItem: (product, quantity = 1) => {
                const { items } = get()
                const existingItem = items.find(item => item.productId === product.id)

                if (existingItem) {
                    set({
                        items: items.map(item =>
                            item.productId === product.id
                                ? { ...item, quantity: item.quantity + quantity }
                                : item
                        )
                    })
                } else {
                    set({
                        items: [...items, { productId: product.id, product, quantity }]
                    })
                }

                // Open cart when adding item
                set({ isOpen: true })
            },

            removeItem: (productId) => {
                set({
                    items: get().items.filter(item => item.productId !== productId)
                })
            },

            updateQuantity: (productId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(productId)
                    return
                }

                set({
                    items: get().items.map(item =>
                        item.productId === productId
                            ? { ...item, quantity }
                            : item
                    )
                })
            },

            clearCart: () => {
                set({ items: [] })
            },

            toggleCart: () => {
                set({ isOpen: !get().isOpen })
            },

            openCart: () => {
                set({ isOpen: true })
            },

            closeCart: () => {
                set({ isOpen: false })
            },

            getTotal: () => {
                return get().items.reduce(
                    (sum, item) => sum + (item.product.price_list || 0) * item.quantity,
                    0
                )
            },

            getItemCount: () => {
                return get().items.reduce((sum, item) => sum + item.quantity, 0)
            },
        }),
        {
            name: 'punto-electro-cart',
            partialize: (state) => ({ items: state.items }), // Only persist items
        }
    )
)
