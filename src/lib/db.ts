import { Pool } from 'pg';

const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false as any,
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

export const getClient = () => pool.connect();
