#!/bin/bash

# Script to initialize ITSM Billing database
# Run this script to create tables and seed initial data

echo "Creating ITSM Billing database schema..."

# Apply schema
psql -h ${DB_HOST:-localhost} -U ${DB_USER:-postgres} -d ${DB_NAME:-opsapps} -f database/migrations/itsm_billing_schema.sql

if [ $? -eq 0 ]; then
    echo "Schema created successfully!"
else
    echo "Failed to create schema!"
    exit 1
fi

echo "Seeding initial data..."

# Apply seed data
psql -h ${DB_HOST:-localhost} -U ${DB_USER:-postgres} -d ${DB_NAME:-opsapps} -f database/seeds/itsm_billing_seed.sql

if [ $? -eq 0 ]; then
    echo "Data seeded successfully!"
else
    echo "Failed to seed data!"
    exit 1
fi

echo "ITSM Billing database initialization completed!"