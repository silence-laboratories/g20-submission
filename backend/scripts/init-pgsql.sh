#!/bin/bash

# Define default database connection parameters
PGHOST="localhost"
PGPORT="5432"
PGUSER="postgres" # Use the superuser to execute these commands
PGPASSWORD=""

while getopts "h:p:u:w:" opt; do
  case $opt in
    h) PGHOST="$OPTARG" ;;
    p) PGPORT="$OPTARG" ;;
    u) PGUSER="$OPTARG" ;;
    w) PGPASSWORD="$OPTARG" ;;
    \?) echo "Invalid option -$OPTARG" >&2; exit 1 ;;
  esac
done

echo "Using PGHOST: $PGHOST"
echo "Using PGPORT: $PGPORT"
echo "Using PGUSER: $PGUSER"
echo "-----------------------------------"

ROLE="sl_admin"
DB="sl_compute_platform"
PASSWORD="password"

echo "Creating role: $ROLE"
PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "postgres" -c "CREATE ROLE $ROLE WITH LOGIN PASSWORD '$PASSWORD';"

echo "Creating database: $DB owned by $ROLE"
PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "postgres" -c "CREATE DATABASE $DB OWNER $ROLE;"

echo "Roles and databases created successfully!"
