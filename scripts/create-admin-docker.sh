#!/bin/bash

# Script to create admin user directly in Docker database

echo "=========================================="
echo "Create Admin User (Docker)"
echo "=========================================="
echo ""

# Default credentials
USERNAME=${1:-admin}
EMAIL=${2:-admin@example.com}
PASSWORD=${3:-admin123}

echo "Creating admin user:"
echo "  Username: $USERNAME"
echo "  Email: $EMAIL"
echo "  Password: $PASSWORD"
echo ""

# Hash password using Node.js in Docker container
echo "Hashing password..."
HASH=$(docker exec checkin-backend node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('$PASSWORD', 10).then(hash => console.log(hash))")

if [ -z "$HASH" ]; then
    echo "Error: Failed to hash password"
    exit 1
fi

echo "Password hashed successfully"
echo ""

# Insert into database
echo "Creating user in database..."
docker exec -i checkin-postgres psql -U postgres -d checkin_db <<EOF
INSERT INTO users (username, email, password_hash, role)
VALUES ('$USERNAME', '$EMAIL', '$HASH', 'admin')
ON CONFLICT (username) DO UPDATE
SET email = EXCLUDED.email,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role;
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "✅ Admin user created successfully!"
    echo "=========================================="
    echo ""
    echo "Login credentials:"
    echo "  Username: $USERNAME"
    echo "  Password: $PASSWORD"
    echo ""
    echo "Access admin panel at: http://localhost:3002/admin"
else
    echo ""
    echo "=========================================="
    echo "❌ Failed to create admin user"
    echo "=========================================="
    exit 1
fi

