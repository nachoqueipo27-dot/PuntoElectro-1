import { Outlet } from 'react-router-dom'
import ModernNavbar from '../components/layout/ModernNavbar'
import Footer from '../components/layout/Footer'
import type { Category } from '../lib/supabase'

// Temporary mock categories until we fetch from Supabase
const mockCategories: Category[] = [
    {
        id: '1',
        parent_id: null,
        name: 'Iluminación',
        slug: 'iluminacion',
        description: null,
        image_url: null,
        display_order: 1,
        is_active: true,
        children: [
            { id: '1-1', parent_id: '1', name: 'Lámparas LED', slug: 'lamparas-led', description: null, image_url: null, display_order: 1, is_active: true },
            { id: '1-2', parent_id: '1', name: 'Iluminación Interior', slug: 'iluminacion-interior', description: null, image_url: null, display_order: 2, is_active: true },
        ]
    },
    {
        id: '2',
        parent_id: null,
        name: 'Electricidad',
        slug: 'electricidad',
        description: null,
        image_url: null,
        display_order: 2,
        is_active: true,
        children: [
            { id: '2-1', parent_id: '2', name: 'Cables', slug: 'cables', description: null, image_url: null, display_order: 1, is_active: true },
        ]
    },
    {
        id: '3',
        parent_id: null,
        name: 'Herramientas',
        slug: 'herramientas',
        description: null,
        image_url: null,
        display_order: 3,
        is_active: true,
        children: []
    },
    {
        id: '4',
        parent_id: null,
        name: 'Seguridad',
        slug: 'camaras-seguridad',
        description: null,
        image_url: null,
        display_order: 4,
        is_active: true,
        children: []
    },
]

export default function MainLayout() {
    return (
        <div className="min-h-screen bg-[var(--color-bg)]">
            <ModernNavbar categories={mockCategories} />
            <main>
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}
