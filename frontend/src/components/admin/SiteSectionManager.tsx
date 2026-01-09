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
  site_id: string;
  name: string;
  code: string;
  description: string | null;
  section_type: string;
  coordinates: any;
  capacity: number | null;
  is_active: boolean;
}

interface SiteSectionManagerProps {
  token?: string;
}

export default function SiteSectionManager({ token }: SiteSectionManagerProps) {
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [sections, setSections] = useState<SiteSection[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<SiteSection | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    section_type: 'room',
    capacity: '',
    coordinates: null as any,
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const authToken = token || localStorage.getItem('token');

  useEffect(() => {
    fetchSites();
  }, []);

  useEffect(() => {
    if (selectedSite) {
      fetchSections();
    }
  }, [selectedSite]);

  const fetchSites = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/sites`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setSites(response.data.sites || []);
      if (response.data.sites?.length > 0) {
        setSelectedSite(response.data.sites[0].id);
      }
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

  const handleOpenModal = (section?: SiteSection) => {
    if (section) {
      setEditingSection(section);
      setFormData({
        name: section.name,
        code: section.code,
        description: section.description || '',
        section_type: section.section_type,
        capacity: section.capacity?.toString() || '',
        coordinates: section.coordinates,
      });
    } else {
      setEditingSection(null);
      setFormData({
        name: '',
        code: '',
        description: '',
        section_type: 'room',
        capacity: '',
        coordinates: null,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        site_id: selectedSite,
        name: formData.name,
        code: formData.code,
        description: formData.description || null,
        section_type: formData.section_type,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        coordinates: formData.coordinates,
      };

      if (editingSection) {
        await axios.put(
          `${API_URL}/api/site-sections/${editingSection.id}`,
          payload,
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );
      } else {
        await axios.post(`${API_URL}/api/site-sections`, payload, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
      }

      setIsModalOpen(false);
      fetchSections();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to save section');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this section?')) return;

    try {
      await axios.delete(`${API_URL}/api/site-sections/${id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      fetchSections();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete section');
    }
  };

  const sectionTypes = [
    'room',
    'office',
    'warehouse',
    'cave',
    'area',
    'workshop',
    'lab',
    'meeting-room',
    'other',
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Site Sections Management</h2>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-smooth"
        >
          + Add Section
        </button>
      </div>

      {/* Site Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Site</label>
        <select
          value={selectedSite}
          onChange={(e) => setSelectedSite(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus-ring transition-smooth"
        >
          {sites.map((site) => (
            <option key={site.id} value={site.id}>
              {site.name} ({site.code})
            </option>
          ))}
        </select>
      </div>

      {/* Sections List */}
      <div className="space-y-4">
        {sections.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No sections found. Create one to get started.</p>
        ) : (
          sections.map((section) => (
            <div
              key={section.id}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{section.name}</h3>
                  <p className="text-sm text-gray-600">Code: {section.code}</p>
                  <p className="text-sm text-gray-600">Type: {section.section_type}</p>
                  {section.description && (
                    <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                  )}
                  {section.capacity && (
                    <p className="text-sm text-gray-600">Capacity: {section.capacity}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleOpenModal(section)}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(section.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 animate-scaleIn">
            <h3 className="text-xl font-bold mb-4">
              {editingSection ? 'Edit Section' : 'Add New Section'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus-ring"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section Code *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus-ring"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section Type
                </label>
                <select
                  value={formData.section_type}
                  onChange={(e) => setFormData({ ...formData, section_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus-ring"
                >
                  {sectionTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus-ring"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacity (optional)
                </label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus-ring"
                  min="1"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-smooth"
                >
                  {editingSection ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-smooth"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

