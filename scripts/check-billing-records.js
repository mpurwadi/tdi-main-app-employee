// check-billing-records.js
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
    host: process.env.DB_HOST || '192.168.100.115',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '456456',
    database: process.env.DB_NAME || 'opsapps',
    port: parseInt(process.env.DB_PORT || '5432', 10),
});

async function checkBillingRecords() {
    const client = await pool.connect();
    try {
        console.log('Checking billing records...');
        
        // Check existing billing records
        const result = await client.query(`
            SELECT id, invoice_number, requester_division, provider_division, service_catalog_id, total_amount, status
            FROM billing_records
            ORDER BY id;
        `);
        
        console.log('Existing billing records:');
        result.rows.forEach(row => {
            console.log(`  ${row.id}: ${row.invoice_number} - ${row.requester_division} -> ${row.provider_division} - Rp ${row.total_amount} (${row.status})`);
        });
        
        // Insert payment records for the actual billing record IDs
        if (result.rows.length > 0) {
            console.log('\nInserting payment records...');
            
            // Find the actual IDs for the billing records we want to pay
            const billingRecordMap = {};
            result.rows.forEach(row => {
                billingRecordMap[row.invoice_number] = row.id;
            });
            
            const paymentRecords = [
                [billingRecordMap['INV-2025-001'], 5000000, 'transfer', 'TRX001', 'completed', 'Payment for server maintenance'],
                [billingRecordMap['INV-2025-002'], 7500000, 'transfer', 'TRX002', 'completed', 'Payment for database services']
            ];
            
            for (const record of paymentRecords) {
                if (record[0]) { // Only insert if the billing record exists
                    try {
                        await client.query(`
                            INSERT INTO payment_records (
                                billing_record_id, amount, payment_method, reference_number, status, remarks
                            ) VALUES ($1, $2, $3, $4, $5, $6)
                            ON CONFLICT DO NOTHING
                        `, record);
                        console.log(`  Inserted payment record for billing ID: ${record[0]}`);
                    } catch (err) {
                        console.error(`  Error inserting payment record for billing ID ${record[0]}:`, err.message);
                    }
                } else {
                    console.log(`  Billing record not found for payment`);
                }
            }
        }
        
    } catch (err) {
        console.error('Error checking billing records:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

checkBillingRecords();