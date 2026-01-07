-- Add sites table
CREATE TABLE IF NOT EXISTS sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    address TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add site authentication methods configuration
CREATE TABLE IF NOT EXISTS site_auth_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    method_type VARCHAR(50) NOT NULL CHECK (method_type IN ('face', 'fingerprint', 'rfid', 'name_search', 'pin')),
    is_enabled BOOLEAN DEFAULT true,
    settings JSONB, -- Additional settings per method (e.g., RFID reader config, face threshold)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(site_id, method_type)
);

-- Add site_id to employees (optional - employees can be assigned to sites)
ALTER TABLE employees ADD COLUMN IF NOT EXISTS site_id UUID REFERENCES sites(id) ON DELETE SET NULL;

-- Add site_id to attendance records
ALTER TABLE attendance_records ADD COLUMN IF NOT EXISTS site_id UUID REFERENCES sites(id) ON DELETE SET NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sites_code ON sites(code);
CREATE INDEX IF NOT EXISTS idx_sites_active ON sites(is_active);
CREATE INDEX IF NOT EXISTS idx_site_auth_methods_site ON site_auth_methods(site_id);
CREATE INDEX IF NOT EXISTS idx_employees_site ON employees(site_id);
CREATE INDEX IF NOT EXISTS idx_attendance_site ON attendance_records(site_id);

-- Insert default site
INSERT INTO sites (id, name, code, description) 
VALUES ('00000000-0000-0000-0000-000000000001', 'Main Office', 'MAIN', 'Main office location')
ON CONFLICT DO NOTHING;

-- Enable all methods for default site
INSERT INTO site_auth_methods (site_id, method_type, is_enabled)
SELECT id, method_type, true
FROM sites, (VALUES ('face'), ('rfid'), ('name_search'), ('pin')) AS methods(method_type)
WHERE code = 'MAIN'
ON CONFLICT DO NOTHING;

