
import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react';
import { SiteConfig } from '../types';

interface ContactPageProps {
    config: SiteConfig;
    isDarkMode: boolean;
    onNavigate: (page: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ config, isDarkMode, onNavigate }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Build WhatsApp message
        const whatsappNumber = config.contact?.phone?.replace(/\D/g, '') || '5491141412148';
        let msg = `Hola Punto Electro! 👋\n\n`;
        msg += `📧 *Consulta desde el sitio web*\n\n`;
        msg += `👤 *Nombre:* ${formData.name}\n`;
        msg += `📧 *Email:* ${formData.email}\n`;
        msg += `📋 *Asunto:* ${formData.subject}\n\n`;
        msg += `💬 *Mensaje:*\n${formData.message}`;

        window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');

        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setFormData({ name: '', email: '', subject: '', message: '' });
        }, 3000);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
            {/* Hero Section */}
            <div className={`border-b ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="container mx-auto px-4 py-16 text-center">
                    <h1 className={`text-4xl md:text-5xl font-black mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        Contactanos
                    </h1>
                    <p className={`text-lg max-w-2xl mx-auto ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        Estamos para ayudarte. Envianos tu consulta y te responderemos a la brevedad.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-12 lg:py-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">

                    {/* LEFT COLUMN: Contact Information */}
                    <div className="space-y-8">
                        <div className={`rounded-xl p-8 border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
                            <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                Información de Contacto
                            </h2>

                            <div className="space-y-6">
                                {/* Phone */}
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-800 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <h3 className={`font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Teléfono</h3>
                                        <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>
                                            {config.contact?.phone || '+54 11 1234 5678'}
                                        </p>
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-800 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <h3 className={`font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Email</h3>
                                        <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>
                                            {config.contact?.email || 'ventas@puntoelectro.com.ar'}
                                        </p>
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-800 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <h3 className={`font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Dirección</h3>
                                        <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>
                                            {config.contact?.address || 'Av. Corrientes 1234, Buenos Aires'}
                                        </p>
                                    </div>
                                </div>

                                {/* Hours */}
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-800 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <h3 className={`font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Horarios</h3>
                                        <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>
                                            {config.contact?.hours || 'Lun a Vie 9:00 - 18:00 hs'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Map Placeholder */}
                        <div className={`rounded-xl overflow-hidden border ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} shadow-sm h-64`}>
                            <div className={`w-full h-full flex items-center justify-center ${isDarkMode ? 'bg-slate-900' : 'bg-slate-100'}`}>
                                <div className="text-center">
                                    <MapPin size={48} className={isDarkMode ? 'text-slate-700 mx-auto mb-2' : 'text-slate-300 mx-auto mb-2'} />
                                    <p className={isDarkMode ? 'text-slate-600' : 'text-slate-400'}>Mapa de ubicación</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Contact Form */}
                    <div className={`rounded-xl p-8 border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
                        <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            Envíanos un mensaje
                        </h2>

                        {submitted ? (
                            <div className="text-center py-12">
                                <div className="mb-4">
                                    <CheckCircle size={64} className="text-green-500 mx-auto" />
                                </div>
                                <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                    ¡Mensaje enviado!
                                </h3>
                                <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>
                                    Te responderemos a la brevedad.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Name */}
                                <div>
                                    <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                        Nombre *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 rounded-xl border outline-none transition focus:ring-2 ${isDarkMode
                                                ? 'bg-slate-950 border-slate-700 text-white focus:ring-blue-900 focus:border-blue-500 placeholder:text-slate-600'
                                                : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-100 focus:border-blue-500 placeholder:text-slate-400'
                                            }`}
                                        placeholder="Tu nombre completo"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 rounded-xl border outline-none transition focus:ring-2 ${isDarkMode
                                                ? 'bg-slate-950 border-slate-700 text-white focus:ring-blue-900 focus:border-blue-500 placeholder:text-slate-600'
                                                : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-100 focus:border-blue-500 placeholder:text-slate-400'
                                            }`}
                                        placeholder="tu@email.com"
                                    />
                                </div>

                                {/* Subject */}
                                <div>
                                    <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                        Asunto *
                                    </label>
                                    <input
                                        type="text"
                                        name="subject"
                                        required
                                        value={formData.subject}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 rounded-xl border outline-none transition focus:ring-2 ${isDarkMode
                                                ? 'bg-slate-950 border-slate-700 text-white focus:ring-blue-900 focus:border-blue-500 placeholder:text-slate-600'
                                                : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-100 focus:border-blue-500 placeholder:text-slate-400'
                                            }`}
                                        placeholder="¿En qué podemos ayudarte?"
                                    />
                                </div>

                                {/* Message */}
                                <div>
                                    <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                        Mensaje *
                                    </label>
                                    <textarea
                                        name="message"
                                        required
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows={6}
                                        className={`w-full px-4 py-3 rounded-xl border outline-none transition focus:ring-2 resize-none ${isDarkMode
                                                ? 'bg-slate-950 border-slate-700 text-white focus:ring-blue-900 focus:border-blue-500 placeholder:text-slate-600'
                                                : 'bg-slate-50 border-slate-200 text-slate-900 focus:ring-blue-100 focus:border-blue-500 placeholder:text-slate-400'
                                            }`}
                                        placeholder="Escribí tu consulta aquí..."
                                    />
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="w-full py-4 rounded-xl font-bold text-lg bg-blue-600 text-white hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    <Send size={20} />
                                    Enviar Mensaje
                                </button>

                                <p className={`text-xs text-center ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                    Al enviar, serás redirigido a WhatsApp para completar el contacto.
                                </p>
                            </form>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};
