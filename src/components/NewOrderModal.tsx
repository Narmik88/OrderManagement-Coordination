import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { Order, OrderDetails, TaskItem, TASK_LISTS } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (order: Omit<Order, 'id'>) => void;
  orderType: string;
}

export const NewOrderModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, orderType }) => {
  const [details, setDetails] = useState<OrderDetails>({
    customerName: '',
    ticketNumber: '',
  });

  const [customTasks, setCustomTasks] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setDetails({
        customerName: '',
        ticketNumber: '',
      });
      setCustomTasks([]);
      setErrors({});
    }
  }, [isOpen, orderType]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!details.customerName || details.customerName.length > 32) {
      newErrors.customerName = 'Customer name is required and must be less than 32 characters';
    }

    if (!details.ticketNumber || !/^\d{5}$/.test(details.ticketNumber)) {
      newErrors.ticketNumber = 'Ticket number must be exactly 5 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const baseTasks = TASK_LISTS[orderType as keyof typeof TASK_LISTS] || [];
    const allTasks: TaskItem[] = [...baseTasks, ...customTasks].map((text, index) => ({
      id: `task-${index}`,
      text,
      completed: false
    }));

    const newOrder: Omit<Order, 'id'> = {
      title: `${orderType} - ${details.customerName}`,
      type: orderType,
      status: 'unassigned',
      createdAt: new Date().toISOString(),
      priority: 'medium',
      details,
      tasks: allTasks,
      assignedTo: undefined,
      completedAt: undefined
    };

    onSubmit(newOrder);
    onClose();
  };

  const addCustomTask = () => {
    setCustomTasks([...customTasks, '']);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">New {orderType} Order</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Customer Name *
              </label>
              <input
                type="text"
                maxLength={32}
                value={details.customerName}
                onChange={(e) => setDetails({ ...details, customerName: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              {errors.customerName && (
                <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Ticket Number *
              </label>
              <input
                type="text"
                pattern="\d{5}"
                value={details.ticketNumber}
                onChange={(e) => setDetails({ ...details, ticketNumber: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              {errors.ticketNumber && (
                <p className="text-red-500 text-sm mt-1">{errors.ticketNumber}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-gray-700">Tasks</h3>
            <div className="space-y-2">
              {TASK_LISTS[orderType as keyof typeof TASK_LISTS]?.map((task, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input type="checkbox" disabled className="rounded" />
                  <span>{task}</span>
                </div>
              ))}
              {customTasks.map((task, index) => (
                <div key={`custom-${index}`} className="flex items-center space-x-2">
                  <input type="checkbox" disabled className="rounded" />
                  <input
                    type="text"
                    value={task}
                    onChange={(e) => {
                      const newTasks = [...customTasks];
                      newTasks[index] = e.target.value;
                      setCustomTasks(newTasks);
                    }}
                    placeholder="Custom task"
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addCustomTask}
              className="flex items-center text-indigo-600 hover:text-indigo-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Custom Task
            </button>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Create Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};