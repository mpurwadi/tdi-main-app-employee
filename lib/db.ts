import { Pool } from 'pg';

const pool = new Pool({
    host: process.env.DB_HOST || '192.168.100.115',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '456456',
    database: process.env.DB_NAME || 'opsapps', // Fallback to 'opsapps' if DB_NAME env var is not set
    port: parseInt(process.env.DB_PORT || '5432', 10),
    ssl: process.env.DB_SSLMODE === 'disable' || !process.env.DB_SSLMODE ? false : { rejectUnauthorized: false },
});

export const db = {
    query: (text: string, params?: any[]) => pool.query(text, params),
};
