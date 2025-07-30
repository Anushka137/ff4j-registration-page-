import React, { useState } from 'react';
import { Plus, Edit, Trash2, X, Check, ToggleLeft, ToggleRight, Flag } from 'lucide-react';

// Define the structure for a single feature flag
interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
}

// Initial mock data for the feature flags
const initialFlags: FeatureFlag[] = [
  { id: '1', name: 'New User Dashboard', description: 'Enables the redesigned user dashboard.', isEnabled: true },
  { id: '2', name: 'Dark Mode', description: 'Allows users to switch to a dark theme.', isEnabled: false },
  { id: '3', name: 'Beta Feature X', description: 'A new experimental feature for testing.', isEnabled: true },
];

// The main App component that renders the dashboard
function App(): JSX.Element {
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>(initialFlags);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);

  // --- CRUD and State Functions ---

  const handleToggleFlag = (id: string): void => {
    setFeatureFlags(flags =>
      flags.map(flag =>
        flag.id === id ? { ...flag, isEnabled: !flag.isEnabled } : flag
      )
    );
  };

  const handleDeleteFlag = (id: string): void => {
    if (window.confirm('Are you sure you want to delete this feature flag?')) {
      setFeatureFlags(flags => flags.filter(flag => flag.id !== id));
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
      setFeatureFlags(flags =>
        flags.map(flag => (flag.id === flagToSave.id ? flagToSave : flag))
      );
    } else {
      // Adding new flag
      setFeatureFlags(flags => [
        ...flags,
        { ...flagToSave, id: new Date().toISOString() }, // Assign a unique ID
      ]);
    }
    handleCloseModal();
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Flag className="w-8 h-8 mr-3 text-blue-600" />
            Feature Flag Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Manage features and rollouts for your application.</p>
        </header>

        <div className="bg-white rounded-lg shadow-md">
          <div className="p-4 border-b border-gray-200 flex justify-end">
            <button
              onClick={() => handleOpenModal(null)}
              className="flex items-center bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Feature
            </button>
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
