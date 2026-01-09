-- Migration: Add Employee Status Updates
-- Allows employees to update their status/activity with time slots

CREATE TABLE IF NOT EXISTS employee_status_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    status_text TEXT NOT NULL,
    status_type VARCHAR(50) DEFAULT 'activity', -- activity, break, meeting, etc.
    duration_minutes INTEGER NOT NULL, -- Duration in minutes (60, 300, etc.)
    expires_at TIMESTAMP NOT NULL, -- When this status expires
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_employee_status_employee_id ON employee_status_updates(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_status_expires_at ON employee_status_updates(expires_at);
CREATE INDEX IF NOT EXISTS idx_employee_status_is_active ON employee_status_updates(is_active);
CREATE INDEX IF NOT EXISTS idx_employee_status_created_at ON employee_status_updates(created_at);

-- Trigger to update updated_at
CREATE TRIGGER update_employee_status_updated_at BEFORE UPDATE ON employee_status_updates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

