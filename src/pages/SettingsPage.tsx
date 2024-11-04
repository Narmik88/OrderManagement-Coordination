import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DepartmentSettings } from '../components/settings/DepartmentSettings';
import { AgentSettings } from '../components/settings/AgentSettings';
import { CategorySettings } from '../components/settings/CategorySettings';
import { DatabaseExport } from '../components/settings/DatabaseExport';
import { Layout } from '../components/Layout';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('departments');
  const navigate = useNavigate();

  const handleSave = async () => {
    // Save all changes
    navigate('/');
  };

  const handleDashboard = () => {
    navigate('/');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Settings</h1>
            <div className="space-x-4">
              <button
                onClick={handleDashboard}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="w-64 space-y-2">
              <button
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'departments' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('departments')}
              >
                Departments
              </button>
              <button
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'agents' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('agents')}
              >
                Agents
              </button>
              <button
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'categories' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('categories')}
              >
                Sub-categories
              </button>
              <button
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'database' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('database')}
              >
                Download Database
              </button>
            </div>

            <div className="flex-1">
              {activeTab === 'departments' && <DepartmentSettings />}
              {activeTab === 'agents' && <AgentSettings />}
              {activeTab === 'categories' && <CategorySettings />}
              {activeTab === 'database' && <DatabaseExport />}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};