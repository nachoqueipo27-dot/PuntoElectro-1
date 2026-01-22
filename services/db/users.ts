
import { User } from '../../types';
import { loadOrSet, KEYS } from './utils';

export const UserDAO = {
    getUsers: (): User[] => loadOrSet(KEYS.USERS, []),
    
    saveUsers: (users: User[]) => localStorage.setItem(KEYS.USERS, JSON.stringify(users)),
    
    addUser: (user: User) => {
        const users = UserDAO.getUsers();
        // Check if email exists
        if (users.some(u => u.email === user.email)) {
            throw new Error("El email ya está registrado");
        }
        users.push(user);
        UserDAO.saveUsers(users);
    },

    updateUser: (updatedUser: User) => {
        const users = UserDAO.getUsers();
        const index = users.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) {
            users[index] = updatedUser;
            UserDAO.saveUsers(users);
        }
    },

    findUserByEmail: (email: string): User | undefined => {
        const users = UserDAO.getUsers();
        return users.find(u => u.email === email);
    }
};
