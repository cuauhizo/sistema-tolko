import { createPool } from 'mysql2/promise'
import { config } from 'dotenv'

config()

export const pool = createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bdsistema-tolko',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})
