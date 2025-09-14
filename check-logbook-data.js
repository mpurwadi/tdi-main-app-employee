const { Pool } = require('pg');

const pool = new Pool({
    user: 'mpurwadi',
    host: 'localhost',
    database: 'opsapps',
    password: 'pratista17',
    port: 5432,
});

async function checkLogbookEntries() {
    try {
        // Get a sample of logbook entries
        const result = await pool.query(`
            SELECT id, user_id, entry_date, activity, work_type, start_time, end_time, status 
            FROM logbook_entries 
            ORDER BY entry_date DESC 
            LIMIT 5;
        `);
        
        console.log('Logbook Entries Sample:');
        console.log('----------------------------------------');
        result.rows.forEach((row, index) => {
            console.log(`${index + 1}. ID: ${row.id}`);
            console.log(`   User ID: ${row.user_id}`);
            console.log(`   Date: ${row.entry_date}`);
            console.log(`   Activity: ${row.activity.substring(0, 50)}${row.activity.length > 50 ? '...' : ''}`);
            console.log(`   Work Type: ${row.work_type || 'NULL'}`);
            console.log(`   Start Time: ${row.start_time || 'NULL'}`);
            console.log(`   End Time: ${row.end_time || 'NULL'}`);
            console.log(`   Status: ${row.status || 'NULL'}`);
            console.log('');
        });
        
        // Check if there are any entries with NULL status
        const nullStatusCount = await pool.query(`
            SELECT COUNT(*) as count 
            FROM logbook_entries 
            WHERE status IS NULL;
        `);
        
        console.log(`Entries with NULL status: ${nullStatusCount.rows[0].count}`);
        
    } catch (error) {
        console.error('Error checking logbook entries:', error);
    } finally {
        await pool.end();
    }
}

checkLogbookEntries();