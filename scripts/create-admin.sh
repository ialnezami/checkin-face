#!/bin/bash

# Script to create an admin user in the database

DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5433}
DB_NAME=${DB_NAME:-checkin_db}
DB_USER=${DB_USER:-postgres}

echo "Creating admin user..."
echo "Enter admin username (default: admin):"
read USERNAME
USERNAME=${USERNAME:-admin}

echo "Enter admin email (default: admin@example.com):"
read EMAIL
EMAIL=${EMAIL:-admin@example.com}

echo "Enter admin password:"
read -s PASSWORD

if [ -z "$PASSWORD" ]; then
    echo "Password cannot be empty!"
    exit 1
fi

# Hash password using Node.js (requires bcryptjs)
HASH=$(node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('$PASSWORD', 10).then(hash => console.log(hash))")

if [ -z "$HASH" ]; then
    echo "Error hashing password. Make sure bcryptjs is installed."
    exit 1
fi

# Insert into database
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME <<EOF
INSERT INTO users (username, email, password_hash, role)
VALUES ('$USERNAME', '$EMAIL', '$HASH', 'admin')
ON CONFLICT (username) DO UPDATE
SET email = EXCLUDED.email,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role;
EOF

if [ $? -eq 0 ]; then
    echo "Admin user created successfully!"
    echo "Username: $USERNAME"
    echo "Email: $EMAIL"
else
    echo "Error creating admin user"
    exit 1
fi

