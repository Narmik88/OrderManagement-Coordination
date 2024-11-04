import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { ORDER_TYPES, TASK_LISTS } from '../../types';
import { db } from '../../services/supabase';

interface Category {
  name: string;
  tasks: string[];
}

export const CategorySettings: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>(
    Object.entries(ORDER_TYPES).map(([_, value]) => ({
      name: value,
      tasks: TASK_LISTS[value as keyof typeof TASK_LISTS] || []
    }))
  );
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({ name: '', tasks: [''] });

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) return;
    
    const category: Category = {
      name: newCategory.name,
      tasks: newCategory.tasks.filter(task => task.trim())
    };

    setCategories([...categories, category]);
    setNewCategory({ name: '', tasks: [''] });
  };

  const handleDeleteCategory = async (categoryName: string) => {
    setCategories(categories.filter(c => c.name !== categoryName));
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
        return {
          ...category,
          tasks: category.tasks.filter((_, index) => index !== taskIndex)
        };
      }
      return category;
    }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Manage Categories</h2>

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
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
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