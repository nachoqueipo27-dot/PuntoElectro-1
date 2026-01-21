import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Layouts
import MainLayout from './layouts/MainLayout'
import DashboardLayout from './pages/dashboard/DashboardLayout'

// Pages
import HomePage from './pages/HomePage'
import ProjectsPage from './pages/dashboard/ProjectsPage'

// Global Components
import CartDrawer from './components/cart/CartDrawer'
import SaveProjectModal from './components/cart/SaveProjectModal'

export default function App() {
    return (
        <BrowserRouter>
            {/* Global Overlays */}
            <CartDrawer />
            <SaveProjectModal />

            <Routes>
                {/* Main Storefront */}
                <Route element={<MainLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/tienda" element={<HomePage />} />
                    <Route path="/kits" element={<HomePage />} />
                    <Route path="/ofertas" element={<HomePage />} />
                    <Route path="/categoria/:slug" element={<HomePage />} />
                    <Route path="/producto/:slug" element={<HomePage />} />
                </Route>

                {/* B2B Dashboard */}
                <Route path="/dashboard" element={<DashboardLayout />}>
                    <Route index element={<Navigate to="/dashboard/projects" replace />} />
                    <Route path="projects" element={<ProjectsPage />} />
                    <Route path="projects/:id" element={<ProjectsPage />} />
                    <Route path="account" element={<div className="p-8 bg-white rounded-2xl">Mi Cuenta (próximamente)</div>} />
                    <Route path="settings" element={<div className="p-8 bg-white rounded-2xl">Configuración (próximamente)</div>} />
                </Route>

                {/* 404 Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    )
}
