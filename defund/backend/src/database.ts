import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

// Initialize DB
let db: Database | null = null;

export async function initDatabase() {
    try {
        db = await open({
            filename: path.join(__dirname, '../../database.sqlite'),
            driver: sqlite3.Database
        });

        console.log('✅ Connected to SQLite database');

        // Create Campaigns Metadata Table
        await db.exec(`
            CREATE TABLE IF NOT EXISTS campaign_metadata (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                campaign_id INTEGER UNIQUE,
                image_url TEXT,
                category TEXT,
                tags TEXT,
                long_description TEXT,
                website_url TEXT,
                twitter_url TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create Verification Logs Table
        await db.exec(`
            CREATE TABLE IF NOT EXISTS verification_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                campaign_id INTEGER,
                milestone_index INTEGER,
                agent_name TEXT,
                verification_result TEXT,
                confidence INTEGER,
                feedback TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('✅ Database tables initialized');
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
    }
}

export function getDb() {
    if (!db) {
        throw new Error('Database not initialized');
    }
    return db;
}
