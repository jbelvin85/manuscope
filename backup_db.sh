#!/bin/bash

# Load environment variables from .env file if it exists
if [ -f .env ]; then
    export $(cat .env | xargs)
fi

# Use values from docker-compose.yml or .env
DB_USER=${DB_USER:-postgres}
DB_NAME=${DB_NAME:-lamdb}
DB_PASSWORD=${DB_PASSWORD:-password}

DB_SERVICE_NAME="db" # Name of the PostgreSQL service in docker-compose.yml

BACKUP_DIR="backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/manuscope_db_backup_plain_${TIMESTAMP}.sql" # New filename

echo "Creating plain SQL database backup from Docker service..."
echo "Database: $DB_NAME (service: $DB_SERVICE_NAME)"
echo "User: $DB_USER"
echo "Backup file: $BACKUP_FILE"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Execute pg_dump inside the Docker container for plain SQL
docker exec -e PGPASSWORD="$DB_PASSWORD" -t $(docker-compose ps -q $DB_SERVICE_NAME) \
    pg_dump -U "$DB_USER" -d "$DB_NAME" \
    --no-owner --no-privileges \
    > "$BACKUP_FILE" # No -Fc for plain SQL

if [ $? -eq 0 ]; then
    echo "Plain SQL database backup created successfully: $BACKUP_FILE"
else
    echo "Error: Plain SQL database backup failed."
    echo "Ensure Docker Desktop/daemon is running and the '$DB_SERVICE_NAME' service is up."
    exit 1
fi
