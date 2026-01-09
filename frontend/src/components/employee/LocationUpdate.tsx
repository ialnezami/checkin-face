'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Site {
  id: string;
  name: string;
  code: string;
}

interface SiteSection {
  id: string;
  name: string;
  code: string;
  section_type: string;
}

interface Location {
  id: string;
  site_id: string;
  section_id: string | null;
  site_name: string;
  section_name: string | null;
  section_code: string | null;
  location_type: string;
  notes: string | null;
  entered_at: string;
  is_current: boolean;
}

interface LocationUpdateProps {
  employeeId?: string;
  token?: string;
}

export default function LocationUpdate({ employeeId, token }: LocationUpdateProps) {
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [sections, setSections] = useState<SiteSection[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const authToken = token || localStorage.getItem('token');

  useEffect(() => {
    fetchSites();
    fetchCurrentLocation();
  }, []);

  useEffect(() => {
    if (selectedSite) {
      fetchSections();
    } else {
      setSections([]);
      setSelectedSection('');
    }
  }, [selectedSite]);

  const fetchSites = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/sites`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setSites(response.data.sites || []);
    } catch (error) {
      console.error('Error fetching sites:', error);
    }
  };

  const fetchSections = async () => {
    if (!selectedSite) return;

    try {
      const response = await axios.get(`${API_URL}/api/site-sections/site/${selectedSite}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setSections(response.data.sections || []);
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };

  const fetchCurrentLocation = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/employee-locations/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setCurrentLocation(response.data.location);
      if (response.data.location) {
        setSelectedSite(response.data.location.site_id);
      }
    } catch (error) {
      console.error('Error fetching location:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    if (!selectedSite) {
      setMessage('Please select a site');
      setIsSubmitting(false);
      return;
    }

    try {
      await axios.post(
        `${API_URL}/api/employee-locations`,
        {
          site_id: selectedSite,
          section_id: selectedSection || null,
          location_type: selectedSection ? 'section' : 'site',
          notes: notes || null,
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      setMessage('Location updated successfully!');
      setNotes('');
      fetchCurrentLocation();
    } catch (error: any) {
      setMessage(error.response?.data?.error || 'Failed to update location');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExitLocation = async () => {
    if (!currentLocation) return;

    try {
      await axios.post(
        `${API_URL}/api/employee-locations/exit/${currentLocation.id}`,
        {},
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      setCurrentLocation(null);
      setMessage('Location exited successfully!');
    } catch (error: any) {
      setMessage(error.response?.data?.error || 'Failed to exit location');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg animate-fadeIn">
      <h3 className="text-xl font-semibold mb-4">Update Your Location</h3>

      {/* Current Location Display */}
      {currentLocation && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-green-900">
                Current Location: {currentLocation.site_name}
              </p>
              {currentLocation.section_name && (
                <p className="text-sm text-green-700 mt-1">
                  Section: {currentLocation.section_name} ({currentLocation.section_code})
                </p>
              )}
              <p className="text-xs text-green-600 mt-1">
                Since: {new Date(currentLocation.entered_at).toLocaleString()}
              </p>
            </div>
            <button
              onClick={handleExitLocation}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
            >
              Exit Location
            </button>
          </div>
        </div>
      )}

      {/* Location Update Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Site *
          </label>
          <select
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus-ring transition-smooth"
            required
          >
            <option value="">-- Select Site --</option>
            {sites.map((site) => (
              <option key={site.id} value={site.id}>
                {site.name} ({site.code})
              </option>
            ))}
          </select>
        </div>

        {selectedSite && sections.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Section/Room (Optional)
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus-ring transition-smooth"
            >
              <option value="">-- No specific section --</option>
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.name} ({section.code}) - {section.section_type}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedSite && sections.length === 0 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
            No sections available for this site. You can still update your location to the site level.
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Working in the back area, Temporary relocation..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus-ring transition-smooth"
            rows={2}
          />
        </div>

        {message && (
          <div
            className={`p-3 rounded-lg ${
              message.includes('successfully')
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !selectedSite}
          className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-smooth focus-ring"
        >
          {isSubmitting ? 'Updating...' : 'Update Location'}
        </button>
      </form>
    </div>
  );
}

