import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { Department } from '../../types';
import { db } from '../../services/supabase';

export const DepartmentSettings: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [editingDept, setEditingDept] = useState<string | null>(null);
  const [newDeptName, setNewDeptName] = useState('');

  const handleAddDepartment = async () => {
    if (!newDeptName.trim()) return;
    
    const newDept: Department = {
      name: newDeptName,
      agents: []
    };

    await db.saveDepartments([...departments, newDept]);
    setDepartments([...departments, newDept]);
    setNewDeptName('');
  };

  const handleDeleteDepartment = async (deptName: string) => {
    const updatedDepts = departments.filter(d => d.name !== deptName);
    await db.saveDepartments(updatedDepts);
    setDepartments(updatedDepts);
  };

  const handleUpdateDepartment = async (oldName: string, newName: string) => {
    const updatedDepts = departments.map(dept =>
      dept.name === oldName ? { ...dept, name: newName } : dept
    );
    await db.saveDepartments(updatedDepts);
    setDepartments(updatedDepts);
    setEditingDept(null);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Manage Departments</h2>

      <div className="flex gap-2">
        <input
          type="text"
          value={newDeptName}
          onChange={(e) => setNewDeptName(e.target.value)}
          placeholder="New department name"
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2"
        />
        <button
          onClick={handleAddDepartment}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Department
        </button>
      </div>

      <div className="space-y-4">
        {departments.map((dept) => (
          <div key={dept.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            {editingDept === dept.name ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={dept.name}
                  onChange={(e) => {
                    const updatedDepts = departments.map(d =>
                      d.name === dept.name ? { ...d, name: e.target.value } : d
                    );
                    setDepartments(updatedDepts);
                  }}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2"
                />
                <button
                  onClick={() => handleUpdateDepartment(dept.name, dept.name)}
                  className="text-green-600 hover:text-green-700"
                >
                  <Save className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setEditingDept(null)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <span className="font-medium">{dept.name}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingDept(dept.name)}
                    className="text-indigo-600 hover:text-indigo-700"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteDepartment(dept.name)}
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