#!/bin/bash
# ============================================================
# aiven_migrate.sh
# Script to migrate local database schema and seed data to Aiven MySQL
# ============================================================

if [ -z "$1" ]; then
    echo "Error: Missing Aiven database password."
    echo "Usage: ./code/database/aiven_migrate.sh <your_aiven_password>"
    exit 1
fi

PASSWORD=$1
HOST="mysql-25173374-giftora033-9453.h.aivencloud.com"
PORT=25409
USER="avnadmin"
DB="defaultdb"

# Get the directory where this script is located
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"

echo "=== Starting Aiven Database Migration ==="

# 1. Create a temporary schema file without database creation/use lines
echo "Preparing database schema..."
sed -e 's/DROP DATABASE IF EXISTS nexus_db;//g' \
    -e 's/CREATE DATABASE nexus_db;//g' \
    -e 's/USE nexus_db;//g' "$SCRIPT_DIR/schema.sql" > "$SCRIPT_DIR/temp_schema.sql"

# 2. Import Schema
echo "Importing tables schema..."
mysql -h $HOST -P $PORT -u $USER -p"$PASSWORD" $DB < "$SCRIPT_DIR/temp_schema.sql"
if [ $? -ne 0 ]; then
    echo "Error: Schema import failed."
    rm -f "$SCRIPT_DIR/temp_schema.sql"
    exit 1
fi

# 3. Import Triggers
echo "Importing database triggers..."
mysql -h $HOST -P $PORT -u $USER -p"$PASSWORD" $DB < "$SCRIPT_DIR/triggers.sql"
if [ $? -ne 0 ]; then
    echo "Error: Triggers import failed."
    rm -f "$SCRIPT_DIR/temp_schema.sql"
    exit 1
fi

# 4. Import Data
echo "Importing seed users & orders..."
mysql -h $HOST -P $PORT -u $USER -p"$PASSWORD" $DB < "$SCRIPT_DIR/data.sql"
if [ $? -ne 0 ]; then
    echo "Error: Seed users/orders import failed."
    rm -f "$SCRIPT_DIR/temp_schema.sql"
    exit 1
fi

# 5. Import Items
echo "Importing seed products & items..."
mysql -h $HOST -P $PORT -u $USER -p"$PASSWORD" $DB < "$SCRIPT_DIR/items.sql"
if [ $? -ne 0 ]; then
    echo "Error: Seed products import failed."
    rm -f "$SCRIPT_DIR/temp_schema.sql"
    exit 1
fi

# 6. Clean up temporary file
rm -f "$SCRIPT_DIR/temp_schema.sql"

echo "=== Aiven Database Migration Completed Successfully! ==="
