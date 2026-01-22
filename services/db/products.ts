
import { Product } from '../../types';
import { loadOrSet, KEYS } from './utils';

// CLEAN DATABASE: No default products
const DEFAULT_PRODUCTS: Product[] = [];

export const ProductDAO = {
    getProducts: (): Product[] => loadOrSet(KEYS.PRODUCTS, DEFAULT_PRODUCTS),
    saveProducts: (products: Product[]) => localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products))
};
