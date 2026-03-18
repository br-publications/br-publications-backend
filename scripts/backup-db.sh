#!/bin/bash

# Load environment variables
source .env

# Set backup directory
BACKUP_DIR="./backups"
mkdir -p $BACKUP_DIR

# Generate timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Backup filename
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_backup_$TIMESTAMP.sql"

# Create backup
PGPASSWORD=$DB_PASSWORD pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME > $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "✅ Database backup created successfully: $BACKUP_FILE"
else
    echo "❌ Database backup failed"
    exit 1
fi