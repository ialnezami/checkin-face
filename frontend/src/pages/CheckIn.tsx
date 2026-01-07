'use client';

import { useState, useEffect } from 'react';
import FaceRecognition from '@/components/auth/FaceRecognition';
import NameSearch from '@/components/auth/NameSearch';
import RFIDScanner from '@/components/auth/RFIDScanner';
import axios from 'axios';

type AuthMethod = 'face' | 'rfid' | 'manual';

interface Site {
  id: string;
  name: string;
  code: string;
}

export default function CheckInPage() {
  const [selectedMethod, setSelectedMethod] = useState<AuthMethod | null>(null);
  const [checkInSuccess, setCheckInSuccess] = useState<string | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [enabledMethods, setEnabledMethods] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchSites();
  }, []);

  useEffect(() => {
    if (selectedSite) {
      fetchEnabledMethods(selectedSite.id);
    }
  }, [selectedSite]);

  const fetchSites = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/sites`);
      const sitesList = response.data.sites || [];
      setSites(sitesList);
      
      // Find a site with enabled methods, or default to first site
      const savedSiteId = localStorage.getItem('selectedSiteId');
      let siteToSelect = savedSiteId 
        ? sitesList.find((s: Site) => s.id === savedSiteId)
        : null;
      
      // If saved site doesn't exist or has no methods, find one with methods
      if (siteToSelect) {
        try {
          const methodsResponse = await axios.get(`${API_URL}/api/sites/${siteToSelect.id}/enabled-methods`);
          const enabledMethods = methodsResponse.data.methods || [];
          if (enabledMethods.length === 0) {
            // Saved site has no methods, find another one
            siteToSelect = null;
          }
        } catch {
          // If we can't check methods, try to find a better site
          siteToSelect = null;
        }
      }
      
      // If no valid site selected, find first site with enabled methods
      if (!siteToSelect) {
        for (const site of sitesList) {
          try {
            const methodsResponse = await axios.get(`${API_URL}/api/sites/${site.id}/enabled-methods`);
            const enabledMethods = methodsResponse.data.methods || [];
            if (enabledMethods.length > 0) {
              siteToSelect = site;
              break;
            }
          } catch {
            continue;
          }
        }
      }
      
      // Fallback to first site if no site with methods found
      if (!siteToSelect && sitesList.length > 0) {
        siteToSelect = sitesList[0];
      }
      
      if (siteToSelect) {
        setSelectedSite(siteToSelect);
        localStorage.setItem('selectedSiteId', siteToSelect.id);
      }
    } catch (error) {
      console.error('Error fetching sites:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnabledMethods = async (siteId: string) => {
    try {
      const response = await axios.get(`${API_URL}/api/sites/${siteId}/enabled-methods`);
      setEnabledMethods(response.data.methods || []);
    } catch (error) {
      console.error('Error fetching enabled methods:', error);
      // Fallback to all methods if API fails
      setEnabledMethods(['face', 'rfid', 'name_search', 'pin']);
    }
  };

  const handleSiteChange = (siteId: string) => {
    const site = sites.find(s => s.id === siteId);
    if (site) {
      setSelectedSite(site);
      localStorage.setItem('selectedSiteId', siteId);
      setSelectedMethod(null); // Reset method selection
    }
  };

  const handleSuccess = (employeeId: string, employeeName: string) => {
    setCheckInSuccess(`Successfully checked in: ${employeeName}`);
    // Reset after 3 seconds
    setTimeout(() => {
      setCheckInSuccess(null);
      setSelectedMethod(null);
    }, 3000);
  };

  const handleError = (error: string) => {
    console.error('Check-in error:', error);
  };

  const isMethodEnabled = (method: string): boolean => {
    const methodMap: Record<string, string> = {
      face: 'face',
      rfid: 'rfid',
      manual: 'name_search', // Manual check-in uses name_search
    };
    return enabledMethods.includes(methodMap[method] || method);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-4">Employee Check-In</h1>

        {/* Site Selection */}
        {sites.length > 1 && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow">
            <label className="block text-sm font-medium mb-2">Select Site:</label>
            <select
              value={selectedSite?.id || ''}
              onChange={(e) => handleSiteChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name} ({site.code})
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedSite && (
          <div className="mb-6 text-center text-sm text-gray-600">
            Current Site: <strong>{selectedSite.name}</strong>
          </div>
        )}

        {checkInSuccess && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg text-center">
            {checkInSuccess}
          </div>
        )}

        {!selectedMethod ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {isMethodEnabled('face') && (
              <button
                onClick={() => setSelectedMethod('face')}
                className="p-8 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow text-center"
              >
                <div className="text-4xl mb-4">👤</div>
                <h2 className="text-xl font-semibold mb-2">Face Recognition</h2>
                <p className="text-gray-600">Check in using facial recognition</p>
              </button>
            )}

            {isMethodEnabled('rfid') && (
              <button
                onClick={() => setSelectedMethod('rfid')}
                className="p-8 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow text-center"
              >
                <div className="text-4xl mb-4">📱</div>
                <h2 className="text-xl font-semibold mb-2">RFID/NFC Tag</h2>
                <p className="text-gray-600">Tap your RFID or NFC card</p>
              </button>
            )}

            {isMethodEnabled('manual') && (
              <button
                onClick={() => setSelectedMethod('manual')}
                className="p-8 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow text-center"
              >
                <div className="text-4xl mb-4">🔍</div>
                <h2 className="text-xl font-semibold mb-2">Name/ID Search</h2>
                <p className="text-gray-600">Search by name or employee ID</p>
              </button>
            )}

            {enabledMethods.length === 0 && selectedSite && (
              <div className="col-span-3 p-8 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                <p className="text-yellow-800 mb-4">
                  No authentication methods are enabled for this site ({selectedSite.name}). Please contact your administrator.
                </p>
                {sites.length > 1 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Or select a different site:</p>
                    <select
                      value={selectedSite.id}
                      onChange={(e) => handleSiteChange(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      {sites.map((site) => (
                        <option key={site.id} value={site.id}>
                          {site.name} ({site.code})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <button
              onClick={() => setSelectedMethod(null)}
              className="mb-4 text-blue-500 hover:text-blue-700"
            >
              ← Back to Method Selection
            </button>

            {selectedMethod === 'face' && (
              <FaceRecognition
                mode="checkin"
                onSuccess={handleSuccess}
                onError={handleError}
              />
            )}

            {selectedMethod === 'rfid' && (
              <RFIDScanner
                onSuccess={handleSuccess}
                onError={handleError}
              />
            )}

            {selectedMethod === 'manual' && (
              <NameSearch
                onSuccess={handleSuccess}
                onError={handleError}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
