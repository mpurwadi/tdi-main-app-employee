import { Pool } from 'pg';

const pool = new Pool({
    user: process.env.DB_USER || 'mpurwadi',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'opsapps',
    password: process.env.DB_PASSWORD || 'pratista17',
    port: parseInt(process.env.DB_PORT || '5432'),
});

async function checkAttendanceRecordsSchema() {
    try {
        // Get table schema information
        const result = await pool.query(`
            SELECT 
                column_name, 
                data_type, 
                is_nullable,
                column_default
            FROM information_schema.columns 
            WHERE table_name = 'attendance_records'
            ORDER BY ordinal_position;
        `);
        
        console.log('Attendance Records Table Schema:');
        console.log('----------------------------------------');
        result.rows.forEach(row => {
            console.log(`${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'} ${row.column_default ? `DEFAULT ${row.column_default}` : ''}`);
        });
        
        // Check if late_checkin_reason column exists
        const hasLateCheckinReason = result.rows.some(row => row.column_name === 'late_checkin_reason');
        console.log(`\\nlate_checkin_reason column exists: ${hasLateCheckinReason}`);
        
        // Check sample data
        const sampleData = await pool.query(`
            SELECT id, user_id, clock_in_time, manual_checkin_reason, manual_checkout_reason 
            FROM attendance_records 
            LIMIT 5;
        `);
        
        console.log('\\nSample Attendance Records (partial fields):');
        console.log('----------------------------------------');
        sampleData.rows.forEach(row => {
            console.log(`ID: ${row.id}, User: ${row.user_id}, Clock-in: ${row.clock_in_time}, Manual Checkin Reason: ${row.manual_checkin_reason || 'NULL'}, Manual Checkout Reason: ${row.manual_checkout_reason || 'NULL'}`);
        });
        
        if (hasLateCheckinReason) {
            const lateCheckinData = await pool.query(`
                SELECT id, late_checkin_reason 
                FROM attendance_records 
                WHERE late_checkin_reason IS NOT NULL
                LIMIT 5;
            `);
            
            console.log('\\nSample Late Check-in Reason Data (if any):');
            console.log('----------------------------------------');
            lateCheckinData.rows.forEach(row => {
                console.log(`ID: ${row.id}, Late Check-in Reason: ${row.late_checkin_reason || 'NULL'}`);
            });
        }
        
    } catch (error) {
        console.error('Error checking attendance records schema:', error);
    } finally {
        await pool.end();
    }
}

checkAttendanceRecordsSchema();