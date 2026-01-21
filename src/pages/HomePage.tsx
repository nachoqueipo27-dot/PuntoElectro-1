import { useState, useEffect, useCallback } from 'react'
import { ArrowRight, Zap, Truck, Shield, Headphones, ChevronLeft, ChevronRight } from 'lucide-react'
import BentoGrid from '../components/home/BentoGrid'
import { ProductGridModern } from '../components/product/ProductCardModern'
import { FeaturedBundles } from '../components/product/BundleCard'
import { useCartStore } from '../stores/cartStore'
import type { Category, Product } from '../lib/supabase'

// ============================================
// MOCK DATA
// ============================================
const mockCategories: Category[] = [
    {
        id: '1', parent_id: null, name: 'Iluminación', slug: 'iluminacion',
        description: null, image_url: null, display_order: 1, is_active: true,
        children: [
            { id: '1-1', parent_id: '1', name: 'Lámparas LED', slug: 'lamparas-led', description: null, image_url: null, display_order: 1, is_active: true },
            { id: '1-2', parent_id: '1', name: 'Iluminación Interior', slug: 'iluminacion-interior', description: null, image_url: null, display_order: 2, is_active: true },
            { id: '1-3', parent_id: '1', name: 'Iluminación Exterior', slug: 'iluminacion-exterior', description: null, image_url: null, display_order: 3, is_active: true },
            { id: '1-4', parent_id: '1', name: 'Tiras LED', slug: 'tiras-led', description: null, image_url: null, display_order: 4, is_active: true },
        ]
    },
    {
        id: '2', parent_id: null, name: 'Electricidad', slug: 'electricidad',
        description: null, image_url: null, display_order: 2, is_active: true,
        children: [
            { id: '2-1', parent_id: '2', name: 'Cables', slug: 'cables', description: null, image_url: null, display_order: 1, is_active: true },
            { id: '2-2', parent_id: '2', name: 'Tableros', slug: 'tableros', description: null, image_url: null, display_order: 2, is_active: true },
        ]
    },
    {
        id: '3', parent_id: null, name: 'Herramientas', slug: 'herramientas',
        description: null, image_url: null, display_order: 3, is_active: true,
        children: []
    },
    {
        id: '4', parent_id: null, name: 'Seguridad', slug: 'camaras-seguridad',
        description: null, image_url: null, display_order: 4, is_active: true,
        children: []
    },
]

const mockProducts: Product[] = [
    {
        id: '1', sku: 'MAC-PNL-12W-BF', name: 'Panel LED Embutir Cuadrado 12W',
        slug: 'panel-led-embutir-cuad-12w-bf', description: 'Panel LED de embutir cuadrado de 12W.',
        category_id: '1-2', price_list: 10625, price_wholesale: 9000, stock: 23,
        main_image: null, images: [], specs: {}, is_active: true, is_featured: true, is_bundle: false,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    },
    {
        id: '2', sku: 'LCT-TERM-C6N', name: 'Terminal Desnudo para Cable 6mm',
        slug: 'terminal-desnudo-c6n', description: 'Terminal desnudo modelo C6N.',
        category_id: '2-1', price_list: 450, price_wholesale: 380, stock: 150,
        main_image: null, images: [], specs: {}, is_active: true, is_featured: true, is_bundle: false,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    },
    {
        id: '3', sku: 'JAD-ALIC-BOMB', name: 'Alicate de Bomba Aislado 1000V',
        slug: 'alicate-bomba-aislado', description: 'Alicate de bomba aislado para electricistas.',
        category_id: '3-1', price_list: 18500, price_wholesale: 16000, stock: 8,
        main_image: null, images: [], specs: {}, is_active: true, is_featured: true, is_bundle: false,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    },
    {
        id: '4', sku: 'JEL-TAPA-10', name: 'Tapa Regina 10x10cm Blanca',
        slug: 'tapa-regina-10x10-blanca', description: null,
        category_id: '2-4', price_list: 1200, price_wholesale: 1000, stock: 45,
        main_image: null, images: [], specs: {}, is_active: true, is_featured: true, is_bundle: false,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    },
    {
        id: '5', sku: 'GEN-RESORTE-20', name: 'Resorte para Caños 20mm',
        slug: 'resorte-canos-20mm', description: 'Resorte para doblar caños de 20mm.',
        category_id: '2-1', price_list: 2800, price_wholesale: 2400, stock: 32,
        main_image: null, images: [], specs: {}, is_active: true, is_featured: false, is_bundle: false,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    },
    {
        id: '6', sku: 'MAC-SPOT-GU10', name: 'Spot Embutir Cuadrado GU10',
        slug: 'spot-embutir-cuadrado-gu10', description: null,
        category_id: '1-2', price_list: 4500, price_wholesale: 3800, stock: 67,
        main_image: null, images: [], specs: {}, is_active: true, is_featured: true, is_bundle: false,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    },
]

const mockBundles = [
    {
        id: 'kit-1',
        title: 'Kit Iluminación Oficina',
        products: [
            { id: 'p1', name: 'Panel LED 60x60', icon: '💡' },
            { id: 'p2', name: 'Driver LED', icon: '⚡' },
            { id: 'p3', name: 'Cables', icon: '🔌' },
            { id: 'p4', name: 'Accesorios', icon: '📦' },
        ],
        originalPrice: 45000,
        salePrice: 38250,
        description: 'Kit completo para iluminar una oficina de hasta 50m². Incluye 4 paneles LED, drivers y cableado.',
    },
    {
        id: 'kit-2',
        title: 'Kit Instalación Residencial',
        products: [
            { id: 'p5', name: 'Tablero 8 bocas', icon: '🔲' },
            { id: 'p6', name: 'Disyuntor', icon: '⚡' },
            { id: 'p7', name: 'Térmicas', icon: '🔒' },
            { id: 'p8', name: 'Cable 2.5mm', icon: '🔌' },
            { id: 'p9', name: 'Extras', icon: '📦' },
        ],
        originalPrice: 85000,
        salePrice: 72500,
        description: 'Todo lo necesario para la instalación eléctrica de una casa. Tablero, protecciones y cableado incluido.',
    },
]

// ============================================
// HERO SECTION - IMAGE CAROUSEL
// ============================================
const heroSlides = [
    {
        image: '/images/hero-productos.jpg',
        title: 'Materiales Eléctricos',
        subtitle: 'de Primera Calidad',
        description: 'Iluminación LED, cables, herramientas y todo lo que necesitas para tus instalaciones eléctricas.',
    },
    {
        image: '/images/hero-local.jpg',
        title: 'Tu proyecto,',
        subtitle: 'nuestra energía',
        description: 'Asesoramiento técnico, servicio electricista a domicilio e instalación de aires acondicionados.',
    },
]

function HeroSection() {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [isTransitioning, setIsTransitioning] = useState(false)

    const goToSlide = useCallback((index: number) => {
        if (isTransitioning) return
        setIsTransitioning(true)
        setCurrentSlide(index)
        setTimeout(() => setIsTransitioning(false), 500)
    }, [isTransitioning])

    const nextSlide = useCallback(() => {
        goToSlide((currentSlide + 1) % heroSlides.length)
    }, [currentSlide, goToSlide])

    const prevSlide = useCallback(() => {
        goToSlide((currentSlide - 1 + heroSlides.length) % heroSlides.length)
    }, [currentSlide, goToSlide])

    // Auto-rotate slides
    useEffect(() => {
        const timer = setInterval(nextSlide, 5000)
        return () => clearInterval(timer)
    }, [nextSlide])

    return (
        <section className="relative h-[60vh] md:h-[70vh] overflow-hidden">
            {/* Slides */}
            {heroSlides.map((slide, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-500 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        }`}
                >
                    {/* Background Image */}
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${slide.image})` }}
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-black/50" />

                    {/* Content */}
                    <div className="relative h-full container-modern flex items-center justify-center">
                        <div className="max-w-2xl text-center">
                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6 text-white">
                                <Zap size={16} className="text-[var(--color-accent)]" />
                                Punto Electro
                            </span>

                            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white">
                                {slide.title}
                                <br />
                                <span className="text-[var(--color-accent)]">{slide.subtitle}</span>
                            </h1>

                            <p className="text-lg md:text-xl text-white/80 mb-8 leading-relaxed">
                                {slide.description}
                            </p>

                            <div className="flex flex-wrap gap-4 justify-center">
                                <a href="/tienda" className="btn btn--lg btn--accent">
                                    Explorar Tienda
                                    <ArrowRight size={18} />
                                </a>
                                <a href="/kits" className="btn btn--lg bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20">
                                    Ver Kits
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Navigation Arrows */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors"
                aria-label="Anterior"
            >
                <ChevronLeft size={24} />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors"
                aria-label="Siguiente"
            >
                <ChevronRight size={24} />
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-3">
                {heroSlides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all ${index === currentSlide
                            ? 'bg-[var(--color-accent)] w-8'
                            : 'bg-white/50 hover:bg-white/80'
                            }`}
                        aria-label={`Ir a slide ${index + 1}`}
                    />
                ))}
            </div>
        </section>
    )
}

// ============================================
// FEATURES BAR
// ============================================
function FeaturesBar() {
    const features = [
        { icon: Truck, text: 'Envío gratis +$50.000' },
        { icon: Shield, text: 'Garantía oficial' },
        { icon: Zap, text: 'Precios mayoristas' },
        { icon: Headphones, text: 'Soporte técnico' },
    ]

    return (
        <section className="bg-white border-b border-[var(--color-border)]">
            <div className="container-modern py-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[var(--color-bg)] rounded-xl flex items-center justify-center flex-shrink-0">
                                <feature.icon size={20} className="text-[var(--color-primary)]" />
                            </div>
                            <span className="text-sm font-medium text-[var(--color-text)]">
                                {feature.text}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

// ============================================
// FEATURED PRODUCTS SECTION
// ============================================
function FeaturedProductsSection({ products }: { products: Product[] }) {
    const { addItem } = useCartStore()

    const handleAddToCart = (product: Product) => {
        addItem(product)
    }

    return (
        <section className="section">
            <div className="container-modern">
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <h2 className="section-title mb-2">Productos Destacados</h2>
                        <p className="section-subtitle mb-0">
                            Lo más vendido esta semana
                        </p>
                    </div>
                    <a href="/tienda" className="hidden sm:flex btn btn--secondary">
                        Ver todos
                        <ArrowRight size={16} />
                    </a>
                </div>

                <ProductGridModern products={products} onAddToCart={handleAddToCart} />
            </div>
        </section>
    )
}

// ============================================
// HOME PAGE
// ============================================
export default function HomePage() {
    return (
        <>
            <HeroSection />
            <FeaturesBar />
            <BentoGrid categories={mockCategories} />
            <FeaturedBundles bundles={mockBundles} />
            <FeaturedProductsSection products={mockProducts} />
        </>
    )
}
