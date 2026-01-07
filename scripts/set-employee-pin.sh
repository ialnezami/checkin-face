#!/bin/bash

# Script to set employee PIN for employee portal login

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: ./set-employee-pin.sh <employee_id> <pin>"
    echo "Example: ./set-employee-pin.sh EMP001 1234"
    exit 1
fi

EMPLOYEE_ID=$1
PIN=$2

echo "Setting PIN for employee: $EMPLOYEE_ID"

# Set PIN in database
docker exec -i checkin-postgres psql -U postgres -d checkin_db <<EOF
INSERT INTO employee_credentials (employee_id, pin_code)
SELECT id, '$PIN'
FROM employees
WHERE employee_id = '$EMPLOYEE_ID'
ON CONFLICT (employee_id) DO UPDATE
SET pin_code = EXCLUDED.pin_code;
EOF

if [ $? -eq 0 ]; then
    echo "✅ PIN set successfully for employee $EMPLOYEE_ID"
    echo "Employee can now login at: http://localhost:3002/employee/login"
    echo "Login with: Employee ID: $EMPLOYEE_ID, PIN: $PIN"
else
    echo "❌ Error setting PIN"
    exit 1
fi

