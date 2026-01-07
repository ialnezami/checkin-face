-- Add leave requests table
CREATE TABLE IF NOT EXISTS leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type VARCHAR(50) NOT NULL CHECK (leave_type IN ('vacation', 'sick', 'personal', 'other')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_requested INTEGER NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add employee login credentials (optional - can use employee_id + PIN)
CREATE TABLE IF NOT EXISTS employee_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL UNIQUE REFERENCES employees(id) ON DELETE CASCADE,
    username VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255),
    pin_code VARCHAR(10), -- 4-6 digit PIN for quick login
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_dates ON leave_requests(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_employee_credentials_employee ON employee_credentials(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_credentials_username ON employee_credentials(username);

-- Function to calculate days requested
CREATE OR REPLACE FUNCTION calculate_leave_days(start_date DATE, end_date DATE)
RETURNS INTEGER AS $$
BEGIN
    RETURN GREATEST(1, end_date - start_date + 1);
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate days_requested
CREATE OR REPLACE FUNCTION update_leave_days()
RETURNS TRIGGER AS $$
BEGIN
    NEW.days_requested = calculate_leave_days(NEW.start_date, NEW.end_date);
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_leave_request_days
    BEFORE INSERT OR UPDATE ON leave_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_leave_days();

