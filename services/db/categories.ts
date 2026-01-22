
import { Category } from '../../types';
import { loadOrSet, KEYS } from './utils';

// CLEAN DATABASE: No default categories
const DEFAULT_CATEGORIES: Category[] = [];

export const CategoryDAO = {
    getCategories: (): Category[] => loadOrSet(KEYS.CATEGORIES, DEFAULT_CATEGORIES),
    saveCategories: (categories: Category[]) => localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories))
};
