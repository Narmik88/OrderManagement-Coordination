import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { ORDER_TYPES, TASK_LISTS } from '../../types';
import { db } from '../../services/supabase';

interface Category {
  name: string;
  tasks: string[];
}

export const CategorySettings: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({ name: '', tasks: [''] });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    const initialCategories = Object.entries(ORDER_TYPES).map(([_, value]) => ({
      name: value,
      tasks: TASK_LISTS[value as keyof typeof TASK_LISTS] || []
    }));
    setCategories(initialCategories);
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) return;
    
    try {
      const category: Category = {
        name: newCategory.name,
        tasks: newCategory.tasks.filter(task => task.trim())
      };

      // Update ORDER_TYPES and TASK_LISTS
      (ORDER_TYPES as any)[newCategory.name.toUpperCase().replace(/\s+/g, '_')] = newCategory.name;
      (TASK_LISTS as any)[newCategory.name] = category.tasks;

      setCategories([...categories, category]);
      setNewCategory({ name: '', tasks: [''] });
      setError(null);
    } catch (err) {
      console.error('Failed to add category:', err);
      setError('Failed to add category');
    }
  };

  const handleDeleteCategory = async (categoryName: string) => {
    try {
      setCategories(categories.filter(c => c.name !== categoryName));
      
      // Remove from ORDER_TYPES and TASK_LISTS
      const typeKey = Object.keys(ORDER_TYPES).find(
        key => (ORDER_TYPES as any)[key] === categoryName
      );
      if (typeKey) {
        delete (ORDER_TYPES as any)[typeKey];
        delete (TASK_LISTS as any)[categoryName];
      }
      
      setError(null);
    } catch (err) {
      console.error('Failed to delete category:', err);
      setError('Failed to delete category');
    }
  };

  const handleAddTask = (categoryName: string) => {
    setCategories(categories.map(category => {
      if (category.name === categoryName) {
        return {
          ...category,
          tasks: [...category.tasks, '']
        };
      }
      return category;
    }));
  };

  const handleUpdateTask = (categoryName: string, taskIndex: number, newValue: string) => {
    setCategories(categories.map(category => {
      if (category.name === categoryName) {
        const newTasks = [...category.tasks];
        newTasks[taskIndex] = newValue;
        
        // Update TASK_LISTS
        (TASK_LISTS as any)[categoryName] = newTasks;
        
        return {
          ...category,
          tasks: newTasks
        };
      }
      return category;
    }));
  };

  const handleDeleteTask = (categoryName: string, taskIndex: number) => {
    setCategories(categories.map(category => {
      if (category.name === categoryName) {
        const newTasks = category.tasks.filter((_, index) => index !== taskIndex);
        
        // Update TASK_LISTS
        (TASK_LISTS as any)[categoryName] = newTasks;
        
        return {
          ...category,
          tasks: newTasks
        };
      }
      return category;
    }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Manage Categories</h2>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newCategory.name}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            placeholder="New category name"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2"
          />
          <button
            onClick={handleAddCategory}
            disabled={!newCategory.name.trim()}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Category
          </button>
        </div>

        {categories.map((category) => (
          <div key={category.name} className="bg-gray-50 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{category.name}</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAddTask(category.name)}
                  className="text-indigo-600 hover:text-indigo-700"
                >
                  <Plus className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.name)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {category.tasks.map((task, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={task}
                    onChange={(e) => handleUpdateTask(category.name, index, e.target.value)}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2"
                  />
                  <button
                    onClick={() => handleDeleteTask(category.name, index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};