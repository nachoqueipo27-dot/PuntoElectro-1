import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables. Check your .env file.')
}

export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
)

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface Brand {
    id: string
    name: string
    slug: string
    logo_url: string | null
    is_active: boolean
}

export interface Category {
    id: string
    parent_id: string | null
    name: string
    slug: string
    description: string | null
    image_url: string | null
    display_order: number
    is_active: boolean
    children?: Category[]
}

export interface Product {
    id: string
    sku: string
    name: string
    slug: string
    description: string | null
    category_id: string | null
    price_list: number
    price_wholesale: number | null
    stock: number
    min_stock?: number
    main_image: string | null
    images: string[]
    specs: Record<string, any>
    is_active: boolean
    is_featured: boolean
    is_bundle: boolean
    is_service?: boolean
    meta_title?: string | null
    meta_description?: string | null
    created_at: string
    updated_at: string
    // Expanded relations
    brand?: Brand
    category?: Category
}

export interface BundleItem {
    id: string
    bundle_id: string
    product_id: string
    quantity: number
    product?: Product
}

export interface ProjectList {
    id: string
    user_id: string
    name: string
    description: string | null
    is_active_cart: boolean
    created_at: string
    updated_at: string
    items?: ProjectListItem[]
}

export interface ProjectListItem {
    id: string
    list_id: string
    product_id: string
    quantity: number
    notes: string | null
    created_at: string
    product?: Product
}

// ============================================
// API HELPERS
// ============================================

export async function getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
        .from('ele_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order')

    if (error) throw error

    // Build tree structure
    const map = new Map<string, Category>()
    const roots: Category[] = []

    data?.forEach(cat => {
        map.set(cat.id, { ...cat, children: [] })
    })

    map.forEach(cat => {
        if (cat.parent_id && map.has(cat.parent_id)) {
            map.get(cat.parent_id)!.children!.push(cat)
        } else {
            roots.push(cat)
        }
    })

    return roots
}

export async function getProducts(options?: {
    categorySlug?: string
    featured?: boolean
    limit?: number
}): Promise<Product[]> {
    let query = supabase
        .from('ele_products')
        .select(`
      *,
      brand:ele_brands(*),
      category:ele_categories(*)
    `)
        .eq('is_active', true)

    if (options?.featured) {
        query = query.eq('is_featured', true)
    }

    if (options?.limit) {
        query = query.limit(options.limit)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return data || []
}

export async function getBrands(): Promise<Brand[]> {
    const { data, error } = await supabase
        .from('ele_brands')
        .select('*')
        .eq('is_active', true)
        .order('name')

    if (error) throw error
    return data || []
}
