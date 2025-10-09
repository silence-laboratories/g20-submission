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

DB="sl_compute_platform"
ROLE="sl_admin"
echo "Dropping all tables in database: $DB"
# Drop the database
PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "postgres" -c "DROP DATABASE IF EXISTS \"$DB\";"
if [ $? -eq 0 ]; then
  echo "Successfully dropped database: $DB"
else
  echo "Failed to drop database: $DB"
fi
