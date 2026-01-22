
import { Brand } from '../../types';
import { loadOrSet, KEYS } from './utils';

// CLEAN DATABASE: No default brands
const DEFAULT_BRANDS: Brand[] = [];

export const BrandDAO = {
    getBrands: (): Brand[] => loadOrSet(KEYS.BRANDS, DEFAULT_BRANDS),
    saveBrands: (brands: Brand[]) => localStorage.setItem(KEYS.BRANDS, JSON.stringify(brands))
};
