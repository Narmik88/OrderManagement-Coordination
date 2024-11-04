import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { Department } from '../../types';
import { agentService } from '../../services/agents';
import { db } from '../../services/supabase';

interface Agent {
  name: string;
  email: string;
  extension: string;
  department: string;
}

export const AgentSettings: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [editingAgent, setEditingAgent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newAgent, setNewAgent] = useState<Agent>({
    name: '',
    email: '',
    extension: '',
    department: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const deps = await db.getAllDepartments();
      setDepartments(deps);
      
      // Extract agents from departments
      const allAgents = deps.flatMap(dept => 
        dept.agents.map(agent => ({
          name: agent.name,
          email: agent.email || '',
          extension: agent.extension || '',
          department: dept.name
        }))
      );
      setAgents(allAgents);
      setError(null);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load departments and agents');
    }
  };

  const handleAddAgent = async () => {
    if (!newAgent.name.trim() || !newAgent.email.trim() || !newAgent.department) return;

    try {
      await agentService.createAgent({
        name: newAgent.name,
        department_name: newAgent.department,
        email: newAgent.email,
        extension: newAgent.extension
      });

      await loadData(); // Reload data to get updated list
      setNewAgent({
        name: '',
        email: '',
        extension: '',
        department: ''
      });
      setError(null);
    } catch (err) {
      console.error('Failed to add agent:', err);
      setError('Failed to add agent');
    }
  };

  const handleUpdateAgent = async (agent: Agent) => {
    try {
      await agentService.updateAgent({
        name: agent.name,
        department_name: agent.department,
        email: agent.email,
        extension: agent.extension
      });

      await loadData(); // Reload data to get updated list
      setEditingAgent(null);
      setError(null);
    } catch (err) {
      console.error('Failed to update agent:', err);
      setError('Failed to update agent');
    }
  };

  const handleDeleteAgent = async (agentName: string) => {
    try {
      await agentService.deleteAgent(agentName);
      await loadData(); // Reload data to get updated list
      setError(null);
    } catch (err) {
      console.error('Failed to delete agent:', err);
      setError('Failed to delete agent');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Manage Agents</h2>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          value={newAgent.name}
          onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
          placeholder="Name"
          className="rounded-lg border border-gray-300 px-4 py-2"
        />
        <input
          type="email"
          value={newAgent.email}
          onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
          placeholder="Email"
          className="rounded-lg border border-gray-300 px-4 py-2"
        />
        <input
          type="text"
          value={newAgent.extension}
          onChange={(e) => setNewAgent({ ...newAgent, extension: e.target.value })}
          placeholder="Extension"
          className="rounded-lg border border-gray-300 px-4 py-2"
        />
        <select
          value={newAgent.department}
          onChange={(e) => setNewAgent({ ...newAgent, department: e.target.value })}
          className="rounded-lg border border-gray-300 px-4 py-2"
        >
          <option value="">Select Department</option>
          {departments.map((dept) => (
            <option key={dept.name} value={dept.name}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleAddAgent}
        disabled={!newAgent.name.trim() || !newAgent.email.trim() || !newAgent.department}
        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus className="w-5 h-5 mr-2" />
        Add Agent
      </button>

      <div className="space-y-4">
        {agents.map((agent) => (
          <div key={agent.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            {editingAgent === agent.name ? (
              <div className="flex-1 grid grid-cols-2 gap-4">
                <input
                  type="email"
                  value={agent.email}
                  onChange={(e) => setAgents(agents.map(a => 
                    a.name === agent.name ? { ...a, email: e.target.value } : a
                  ))}
                  className="rounded-lg border border-gray-300 px-4 py-2"
                />
                <input
                  type="text"
                  value={agent.extension}
                  onChange={(e) => setAgents(agents.map(a => 
                    a.name === agent.name ? { ...a, extension: e.target.value } : a
                  ))}
                  className="rounded-lg border border-gray-300 px-4 py-2"
                />
                <select
                  value={agent.department}
                  onChange={(e) => setAgents(agents.map(a => 
                    a.name === agent.name ? { ...a, department: e.target.value } : a
                  ))}
                  className="rounded-lg border border-gray-300 px-4 py-2"
                >
                  {departments.map((dept) => (
                    <option key={dept.name} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateAgent(agent)}
                    className="text-green-600 hover:text-green-700"
                  >
                    <Save className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setEditingAgent(null)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <h3 className="font-medium">{agent.name}</h3>
                  <p className="text-sm text-gray-600">{agent.email}</p>
                  <p className="text-sm text-gray-600">Ext: {agent.extension}</p>
                  <p className="text-sm text-gray-600">Dept: {agent.department}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingAgent(agent.name)}
                    className="text-indigo-600 hover:text-indigo-700"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteAgent(agent.name)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};