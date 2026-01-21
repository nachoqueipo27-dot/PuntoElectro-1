import { useState } from 'react'
import { X, FolderPlus, Loader2 } from 'lucide-react'
import { useUIStore } from '../../stores/uiStore'
import { useCartStore } from '../../stores/cartStore'
import { supabase } from '../../lib/supabase'

export default function SaveProjectModal() {
    const { isSaveProjectModalOpen, closeSaveProjectModal } = useUIStore()
    const { items, clearCart, getTotal } = useCartStore()

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    if (!isSaveProjectModalOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!name.trim()) {
            setError('Por favor ingresa un nombre para el proyecto')
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                setError('Debes iniciar sesión para guardar proyectos')
                setIsLoading(false)
                return
            }

            // Create project
            const { data: project, error: projectError } = await supabase
                .from('project_lists')
                .insert({
                    user_id: user.id,
                    name: name.trim(),
                    description: description.trim() || null,
                    is_active_cart: false,
                })
                .select()
                .single()

            if (projectError) throw projectError

            // Add items to project
            const projectItems = items.map(item => ({
                list_id: project.id,
                product_id: item.productId,
                quantity: item.quantity,
                notes: null
            }))

            const { error: itemsError } = await supabase
                .from('project_list_items')
                .insert(projectItems)

            if (itemsError) throw itemsError

            setSuccess(true)

            // Clear form after success
            setTimeout(() => {
                clearCart()
                closeSaveProjectModal()
                setName('')
                setDescription('')
                setSuccess(false)
            }, 2000)

        } catch (err) {
            console.error('Error saving project:', err)
            setError('Error al guardar el proyecto. Por favor intenta nuevamente.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleClose = () => {
        if (!isLoading) {
            closeSaveProjectModal()
            setName('')
            setDescription('')
            setError(null)
            setSuccess(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[var(--color-accent)] rounded-xl flex items-center justify-center">
                            <FolderPlus size={20} className="text-[var(--color-primary)]" />
                        </div>
                        <h2 className="font-heading text-xl font-bold text-[var(--color-primary)]">
                            Guardar Proyecto
                        </h2>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={isLoading}
                        className="p-2 hover:bg-[var(--color-surface-hover)] rounded-lg transition-colors disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Success State */}
                {success ? (
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="font-heading text-xl font-bold text-[var(--color-text)] mb-2">
                            ¡Proyecto guardado!
                        </h3>
                        <p className="text-[var(--color-text-muted)]">
                            Puedes verlo en tu Dashboard de Proyectos
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {/* Body */}
                        <div className="p-6 space-y-4">
                            {/* Summary */}
                            <div className="p-4 bg-[var(--color-bg)] rounded-xl">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-[var(--color-text-muted)]">Productos</span>
                                    <span className="font-medium">{items.length} items</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[var(--color-text-muted)]">Total estimado</span>
                                    <span className="font-bold text-[var(--color-primary)]">
                                        ${getTotal().toLocaleString('es-AR')}
                                    </span>
                                </div>
                            </div>

                            {/* Name Input */}
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                                    Nombre del Proyecto *
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Ej: Edificio Torre Norte"
                                    className="w-full px-4 py-3 border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-accent-glow)] transition-all"
                                    disabled={isLoading}
                                    autoFocus
                                />
                            </div>

                            {/* Description Input */}
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                                    Descripción (opcional)
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Ej: Instalación eléctrica pisos 3-5"
                                    rows={3}
                                    className="w-full px-4 py-3 border border-[var(--color-border)] rounded-xl focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-accent-glow)] transition-all resize-none"
                                    disabled={isLoading}
                                />
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                                    {error}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-[var(--color-border)] flex gap-3">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={isLoading}
                                className="btn btn--secondary flex-1"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn btn--primary flex-1 flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    'Guardar Proyecto'
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}
