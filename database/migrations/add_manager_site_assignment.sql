-- Add site_id to users table for manager role
ALTER TABLE users ADD COLUMN IF NOT EXISTS site_id UUID REFERENCES sites(id) ON DELETE SET NULL;

-- Create index for site_id in users
CREATE INDEX IF NOT EXISTS idx_users_site_id ON users(site_id);

-- Update existing managers to have site_id (optional - set to first site if exists)
UPDATE users 
SET site_id = (SELECT id FROM sites WHERE is_active = true LIMIT 1)
WHERE role = 'manager' AND site_id IS NULL;

