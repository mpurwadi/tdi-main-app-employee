// seed-billing-data.js
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
    host: process.env.DB_HOST || '192.168.100.115',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '456456',
    database: process.env.DB_NAME || 'opsapps',
    port: parseInt(process.env.DB_PORT || '5432', 10),
});

async function seedBillingData() {
    const client = await pool.connect();
    try {
        console.log('Seeding billing records and payment records...');
        
        // Insert sample billing records
        const billingRecords = [
            ['INV-2025-001', 'DevOps', 'IT', 2, 1, 5000000, 5000000, '2025-09-01', '2025-09-30', '2025-10-15', 'paid', 'Monthly server maintenance'],
            ['INV-2025-002', 'Big Data', 'IT', 3, 1, 7500000, 7500000, '2025-09-01', '2025-09-30', '2025-10-15', 'paid', 'Database administration services'],
            ['INV-2025-003', 'Produk', 'IT', 5, 40, 150000, 6000000, '2025-09-01', '2025-09-30', '2025-10-15', 'pending', 'Custom software development'],
            ['INV-2025-004', 'Operasional', 'IT', 7, 20, 300000, 6000000, '2025-09-01', '2025-09-30', '2025-10-15', 'overdue', 'IT consulting services'],
            ['INV-2025-005', 'DevOps', 'IT', 8, 1, 10000000, 10000000, '2025-09-01', '2025-09-30', '2025-10-15', 'pending', 'Cloud infrastructure services']
        ];
        
        console.log('\nInserting billing records...');
        for (const record of billingRecords) {
            try {
                await client.query(`
                    INSERT INTO billing_records (
                        invoice_number, requester_division, provider_division, service_catalog_id,
                        quantity, unit_price, total_amount, billing_period_start, billing_period_end,
                        due_date, status, description
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                    ON CONFLICT DO NOTHING
                `, record);
                console.log(`  Inserted billing record: ${record[0]}`);
            } catch (err) {
                console.error(`  Error inserting billing record ${record[0]}:`, err.message);
            }
        }
        
        // Insert sample payment records
        const paymentRecords = [
            [1, 5000000, 'transfer', 'TRX001', 'completed', 'Payment for server maintenance'],
            [2, 7500000, 'transfer', 'TRX002', 'completed', 'Payment for database services']
        ];
        
        console.log('\nInserting payment records...');
        for (const record of paymentRecords) {
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
        }
        
        console.log('\nSeeding completed!');
        
    } catch (err) {
        console.error('Error seeding billing data:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

seedBillingData();