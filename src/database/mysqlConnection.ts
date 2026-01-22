// NOTE: This file contains the configuration for the MySQL connection.
// The actual connection pool instantiation is handled in `server.js` (Backend).
// We export the config here for reference or if we move to a pure Node.js structure later.
// IMPORTING 'mysql2' HERE DIRECTLY WOULD CRASH THE FRONTEND BUILD IF VITE PROCESSES THIS FILE.

export const dbConfig = {
    host: 'puntoelectro.store',
    user: 'u693043966_puntoelectro',
    password: 'Darkdimi1996$',
    database: 'u693043966_puntoelectro',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// This function is a stub for the frontend to prevent compilation errors
// if it's accidentally imported. The real connection logic is in server.js
export const checkConnection = async () => {
    console.log("Database connection is managed by the Backend Server (server.js)");
    return true;
};
