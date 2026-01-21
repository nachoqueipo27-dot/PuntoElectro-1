import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Zap, Mail, Lock, User, ArrowRight, Loader2, CheckCircle } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'

export default function RegisterPage() {
    const navigate = useNavigate()
    const { signUp, isLoading } = useAuthStore()

    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden')
            return
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres')
            return
        }

        const { error } = await signUp(email, password, fullName)

        if (error) {
            setError(error.message)
        } else {
            setSuccess(true)
            // Auto-redirect after showing success
            setTimeout(() => {
                navigate('/dashboard')
            }, 2000)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-primary-dark)] to-[#1a2a4a] flex items-center justify-center p-4">
            {/* Glassmorphism Card */}
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 text-white">
                        <div className="w-12 h-12 bg-[var(--color-accent)] rounded-xl flex items-center justify-center">
                            <Zap size={28} className="text-[var(--color-primary)]" />
                        </div>
                        <span className="text-2xl font-bold font-heading">
                            Punto<span className="text-[var(--color-accent)]">Electro</span>
                        </span>
                    </Link>
                </div>

                {/* Card */}
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                    {success ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle size={40} className="text-green-400" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">¡Cuenta creada!</h2>
                            <p className="text-white/60">Redirigiendo al dashboard...</p>
                        </div>
                    ) : (
                        <>
                            <h1 className="text-2xl font-bold text-white text-center mb-2">
                                Crear Cuenta
                            </h1>
                            <p className="text-white/60 text-center mb-8">
                                Registrate para acceder a precios mayoristas
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Full Name */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-white/80">
                                        Nombre Completo
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="Juan Pérez"
                                            className="w-full h-12 pl-12 pr-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-white/80">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="tu@email.com"
                                            className="w-full h-12 pl-12 pr-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-white/80">
                                        Contraseña
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Mínimo 6 caracteres"
                                            className="w-full h-12 pl-12 pr-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-white/80">
                                        Confirmar Contraseña
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full h-12 pl-12 pr-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-sm text-center">
                                        {error}
                                    </div>
                                )}

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-12 bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-[var(--color-primary)] font-semibold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                                >
                                    {isLoading ? (
                                        <Loader2 size={20} className="animate-spin" />
                                    ) : (
                                        <>
                                            Crear Cuenta
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Divider */}
                            <div className="flex items-center gap-4 my-6">
                                <div className="flex-1 h-px bg-white/20" />
                                <span className="text-white/40 text-sm">o</span>
                                <div className="flex-1 h-px bg-white/20" />
                            </div>

                            {/* Login Link */}
                            <p className="text-center text-white/60">
                                ¿Ya tenés cuenta?{' '}
                                <Link to="/auth/login" className="text-[var(--color-accent)] hover:underline font-medium">
                                    Iniciá sesión
                                </Link>
                            </p>
                        </>
                    )}
                </div>

                {/* Back to Store */}
                <p className="text-center mt-6">
                    <Link to="/" className="text-white/60 hover:text-white text-sm flex items-center justify-center gap-2">
                        <ArrowRight size={14} className="rotate-180" />
                        Volver a la tienda
                    </Link>
                </p>
            </div>
        </div>
    )
}
