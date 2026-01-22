
import { Service } from '../../types';
import { loadOrSet, KEYS } from './utils';

// CLEAN DATABASE: No default services
const DEFAULT_SERVICES: Service[] = [];

export const ServiceDAO = {
    getServices: (): Service[] => loadOrSet(KEYS.SERVICES, DEFAULT_SERVICES),
    saveServices: (services: Service[]) => localStorage.setItem(KEYS.SERVICES, JSON.stringify(services))
};
