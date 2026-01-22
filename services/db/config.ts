
import { SiteConfig } from '../../types';
import { loadOrSet, KEYS } from './utils';

const DEFAULT_CONFIG: SiteConfig = {
    theme: {
        background: '#f8fafc', 
        primary: '#2563eb',    
        secondary: '#0f172a',  
        text: '#1e293b'        
    },
    hero: {
        badgeText: 'POTENCIA TU PROYECTO'
    },
    categoriesSection: {
        title: 'Categorías',
        subtitle: 'Encuentra todo lo que necesitas para tu instalación'
    },
    features: [
        { icon: 'Truck', title: "Envío Rápido", subtitle: "En 24hs en AMBA" },
        { icon: 'ShieldCheck', title: "Garantía", subtitle: "Oficial de fábrica" },
        { icon: 'CreditCard', title: "Cuotas", subtitle: "Sin interés" },
        { icon: 'BatteryCharging', title: "Asesoría", subtitle: "Técnica experta" }
    ],
    sectionBackgrounds: {
        trustIndicators: '',
        categories: ''
    },
    bestSellers: {
        title: 'Más Vendidos',
        backgroundColor: '#ffffff',
        backgroundImage: '',
        textColor: '#1e293b',
        productIds: ['1', '2', '3', '5'],
        enableAnimations: true,
        marqueeSpeed: 40
    },
    promoBanner: {
        image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=2070&auto=format&fit=crop',
        title: 'Soluciones integrales para la industria.',
        text: 'Contamos con un departamento de ingeniería dedicado para grandes obras, tableros a medida y automatización industrial.',
        ctaText: 'Solicitar Cotización',
        tagText: 'Área Profesional'
    },
    checkout: {
        whatsappNumber: '5491141412148',
        viewCartTitle: 'Mi Carrito',
        checkoutTitle: 'Finalizar Compra',
        successMessage: '¡Pedido enviado a WhatsApp! Gracias por tu compra.',
        styles: {
            headerBg: '#ffffff',
            headerText: '#1e293b',
            checkoutBtnBg: '#0f172a',
            checkoutBtnText: '#ffffff',
            fontFamily: 'Inter'
        },
        fields: [
            { id: 'address', label: 'Dirección de Entrega', type: 'text', required: true, placeholder: 'Calle 123, Localidad...', width: 'full' },
            { id: 'notes', label: 'Notas Adicionales', type: 'textarea', required: false, placeholder: 'Dejanos un mensaje...', width: 'full' }
        ],
        paymentMethods: [
            { id: 'efectivo', label: 'Efectivo', subLabel: '10% OFF', icon: 'Banknote', active: true, discountPercent: 10 },
            { id: 'transferencia', label: 'Transferencia', subLabel: 'Precio Lista', icon: 'Landmark', active: true, discountPercent: 0 },
            { id: 'otro', label: 'Otro', subLabel: 'Consultar', icon: 'CreditCard', active: true, discountPercent: 0 }
        ]
    },
    footer: {
        description: 'Líderes en distribución de materiales eléctricos e iluminación para el hogar y la industria. Calidad garantizada en cada producto.',
        titleNavigation: 'Navegación',
        titleContact: 'Contacto',
        titleHours: 'Horarios',
        labelCustomerService: 'Atención al Cliente:',
        labelShipping: 'Envíos:',
        textShippingHours: 'Lun a Sáb 8:00 - 20:00 hs',
        copyrightText: '© 2024 Punto Electro. Todos los derechos reservados.'
    },
    banners: [
        {
            id: '1',
            image: 'https://images.unsplash.com/photo-1498084393753-b411b2d26b34?q=80&w=1920&auto=format&fit=crop',
            title: 'Punto Electro',
            subtitle: 'Materiales eléctricos y asesoramiento técnico.',
            ctaText: 'Ver Productos',
            ctaLink: '#/shop'
        },
        {
            id: '2',
            image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=1920&auto=format&fit=crop',
            title: 'Soluciones Profesionales',
            subtitle: 'Todo para la industria y el hogar con la mejor calidad.',
            ctaText: 'Ir al Catálogo',
            ctaLink: '#/shop?cat=Herramientas'
        }
    ],
    contact: {
        phone: '+54 11 1234 5678',
        email: 'ventas@puntoelectro.com.ar',
        address: 'Av. Corrientes 1234, Buenos Aires',
        hours: 'Lun a Vie 9:00 - 18:00 hs',
        instagram: 'https://instagram.com',
        facebook: 'https://facebook.com',
        actionButton: {
            text: 'Chatear por WhatsApp',
            url: 'https://wa.me/message/YEWBPPXFQ2XIO1'
        }
    },
    branches: [
        { 
            id: '1', 
            name: 'Casa Central', 
            address: 'Av. Corrientes 1234, CABA', 
            phone: '11-1234-5678', 
            mapUrl: 'https://maps.app.goo.gl/somelink',
            embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284.016887889453!2d-58.38375908477038!3d-34.60373888045932!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4aa9f0a6da5edb%3A0x11bead4e234e558b!2sObelisco!5e0!3m2!1ses!2sar!4v1709845345678!5m2!1ses!2sar'
        },
        { 
            id: '2', 
            name: 'Sucursal Norte', 
            address: 'Av. Libertador 5000, CABA', 
            phone: '11-4321-8765', 
            mapUrl: 'https://maps.app.goo.gl/somelink2',
            embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3286.186626182054!2d-58.42875908478426!3d-34.54883888047321!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcb59c77c3a07b%3A0x7b1c3e3a4e1d1b1!2sAv.%20del%20Libertador%205000%2C%20C1426BXR%20CABA!5e0!3m2!1ses!2sar!4v1709845345678!5m2!1ses!2sar'
        }
    ]
};

export const ConfigDAO = {
    getConfig: (): SiteConfig => loadOrSet(KEYS.CONFIG, DEFAULT_CONFIG),
    saveConfig: (config: SiteConfig) => localStorage.setItem(KEYS.CONFIG, JSON.stringify(config))
};
