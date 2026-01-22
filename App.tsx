
import React, { useState, useEffect, useCallback, memo, useMemo, useRef } from 'react';
import { X, Minus, Plus, ShoppingCart, Star, ArrowRight, Zap, Check, Filter, ShieldCheck, Truck, CreditCard, BatteryCharging, Package, MapPin, Headset, ChevronLeft, ExternalLink, Loader2, Banknote, Landmark, Phone, User as UserIcon, MessageCircle, Store, Home, History, Clock, Timer, Sparkles, Mail, AlertCircle, QrCode, Wallet, DollarSign, Bitcoin, Smartphone, Menu, LogOut, Sun, Moon, Lock, ChevronDown, CheckCircle, ChevronUp, Search, Info, ChevronRight, XCircle } from 'lucide-react';
import { Product, CartItem, Category, SiteConfig, Brand, User, Order, Service } from './types';
import { MockDb } from './services/mockDb';
import { AuthService } from './services/authService';
import { Header, Footer, Sidebar, CartDrawer, LegalModal } from './components/Layout';
import { AdminPanel } from './components/AdminPanel';
import { ContactPage } from './pages/ContactPage';

// Helper for UI Icons - Updated with Smartphone/Devices
const IconRenderer = ({ name, size = 24 }: { name: string, size?: number }) => {
    const icons: any = { Zap, Truck, ShieldCheck, Headset, CreditCard, Package, MapPin, BatteryCharging, Banknote, Landmark, QrCode, Wallet, DollarSign, Bitcoin, Smartphone };
    const Icon = icons[name] || Zap;
    return <Icon size={size} />;
};

// --- ANIMATION COMPONENTS ---
const SuccessAnimation: React.FC<{ message: string; subMessage?: string }> = ({ message, subMessage }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 dark:bg-slate-900/95 backdrop-blur-md animate-fadeIn">
            <div className="text-center transform animate-scaleIn">
                <div className="mb-6 relative">
                    <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                        <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
                        <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                    </svg>
                </div>
                <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2">{message}</h2>
                {subMessage && <p className="text-slate-500 dark:text-slate-400 font-medium">{subMessage}</p>}
            </div>
        </div>
    );
};

// --- PROMO TIMER BAR COMPONENT (MOBILE OPTIMIZED) ---
const PromoTimerBar: React.FC<{ timeLeft: number }> = ({ timeLeft }) => {
    if (timeLeft <= 0) return null;

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className="fixed top-0 left-0 right-0 h-[40px] z-50 bg-slate-900 text-white overflow-hidden shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-purple-900 to-blue-900 animate-shimmer opacity-80"></div>
            {/* Mobile Layout (Compact) */}
            <div className="container mx-auto px-4 h-full relative z-10 flex items-center justify-between md:justify-center gap-2 md:gap-4">

                <div className="flex items-center gap-1.5 text-yellow-400 font-bold uppercase tracking-wider text-[10px] md:text-sm animate-pulse whitespace-nowrap">
                    <Zap size={14} className="md:w-4 md:h-4" fill="currentColor" />
                    <span>Flash Promo</span>
                </div>

                {/* Timer Pill */}
                <div className="bg-black/40 px-3 py-0.5 rounded-full border border-white/10 flex items-center gap-2 backdrop-blur-sm">
                    <span className="text-xs text-slate-300 hidden md:inline">Termina en:</span>
                    <span className="font-mono font-bold text-sm md:text-base text-white tabular-nums tracking-wider">
                        {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                    </span>
                </div>

                {/* Discount Badge */}
                <div className="font-bold text-xs md:text-sm bg-green-500/20 px-2 py-0.5 rounded text-green-400 border border-green-500/30 whitespace-nowrap">
                    10% OFF
                </div>
            </div>
        </div>
    );
};

// --- POP-UP PROMO COMPONENT (OPTIMIZED LOGIC & ANIMATION) ---
const RegistrationPopup: React.FC<{
    onNavigate: (page: string) => void;
    userEmail: string | null;
}> = ({ onNavigate, userEmail }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        // Function to check logic
        const checkPopup = () => {
            if (userEmail) return; // Don't show if logged in

            const nextShowTimeStr = localStorage.getItem('popupNextShowTime');
            const now = Date.now();

            // Show if never shown OR if 5 minutes have passed since last close
            if (!nextShowTimeStr || now > parseInt(nextShowTimeStr, 10)) {
                setShouldRender(true);
                // Slight delay for smooth animation after mount
                setTimeout(() => setIsVisible(true), 2000);
            }
        };

        checkPopup();
    }, [userEmail]);

    const handleClose = () => {
        setIsVisible(false);
        // Wait for animation to finish before unmounting
        setTimeout(() => setShouldRender(false), 500);

        // Set next show time to 5 minutes from now
        const nextTime = Date.now() + (5 * 60 * 1000); // 5 minutes
        localStorage.setItem('popupNextShowTime', nextTime.toString());
    };

    const handleRegisterAction = () => {
        setIsVisible(false); // Close immediately
        setTimeout(() => setShouldRender(false), 300);
        localStorage.setItem('popupNextShowTime', Date.now().toString()); // Don't show again immediately
        onNavigate('register');
    };

    if (!shouldRender) return null;

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 h-[100dvh] transition-opacity duration-500 ease-out ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-slate-900/80 backdrop-blur-md transition-opacity"
                onClick={handleClose}
            ></div>

            {/* Popup Card - Fluid Animation */}
            <div className={`
                relative w-full max-w-sm md:max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl border-2 border-blue-500/30 
                transform transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) flex flex-col max-h-[90vh] m-auto bg-slate-900
                ${isVisible ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-8'}
            `}>

                {/* Background Details */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-900 to-slate-900"></div>
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                </div>

                {/* Content */}
                <div className="relative p-8 md:p-10 text-center overflow-y-auto custom-scrollbar flex flex-col items-center justify-center h-full w-full">

                    {/* Header Logo - Centered Fully */}
                    <div className="w-full flex justify-center items-center mb-6 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="p-3 md:p-4 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/40">
                                <Zap size={28} className="md:w-10 md:h-10" fill="currentColor" />
                            </div>
                            <div className="text-left">
                                <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-none text-white">PUNTO<span className="text-blue-500">.</span></h2>
                                <p className="text-xs md:text-sm font-bold tracking-widest uppercase text-slate-400">Electro</p>
                            </div>
                        </div>
                    </div>

                    {/* Centered Heading Section - Centered Fully */}
                    <div className="w-full flex flex-col items-center justify-center text-center mb-6">
                        <h2 className="w-full text-center text-4xl md:text-5xl font-black text-white mb-3 leading-none tracking-tight drop-shadow-lg">
                            ⚡ ¡Beneficio Exclusivo!
                        </h2>
                        <p className="w-full text-center text-slate-300 text-xl md:text-2xl leading-relaxed font-medium">
                            Crea tu cuenta gratis y activá el descuento flash.
                        </p>
                    </div>

                    {/* Benefits List */}
                    <div className="space-y-4 mb-8 text-left w-full max-w-sm mx-auto bg-white/5 p-6 rounded-3xl border border-white/10 shadow-inner">
                        <div className="flex items-center gap-4 text-slate-200">
                            <Star size={24} className="text-yellow-400 shrink-0" fill="currentColor" />
                            <span className="text-lg md:text-xl font-medium"><span className="text-yellow-400 font-bold">10% OFF</span> inmediato</span>
                        </div>
                        <div className="flex items-center gap-4 text-slate-200">
                            <Zap size={24} className="text-blue-400 shrink-0" />
                            <span className="text-lg md:text-xl font-medium">Acceso a precios mayoristas</span>
                        </div>
                        <div className="flex items-center gap-4 text-slate-200">
                            <Truck size={24} className="text-green-400 shrink-0" />
                            <span className="text-lg md:text-xl font-medium">Seguimiento de pedidos</span>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <button
                        onClick={handleRegisterAction}
                        className="w-full py-5 rounded-2xl font-black text-xl md:text-2xl bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-xl shadow-blue-600/30 mb-4 active:scale-95 border-t border-blue-400 hover:-translate-y-1 shrink-0"
                    >
                        Crear cuenta ahora
                    </button>

                    <button
                        onClick={handleClose}
                        className="text-sm md:text-base text-slate-400 hover:text-white transition underline decoration-slate-600 underline-offset-4 py-2 shrink-0"
                    >
                        No gracias, prefiero pagar precio full
                    </button>
                </div>

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-full transition z-50 backdrop-blur-md"
                >
                    <X size={24} />
                </button>
            </div>
        </div>
    );
};


// --- CHECKOUT PAGE COMPONENT ---
const CheckoutPage: React.FC<{
    cart: CartItem[];
    config: SiteConfig;
    onBack: () => void;
    onGoHome: () => void;
    onClearCart: () => void;
    userEmail: string | null;
    userName: string | null;
    promoTimeLeft: number;
    isDarkMode: boolean;
}> = ({ cart, config, onBack, onGoHome, onClearCart, userEmail, userName, promoTimeLeft, isDarkMode }) => {
    const [formValues, setFormValues] = useState<Record<string, string>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [deliveryMethod, setDeliveryMethod] = useState<'shipping' | 'pickup'>('shipping');
    const defaultMethod = config.checkout.paymentMethods.find(p => p.active)?.id || '';
    const [paymentMethod, setPaymentMethod] = useState<string>(defaultMethod);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        if (userEmail) {
            MockDb.findUserByEmail(userEmail).then(setCurrentUser);
        }
    }, [userEmail]);

    useEffect(() => {
        if (cart.length === 0) {
            onBack();
        }
    }, [cart, onBack]);

    const handleInputChange = (id: string, value: string) => {
        setFormValues(prev => ({ ...prev, [id]: value }));
        if (errors[id]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[id];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        let isValid = true;
        if (!userEmail) {
            if (!formValues['guest_name']?.trim()) {
                newErrors['guest_name'] = 'Requerido';
                isValid = false;
            }
            const emailVal = formValues['guest_email']?.trim();
            if (!emailVal) {
                newErrors['guest_email'] = 'Requerido';
                isValid = false;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
                newErrors['guest_email'] = 'Email inválido';
                isValid = false;
            }
            const phoneVal = formValues['guest_phone']?.trim();
            if (!phoneVal) {
                newErrors['guest_phone'] = 'Requerido';
                isValid = false;
            } else if (!/^[\d\s\-\+\(\)]{8,}$/.test(phoneVal)) {
                newErrors['guest_phone'] = 'Teléfono inválido';
                isValid = false;
            }
        }
        config.checkout.fields.forEach(field => {
            if (deliveryMethod === 'pickup' && field.id === 'address') return;
            const value = formValues[field.id]?.trim() || '';
            if (field.required && !value) {
                newErrors[field.id] = 'Requerido';
                isValid = false;
            }
        });
        setErrors(newErrors);
        return isValid;
    };

    const subtotal = cart.reduce((acc, item) => {
        const finalPrice = (item.discount && item.discount > 0) ? item.price * (1 - item.discount / 100) : item.price;
        return acc + (finalPrice * item.quantity);
    }, 0);

    const selectedPaymentMethod = config.checkout.paymentMethods.find(p => p.id === paymentMethod);
    const paymentDiscountPercent = selectedPaymentMethod?.discountPercent || 0;
    const promoActive = promoTimeLeft > 0 && !!userEmail;
    const promoDiscountPercent = promoActive ? 10 : 0;
    const shippingCost = 0;
    const paymentDiscountAmount = subtotal * (paymentDiscountPercent / 100);
    const promoDiscountAmount = promoActive ? (subtotal * (promoDiscountPercent / 100)) : 0;
    const finalTotal = subtotal - paymentDiscountAmount - promoDiscountAmount + (deliveryMethod === 'shipping' ? shippingCost : 0);

    const handleConfirmOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        const finalName = userEmail ? (userName || 'Usuario') : formValues['guest_name'];
        const finalEmail = userEmail || formValues['guest_email'];
        const finalPhone = userEmail ? (currentUser?.phone || '') : formValues['guest_phone'];

        // Forced WhatsApp Number as requested
        const whatsappNumber = '5491141412148';

        let msg = `Hola Punto Electro! 👋 Quiero realizar el siguiente pedido:\n\n`;
        msg += `👤 *Cliente:* ${finalName}\n`;
        msg += `📱 *Tel:* ${finalPhone}\n`;
        msg += `📧 *Email:* ${finalEmail}\n\n`;

        msg += `📦 *PRODUCTOS SELECCIONADOS:*\n`;
        cart.forEach(item => {
            const price = item.discount ? item.price * (1 - item.discount / 100) : item.price;
            msg += `• *${item.quantity}x* ${item.name}\n   $${price.toLocaleString()} c/u (Total: $${(price * item.quantity).toLocaleString()})\n`;
        });

        msg += `\n💰 *DETALLES DEL PAGO Y ENVÍO:*\n`;
        msg += `Subtotal: $${subtotal.toLocaleString()}\n`;

        // Método de Pago (Siempre visible)
        const paymentLabel = selectedPaymentMethod?.label || paymentMethod;
        msg += `💳 *Método de Pago:* ${paymentLabel}\n`;

        if (paymentDiscountPercent > 0) {
            msg += `   └ Descuento Pago: -${paymentDiscountPercent}%\n`;
        }

        if (promoActive) {
            msg += `⚡ Promo Flash: -10%\n`;
        }

        // Método de Entrega (Siempre visible)
        if (deliveryMethod === 'shipping') {
            msg += `🚚 *Método de Entrega:* Envío a Domicilio\n`;
            msg += `📍 *Dirección:* ${formValues['address'] || 'A coordinar'}\n`;
        } else {
            msg += `🏪 *Método de Entrega:* Retiro en Local\n`;
        }

        msg += `\n✅ *TOTAL FINAL: $${finalTotal.toLocaleString()}*\n\n`;

        if (formValues['notes']) {
            msg += `📝 *Notas:* ${formValues['notes']}\n`;
        }

        msg += `Aguardo confirmación para coordinar el pago. ¡Gracias!`;

        const order: Order = {
            id: `PED-${Date.now()}`,
            customerEmail: finalEmail,
            customerName: finalName,
            customerPhone: finalPhone,
            items: cart,
            total: finalTotal,
            status: 'pending' as const,
            date: new Date().toLocaleDateString(),
            deliveryMethod: deliveryMethod,
            deliveryAddress: deliveryMethod === 'shipping' ? formValues['address'] : undefined,
            paymentMethod: selectedPaymentMethod?.label || paymentMethod,
            notes: formValues['notes']
        };
        await MockDb.addOrder(order);
        onClearCart();
        window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
        alert(config.checkout.successMessage || '¡Pedido enviado a WhatsApp!');
        onBack();
    };

    return (
        <div className={`min-h-screen animate-fadeIn ${isDarkMode ? 'bg-slate-950 text-slate-300' : 'bg-slate-50 text-slate-700'}`} style={{ fontFamily: 'Inter, sans-serif' }}>
            {/* Header Simplified */}
            <div className={`border-b sticky top-0 z-30 transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className={`flex items-center gap-2 font-bold text-xl cursor-pointer ${isDarkMode ? 'text-white' : 'text-slate-800'}`} onClick={onGoHome}>
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white"><Zap size={18} fill="currentColor" /></div>
                        PUNTO<span className="text-indigo-600">.</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm font-medium">
                        <button onClick={onBack} className={`flex items-center gap-1 transition ${isDarkMode ? 'text-slate-400 hover:text-indigo-400' : 'text-slate-500 hover:text-indigo-600'}`}><ChevronLeft size={16} /> Volver</button>
                        <div className={`h-4 w-px hidden sm:block ${isDarkMode ? 'bg-slate-700' : 'bg-slate-300'}`}></div>
                        <div className={`hidden sm:flex items-center gap-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}><Lock size={14} /> Checkout Seguro</div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 lg:py-12 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                    {/* LEFT COLUMN: FORMS */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Finalizar Compra</h1>
                            {userEmail && <span className={`px-3 py-1 rounded-full text-xs font-bold border ${isDarkMode ? 'bg-indigo-900/30 text-indigo-300 border-indigo-800' : 'bg-indigo-50 text-indigo-700 border-indigo-100'}`}>Hola, {userName}</span>}
                        </div>

                        {/* STEP 1: CONTACT */}
                        <div className={`rounded-2xl shadow-sm border overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                            <div className={`px-6 py-4 border-b flex items-center gap-3 ${isDarkMode ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>1</div>
                                <h2 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Datos de Contacto</h2>
                            </div>
                            <div className="p-6">
                                {!userEmail ? (
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wide mb-2 opacity-60">Nombre Completo</label>
                                            <input type="text" className={`w-full p-3 rounded-lg border outline-none transition focus:ring-2 ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:ring-indigo-900 focus:border-indigo-500 placeholder:text-slate-600' : 'bg-white border-slate-300 focus:ring-indigo-100 focus:border-indigo-500'} ${errors['guest_name'] ? 'border-red-500/50 bg-red-500/10' : ''}`} placeholder="Ej: Juan Pérez" value={formValues['guest_name'] || ''} onChange={(e) => handleInputChange('guest_name', e.target.value)} />
                                            {errors['guest_name'] && <p className="text-red-500 text-xs mt-1">{errors['guest_name']}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wide mb-2 opacity-60">Email</label>
                                            <input type="email" className={`w-full p-3 rounded-lg border outline-none transition focus:ring-2 ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:ring-indigo-900 focus:border-indigo-500 placeholder:text-slate-600' : 'bg-white border-slate-300 focus:ring-indigo-100 focus:border-indigo-500'} ${errors['guest_email'] ? 'border-red-500/50 bg-red-500/10' : ''}`} placeholder="juan@email.com" value={formValues['guest_email'] || ''} onChange={(e) => handleInputChange('guest_email', e.target.value)} />
                                            {errors['guest_email'] && <p className="text-red-500 text-xs mt-1">{errors['guest_email']}</p>}
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold uppercase tracking-wide mb-2 opacity-60">Teléfono / WhatsApp</label>
                                            <input type="tel" className={`w-full p-3 rounded-lg border outline-none transition focus:ring-2 ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:ring-indigo-900 focus:border-indigo-500 placeholder:text-slate-600' : 'bg-white border-slate-300 focus:ring-indigo-100 focus:border-indigo-500'} ${errors['guest_phone'] ? 'border-red-500/50 bg-red-500/10' : ''}`} placeholder="Ej: 11 1234 5678" value={formValues['guest_phone'] || ''} onChange={(e) => handleInputChange('guest_phone', e.target.value)} />
                                            {errors['guest_phone'] && <p className="text-red-500 text-xs mt-1">{errors['guest_phone']}</p>}
                                        </div>
                                    </div>
                                ) : (
                                    <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                        Tus datos ya están cargados en tu cuenta: <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>{userEmail}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* STEP 2: DELIVERY */}
                        <div className={`rounded-2xl shadow-sm border overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                            <div className={`px-6 py-4 border-b flex items-center gap-3 ${isDarkMode ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>2</div>
                                <h2 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Método de Entrega</h2>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setDeliveryMethod('shipping')}
                                        className={`relative p-4 rounded-xl border-2 text-left transition-all ${deliveryMethod === 'shipping' ? (isDarkMode ? 'border-indigo-500 bg-indigo-900/20' : 'border-indigo-500 bg-indigo-50/50') : (isDarkMode ? 'border-slate-800 hover:border-slate-700' : 'border-slate-100 hover:border-slate-200')}`}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className={`p-2 rounded-lg ${deliveryMethod === 'shipping' ? (isDarkMode ? 'bg-indigo-900/50 text-indigo-400' : 'bg-indigo-100 text-indigo-600') : (isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500')}`}>
                                                <Truck size={24} />
                                            </div>
                                            <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Envío a Domicilio</span>
                                        </div>
                                        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Recibí tu pedido en la dirección que indiques.</p>
                                        {deliveryMethod === 'shipping' && <div className="absolute top-3 right-3 text-indigo-500"><CheckCircle size={20} fill="currentColor" className={isDarkMode ? 'text-indigo-900' : 'text-white'} /></div>}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setDeliveryMethod('pickup')}
                                        className={`relative p-4 rounded-xl border-2 text-left transition-all ${deliveryMethod === 'pickup' ? (isDarkMode ? 'border-indigo-500 bg-indigo-900/20' : 'border-indigo-500 bg-indigo-50/50') : (isDarkMode ? 'border-slate-800 hover:border-slate-700' : 'border-slate-100 hover:border-slate-200')}`}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className={`p-2 rounded-lg ${deliveryMethod === 'pickup' ? (isDarkMode ? 'bg-indigo-900/50 text-indigo-400' : 'bg-indigo-100 text-indigo-600') : (isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500')}`}>
                                                <Store size={24} />
                                            </div>
                                            <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Retiro en Local</span>
                                        </div>
                                        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Pasa a buscar tu pedido por nuestra sucursal.</p>
                                        {deliveryMethod === 'pickup' && <div className="absolute top-3 right-3 text-indigo-500"><CheckCircle size={20} fill="currentColor" className={isDarkMode ? 'text-indigo-900' : 'text-white'} /></div>}
                                    </button>
                                </div>

                                {/* Dynamic Fields based on Delivery */}
                                <div className="space-y-4 animate-fadeIn">
                                    {deliveryMethod === 'shipping' && (
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wide mb-2 opacity-60">Dirección de Envío</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-3.5 opacity-40" size={18} />
                                                <input type="text" className={`w-full pl-10 p-3 rounded-lg border outline-none transition focus:ring-2 ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:ring-indigo-900 focus:border-indigo-500 placeholder:text-slate-600' : 'bg-white border-slate-300 focus:ring-indigo-100 focus:border-indigo-500'} ${errors['address'] ? 'border-red-500/50 bg-red-500/10' : ''}`} placeholder="Calle, Número, Localidad, CP..." value={formValues['address'] || ''} onChange={(e) => handleInputChange('address', e.target.value)} />
                                            </div>
                                            {errors['address'] && <p className="text-red-500 text-xs mt-1">{errors['address']}</p>}
                                        </div>
                                    )}

                                    {config.checkout.fields.filter(f => f.id !== 'address').map(field => (
                                        <div key={field.id}>
                                            <label className="block text-xs font-bold uppercase tracking-wide mb-2 opacity-60">{field.label} {field.required ? '*' : '(Opcional)'}</label>
                                            {field.type === 'textarea' ? (
                                                <textarea className={`w-full p-3 rounded-lg border outline-none transition focus:ring-2 min-h-[100px] resize-none ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:ring-indigo-900 focus:border-indigo-500 placeholder:text-slate-600' : 'bg-white border-slate-300 focus:ring-indigo-100 focus:border-indigo-500'}`} placeholder={field.placeholder} value={formValues[field.id] || ''} onChange={(e) => handleInputChange(field.id, e.target.value)} />
                                            ) : (
                                                <input type={field.type} className={`w-full p-3 rounded-lg border outline-none transition focus:ring-2 ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white focus:ring-indigo-900 focus:border-indigo-500 placeholder:text-slate-600' : 'bg-white border-slate-300 focus:ring-indigo-100 focus:border-indigo-500'}`} placeholder={field.placeholder} value={formValues[field.id] || ''} onChange={(e) => handleInputChange(field.id, e.target.value)} />
                                            )}
                                            {errors[field.id] && <p className="text-red-500 text-xs mt-1">{errors[field.id]}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* STEP 3: PAYMENT */}
                        <div className={`rounded-2xl shadow-sm border overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                            <div className={`px-6 py-4 border-b flex items-center gap-3 ${isDarkMode ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>3</div>
                                <h2 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Método de Pago</h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {config.checkout.paymentMethods.filter(m => m.active).map(method => (
                                        <button
                                            key={method.id}
                                            type="button"
                                            onClick={() => setPaymentMethod(method.id)}
                                            className={`relative p-4 rounded-xl border-2 text-left transition-all ${paymentMethod === method.id ? (isDarkMode ? 'border-indigo-500 bg-indigo-900/20' : 'border-indigo-500 bg-indigo-50/50') : (isDarkMode ? 'border-slate-800 hover:border-slate-700' : 'border-slate-100 hover:border-slate-200')}`}
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div className={`p-2 rounded-lg ${paymentMethod === method.id ? (isDarkMode ? 'bg-indigo-900/50 text-indigo-400' : 'bg-indigo-100 text-indigo-600') : (isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500')}`}>
                                                    <IconRenderer name={method.icon} size={24} />
                                                </div>
                                                {method.discountPercent > 0 && (
                                                    <span className="text-[10px] font-bold bg-green-500/20 text-green-500 px-2 py-0.5 rounded border border-green-500/20">-{method.discountPercent}% OFF</span>
                                                )}
                                            </div>
                                            <div className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{method.label}</div>
                                            <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{method.subLabel}</div>
                                            {paymentMethod === method.id && <div className="absolute top-3 right-3 text-indigo-500"><CheckCircle size={20} fill="currentColor" className={isDarkMode ? 'text-indigo-900' : 'text-white'} /></div>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: SUMMARY */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className={`rounded-2xl shadow-lg border sticky top-24 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                            <div className={`p-5 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                                <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Resumen del Pedido</h3>
                            </div>
                            <div className="p-5 space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar">
                                {cart.map(item => (
                                    <div key={item.id} className="flex gap-3">
                                        <div className="w-12 h-12 bg-white rounded border p-1 shrink-0"><img src={item.image} className="w-full h-full object-contain" alt="" /></div>
                                        <div className="flex-1 min-w-0">
                                            <div className={`text-sm font-medium truncate ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{item.name}</div>
                                            <div className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>{item.quantity} x ${item.price.toLocaleString()}</div>
                                        </div>
                                        <div className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>${(item.price * item.quantity).toLocaleString()}</div>
                                    </div>
                                ))}
                            </div>
                            <div className={`p-5 border-t space-y-3 ${isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50'}`}>
                                <div className="flex justify-between text-sm">
                                    <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Subtotal</span>
                                    <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>${subtotal.toLocaleString()}</span>
                                </div>
                                {paymentDiscountPercent > 0 && (
                                    <div className="flex justify-between text-sm text-green-500">
                                        <span>Descuento {selectedPaymentMethod?.label} ({paymentDiscountPercent}%)</span>
                                        <span className="font-bold">-${paymentDiscountAmount.toLocaleString()}</span>
                                    </div>
                                )}
                                {promoActive && (
                                    <div className="flex justify-between text-sm text-yellow-500">
                                        <span className="flex items-center gap-1"><Zap size={12} fill="currentColor" /> Flash Promo (10%)</span>
                                        <span className="font-bold">-${promoDiscountAmount.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm">
                                    <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Envío</span>
                                    <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{deliveryMethod === 'shipping' ? (shippingCost > 0 ? `$${shippingCost}` : 'Consultar') : 'Gratis'}</span>
                                </div>
                                <div className={`border-t my-2 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}></div>
                                <div className="flex justify-between items-end">
                                    <span className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Total</span>
                                    <div className="text-right">
                                        <span className={`block text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>${finalTotal.toLocaleString()}</span>
                                        {deliveryMethod === 'shipping' && <span className="text-[10px] text-slate-500">+ Envío a coordinar</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="p-5 pt-0">
                                <button
                                    onClick={handleConfirmOrder}
                                    className="w-full py-4 rounded-xl font-bold text-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    Confirmar Pedido <ArrowRight size={20} />
                                </button>
                                <p className={`text-center text-xs mt-3 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                    Al confirmar, serás redirigido a WhatsApp para finalizar.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- PRODUCT DETAIL MODAL ---
const ProductDetailModal: React.FC<{
    product: Product;
    isOpen: boolean;
    onClose: () => void;
    onAddToCart: (product: Product) => void;
    isDarkMode: boolean;
}> = ({ product, isOpen, onClose, onAddToCart, isDarkMode }) => {
    if (!isOpen) return null;

    const hasDiscount = (product.discount || 0) > 0;
    const finalPrice = hasDiscount ? product.price * (1 - product.discount! / 100) : product.price;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>
            <div className={`relative w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-scaleIn ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>

                {/* Close Button Mobile */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/10 hover:bg-black/20 text-slate-500 transition md:hidden"
                >
                    <X size={24} />
                </button>

                {/* Image Section */}
                <div className={`w-full md:w-1/2 p-8 flex items-center justify-center relative ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                    <img
                        src={product.image}
                        alt={product.name}
                        className="max-w-full max-h-[300px] md:max-h-[400px] object-contain drop-shadow-xl"
                    />
                    {hasDiscount && (
                        <div className="absolute top-6 left-6 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                            -{product.discount}% OFF
                        </div>
                    )}
                </div>

                {/* Info Section */}
                <div className="w-full md:w-1/2 p-8 overflow-y-auto custom-scrollbar flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex gap-2 mb-2">
                            <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase tracking-wide ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                                {product.category}
                            </span>
                            {product.brand && (
                                <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase tracking-wide ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                    {product.brand}
                                </span>
                            )}
                        </div>
                        <button onClick={onClose} className="hidden md:block p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"><X size={24} /></button>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">{product.name}</h2>

                    <div className="mb-6">
                        {hasDiscount ? (
                            <div className="flex items-end gap-3">
                                <span className="text-3xl font-black text-slate-900 dark:text-white">${finalPrice.toLocaleString()}</span>
                                <span className="text-lg text-slate-400 line-through mb-1">${product.price.toLocaleString()}</span>
                            </div>
                        ) : (
                            <span className="text-3xl font-black">${product.price.toLocaleString()}</span>
                        )}
                        <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Precio final IVA incluido</p>
                    </div>

                    <div className={`prose prose-sm mb-8 ${isDarkMode ? 'prose-invert text-slate-300' : 'text-slate-600'}`}>
                        <p>{product.description || "Sin descripción detallada."}</p>
                    </div>

                    <div className="mt-auto space-y-4">
                        <div className={`flex items-center gap-2 text-sm font-medium ${product.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {product.stock > 0 ? <CheckCircle size={16} /> : <XCircle size={16} />}
                            {product.stock > 0 ? `Stock disponible (${product.stock} u.)` : 'Sin Stock'}
                        </div>

                        <button
                            onClick={() => { onAddToCart(product); onClose(); }}
                            disabled={product.stock <= 0}
                            className="w-full py-4 rounded-xl font-bold text-lg bg-blue-600 text-white hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <ShoppingCart size={20} /> Agregar al Carrito
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- FILTER SIDEBAR (SHOP) ---
const ShopFilters: React.FC<{
    categories: Category[];
    brands: Brand[];
    selectedCategory: string | null;
    selectedBrand: string | null;
    onSelectCategory: (c: string | null) => void;
    onSelectBrand: (b: string | null) => void;
    isDarkMode: boolean;
    isOpenMobile: boolean;
    onCloseMobile: () => void;
}> = ({ categories, brands, selectedCategory, selectedBrand, onSelectCategory, onSelectBrand, isDarkMode, isOpenMobile, onCloseMobile }) => {

    // Accordion States
    const [showCats, setShowCats] = useState(true);
    const [showBrands, setShowBrands] = useState(true);

    const content = (
        <div className="space-y-6">
            {/* Header Mobile */}
            <div className="flex md:hidden justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Filtrar Productos</h3>
                <button onClick={onCloseMobile}><X size={24} /></button>
            </div>

            {/* Categories */}
            <div>
                <button onClick={() => setShowCats(!showCats)} className="w-full flex justify-between items-center font-bold mb-3">
                    Categorías <ChevronDown size={16} className={`transition-transform ${showCats ? 'rotate-180' : ''}`} />
                </button>
                {showCats && (
                    <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar">
                        <button
                            onClick={() => onSelectCategory(null)}
                            className={`w-full text-left px-2 py-1.5 rounded text-sm transition ${!selectedCategory ? 'text-blue-500 font-bold' : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                            Todas
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => onSelectCategory(cat.name)}
                                className={`w-full text-left px-2 py-1.5 rounded text-sm transition ${selectedCategory === cat.name ? 'text-blue-500 font-bold' : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className={`h-px w-full ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>

            {/* Brands */}
            <div>
                <button onClick={() => setShowBrands(!showBrands)} className="w-full flex justify-between items-center font-bold mb-3">
                    Marcas <ChevronDown size={16} className={`transition-transform ${showBrands ? 'rotate-180' : ''}`} />
                </button>
                {showBrands && (
                    <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar">
                        <button
                            onClick={() => onSelectBrand(null)}
                            className={`w-full text-left px-2 py-1.5 rounded text-sm transition ${!selectedBrand ? 'text-blue-500 font-bold' : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
                        >
                            Todas
                        </button>
                        {Array.from(new Set(brands.map(b => b.name))).sort().map(brandName => (
                            <button
                                key={brandName}
                                onClick={() => onSelectBrand(brandName)}
                                className={`w-full text-left px-2 py-1.5 rounded text-sm transition ${selectedBrand === brandName ? 'text-blue-500 font-bold' : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
                            >
                                {brandName}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <div className={`hidden md:block w-64 shrink-0 p-4 rounded-2xl border h-fit sticky top-24 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                {content}
            </div>

            {/* Mobile Drawer */}
            {isOpenMobile && (
                <div className="fixed inset-0 z-50 flex md:hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCloseMobile}></div>
                    <div className={`relative w-4/5 max-w-xs h-full p-6 shadow-2xl animate-slideRight ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
                        {content}
                    </div>
                </div>
            )}
        </>
    );
};

export default function App() {
    const [config, setConfig] = useState<SiteConfig | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [services, setServices] = useState<Service[]>([]);

    // UI State
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activePage, setActivePage] = useState('home');
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [registerName, setRegisterName] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPhone, setRegisterPhone] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isLegalModalOpen, setIsLegalModalOpen] = useState<'terms' | 'privacy' | null>(null);

    // Filters & Shop State
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
    const [shopSearchTerm, setShopSearchTerm] = useState(''); // Internal shop search
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    // Category Carousel Scroll
    const categoryScrollRef = useRef<HTMLDivElement>(null);

    // Theme
    const [isDarkMode, setIsDarkMode] = useState(true);

    // Promo Timer
    const [promoTimeLeft, setPromoTimeLeft] = useState(0);

    // Initial Load
    useEffect(() => {
        const loadData = async () => {
            const [c, p, cat, b, s] = await Promise.all([
                MockDb.getConfig(),
                MockDb.getProducts(),
                MockDb.getCategories(),
                MockDb.getBrands(),
                MockDb.getServices()
            ]);
            setConfig(c);
            setProducts(p);
            setCategories(cat);
            setBrands(b);
            setServices(s);
        };
        loadData();

        // Check Auth
        const storedUser = localStorage.getItem('punto_electro_user');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            setUserEmail(parsed.email);
            setUserName(parsed.name);
        }

        // Global Promo Timer Check
        const promoEnd = localStorage.getItem('punto_flash_promo_end_global');
        if (promoEnd) {
            const now = Date.now();
            const end = parseInt(promoEnd, 10);
            if (end > now) {
                setPromoTimeLeft(Math.floor((end - now) / 1000));
            } else {
                localStorage.removeItem('punto_flash_promo_end_global');
            }
        }
    }, []);

    // Timer Interval
    useEffect(() => {
        if (promoTimeLeft <= 0) return;
        const interval = setInterval(() => {
            setPromoTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    localStorage.removeItem('punto_flash_promo_end_global');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [promoTimeLeft]);

    // Scroll Categories
    const scrollCategories = (direction: 'left' | 'right') => {
        if (categoryScrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = categoryScrollRef.current;
            const scrollAmount = 300; // Pixels to scroll

            if (direction === 'left') {
                if (scrollLeft === 0) {
                    // If at start, jump to end
                    categoryScrollRef.current.scrollTo({ left: scrollWidth, behavior: 'smooth' });
                } else {
                    categoryScrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
                }
            } else {
                if (scrollLeft + clientWidth >= scrollWidth - 10) { // Tolerance
                    // If at end, jump to start
                    categoryScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                }
            }
        }
    };

    // Global Search Handler (From Header)
    const handleGlobalSearch = (term: string) => {
        setShopSearchTerm(term);
        setActivePage('shop');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Scroll to Top on Page Change
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [activePage, selectedCategory, selectedBrand]);

    // Admin Data Refresh
    const handleAdminDataUpdate = async () => {
        const [c, p, cat, b, s] = await Promise.all([
            MockDb.getConfig(),
            MockDb.getProducts(),
            MockDb.getCategories(),
            MockDb.getBrands(),
            MockDb.getServices()
        ]);
        setConfig(c);
        setProducts(p);
        setCategories(cat);
        setBrands(b);
        setServices(s);
    };

    // Auth Handlers
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await AuthService.login(loginEmail, loginPassword);
        if (res.success && res.user) {
            setUserEmail(res.user.email);
            setUserName(res.user.name);
            localStorage.setItem('punto_electro_user', JSON.stringify(res.user));
            if (res.user.role === 'admin') setActivePage('admin');
            else setActivePage('home');
        } else {
            alert(res.message);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await AuthService.register(registerName, registerEmail, registerPhone, registerPassword);
        if (res.success) {
            // Auto Login & Start Promo
            setUserEmail(registerEmail);
            setUserName(registerName);
            localStorage.setItem('punto_electro_user', JSON.stringify({ email: registerEmail, name: registerName, role: 'user' }));

            // Start Promo Timer Global (20 min)
            const endTime = Date.now() + (20 * 60 * 1000);
            localStorage.setItem('punto_flash_promo_end_global', endTime.toString());
            setPromoTimeLeft(20 * 60);

            setSuccessMsg('¡Cuenta creada! Se activó tu descuento Flash.');
            setTimeout(() => {
                setSuccessMsg('');
                setActivePage('home');
            }, 2000);
        } else {
            alert(res.message);
        }
    };

    const handleLogout = () => {
        setUserEmail(null);
        setUserName(null);
        localStorage.removeItem('punto_electro_user');
        setActivePage('home');
    };

    // Cart Logic
    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(p => p.id === product.id);
            if (existing) return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
            return [...prev, { ...product, quantity: 1 }];
        });
        setIsCartOpen(true);
    };
    const updateQty = (id: string, delta: number) => {
        setCart(prev => prev.map(p => {
            if (p.id === id) return { ...p, quantity: Math.max(1, p.quantity + delta) };
            return p;
        }));
    };
    const removeFromCart = (id: string) => setCart(prev => prev.filter(p => p.id !== id));

    // Filter Logic for Shop Page
    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
            const matchesBrand = selectedBrand ? p.brand === selectedBrand : true;
            const matchesSearch = shopSearchTerm ?
                (p.name.toLowerCase().includes(shopSearchTerm.toLowerCase()) ||
                    p.category.toLowerCase().includes(shopSearchTerm.toLowerCase()) ||
                    p.brand?.toLowerCase().includes(shopSearchTerm.toLowerCase())) : true;

            return matchesCategory && matchesBrand && matchesSearch;
        });
    }, [products, selectedCategory, selectedBrand, shopSearchTerm]);

    // Derived States
    const adminEmails = ['nacho@admin.com', 'nachoqueipo27@gmail.com'];
    const isAdmin = userEmail ? adminEmails.includes(userEmail) : false;
    const hasActivePromo = promoTimeLeft > 0 && !!userEmail;

    // Render Loading
    if (!config) return <div className="h-screen flex items-center justify-center bg-slate-900 text-white"><Loader2 className="animate-spin mr-2" /> Cargando Punto Electro...</div>;

    // Render Admin
    if (activePage === 'admin' && isAdmin) {
        return <AdminPanel onLogout={handleLogout} onGoHome={() => setActivePage('home')} onDataUpdate={handleAdminDataUpdate} />;
    }

    // Render Checkout
    if (activePage === 'checkout') {
        return <CheckoutPage
            cart={cart}
            config={config}
            onBack={() => setActivePage('shop')}
            onGoHome={() => setActivePage('home')}
            onClearCart={() => setCart([])}
            userEmail={userEmail}
            userName={userName}
            promoTimeLeft={promoTimeLeft}
            isDarkMode={isDarkMode}
        />;
    }

    // Render Contact Page
    if (activePage === 'contact') {
        return <ContactPage
            config={config}
            isDarkMode={isDarkMode}
            onNavigate={setActivePage}
        />;
    }

    // --- MAIN RENDER ---
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">

            {/* Promo Bar (Conditionally Visible) */}
            {hasActivePromo && <PromoTimerBar timeLeft={promoTimeLeft} />}

            {/* Layout Components */}
            <Header
                cartCount={cart.reduce((a, b) => a + b.quantity, 0)}
                onCartClick={() => setIsCartOpen(true)}
                onMenuClick={(page) => {
                    setActivePage(page);
                    if (page === 'shop') { // Reset filters on menu click
                        setSelectedCategory(null);
                        setSelectedBrand(null);
                        setShopSearchTerm('');
                    }
                }}
                onMobileMenuClick={() => setIsMenuOpen(true)}
                userEmail={userEmail}
                userName={userName}
                onLogout={handleLogout}
                config={config}
                activePage={activePage}
                products={products}
                onProductClick={(p) => setSelectedProduct(p)}
                categories={categories}
                onCategorySelect={setSelectedCategory}
                onBrandSelect={setSelectedBrand}
                brands={brands}
                isDarkMode={isDarkMode}
                onToggleTheme={() => setIsDarkMode(!isDarkMode)}
                hasActivePromo={hasActivePromo}
                onSearchSubmit={handleGlobalSearch}
            />

            <Sidebar
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                onNav={setActivePage}
                activePage={activePage}
                isMobile={true}
                categories={categories}
                onCategorySelect={setSelectedCategory}
                onBrandSelect={setSelectedBrand}
                brands={brands}
                userEmail={userEmail}
                userName={userName}
                onLogout={handleLogout}
            />

            <CartDrawer
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                items={cart}
                onUpdateQty={updateQty}
                onRemoveItem={removeFromCart}
                onGoToCheckout={() => { setIsCartOpen(false); setActivePage('checkout'); }}
                onContinueShopping={() => { setIsCartOpen(false); setActivePage('shop'); }}
                config={config}
            />

            {/* Modals */}
            <ProductDetailModal
                product={selectedProduct!}
                isOpen={!!selectedProduct}
                onClose={() => setSelectedProduct(null)}
                onAddToCart={addToCart}
                isDarkMode={isDarkMode}
            />

            <LegalModal type={isLegalModalOpen} onClose={() => setIsLegalModalOpen(null)} />
            <RegistrationPopup onNavigate={(p) => setActivePage(p)} userEmail={userEmail} />
            {successMsg && <SuccessAnimation message={successMsg} />}

            {/* Page Content Spacing for Header/Promo */}
            <div style={{ paddingTop: hasActivePromo ? '105px' : '65px' }}>

                {/* --- HOME PAGE --- */}
                {activePage === 'home' && (
                    <div className="animate-fadeIn">

                        {/* HERO SECTION - Enterprise Modern */}
                        <div className="relative overflow-hidden bg-slate-900">
                            {/* Solid Background with subtle gradient */}
                            <div className="relative h-[500px] md:h-[600px] w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                                {config.banners.map((banner, index) => (
                                    <div key={banner.id} className="absolute inset-0 w-full h-full">
                                        {/* Decorative image on right side */}
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-[80%] hidden lg:block">
                                            <img src={banner.image} className="w-full h-full object-cover rounded-l-3xl shadow-2xl opacity-80" alt="" />
                                            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-transparent to-transparent"></div>
                                        </div>

                                        <div className="absolute inset-0 z-20 container mx-auto px-4 flex flex-col justify-center h-full">
                                            <div className="max-w-2xl animate-slideRight">
                                                <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white border border-white/20 text-xs font-semibold uppercase tracking-widest mb-6 backdrop-blur-sm">
                                                    {config.hero.badgeText}
                                                </span>
                                                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] mb-6">
                                                    {banner.title}
                                                </h1>
                                                <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-lg leading-relaxed font-medium">
                                                    {banner.subtitle}
                                                </p>
                                                <div className="flex flex-col sm:flex-row gap-4">
                                                    <button
                                                        onClick={() => {
                                                            if (banner.ctaLink.startsWith('#/shop?cat=')) {
                                                                const cat = banner.ctaLink.split('=')[1];
                                                                setSelectedCategory(cat);
                                                                setActivePage('shop');
                                                            } else {
                                                                setActivePage('shop');
                                                            }
                                                        }}
                                                        className="px-8 py-4 bg-white hover:bg-slate-100 text-slate-900 rounded-xl font-bold transition-all shadow-xl flex items-center justify-center gap-2 group hover:scale-105 active:scale-95"
                                                    >
                                                        {banner.ctaText} <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                                                    </button>
                                                    <button
                                                        onClick={() => setActivePage('contact')}
                                                        className="px-8 py-4 bg-transparent hover:bg-white/10 text-white border-2 border-white/30 hover:border-white/50 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                                                    >
                                                        Contactar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))[0]}
                                {/* TODO: Add actual carousel logic if multiple banners */}
                            </div>
                        </div>

                        {/* CATEGORIES CAROUSEL - Enterprise Style */}
                        <section className="py-16 bg-white">
                            <div className="container mx-auto px-4">
                                <div className="text-center mb-10">
                                    <h2 className="text-3xl font-bold text-slate-900">{config.categoriesSection.title}</h2>
                                    <p className="mt-2 text-slate-500">{config.categoriesSection.subtitle}</p>
                                </div>

                                <div className="relative group/carousel max-w-6xl mx-auto">
                                    {/* Left Button - Absolute Positioned */}
                                    <button
                                        onClick={() => scrollCategories('left')}
                                        className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 z-20 p-3 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-sm transition-all hover:scale-110 hover:border-blue-500 active:scale-95"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>

                                    {/* Carousel Container */}
                                    <div
                                        ref={categoryScrollRef}
                                        className="flex gap-6 overflow-x-auto hide-scrollbar px-4 py-4 scroll-smooth snap-x snap-mandatory"
                                    >
                                        {categories.map((cat) => (
                                            <div
                                                key={cat.id}
                                                onClick={() => { setSelectedCategory(cat.name); setActivePage('shop'); }}
                                                className={`flex-none w-40 md:w-48 snap-center cursor-pointer group transition-all duration-300 hover:-translate-y-2`}
                                            >
                                                <div className={`relative aspect-square rounded-2xl overflow-hidden mb-4 shadow-lg border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                                                    <img src={cat.image} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" alt={cat.name} />
                                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
                                                </div>
                                                <h3 className={`text-center font-bold text-lg ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{cat.name}</h3>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Right Button - Absolute Positioned */}
                                    <button
                                        onClick={() => scrollCategories('right')}
                                        className={`absolute -right-4 md:-right-12 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full shadow-xl transition-all hover:scale-110 active:scale-95 ${isDarkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                                    >
                                        <ChevronRight size={24} />
                                    </button>

                                    {/* Gradient Masks */}
                                    <div className={`absolute top-0 left-0 w-8 h-full bg-gradient-to-r pointer-events-none ${isDarkMode ? 'from-slate-900 to-transparent' : 'from-slate-50 to-transparent'}`}></div>
                                    <div className={`absolute top-0 right-0 w-8 h-full bg-gradient-to-l pointer-events-none ${isDarkMode ? 'from-slate-900 to-transparent' : 'from-slate-50 to-transparent'}`}></div>
                                </div>
                            </div>
                        </section>

                        {/* PROMO BANNER (INDUSTRIAL) */}
                        <section className="py-20 relative overflow-hidden">
                            <div className="absolute inset-0">
                                <img src={config.promoBanner.image} className="w-full h-full object-cover" alt="" />
                                <div className="absolute inset-0 bg-blue-900/90 mix-blend-multiply"></div>
                            </div>
                            <div className="container mx-auto px-4 relative z-10">
                                <div className="max-w-3xl">
                                    <span className="inline-block px-4 py-1.5 rounded-full border border-white/30 text-white text-xs font-bold uppercase tracking-widest mb-6">
                                        {config.promoBanner.tagText}
                                    </span>
                                    <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">{config.promoBanner.title}</h2>
                                    <p className="text-xl text-blue-100 mb-8 leading-relaxed">{config.promoBanner.text}</p>
                                    <button onClick={() => setActivePage('contact')} className="px-8 py-4 bg-white text-blue-900 rounded-xl font-bold hover:bg-blue-50 transition shadow-xl">
                                        {config.promoBanner.ctaText}
                                    </button>
                                </div>
                            </div>
                        </section>

                    </div>
                )}

                {/* --- SHOP PAGE (FILTERS & PRODUCTS) --- */}
                {activePage === 'shop' && (
                    <div className="container mx-auto px-4 py-8 animate-fadeIn">

                        {/* Header Shop */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                            <div>
                                <h2 className="text-3xl font-bold">
                                    {selectedCategory || (shopSearchTerm ? `Resultados para "${shopSearchTerm}"` : "Todos los Productos")}
                                </h2>
                                <p className="text-slate-500 mt-1">
                                    {filteredProducts.length} productos encontrados
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsMobileFiltersOpen(true)}
                                    className={`md:hidden flex items-center gap-2 px-4 py-2 rounded-lg font-bold border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
                                >
                                    <Filter size={18} /> Filtros
                                </button>
                                {shopSearchTerm && (
                                    <button
                                        onClick={() => { setShopSearchTerm(''); setSelectedCategory(null); }}
                                        className="text-sm text-red-500 hover:underline px-2"
                                    >
                                        Limpiar búsqueda
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-8">
                            {/* Filter Sidebar Component */}
                            <ShopFilters
                                categories={categories}
                                brands={brands}
                                selectedCategory={selectedCategory}
                                selectedBrand={selectedBrand}
                                onSelectCategory={setSelectedCategory}
                                onSelectBrand={setSelectedBrand}
                                isDarkMode={isDarkMode}
                                isOpenMobile={isMobileFiltersOpen}
                                onCloseMobile={() => setIsMobileFiltersOpen(false)}
                            />

                            {/* Product Grid */}
                            <div className="flex-1">
                                {filteredProducts.length > 0 ? (
                                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                                        {filteredProducts.map(product => {
                                            const hasDiscount = (product.discount || 0) > 0;
                                            const finalPrice = hasDiscount ? product.price * (1 - product.discount! / 100) : product.price;

                                            return (
                                                <div
                                                    key={product.id}
                                                    className="group relative bg-white border border-slate-200 rounded-xl overflow-hidden transition-all duration-300 hover:border-blue-500 hover:-translate-y-1"
                                                >
                                                    {/* Discount Badge */}
                                                    {hasDiscount && (
                                                        <div className="absolute top-3 left-3 z-10 bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                                                            -{product.discount}%
                                                        </div>
                                                    )}

                                                    <div
                                                        className="aspect-square p-4 bg-slate-50 relative cursor-pointer overflow-hidden"
                                                        onClick={() => setSelectedProduct(product)}
                                                    >
                                                        <img src={product.image} className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" alt={product.name} />

                                                        {/* Quick Add Overlay */}
                                                        <div className="absolute inset-0 bg-slate-900/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                                                                className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform flex items-center gap-2 hover:bg-blue-600"
                                                            >
                                                                <ShoppingCart size={16} /> Agregar
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="p-4 bg-white">
                                                        <div className="text-xs text-slate-400 font-medium mb-1 uppercase tracking-wide">{product.brand}</div>
                                                        <h3
                                                            className="font-semibold text-sm text-slate-900 mb-3 line-clamp-2 min-h-[40px] cursor-pointer hover:text-blue-500 transition-colors"
                                                            onClick={() => setSelectedProduct(product)}
                                                        >
                                                            {product.name}
                                                        </h3>
                                                        <div className="flex items-end justify-between">
                                                            <div>
                                                                {hasDiscount && (
                                                                    <div className="text-xs text-slate-400 line-through">${product.price.toLocaleString()}</div>
                                                                )}
                                                                <div className={`font-bold text-lg ${hasDiscount ? 'text-blue-600' : 'text-slate-900'}`}>
                                                                    ${finalPrice.toLocaleString()}
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => addToCart(product)}
                                                                className="p-2.5 rounded-xl border border-slate-200 text-slate-500 transition-all hover:border-blue-500 hover:bg-blue-500 hover:text-white"
                                                            >
                                                                <Plus size={18} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-20 opacity-60">
                                        <Package size={64} className="mx-auto mb-4 text-slate-400" />
                                        <h3 className="text-xl font-bold mb-2">No encontramos productos</h3>
                                        <p>Intenta ajustar tus filtros o búsqueda.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- LOGIN --- */}
                {activePage === 'login' && (
                    <div className="container mx-auto px-4 py-20 max-w-md animate-fadeIn">
                        <div className={`p-8 rounded-3xl shadow-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-black mb-2">Bienvenido</h2>
                                <p className="text-slate-500">Ingresa a tu cuenta para continuar</p>
                            </div>
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wide opacity-50 mb-1">Email</label>
                                    <input type="email" required className={`w-full p-3 rounded-xl border outline-none focus:ring-2 ${isDarkMode ? 'bg-slate-900 border-slate-600 text-white focus:ring-blue-500' : 'bg-slate-50 border-slate-200 focus:ring-blue-500'}`} value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wide opacity-50 mb-1">Contraseña</label>
                                    <input type="password" required className={`w-full p-3 rounded-xl border outline-none focus:ring-2 ${isDarkMode ? 'bg-slate-900 border-slate-600 text-white focus:ring-blue-500' : 'bg-slate-50 border-slate-200 focus:ring-blue-500'}`} value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
                                </div>
                                <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-lg">Ingresar</button>
                            </form>
                            <div className="mt-6 text-center text-sm">
                                <span className="text-slate-500">¿No tienes cuenta? </span>
                                <button onClick={() => setActivePage('register')} className="font-bold text-blue-500 hover:underline">Regístrate aquí</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- REGISTER --- */}
                {activePage === 'register' && (
                    <div className="container mx-auto px-4 py-20 max-w-md animate-fadeIn">
                        <div className={`p-8 rounded-3xl shadow-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-black mb-2">Crear Cuenta</h2>
                                <div className="inline-flex items-center gap-1 bg-yellow-400/20 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold">
                                    <Zap size={12} fill="currentColor" /> Activa 10% OFF Flash
                                </div>
                            </div>
                            <form onSubmit={handleRegister} className="space-y-4">
                                <div><label className="block text-xs font-bold uppercase tracking-wide opacity-50 mb-1">Nombre</label><input type="text" required className={`w-full p-3 rounded-xl border outline-none focus:ring-2 ${isDarkMode ? 'bg-slate-900 border-slate-600 text-white' : 'bg-slate-50'}`} value={registerName} onChange={e => setRegisterName(e.target.value)} /></div>
                                <div><label className="block text-xs font-bold uppercase tracking-wide opacity-50 mb-1">Email</label><input type="email" required className={`w-full p-3 rounded-xl border outline-none focus:ring-2 ${isDarkMode ? 'bg-slate-900 border-slate-600 text-white' : 'bg-slate-50'}`} value={registerEmail} onChange={e => setRegisterEmail(e.target.value)} /></div>
                                <div><label className="block text-xs font-bold uppercase tracking-wide opacity-50 mb-1">Teléfono</label><input type="tel" required className={`w-full p-3 rounded-xl border outline-none focus:ring-2 ${isDarkMode ? 'bg-slate-900 border-slate-600 text-white' : 'bg-slate-50'}`} value={registerPhone} onChange={e => setRegisterPhone(e.target.value)} /></div>
                                <div><label className="block text-xs font-bold uppercase tracking-wide opacity-50 mb-1">Contraseña</label><input type="password" required className={`w-full p-3 rounded-xl border outline-none focus:ring-2 ${isDarkMode ? 'bg-slate-900 border-slate-600 text-white' : 'bg-slate-50'}`} value={registerPassword} onChange={e => setRegisterPassword(e.target.value)} /></div>
                                <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-lg">Registrarse</button>
                            </form>
                            <button onClick={() => setActivePage('login')} className="w-full mt-4 text-sm text-slate-500 hover:text-blue-500">¿Ya tienes cuenta? Ingresa aquí</button>
                        </div>
                    </div>
                )}

                {/* --- SERVICES --- */}
                {activePage === 'services' && (
                    <div className="container mx-auto px-4 py-12 animate-fadeIn">
                        <h2 className="text-3xl font-bold text-center mb-12">Nuestros Servicios</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            {services.map(s => (
                                <div key={s.id} className={`p-8 rounded-3xl border transition hover:-translate-y-2 hover:shadow-xl ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-600/30">
                                        <IconRenderer name={s.icon} size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold mb-4">{s.title}</h3>
                                    <p className={`leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{s.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- SUCURSALES (IMPROVED) --- */}
                {activePage === 'branches' && (
                    <div className="container mx-auto px-4 py-12 animate-fadeIn">
                        <h2 className="text-3xl font-bold text-center mb-12">Nuestras Sucursales</h2>
                        {/* Centered Flex Container */}
                        <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
                            {config.branches.map((branch) => {
                                // Auto Generate Map URL if missing
                                const mapSrc = branch.embedUrl
                                    ? branch.embedUrl
                                    : `https://www.google.com/maps?q=${encodeURIComponent(branch.address)}&output=embed`;

                                return (
                                    <div key={branch.id} className={`w-full md:w-[450px] rounded-2xl overflow-hidden shadow-lg border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                                        {/* Map Frame */}
                                        <div className="h-64 w-full bg-slate-200 dark:bg-slate-700 relative">
                                            <iframe
                                                src={mapSrc}
                                                width="100%"
                                                height="100%"
                                                style={{ border: 0 }}
                                                allowFullScreen
                                                loading="lazy"
                                                referrerPolicy="no-referrer-when-downgrade"
                                            ></iframe>
                                        </div>
                                        {/* Info */}
                                        <div className="p-8">
                                            <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{branch.name}</h3>

                                            {/* Address */}
                                            <p className={`flex items-start gap-2 mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                                <MapPin className="text-blue-500 shrink-0 mt-1" size={18} />
                                                {branch.address}
                                            </p>

                                            {/* Phone Display Added */}
                                            <p className={`flex items-start gap-2 mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                                <Phone className="text-blue-500 shrink-0 mt-1" size={18} />
                                                {branch.phone}
                                            </p>

                                            <div className="flex flex-col sm:flex-row gap-4">
                                                <a
                                                    href={branch.mapUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 border-2 transition ${isDarkMode ? 'border-blue-500 text-blue-400 hover:bg-blue-900/20' : 'border-blue-600 text-blue-600 hover:bg-blue-50'}`}
                                                >
                                                    <MapPin size={18} /> Ver en Mapa
                                                </a>
                                                <a
                                                    href={`tel:${branch.phone}`}
                                                    className="flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 transition shadow-lg shadow-blue-600/20"
                                                >
                                                    <Phone size={18} /> Llamar
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* --- CONTACT --- */}
                {activePage === 'contact' && (
                    <div className="container mx-auto px-4 py-12 animate-fadeIn">
                        <div className={`max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
                            <div className="bg-blue-600 p-10 text-white md:w-2/5 flex flex-col justify-between">
                                <div>
                                    <h2 className="text-3xl font-black mb-6">Contáctanos</h2>
                                    <p className="text-blue-100 mb-8">Estamos para asesorarte. Escríbenos y te responderemos a la brevedad.</p>
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center"><Phone size={20} /></div>
                                            <div><p className="text-xs text-blue-200 uppercase font-bold">Llámanos</p><p className="font-bold">{config.contact.phone}</p></div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center"><Mail size={20} /></div>
                                            <div><p className="text-xs text-blue-200 uppercase font-bold">Email</p><p className="font-bold break-all">{config.contact.email}</p></div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center"><MapPin size={20} /></div>
                                            <div><p className="text-xs text-blue-200 uppercase font-bold">Visítanos</p><p className="font-bold">{config.contact.address}</p></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-12">
                                    <a
                                        href={config.contact.actionButton.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full bg-white text-blue-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-50 transition"
                                    >
                                        <MessageCircle size={20} /> {config.contact.actionButton.text}
                                    </a>
                                </div>
                            </div>
                            <div className={`p-10 md:w-3/5 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                                <h3 className="text-2xl font-bold mb-6">Envíanos un mensaje</h3>
                                <form className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div><label className="block text-xs font-bold uppercase mb-2 opacity-60">Nombre</label><input type="text" className={`w-full p-3 rounded-xl border outline-none focus:ring-2 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white focus:ring-blue-500' : 'bg-slate-50 border-slate-200 focus:ring-blue-500'}`} /></div>
                                        <div><label className="block text-xs font-bold uppercase mb-2 opacity-60">Apellido</label><input type="text" className={`w-full p-3 rounded-xl border outline-none focus:ring-2 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white focus:ring-blue-500' : 'bg-slate-50 border-slate-200 focus:ring-blue-500'}`} /></div>
                                    </div>
                                    <div><label className="block text-xs font-bold uppercase mb-2 opacity-60">Email</label><input type="email" className={`w-full p-3 rounded-xl border outline-none focus:ring-2 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white focus:ring-blue-500' : 'bg-slate-50 border-slate-200 focus:ring-blue-500'}`} /></div>
                                    <div><label className="block text-xs font-bold uppercase mb-2 opacity-60">Mensaje</label><textarea className={`w-full p-3 rounded-xl border outline-none focus:ring-2 h-32 resize-none ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white focus:ring-blue-500' : 'bg-slate-50 border-slate-200 focus:ring-blue-500'}`}></textarea></div>
                                    <button className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition">Enviar Mensaje</button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Footer config={config} onNav={setActivePage} onOpenLegal={(t) => setIsLegalModalOpen(t)} />
        </div>
    );
}
