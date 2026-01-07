#!/bin/bash

# Script to create an admin user for the Employee Check-In System

echo "=========================================="
echo "Create Admin User"
echo "=========================================="
echo ""

# Default values
USERNAME=${1:-admin}
EMAIL=${2:-admin@example.com}
PASSWORD=${3:-admin123}

echo "Creating admin user with:"
echo "  Username: $USERNAME"
echo "  Email: $EMAIL"
echo "  Password: $PASSWORD"
echo ""

# Check if backend directory exists
if [ ! -d "backend" ]; then
    echo "Error: backend directory not found"
    exit 1
fi

# Run the TypeScript script using tsx
cd backend
npx tsx src/scripts/createAdmin.ts "$USERNAME" "$EMAIL" "$PASSWORD"

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "✅ Admin user created successfully!"
    echo "=========================================="
    echo ""
    echo "You can now login at: http://localhost:3002/admin"
    echo "Username: $USERNAME"
    echo "Password: $PASSWORD"
else
    echo ""
    echo "=========================================="
    echo "❌ Failed to create admin user"
    echo "=========================================="
    exit 1
fi

