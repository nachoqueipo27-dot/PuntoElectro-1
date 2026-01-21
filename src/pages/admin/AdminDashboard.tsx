import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { Plus, Upload, Loader2, Package, Save, X, Image as ImageIcon, Trash2 } from 'lucide-react'
import { supabase, type Category, type Product } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'

interface ProductForm {
    name: string
    sku: string
    slug: string
    description: string
    category_id: string
    price: string
    compare_at_price: string
    stock: string
    is_bundle: boolean
    is_featured: boolean
    image_url: string
}

const initialForm: ProductForm = {
    name: '',
    sku: '',
    slug: '',
    description: '',
    category_id: '',
    price: '',
    compare_at_price: '',
    stock: '0',
    is_bundle: false,
    is_featured: false,
    image_url: '',
}

export default function AdminDashboard() {
    const { profile, isLoading: authLoading, isInitialized } = useAuthStore()

    const [categories, setCategories] = useState<Category[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isUploading, setIsUploading] = useState(false)

    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState<ProductForm>(initialForm)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    // Check admin access
    if (isInitialized && !authLoading) {
        if (!profile || profile.role !== 'admin') {
            return <Navigate to="/" replace />
        }
    }

    // Fetch data
    useEffect(() => {
        async function fetchData() {
            setIsLoading(true)
            try {
                // Fetch categories
                const { data: catData } = await supabase
                    .from('categories')
                    .select('*')
                    .eq('is_active', true)
                    .order('display_order')

                if (catData) {
                    const mapped = catData.map(c => ({
                        id: c.id,
                        parent_id: c.parent_id,
                        name: c.name,
                        slug: c.slug,
                        description: c.description,
                        image_url: c.image_url,
                        display_order: c.display_order,
                        is_active: c.is_active,
                    }))
                    setCategories(mapped)
                }

                // Fetch products
                const { data: prodData } = await supabase
                    .from('products')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(50)

                if (prodData) {
                    const mapped: Product[] = prodData.map(p => ({
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
                    }))
                    setProducts(mapped)
                }
            } catch (err) {
                console.error('Error fetching data:', err)
            } finally {
                setIsLoading(false)
            }
        }

        if (profile?.role === 'admin') {
            fetchData()
        }
    }, [profile])

    // Generate slug from name
    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
    }

    const handleNameChange = (name: string) => {
        setForm({
            ...form,
            name,
            slug: generateSlug(name),
        })
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        setError(null)

        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}.${fileExt}`
            const filePath = `products/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('images')
                .getPublicUrl(filePath)

            setForm({ ...form, image_url: publicUrl })
        } catch (err: any) {
            setError(`Error subiendo imagen: ${err.message}`)
        } finally {
            setIsUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSuccess(null)
        setIsSaving(true)

        try {
            // Validate
            if (!form.name || !form.sku || !form.price) {
                throw new Error('Nombre, SKU y Precio son requeridos')
            }

            const productData = {
                name: form.name,
                sku: form.sku,
                slug: form.slug || generateSlug(form.name),
                description: form.description || null,
                category_id: form.category_id || null,
                price: parseFloat(form.price),
                compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null,
                stock: parseInt(form.stock) || 0,
                is_bundle: form.is_bundle,
                is_featured: form.is_featured,
                is_active: true,
                image_url: form.image_url || null,
            }

            const { data, error: insertError } = await supabase
                .from('products')
                .insert(productData)
                .select()
                .single()

            if (insertError) throw insertError

            // Add to local list
            if (data) {
                const newProduct: Product = {
                    id: data.id,
                    sku: data.sku,
                    name: data.name,
                    slug: data.slug,
                    description: data.description,
                    category_id: data.category_id,
                    price_list: Number(data.price),
                    price_wholesale: data.compare_at_price ? Number(data.compare_at_price) : null,
                    stock: data.stock,
                    main_image: data.image_url,
                    images: [],
                    specs: {},
                    is_active: data.is_active,
                    is_featured: data.is_featured,
                    is_bundle: data.is_bundle,
                    created_at: data.created_at,
                    updated_at: data.updated_at,
                }
                setProducts([newProduct, ...products])
            }

            setSuccess('Producto creado exitosamente')
            setForm(initialForm)
            setShowForm(false)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteProduct = async (productId: string) => {
        if (!confirm('¿Estás seguro de eliminar este producto?')) return

        try {
            await supabase
                .from('products')
                .delete()
                .eq('id', productId)

            setProducts(products.filter(p => p.id !== productId))
            setSuccess('Producto eliminado')
        } catch (err: any) {
            setError(err.message)
        }
    }

    if (authLoading || !isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 size={40} className="animate-spin text-[var(--color-primary)]" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[var(--color-bg)]">
            {/* Header */}
            <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)]">
                <div className="container-modern py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-[var(--color-primary)] font-heading">
                                Panel de Administración
                            </h1>
                            <p className="text-[var(--color-text-muted)]">
                                Gestión de productos
                            </p>
                        </div>

                        <button
                            onClick={() => setShowForm(true)}
                            className="btn btn--primary"
                        >
                            <Plus size={18} />
                            Nuevo Producto
                        </button>
                    </div>
                </div>
            </div>

            <div className="container-modern py-8">
                {/* Alerts */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center justify-between">
                        <span>{error}</span>
                        <button onClick={() => setError(null)}>
                            <X size={18} />
                        </button>
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 flex items-center justify-between">
                        <span>{success}</span>
                        <button onClick={() => setSuccess(null)}>
                            <X size={18} />
                        </button>
                    </div>
                )}

                {/* Product Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                        <div className="bg-[var(--color-surface)] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-[var(--color-surface)] p-6 border-b border-[var(--color-border)] flex items-center justify-between">
                                <h2 className="text-xl font-bold text-[var(--color-primary)]">
                                    Nuevo Producto
                                </h2>
                                <button onClick={() => setShowForm(false)}>
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                                        Nombre del Producto *
                                    </label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => handleNameChange(e.target.value)}
                                        className="w-full h-12 px-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl"
                                        required
                                    />
                                </div>

                                {/* SKU & Slug */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                                            SKU *
                                        </label>
                                        <input
                                            type="text"
                                            value={form.sku}
                                            onChange={(e) => setForm({ ...form, sku: e.target.value.toUpperCase() })}
                                            className="w-full h-12 px-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                                            Slug
                                        </label>
                                        <input
                                            type="text"
                                            value={form.slug}
                                            onChange={(e) => setForm({ ...form, slug: e.target.value })}
                                            className="w-full h-12 px-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl"
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                                        Descripción
                                    </label>
                                    <textarea
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl resize-none"
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                                        Categoría
                                    </label>
                                    <select
                                        value={form.category_id}
                                        onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                                        className="w-full h-12 px-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl"
                                    >
                                        <option value="">Sin categoría</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Prices */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                                            Precio *
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={form.price}
                                            onChange={(e) => setForm({ ...form, price: e.target.value })}
                                            className="w-full h-12 px-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                                            Precio Comparación
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={form.compare_at_price}
                                            onChange={(e) => setForm({ ...form, compare_at_price: e.target.value })}
                                            className="w-full h-12 px-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl"
                                        />
                                    </div>
                                </div>

                                {/* Stock */}
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                                        Stock
                                    </label>
                                    <input
                                        type="number"
                                        value={form.stock}
                                        onChange={(e) => setForm({ ...form, stock: e.target.value })}
                                        className="w-full h-12 px-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl"
                                    />
                                </div>

                                {/* Image Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                                        Imagen
                                    </label>
                                    <div className="flex gap-4 items-start">
                                        {form.image_url ? (
                                            <div className="w-24 h-24 rounded-xl border border-[var(--color-border)] overflow-hidden">
                                                <img src={form.image_url} alt="" className="w-full h-full object-cover" />
                                            </div>
                                        ) : (
                                            <div className="w-24 h-24 rounded-xl border border-dashed border-[var(--color-border)] flex items-center justify-center">
                                                <ImageIcon size={32} className="text-[var(--color-text-light)]" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <label className="btn btn--secondary cursor-pointer">
                                                {isUploading ? (
                                                    <Loader2 size={18} className="animate-spin" />
                                                ) : (
                                                    <Upload size={18} />
                                                )}
                                                Subir Imagen
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    className="hidden"
                                                    disabled={isUploading}
                                                />
                                            </label>
                                            <p className="text-xs text-[var(--color-text-muted)] mt-2">
                                                PNG, JPG hasta 2MB
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Toggles */}
                                <div className="flex gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.is_bundle}
                                            onChange={(e) => setForm({ ...form, is_bundle: e.target.checked })}
                                            className="w-5 h-5 rounded border-[var(--color-border)] text-[var(--color-primary)]"
                                        />
                                        <span className="text-sm">Es Kit/Bundle</span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.is_featured}
                                            onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                                            className="w-5 h-5 rounded border-[var(--color-border)] text-[var(--color-primary)]"
                                        />
                                        <span className="text-sm">Destacado</span>
                                    </label>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="flex-1 h-12 border border-[var(--color-border)] rounded-xl font-medium hover:bg-[var(--color-bg)] transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="flex-1 h-12 bg-[var(--color-primary)] text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50"
                                    >
                                        {isSaving ? (
                                            <Loader2 size={18} className="animate-spin" />
                                        ) : (
                                            <Save size={18} />
                                        )}
                                        Guardar Producto
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Products List */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={40} className="animate-spin text-[var(--color-primary)]" />
                    </div>
                ) : (
                    <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-[var(--color-bg)]">
                                <tr>
                                    <th className="text-left p-4 text-sm font-medium text-[var(--color-text-muted)]">Producto</th>
                                    <th className="text-left p-4 text-sm font-medium text-[var(--color-text-muted)]">SKU</th>
                                    <th className="text-left p-4 text-sm font-medium text-[var(--color-text-muted)]">Precio</th>
                                    <th className="text-left p-4 text-sm font-medium text-[var(--color-text-muted)]">Stock</th>
                                    <th className="text-left p-4 text-sm font-medium text-[var(--color-text-muted)]">Tipo</th>
                                    <th className="text-right p-4 text-sm font-medium text-[var(--color-text-muted)]">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--color-border)]">
                                {products.map(product => (
                                    <tr key={product.id} className="hover:bg-[var(--color-bg)] transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-lg bg-[var(--color-bg)] overflow-hidden flex items-center justify-center border border-[var(--color-border)]">
                                                    {product.main_image ? (
                                                        <img src={product.main_image} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package size={20} className="text-[var(--color-text-light)]" />
                                                    )}
                                                </div>
                                                <span className="font-medium text-[var(--color-text)]">{product.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-[var(--color-text-muted)]">{product.sku}</td>
                                        <td className="p-4 font-medium text-[var(--color-primary)]">
                                            ${product.price_list.toLocaleString('es-AR')}
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${product.stock > 0
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                                }`}>
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {product.is_bundle && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--color-accent)] text-[var(--color-primary)] rounded-full text-xs font-medium">
                                                    <Package size={12} />
                                                    Kit
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleDeleteProduct(product.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
