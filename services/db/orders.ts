
import { Order } from '../../types';
import { loadOrSet, KEYS } from './utils';

export const OrderDAO = {
    getOrders: (): Order[] => loadOrSet(KEYS.ORDERS, []),
    
    saveOrders: (orders: Order[]) => localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders)),
    
    addOrder: (order: Order) => {
        const orders = OrderDAO.getOrders();
        orders.unshift(order);
        OrderDAO.saveOrders(orders);
    }
};
