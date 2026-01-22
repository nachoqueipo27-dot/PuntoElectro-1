
import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Mail, CheckCircle, AlertTriangle, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { AuthService } from '../services/authService';

// --- OTP INPUT COMPONENT ---
interface OTPInputProps {
    length?: number;
    onComplete: (otp: string) => void;
    disabled?: boolean;
}

export const OTPInput: React.FC<OTPInputProps> = ({ length = 6, onComplete, disabled }) => {
    const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (index: number, value: string) => {
        if (isNaN(Number(value))) return;
        
        const newOtp = [...otp];
        // Allow only last char if multiple typed
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        // Trigger complete
        const combinedOtp = newOtp.join('');
        if (combinedOtp.length === length) onComplete(combinedOtp);

        // Move to next
        if (value && index < length - 1 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const data = e.clipboardData.getData('text').slice(0, length).split('');
        if (data.length === length && data.every(char => !isNaN(Number(char)))) {
            setOtp(data);
            onComplete(data.join(''));
            inputRefs.current[length - 1]?.focus();
        }
    };

    return (
        <div className="flex gap-2 justify-center my-4">
            {otp.map((digit, index) => (
                <input
                    key={index}
                    ref={(ref) => { inputRefs.current[index] = ref; }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    disabled={disabled}
                    onChange={e => handleChange(index, e.target.value)}
                    onKeyDown={e => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-10 h-12 sm:w-12 sm:h-14 border-2 rounded-xl text-center text-xl font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition bg-slate-50 disabled:opacity-50 disabled:bg-slate-100 text-slate-800"
                />
            ))}
        </div>
    );
};

// --- EMAIL SENT CONFIRMATION SCREEN ---
interface PendingVerificationProps {
    email: string;
    onResend: () => Promise<boolean>;
    onVerifyOtp: (otp: string) => Promise<boolean>;
}

export const PendingVerification: React.FC<PendingVerificationProps> = ({ email, onResend, onVerifyOtp }) => {
    const [mode, setMode] = useState<'info' | 'otp'>('info');
    const [loading, setLoading] = useState(false);
    const [resendStatus, setResendStatus] = useState<string>('');

    const handleResend = async () => {
        setLoading(true);
        const success = await onResend();
        setLoading(false);
        if (success) {
            setResendStatus('Email reenviado correctamente');
            setTimeout(() => setResendStatus(''), 3000);
        }
    };

    const handleOtpSubmit = async (otp: string) => {
        setLoading(true);
        await onVerifyOtp(otp);
        setLoading(false);
    };

    return (
        <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail size={32} />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Revisa tu correo</h2>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                Enviamos un enlace de confirmación y un código a <span className="font-bold text-slate-800">{email}</span>.
            </p>

            {mode === 'info' ? (
                <div className="space-y-3">
                    <button 
                        onClick={() => setMode('otp')}
                        className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/20"
                    >
                        Ingresar Código Manualmente
                    </button>
                    <button 
                        onClick={handleResend}
                        disabled={loading}
                        className="w-full bg-white border border-slate-200 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-50 transition flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18}/> : <RefreshCw size={18}/>} 
                        Reenviar Correo
                    </button>
                    <p className="text-xs text-slate-400 mt-4">
                        ¿No lo recibiste? Revisa tu carpeta de Spam.
                    </p>
                </div>
            ) : (
                <div className="animate-fadeIn">
                    <p className="text-sm font-bold text-slate-700 mb-2">Ingresa el código de 6 dígitos</p>
                    <OTPInput onComplete={handleOtpSubmit} disabled={loading} />
                    
                    {loading && <div className="text-blue-600 font-bold text-sm my-2 flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={16}/> Verificando...</div>}
                    
                    <button 
                        onClick={() => setMode('info')}
                        className="text-sm text-slate-400 hover:text-slate-600 mt-4 underline"
                    >
                        Volver a opciones
                    </button>
                </div>
            )}

            {resendStatus && (
                <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm font-bold animate-fadeIn flex items-center justify-center gap-2">
                    <CheckCircle size={16}/> {resendStatus}
                </div>
            )}
        </div>
    );
};

// --- MAIN VERIFY PAGE (Handles URL Token) ---
export const VerifyEmailPage: React.FC<{ 
    onNavigate: (page: string) => void;
    onLoginSuccess: (user: any) => void;
}> = ({ onNavigate, onLoginSuccess }) => {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verificando tu cuenta...');
    
    // Parse Token from URL
    useEffect(() => {
        try {
            const hash = window.location.hash; 
            // Support both #/verify-email?token=... and verify-email?token=...
            // Split by ? to get query params regardless of hash prefix
            const pieces = hash.split('?');
            if (pieces.length > 1) {
                const queryPart = pieces[1];
                const params = new URLSearchParams(queryPart);
                const token = params.get('token');

                if (token) {
                    handleVerify(token);
                    return;
                }
            }
        } catch (e) {
            console.error("Token parse error", e);
        }
        
        setStatus('error');
        setMessage('Enlace de verificación inválido o incompleto.');
    }, []);

    const handleVerify = async (token: string) => {
        const response = await AuthService.verifyByToken(token);
        if (response.success && response.user) {
            setStatus('success');
            // Auto login or prompt to login
            setTimeout(() => {
                onNavigate('login');
            }, 3000);
        } else {
            setStatus('error');
            setMessage(response.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
                {status === 'loading' && (
                    <div className="py-10">
                        <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4"/>
                        <h2 className="text-xl font-bold text-slate-800">Verificando...</h2>
                        <p className="text-slate-500">Estamos validando tu enlace.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="py-8 animate-scaleIn">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 mb-2">¡Email Verificado!</h2>
                        <p className="text-slate-500 mb-8">Tu cuenta ha sido activada correctamente. Redirigiendo al login...</p>
                        <button 
                            onClick={() => onNavigate('login')}
                            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition shadow-lg"
                        >
                            Ir a Iniciar Sesión Ahora
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="py-8 animate-fadeIn">
                        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 mb-2">Enlace Expirado o Inválido</h2>
                        <p className="text-slate-500 mb-8">{message}</p>
                        <button 
                            onClick={() => onNavigate('login')} // Assume login has "Resend" option logic or just go home
                            className="w-full bg-slate-100 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-200 transition"
                        >
                            Volver al Inicio
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
