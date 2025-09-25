const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || '192.168.100.115',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '456456',
    database: process.env.DB_NAME || 'opsapps',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    ssl: process.env.DB_SSLMODE === 'disable' || !process.env.DB_SSLMODE ? false : { rejectUnauthorized: false },
});

const categoriesToSeed = [
    { id: 1, name: 'Infrastructure', description: 'Hardware and infrastructure services' },
    { id: 2, name: 'Analytics', description: 'Data analysis and reporting services' },
    { id: 3, name: 'Development', description: 'Application development services' },
    { id: 4, name: 'Security', description: 'Security assessment and compliance services' }
];

async function seedCategories() {
    try {
        for (const category of categoriesToSeed) {
            // Check if category already exists
            const checkQuery = 'SELECT id FROM service_categories WHERE id = $1 OR name = $2';
            const checkResult = await pool.query(checkQuery, [category.id, category.name]);

            if (checkResult.rows.length === 0) {
                // Insert category if it doesn't exist
                const insertQuery = 'INSERT INTO service_categories (id, name, description) VALUES ($1, $2, $3)';
                await pool.query(insertQuery, [category.id, category.name, category.description]);
                console.log(`Inserted category: ${category.name} (ID: ${category.id})`);
            } else {
                console.log(`Category already exists: ${category.name} (ID: ${category.id})`);
            }
        }
        console.log('Service categories seeding complete.');
    } catch (error) {
        console.error('Error seeding service categories:', error);
    } finally {
        pool.end();
    }
}

seedCategories();
