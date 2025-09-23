const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || '192.168.100.115',
    database: process.env.DB_NAME || 'opsapps',
    password: process.env.DB_PASSWORD || '456456',
    port: process.env.DB_PORT || 5432,
});

async function runMigrations() {
    try {
        // Get all migration files and sort them
        const migrationsDir = path.join(__dirname, 'db', 'migrations');
        const migrationFiles = fs.readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort();
        
        console.log(`Found ${migrationFiles.length} migration files`);
        
        // Run each migration
        for (const file of migrationFiles) {
            console.log(`Running migration: ${file}`);
            const filePath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(filePath, 'utf8');
            
            // Split the SQL file into individual statements
            const statements = sql.split(';').filter(stmt => stmt.trim() !== '');
            
            for (const statement of statements) {
                if (statement.trim() !== '') {
                    try {
                        await pool.query(statement);
                    } catch (error) {
                        // Log error but continue with other statements
                        console.warn(`Warning: Error executing statement in ${file}: ${error.message}`);
                        console.warn(`Statement: ${statement.substring(0, 100)}...`);
                        // Don't throw error to continue with other migrations
                    }
                }
            }
            
            console.log(`Completed migration: ${file}`);
        }
        
        console.log('All migrations processed (with any errors logged as warnings)');
    } catch (error) {
        console.error('Error running migrations:', error);
    } finally {
        await pool.end();
    }
}

runMigrations();