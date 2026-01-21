import type { Category } from '../../lib/supabase'
import { ArrowRight } from 'lucide-react'

interface BentoGridProps {
    categories: Category[]
}

export default function BentoGrid({ categories }: BentoGridProps) {
    // Get category icons
    const getIcon = (slug: string): string => {
        const icons: Record<string, string> = {
            'iluminacion': '💡',
            'electricidad': '⚡',
            'herramientas': '🔧',
            'camaras-seguridad': '📹',
        }
        return icons[slug] || '📦'
    }

    // Define bento layout - first 4 categories with different sizes
    const bentoLayout = [
        { slug: 'iluminacion', className: 'bento-card--large' },
        { slug: 'electricidad', className: '' },
        { slug: 'herramientas', className: '' },
        { slug: 'camaras-seguridad', className: 'bento-card--wide' },
    ]

    return (
        <section className="section">
            <div className="container-modern">
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <h2 className="section-title mb-2">Explora Nuestras Categorías</h2>
                        <p className="section-subtitle mb-0">
                            Todo lo que necesitas para tus proyectos eléctricos
                        </p>
                    </div>
                    <a href="/tienda" className="hidden sm:flex btn btn--secondary">
                        Ver todo
                        <ArrowRight size={16} />
                    </a>
                </div>

                <div className="bento-grid">
                    {/* Featured Kit Card */}
                    <div className="bento-card bento-card--featured bento-card--tall">
                        <span className="bento-card__badge">-15%</span>
                        <div className="bento-card__icon">
                            <span className="text-2xl">🎁</span>
                        </div>
                        <h3 className="bento-card__title text-white text-xl mb-2">
                            Kit Eléctrico Básico
                        </h3>
                        <p className="text-white/80 text-sm mb-4">
                            Todo lo que necesitas para una instalación residencial completa.
                        </p>
                        <div className="mt-auto">
                            <p className="text-white/60 text-sm line-through">$85.000</p>
                            <p className="text-white text-2xl font-bold mb-4">$72.500</p>
                            <button className="btn btn--accent w-full">
                                Ver Kit
                            </button>
                        </div>
                    </div>

                    {/* Category Cards */}
                    {categories.slice(0, 4).map((cat, index) => {
                        const layout = bentoLayout[index]
                        const subcategoryCount = cat.children?.length || 0

                        return (
                            <a
                                key={cat.id}
                                href={`/categoria/${cat.slug}`}
                                className={`bento-card ${layout?.className || ''}`}
                            >
                                <div className="bento-card__icon">
                                    <span className="text-2xl">{getIcon(cat.slug)}</span>
                                </div>
                                <h3 className="bento-card__title">{cat.name}</h3>
                                <p className="bento-card__subtitle">
                                    {subcategoryCount} subcategorías
                                </p>

                                {/* Show some subcategories for large cards */}
                                {layout?.className === 'bento-card--large' && cat.children && (
                                    <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                                        <div className="flex flex-wrap gap-2">
                                            {cat.children.slice(0, 4).map(sub => (
                                                <span
                                                    key={sub.id}
                                                    className="px-3 py-1 bg-[var(--color-bg)] text-[var(--color-text-muted)] text-xs rounded-full"
                                                >
                                                    {sub.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </a>
                        )
                    })}

                    {/* Promo Card */}
                    <div className="bento-card">
                        <span className="bento-card__badge">NUEVO</span>
                        <div className="bento-card__icon">
                            <span className="text-2xl">🏗️</span>
                        </div>
                        <h3 className="bento-card__title">Listas de Obra</h3>
                        <p className="bento-card__subtitle">
                            Guarda y organiza tus proyectos
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}
