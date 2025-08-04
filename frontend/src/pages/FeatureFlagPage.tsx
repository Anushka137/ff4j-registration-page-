import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Check, ToggleLeft, ToggleRight, Flag, AlertCircle } from 'lucide-react';

// Define the structure for a single feature flag
interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
}

// Mock user data (in a real app, this would come from authentication)
const currentUser = {
  username: 'Anushka Shrivastava',
  email: 'anushka.s.0711@gmail.com'
};

// The main App component that renders the dashboard
function App(): JSX.Element {
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  // Load feature flags from backend and set up periodic refresh
  useEffect(() => {
    fetchFeatureFlags();
    
    // Set up periodic refresh every 30 seconds to check for approved changes
    const interval = setInterval(() => {
      fetchFeatureFlags();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchFeatureFlags = async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch('/api/feature-flags');
      if (response.ok) {
        const flags = await response.json();
        setFeatureFlags(flags);
        setLastUpdate(new Date().toLocaleTimeString());
      } else {
        console.error('Failed to fetch feature flags');
      }
    } catch (error) {
      console.error('Error fetching feature flags:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const requestFeatureChange = async (action: string, flagData?: any) => {
    try {
      const response = await fetch('/api/request-feature-change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          flagData,
          username: currentUser.username,
          email: currentUser.email
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setMessage(result.message + ' - You will receive an email when the manager approves or denies your request.');
        setIsError(false);
        // Show success message
        setTimeout(() => setMessage(''), 8000);
      } else {
        const error = await response.json();
        setMessage(error.message || 'Failed to submit request');
        setIsError(true);
      }
    } catch (error) {
      console.error('Error requesting feature change:', error);
      setMessage('Failed to submit request');
      setIsError(true);
    }
  };

  // --- CRUD and State Functions ---

  const handleToggleFlag = (id: string): void => {
    const flag = featureFlags.find(f => f.id === id);
    if (flag) {
      requestFeatureChange('toggle', { id, name: flag.name });
    }
  };

  const handleDeleteFlag = (id: string): void => {
    const flag = featureFlags.find(f => f.id === id);
    if (flag && window.confirm('Are you sure you want to delete this feature flag?')) {
      requestFeatureChange('delete', { id, name: flag.name });
    }
  };

  const handleOpenModal = (flag: FeatureFlag | null): void => {
    setEditingFlag(flag);
    setIsModalOpen(true);
  };

  const handleCloseModal = (): void => {
    setIsModalOpen(false);
    setEditingFlag(null);
  };

  const handleSaveFlag = (flagToSave: FeatureFlag): void => {
    if (flagToSave.id) {
      // Editing existing flag
      requestFeatureChange('edit', flagToSave);
    } else {
      // Adding new flag
      requestFeatureChange('add', flagToSave);
    }
    handleCloseModal();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading feature flags...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Flag className="w-8 h-8 mr-3 text-blue-600" />
            Feature Flag Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Manage features and rollouts for your application.</p>
          {message && (
            <div className={`mt-4 p-4 rounded-lg flex items-center ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              <AlertCircle className="w-5 h-5 mr-2" />
              {message}
            </div>
          )}
        </header>

        <div className="bg-white rounded-lg shadow-md">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <strong>Note:</strong> All changes require manager approval
              {lastUpdate && (
                <span className="ml-4 text-xs text-gray-500">
                  Last updated: {lastUpdate}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchFeatureFlags}
                disabled={isRefreshing}
                className={`flex items-center font-semibold py-2 px-3 rounded-lg transition-colors duration-200 ${
                  isRefreshing 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isRefreshing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-1"></div>
                ) : (
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              <button
                onClick={() => handleOpenModal(null)}
                className="flex items-center bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add New Feature
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4 font-semibold text-sm text-gray-600">Feature Flag</th>
                  <th className="p-4 font-semibold text-sm text-gray-600">Status</th>
                  <th className="p-4 font-semibold text-sm text-gray-600">Description</th>
                  <th className="p-4 font-semibold text-sm text-gray-600 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {featureFlags.map(flag => (
                  <tr key={flag.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-900">{flag.name}</td>
                    <td className="p-4">
                      <button onClick={() => handleToggleFlag(flag.id)} className="flex items-center cursor-pointer">
                        {flag.isEnabled ? (
                          <ToggleRight className="w-10 h-10 text-green-500" />
                        ) : (
                          <ToggleLeft className="w-10 h-10 text-gray-400" />
                        )}
                        <span className={`ml-2 text-sm font-semibold ${flag.isEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                          {flag.isEnabled ? 'ON' : 'OFF'}
                        </span>
                      </button>
                    </td>
                    <td className="p-4 text-gray-600 max-w-sm">{flag.description}</td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center items-center space-x-2">
                        <button onClick={() => handleOpenModal(flag)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors">
                          <Edit className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDeleteFlag(flag.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-full transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <FeatureFlagModal
          flag={editingFlag}
          onClose={handleCloseModal}
          onSave={handleSaveFlag}
        />
      )}
    </div>
  );
}


// --- Modal Component for Adding/Editing ---
interface ModalProps {
  flag: FeatureFlag | null;
  onClose: () => void;
  onSave: (flag: FeatureFlag) => void;
}

function FeatureFlagModal({ flag, onClose, onSave }: ModalProps): JSX.Element {
  const [formData, setFormData] = useState<FeatureFlag>(
    flag || { id: '', name: '', description: '', isEnabled: false }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (formData.name.trim()) {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-bold">{flag ? 'Edit Feature Flag' : 'Add New Feature Flag'}</h2>
            <button type="button" onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Feature Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., New Checkout Flow"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Describe what this feature does..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="p-4 bg-gray-50 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">
              Cancel
            </button>
            <button type="submit" className="py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
              <Check className="w-5 h-5 inline-block mr-1" />
              {flag ? 'Save Changes' : 'Add Feature'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
