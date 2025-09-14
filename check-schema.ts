import { Pool } from 'pg';

const pool = new Pool({
    user: 'mpurwadi',
    host: 'localhost',
    database: 'opsapps',
    password: 'pratista17',
    port: 5432,
});

async function checkLogbookSchema() {
    try {
        // Get table schema information
        const result = await pool.query(`
            SELECT 
                column_name, 
                data_type, 
                is_nullable,
                column_default
            FROM information_schema.columns 
            WHERE table_name = 'logbook_entries'
            ORDER BY ordinal_position;
        `);
        
        console.log('Logbook Entries Table Schema:');
        console.log('----------------------------------------');
        result.rows.forEach(row => {
            console.log(`${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'} ${row.column_default ? `DEFAULT ${row.column_default}` : ''}`);
        });
        
        // Get sample data to check status values
        const sampleData = await pool.query(`
            SELECT id, entry_date, activity, status 
            FROM logbook_entries 
            LIMIT 5;
        `);
        
        console.log('\nSample Logbook Entries:');
        console.log('----------------------------------------');
        sampleData.rows.forEach(row => {
            console.log(`ID: ${row.id}, Date: ${row.entry_date}, Status: ${row.status || 'NULL'}, Activity: ${row.activity.substring(0, 30)}${row.activity.length > 30 ? '...' : ''}`);
        });
        
        // Check if there are any entries with NULL status
        const nullStatusCount = await pool.query(`
            SELECT COUNT(*) as count 
            FROM logbook_entries 
            WHERE status IS NULL;
        `);
        
        console.log(`\nEntries with NULL status: ${nullStatusCount.rows[0].count}`);
        
    } catch (error) {
        console.error('Error checking logbook schema:', error);
    } finally {
        await pool.end();
    }
}

checkLogbookSchema();