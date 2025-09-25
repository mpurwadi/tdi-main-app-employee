import { db } from '../lib/db';

async function createJobRolesTable() {
  try {
    // Create job_roles table
    await db.query(`
      CREATE TABLE IF NOT EXISTS job_roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Job roles table created successfully');
    
    // Insert default job roles
    const defaultRoles = [
      ['Developer', 'Software development role'],
      ['Data Engineering', 'Data engineering and analytics role'],
      ['UI/UX Designer', 'User interface and experience design role'],
      ['QA Engineer', 'Quality assurance and testing role'],
      ['System Administrator', 'System administration and maintenance role'],
      ['Product Manager', 'Product management and strategy role'],
      ['Business Analyst', 'Business analysis and requirements role'],
      ['DevOps Engineer', 'Development operations and deployment role'],
      ['Security Specialist', 'Information security and compliance role'],
      ['Technical Support', 'Technical support and troubleshooting role']
    ];
    
    for (const [name, description] of defaultRoles) {
      try {
        await db.query(
          'INSERT INTO job_roles (name, description) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING',
          [name, description]
        );
      } catch (insertError) {
        console.log(`Role ${name} already exists or error occurred:`, insertError);
      }
    }
    
    console.log('Default job roles inserted');
    
    // Add job_role_id column to users table if it doesn't exist
    try {
      await db.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS job_role_id INTEGER REFERENCES job_roles(id) ON DELETE SET NULL
      `);
      console.log('job_role_id column added to users table');
    } catch (alterError) {
      console.log('job_role_id column may already exist or error occurred:', alterError);
    }
    
    console.log('Job roles setup completed successfully');
  } catch (error) {
    console.error('Error setting up job roles:', error);
  }
}

createJobRolesTable();