-- Migration: Add Site Sections/Rooms
-- Allows admin to create sections/rooms within sites and track employee locations

-- Ensure sites table exists (if migration runs before add_sites.sql)
CREATE TABLE IF NOT EXISTS sites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    address TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS site_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    section_type VARCHAR(50) DEFAULT 'room', -- room, area, cave, office, warehouse, etc.
    coordinates JSONB, -- For graphic layout: {x, y, width, height} or {polygon: [...]}
    capacity INTEGER, -- Maximum capacity
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(site_id, code)
);

-- Employee location tracking within sections
CREATE TABLE IF NOT EXISTS employee_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    section_id UUID REFERENCES site_sections(id) ON DELETE SET NULL,
    location_type VARCHAR(50) DEFAULT 'section', -- section, site, offsite
    notes TEXT, -- Additional notes about location
    entered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    exited_at TIMESTAMP, -- NULL if currently in this location
    is_current BOOLEAN DEFAULT true, -- Current location flag
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_site_sections_site_id ON site_sections(site_id);
CREATE INDEX IF NOT EXISTS idx_site_sections_code ON site_sections(code);
CREATE INDEX IF NOT EXISTS idx_site_sections_is_active ON site_sections(is_active);

CREATE INDEX IF NOT EXISTS idx_employee_locations_employee_id ON employee_locations(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_locations_site_id ON employee_locations(site_id);
CREATE INDEX IF NOT EXISTS idx_employee_locations_section_id ON employee_locations(section_id);
CREATE INDEX IF NOT EXISTS idx_employee_locations_is_current ON employee_locations(is_current);
CREATE INDEX IF NOT EXISTS idx_employee_locations_entered_at ON employee_locations(entered_at);

-- Trigger to update updated_at
CREATE TRIGGER update_site_sections_updated_at BEFORE UPDATE ON site_sections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically set previous location as not current when new location is added
CREATE OR REPLACE FUNCTION update_previous_location()
RETURNS TRIGGER AS $$
BEGIN
    -- Set all previous current locations for this employee as not current
    UPDATE employee_locations
    SET is_current = false, exited_at = CURRENT_TIMESTAMP
    WHERE employee_id = NEW.employee_id
      AND is_current = true
      AND id != NEW.id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update previous locations
CREATE TRIGGER update_previous_employee_location BEFORE INSERT ON employee_locations
    FOR EACH ROW EXECUTE FUNCTION update_previous_location();

