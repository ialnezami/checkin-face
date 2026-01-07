-- Work schedules table for site-specific and employee-specific schedules
CREATE TABLE IF NOT EXISTS work_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    shift_type VARCHAR(50) NOT NULL CHECK (shift_type IN ('morning', 'afternoon', 'night', 'flexible', 'custom')),
    day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 1=Monday, etc. NULL = all days
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    grace_period_minutes INTEGER DEFAULT 15, -- Grace period before marking as late
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Ensure one schedule per employee per day per site (or NULL for all days)
    UNIQUE(employee_id, site_id, day_of_week)
);

-- Site default schedules (when no employee-specific schedule exists)
CREATE TABLE IF NOT EXISTS site_default_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    shift_type VARCHAR(50) NOT NULL CHECK (shift_type IN ('morning', 'afternoon', 'night', 'flexible', 'custom')),
    day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6), -- NULL = all days
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    grace_period_minutes INTEGER DEFAULT 15,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(site_id, shift_type, day_of_week)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_work_schedules_site ON work_schedules(site_id);
CREATE INDEX IF NOT EXISTS idx_work_schedules_employee ON work_schedules(employee_id);
CREATE INDEX IF NOT EXISTS idx_work_schedules_active ON work_schedules(is_active);
CREATE INDEX IF NOT EXISTS idx_site_default_schedules_site ON site_default_schedules(site_id);
CREATE INDEX IF NOT EXISTS idx_site_default_schedules_active ON site_default_schedules(is_active);

-- Add site_id to employees if not exists (for site assignment)
ALTER TABLE employees ADD COLUMN IF NOT EXISTS site_id UUID REFERENCES sites(id) ON DELETE SET NULL;

-- Function to update updated_at timestamp for schedules
CREATE OR REPLACE FUNCTION update_schedule_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_work_schedules_updated_at BEFORE UPDATE ON work_schedules
    FOR EACH ROW EXECUTE FUNCTION update_schedule_updated_at();

CREATE TRIGGER update_site_default_schedules_updated_at BEFORE UPDATE ON site_default_schedules
    FOR EACH ROW EXECUTE FUNCTION update_schedule_updated_at();

-- Insert default schedules for existing sites (9 AM - 5 PM, Monday-Friday)
INSERT INTO site_default_schedules (site_id, shift_type, day_of_week, start_time, end_time, grace_period_minutes)
SELECT 
    id,
    'morning',
    day_num,
    '09:00:00',
    '17:00:00',
    15
FROM sites, generate_series(1, 5) AS day_num -- Monday to Friday
WHERE is_active = true
ON CONFLICT DO NOTHING;

