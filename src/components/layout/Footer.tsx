export default function Footer() {
    return (
        <footer className="bg-[var(--color-primary-dark)] text-white py-12">
            <div className="container-modern">
                <div className="grid md:grid-cols-4 gap-8 mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-2xl">⚡</span>
                            <span className="font-heading text-xl font-bold">
                                Punto<span className="text-[var(--color-accent)]">Electro</span>
                            </span>
                        </div>
                        <p className="text-sm text-white/70 leading-relaxed">
                            Tu distribuidor de materiales eléctricos de confianza.
                            Calidad y precios para profesionales.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4">Categorías</h4>
                        <ul className="space-y-2 text-sm text-white/70">
                            <li><a href="/categoria/iluminacion" className="hover:text-white transition-colors">Iluminación</a></li>
                            <li><a href="/categoria/electricidad" className="hover:text-white transition-colors">Electricidad</a></li>
                            <li><a href="/categoria/herramientas" className="hover:text-white transition-colors">Herramientas</a></li>
                            <li><a href="/categoria/camaras-seguridad" className="hover:text-white transition-colors">Seguridad</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4">Atención</h4>
                        <ul className="space-y-2 text-sm text-white/70">
                            <li>Lun-Vie: 9:00 - 18:00</li>
                            <li>Sábados: 9:00 - 13:00</li>
                            <li>(011) 1234-5678</li>
                            <li>ventas@puntoelectro.com</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4">Para Profesionales</h4>
                        <p className="text-sm text-white/70 mb-4">
                            Registrate como electricista matriculado y accedé a precios especiales.
                        </p>
                        <a href="/b2b" className="btn btn--accent text-sm">
                            Solicitar Acceso B2B
                        </a>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 text-center text-sm text-white/50">
                    © 2026 Punto Electro. Todos los derechos reservados.
                </div>
            </div>
        </footer>
    )
}
