import { create } from 'zustand'

interface UIStore {
    isMobileMenuOpen: boolean
    isSearchOpen: boolean
    isSaveProjectModalOpen: boolean

    // Actions
    toggleMobileMenu: () => void
    closeMobileMenu: () => void
    toggleSearch: () => void
    openSaveProjectModal: () => void
    closeSaveProjectModal: () => void
}

export const useUIStore = create<UIStore>((set, get) => ({
    isMobileMenuOpen: false,
    isSearchOpen: false,
    isSaveProjectModalOpen: false,

    toggleMobileMenu: () => set({ isMobileMenuOpen: !get().isMobileMenuOpen }),
    closeMobileMenu: () => set({ isMobileMenuOpen: false }),
    toggleSearch: () => set({ isSearchOpen: !get().isSearchOpen }),
    openSaveProjectModal: () => set({ isSaveProjectModalOpen: true }),
    closeSaveProjectModal: () => set({ isSaveProjectModalOpen: false }),
}))
