import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Stores
import { useAuthStore } from './stores/authStore'

// Layouts
import MainLayout from './layouts/MainLayout'
import DashboardLayout from './pages/dashboard/DashboardLayout'

// Pages - Public
import HomePage from './pages/HomePage'
import CatalogPage from './pages/catalog/CatalogPage'
import ProductDetailPage from './pages/product/ProductDetailPage'

// Pages - Auth
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// Pages - Dashboard (B2B)
import ProjectsPage from './pages/dashboard/ProjectsPage'

// Pages - Admin
import AdminDashboard from './pages/admin/AdminDashboard'

// Global Components
import CartDrawer from './components/cart/CartDrawer'
import SaveProjectModal from './components/cart/SaveProjectModal'

// Protected Route Wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, isLoading, isInitialized } = useAuthStore()

    if (!isInitialized || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/auth/login" replace />
    }

    return <>{children}</>
}

export default function App() {
    const { initialize } = useAuthStore()

    // Initialize auth on app load
    useEffect(() => {
        initialize()
    }, [initialize])

    return (
        <BrowserRouter>
            {/* Global Overlays */}
            <CartDrawer />
            <SaveProjectModal />

            <Routes>
                {/* ========================
                    AUTH ROUTES 
                    ======================== */}
                <Route path="/auth/login" element={<LoginPage />} />
                <Route path="/auth/register" element={<RegisterPage />} />

                {/* ========================
                    PUBLIC STOREFRONT
                    ======================== */}
                <Route element={<MainLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/tienda" element={<CatalogPage />} />
                    <Route path="/kits" element={<CatalogPage />} />
                    <Route path="/ofertas" element={<CatalogPage />} />
                    <Route path="/categoria/:slug" element={<CatalogPage />} />
                    <Route path="/producto/:slug" element={<ProductDetailPage />} />
                </Route>

                {/* ========================
                    B2B DASHBOARD (Protected)
                    ======================== */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Navigate to="/dashboard/projects" replace />} />
                    <Route path="projects" element={<ProjectsPage />} />
                    <Route path="projects/:id" element={<ProjectsPage />} />
                    <Route path="account" element={<div className="p-8 bg-white rounded-2xl">Mi Cuenta (próximamente)</div>} />
                    <Route path="settings" element={<div className="p-8 bg-white rounded-2xl">Configuración (próximamente)</div>} />
                </Route>

                {/* ========================
                    ADMIN PANEL (Protected + Admin Role)
                    ======================== */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* 404 Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    )
}
