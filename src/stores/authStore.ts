import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

export interface Profile {
    id: string
    email: string | null
    full_name: string | null
    phone: string | null
    company_name: string | null
    cuit: string | null
    is_b2b: boolean
    role: 'customer' | 'admin' | 'staff'
    address_line1: string | null
    address_line2: string | null
    city: string | null
    province: string | null
    postal_code: string | null
}

interface AuthStore {
    user: User | null
    profile: Profile | null
    session: Session | null
    isLoading: boolean
    isInitialized: boolean

    // Actions
    initialize: () => Promise<void>
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>
    signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>
    signOut: () => Promise<void>
    fetchProfile: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set, get) => ({
    user: null,
    profile: null,
    session: null,
    isLoading: true,
    isInitialized: false,

    initialize: async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()

            if (session?.user) {
                set({ user: session.user, session })
                await get().fetchProfile()
            }

            // Listen for auth changes
            supabase.auth.onAuthStateChange(async (event, session) => {
                set({ user: session?.user ?? null, session })

                if (session?.user) {
                    await get().fetchProfile()
                } else {
                    set({ profile: null })
                }
            })
        } finally {
            set({ isLoading: false, isInitialized: true })
        }
    },

    signIn: async (email, password) => {
        set({ isLoading: true })
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                return { error }
            }

            return { error: null }
        } finally {
            set({ isLoading: false })
        }
    },

    signUp: async (email, password, fullName) => {
        set({ isLoading: true })
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            })

            if (error) {
                return { error }
            }

            // Create profile for new user
            if (data.user) {
                await supabase.from('profiles').insert({
                    id: data.user.id,
                    email,
                    full_name: fullName,
                    role: 'customer',
                })
            }

            return { error: null }
        } finally {
            set({ isLoading: false })
        }
    },

    signOut: async () => {
        await supabase.auth.signOut()
        set({ user: null, session: null, profile: null })
    },

    fetchProfile: async () => {
        const { user } = get()
        if (!user) return

        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (data) {
            set({ profile: data as Profile })
        }
    },
}))
