import { Outlet, NavLink } from 'react-router-dom'
import { FolderOpen, User, Settings, LogOut, ArrowLeft } from 'lucide-react'

export default function DashboardLayout() {
    const navItems = [
        { to: '/dashboard/projects', icon: FolderOpen, label: 'Proyectos' },
        { to: '/dashboard/account', icon: User, label: 'Mi Cuenta' },
        { to: '/dashboard/settings', icon: Settings, label: 'Configuración' },
    ]

    return (
        <div className="min-h-screen bg-[var(--color-bg)]">
            {/* Header */}
            <header className="bg-white border-b border-[var(--color-border)] sticky top-0 z-40">
                <div className="container-modern py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <a
                                href="/"
                                className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
                            >
                                <ArrowLeft size={18} />
                                <span className="hidden sm:inline">Volver a la tienda</span>
                            </a>
                            <span className="text-[var(--color-border)]">|</span>
                            <h1 className="font-heading text-lg font-bold text-[var(--color-primary)]">
                                Mi Dashboard
                            </h1>
                        </div>

                        <button className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-red-500 transition-colors">
                            <LogOut size={18} />
                            <span className="hidden sm:inline">Cerrar sesión</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="container-modern py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="lg:w-64 flex-shrink-0">
                        <nav className="bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden">
                            {navItems.map(item => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-5 py-4 border-b border-[var(--color-border)] last:border-b-0 transition-colors ${isActive
                                            ? 'bg-[var(--color-primary)] text-white'
                                            : 'hover:bg-[var(--color-surface-hover)]'
                                        }`
                                    }
                                >
                                    <item.icon size={20} />
                                    {item.label}
                                </NavLink>
                            ))}
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    )
}
