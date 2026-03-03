import { Pool } from 'pg';

// Database configuration - uses environment variables
export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'SNCardDB',
  ssl: process.env.DB_HOST !== 'localhost' ? { rejectUnauthorized: false } : undefined,
});