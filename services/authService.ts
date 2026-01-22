
import { User, AuthResponse } from '../types';
import { MockDb } from './mockDb';

// --- AUTH SERVICE ---
export const AuthService = {

    // 1. LOGIN
    login: async (email: string, password: string): Promise<AuthResponse> => {
        const normalizedEmail = email.toLowerCase().trim();
        const adminEmails = ['nacho@admin.com', 'nachoqueipo27@gmail.com'];

        // Hardcoded Admin Check (Safety net)
        if (adminEmails.includes(normalizedEmail) && password === 'admin123') {
            return {
                success: true,
                message: 'Bienvenido Administrador',
                user: {
                    id: 'admin',
                    name: 'Administrador',
                    email: normalizedEmail, // Use the actual email they logged in with
                    phone: '',
                    role: 'admin'
                }
            };
        }

        try {
            const user = await MockDb.findUserByEmail(normalizedEmail);

            if (user && user.password === password) {
                // Force admin role if email is in admin list
                if (adminEmails.includes(normalizedEmail)) {
                    return {
                        success: true,
                        message: 'Bienvenido Administrador',
                        user: {
                            ...user,
                            role: 'admin'
                        }
                    };
                }

                return {
                    success: true,
                    message: 'Login exitoso',
                    user
                };
            }

            return { success: false, message: 'Credenciales inválidas' };
        } catch (error) {
            console.error("Login Error:", error);
            return { success: false, message: 'Error de conexión' };
        }
    },

    // 2. REGISTER
    register: async (name: string, email: string, phone: string, password: string): Promise<AuthResponse> => {
        try {
            const normalizedEmail = email.toLowerCase().trim();

            const existing = await MockDb.findUserByEmail(normalizedEmail);

            if (existing && existing.id) {
                return { success: false, message: 'El email ya está registrado.' };
            }

            const newUser: User = {
                id: Date.now().toString(),
                name,
                email: normalizedEmail,
                phone,
                password,
                role: 'user'
            };

            await MockDb.addUser(newUser);

            return { success: true, message: 'Usuario creado correctamente.' };
        } catch (error) {
            console.error(error);
            return { success: false, message: 'Error al procesar el registro.' };
        }
    },

    // 3. VERIFY TOKEN (Mock)
    verifyByToken: async (token: string): Promise<AuthResponse> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (token && token.length > 5) {
                    const mockUser: User = {
                        id: 'verified_user',
                        name: 'Usuario Verificado',
                        email: 'verified@example.com',
                        phone: '12345678',
                        role: 'user'
                    };
                    resolve({ success: true, message: 'Cuenta verificada correctamente.', user: mockUser });
                } else {
                    resolve({ success: false, message: 'Token inválido o expirado.' });
                }
            }, 1000);
        });
    }
};
