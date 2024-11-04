import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { Department } from '../../types';
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
  const [newAgent, setNewAgent] = useState<Agent>({
    name: '',
    email: '',
    extension: '',
    department: ''
  });

  const handleAddAgent = async () => {
    if (!newAgent.name.trim() || !newAgent.email.trim() || !newAgent.department) return;

    const updatedDepts = departments.map(dept => {
      if (dept.name === newAgent.department) {
        return {
          ...dept,
          agents: [...dept.agents, { 
            name: newAgent.name,
            completedOrders: 0,
            totalOrders: 0
          }]
        };
      }
      return dept;
    });

    await db.saveDepartments(updatedDepts);
    setDepartments(updatedDepts);
    setAgents([...agents, newAgent]);
    setNewAgent({
      name: '',
      email: '',
      extension: '',
      department: ''
    });
  };

  const handleDeleteAgent = async (agentName: string) => {
    const agent = agents.find(a => a.name === agentName);
    if (!agent) return;

    const updatedDepts = departments.map(dept => {
      if (dept.name === agent.department) {
        return {
          ...dept,
          agents: dept.agents.filter(a => a.name !== agentName)
        };
      }
      return dept;
    });

    await db.saveDepartments(updatedDepts);
    setDepartments(updatedDepts);
    setAgents(agents.filter(a => a.name !== agentName));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Manage Agents</h2>

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
        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
      >
        <Plus className="w-5 h-5 mr-2" />
        Add Agent
      </button>

      <div className="space-y-4">
        {agents.map((agent) => (
          <div key={agent.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
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
          </div>
        ))}
      </div>
    </div>
  );
};