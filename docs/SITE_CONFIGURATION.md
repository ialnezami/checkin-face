# Site-Based Authentication Method Configuration

## Overview

The system now supports **site-specific authentication method configuration**. This allows site managers to enable or disable specific authentication methods (Face Recognition, RFID, Name Search, PIN) for each site location.

## Features

- **Multi-Site Support**: Create and manage multiple sites/locations
- **Method Configuration**: Enable/disable authentication methods per site
- **Dynamic Check-In**: Check-in interface automatically shows only enabled methods
- **Site Selection**: Users can select their site before checking in
- **Manager Control**: Site managers can configure methods via Admin Panel

## Database Schema

### Sites Table
```sql
CREATE TABLE sites (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    address TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT true
);
```

### Site Auth Methods Table
```sql
CREATE TABLE site_auth_methods (
    id UUID PRIMARY KEY,
    site_id UUID REFERENCES sites(id),
    method_type VARCHAR(50) CHECK (method_type IN ('face', 'fingerprint', 'rfid', 'name_search', 'pin')),
    is_enabled BOOLEAN DEFAULT true,
    settings JSONB
);
```

## Usage

### For Site Managers

1. **Access Admin Panel**: Login at http://localhost:3002/admin
2. **Navigate to Sites Tab**: Click on "Sites" in the admin navigation
3. **Create a Site**:
   - Click "+ Add Site"
   - Enter site name, code, address, and description
   - Click "Create Site"

4. **Configure Authentication Methods**:
   - Select a site from the list
   - Toggle authentication methods on/off:
     - ✅ **Face Recognition**: Enable face-based check-in
     - ✅ **RFID/NFC Tags**: Enable RFID card scanning
     - ✅ **Name/ID Search**: Enable manual name/ID search
     - ✅ **PIN/Password**: Enable PIN-based check-in
     - ✅ **Fingerprint**: Enable fingerprint scanning (when hardware available)

### For Employees

1. **Select Site** (if multiple sites available):
   - Go to Check-In page
   - Select your site from the dropdown

2. **Check-In**:
   - Only enabled methods for your site will be displayed
   - Choose your preferred method and complete check-in

## API Endpoints

### Sites

- `GET /api/sites` - List all sites
- `GET /api/sites/:id` - Get site details with auth methods
- `POST /api/sites` - Create new site (admin/manager only)
- `PUT /api/sites/:id` - Update site (admin/manager only)
- `DELETE /api/sites/:id` - Delete site (admin only)

### Site Auth Methods

- `GET /api/sites/:id/auth-methods` - Get all auth methods for a site
- `GET /api/sites/:id/enabled-methods` - Get only enabled methods (public)
- `PUT /api/sites/:id/auth-methods` - Update method configuration (admin/manager only)

### Example: Enable RFID for a Site

```bash
curl -X PUT http://localhost:8000/api/sites/{site-id}/auth-methods \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "method_type": "rfid",
    "is_enabled": true
  }'
```

## Use Cases

### Scenario 1: Office with RFID Only
- **Site**: Main Office
- **Enabled Methods**: RFID, Name Search
- **Disabled**: Face Recognition (privacy concerns), PIN (not needed)

### Scenario 2: Warehouse with Face Recognition
- **Site**: Warehouse
- **Enabled Methods**: Face Recognition, RFID
- **Disabled**: Name Search (too slow), PIN

### Scenario 3: Remote Site with Manual Only
- **Site**: Remote Branch
- **Enabled Methods**: Name Search, PIN
- **Disabled**: Face Recognition (no camera), RFID (no readers)

## Default Configuration

When a new site is created, **all methods are disabled by default**. Site managers must explicitly enable the methods they want to use.

The default "Main Office" site has all methods enabled for backward compatibility.

## Migration

The database migration (`database/migrations/add_sites.sql`) automatically:
1. Creates the `sites` and `site_auth_methods` tables
2. Adds `site_id` columns to `employees` and `attendance_records`
3. Creates a default "Main Office" site with all methods enabled
4. Adds necessary indexes for performance

Run the migration:
```bash
docker exec -i checkin-postgres psql -U postgres -d checkin_db < database/migrations/add_sites.sql
```

## Frontend Integration

The Check-In page (`/checkin`) automatically:
- Fetches available sites
- Shows site selector (if multiple sites)
- Fetches enabled methods for selected site
- Displays only enabled authentication methods
- Remembers selected site in localStorage

## Best Practices

1. **Use Descriptive Site Codes**: Use clear codes like "MAIN", "WAREHOUSE", "BRANCH1"
2. **Enable Only Needed Methods**: Don't enable methods you don't have hardware for
3. **Test Configuration**: After changing methods, test check-in to ensure it works
4. **Document Site Settings**: Keep notes on why certain methods are enabled/disabled
5. **Regular Review**: Periodically review site configurations as needs change

## Troubleshooting

### No Methods Showing in Check-In
- Check if site has any enabled methods in Admin Panel
- Verify site is active (`is_active = true`)
- Check browser console for API errors

### Methods Not Updating
- Ensure you're logged in as admin or manager
- Check backend logs for errors
- Verify site ID is correct

### Site Not Appearing
- Check if site is active
- Verify user has permission to view sites
- Check database for site records

## Future Enhancements

- Site-specific settings (e.g., face recognition threshold per site)
- Site-based employee assignment
- Site-specific reporting
- Multi-site dashboard views
- Site access control/permissions

