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
        <div className="text-center animate-fadeIn">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-4 md:py-8">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 animate-fadeIn">
          Employee Check-In
        </h1>

        {/* Site Selection */}
        {sites.length > 1 && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow-md animate-slideIn">
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Select Site:
            </label>
            <select
              value={selectedSite?.id || ''}
              onChange={(e) => handleSiteChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus-ring transition-smooth"
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
          <div className="mb-6 text-center text-sm text-gray-600 animate-fadeIn">
            Current Site: <strong className="text-blue-600">{selectedSite.name}</strong>
          </div>
        )}

        {checkInSuccess && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg text-center animate-scaleIn shadow-md">
            <div className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {checkInSuccess}
            </div>
          </div>
        )}

        {!selectedMethod ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {isMethodEnabled('face') && (
              <button
                onClick={() => setSelectedMethod('face')}
                className="p-6 md:p-8 bg-white rounded-lg shadow-lg hover-lift text-center animate-scaleIn focus-ring transition-smooth"
                style={{ animationDelay: '0.1s' }}
              >
                <div className="text-4xl md:text-5xl mb-4">👤</div>
                <h2 className="text-lg md:text-xl font-semibold mb-2 text-gray-800">
                  Face Recognition
                </h2>
                <p className="text-sm md:text-base text-gray-600">
                  Check in using facial recognition
                </p>
              </button>
            )}

            {isMethodEnabled('rfid') && (
              <button
                onClick={() => setSelectedMethod('rfid')}
                className="p-6 md:p-8 bg-white rounded-lg shadow-lg hover-lift text-center animate-scaleIn focus-ring transition-smooth"
                style={{ animationDelay: '0.2s' }}
              >
                <div className="text-4xl md:text-5xl mb-4">📱</div>
                <h2 className="text-lg md:text-xl font-semibold mb-2 text-gray-800">
                  RFID/NFC Tag
                </h2>
                <p className="text-sm md:text-base text-gray-600">
                  Tap your RFID or NFC card
                </p>
              </button>
            )}

            {isMethodEnabled('manual') && (
              <button
                onClick={() => setSelectedMethod('manual')}
                className="p-6 md:p-8 bg-white rounded-lg shadow-lg hover-lift text-center animate-scaleIn focus-ring transition-smooth"
                style={{ animationDelay: '0.3s' }}
              >
                <div className="text-4xl md:text-5xl mb-4">🔍</div>
                <h2 className="text-lg md:text-xl font-semibold mb-2 text-gray-800">
                  Name/ID Search
                </h2>
                <p className="text-sm md:text-base text-gray-600">
                  Search by name or employee ID
                </p>
              </button>
            )}

            {enabledMethods.length === 0 && selectedSite && (
              <div className="col-span-1 md:col-span-3 p-6 md:p-8 bg-yellow-50 border border-yellow-200 rounded-lg text-center animate-scaleIn">
                <p className="text-yellow-800 mb-4 text-sm md:text-base">
                  No authentication methods are enabled for this site ({selectedSite.name}). 
                  Please contact your administrator.
                </p>
                {sites.length > 1 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Or select a different site:</p>
                    <select
                      value={selectedSite.id}
                      onChange={(e) => handleSiteChange(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus-ring transition-smooth"
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
          <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 animate-slideIn">
            <button
              onClick={() => setSelectedMethod(null)}
              className="mb-4 text-blue-500 hover:text-blue-700 transition-colors flex items-center focus-ring rounded px-2 py-1"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Method Selection
            </button>

            <div className="animate-fadeIn">
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
          </div>
        )}
      </div>
    </div>
  );
}
