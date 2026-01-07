'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Site {
  id: string;
  name: string;
  code: string;
  address?: string;
  description?: string;
  is_active: boolean;
  authMethods?: SiteAuthMethod[];
}

interface SiteAuthMethod {
  id: string;
  method_type: 'face' | 'fingerprint' | 'rfid' | 'name_search' | 'pin';
  is_enabled: boolean;
  settings?: any;
}

const METHOD_LABELS: Record<string, string> = {
  face: 'Face Recognition',
  fingerprint: 'Fingerprint',
  rfid: 'RFID/NFC Tags',
  name_search: 'Name/ID Search',
  pin: 'PIN/Password',
};

export default function SiteManagement() {
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    description: '',
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/sites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSites(response.data.sites || []);
    } catch (error) {
      console.error('Error fetching sites:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSiteDetails = async (siteId: string) => {
    try {
      const response = await axios.get(`${API_URL}/api/sites/${siteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedSite(response.data);
    } catch (error) {
      console.error('Error fetching site details:', error);
    }
  };

  const handleCreateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/api/sites`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setShowForm(false);
      setFormData({ name: '', code: '', address: '', description: '' });
      fetchSites();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error creating site');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMethod = async (siteId: string, methodType: string, currentEnabled: boolean) => {
    try {
      await axios.put(
        `${API_URL}/api/sites/${siteId}/auth-methods`,
        {
          method_type: methodType,
          is_enabled: !currentEnabled,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (selectedSite?.id === siteId) {
        fetchSiteDetails(siteId);
      }
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error updating method');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Site Management</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          {showForm ? 'Cancel' : '+ Add Site'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreateSite} className="mb-6 p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Create New Site</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Site Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Site Code *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                required
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g., MAIN, BRANCH1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            Create Site
          </button>
        </form>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* Sites List */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Sites</h3>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : sites.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No sites found</div>
          ) : (
            <div className="space-y-2">
              {sites.map((site) => (
                <div
                  key={site.id}
                  onClick={() => {
                    setSelectedSite(site);
                    fetchSiteDetails(site.id);
                  }}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedSite?.id === site.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="font-semibold">{site.name}</div>
                  <div className="text-sm text-gray-600">Code: {site.code}</div>
                  {site.address && (
                    <div className="text-sm text-gray-500">{site.address}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Auth Methods Configuration */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Authentication Methods</h3>
          {!selectedSite ? (
            <div className="text-center py-8 text-gray-500">
              Select a site to configure authentication methods
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(METHOD_LABELS).map(([methodType, label]) => {
                const method = selectedSite.authMethods?.find(
                  (m) => m.method_type === methodType
                );
                const isEnabled = method?.is_enabled ?? false;

                return (
                  <div
                    key={methodType}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{label}</div>
                      <div className="text-sm text-gray-500">
                        {isEnabled ? 'Enabled' : 'Disabled'}
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={() =>
                          handleToggleMethod(selectedSite.id, methodType, isEnabled)
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                );
              })}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                <strong>Note:</strong> Only enabled methods will be available for check-in at this site.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

