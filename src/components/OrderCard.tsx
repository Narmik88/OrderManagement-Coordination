import React, { useState } from 'react';
import { User, Edit2, Save, X, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { Order, TaskItem } from '../types';

interface Props {
  order: Order;
  onAssign?: (agentName: string) => void;
  onCompleteTask?: (taskId: string) => void;
  onUpdateDetails?: (details: { invoiceNumber?: string; note?: string; priority?: 'low' | 'medium' | 'high' }) => void;
  onDelete?: () => void;
  agents?: { name: string }[];
  showChecklist?: boolean;
  onToggleChecklist?: () => void;
}

export const OrderCard: React.FC<Props> = ({ 
  order, 
  onAssign, 
  onCompleteTask, 
  onUpdateDetails,
  onDelete,
  agents = [],
  showChecklist = false,
  onToggleChecklist
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState(order.details?.invoiceNumber || '');
  const [note, setNote] = useState(order.details?.note || '');
  const [priority, setPriority] = useState(order.priority);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const completedTasks = order.tasks.filter(task => task.completed).length;
  const totalTasks = order.tasks.length;
  const completionPercentage = Math.round((completedTasks / totalTasks) * 100);

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  };

  const validateDetails = () => {
    const newErrors: Record<string, string> = {};

    if (invoiceNumber && !/^\d{5,12}$/.test(invoiceNumber)) {
      newErrors.invoiceNumber = 'Invoice number must be between 5 and 12 digits';
    }

    if (note && note.length > 128) {
      newErrors.note = 'Note must be less than 128 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateDetails()) return;

    onUpdateDetails?.({
      invoiceNumber: invoiceNumber || undefined,
      note: note || undefined,
      priority
    });
    setIsEditing(false);
  };

  const handlePriorityChange = (newPriority: 'low' | 'medium' | 'high') => {
    setPriority(newPriority);
    onUpdateDetails?.({ priority: newPriority });
  };

  const handleTaskComplete = (taskId: string) => {
    onCompleteTask?.(taskId);
  };

  const handleAssign = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const agentName = e.target.value;
    if (agentName && onAssign) {
      onAssign(agentName);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-800">{order.title}</h3>
        <div className="flex items-center gap-2">
          {order.status !== 'completed' ? (
            <select
              value={priority}
              onChange={(e) => handlePriorityChange(e.target.value as 'low' | 'medium' | 'high')}
              className="text-xs px-2 py-1 rounded-full border border-gray-300 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="low" className="bg-green-100 text-green-800">Low</option>
              <option value="medium" className="bg-yellow-100 text-yellow-800">Medium</option>
              <option value="high" className="bg-red-100 text-red-800">High</option>
            </select>
          ) : (
            <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[order.priority]}`}>
              {order.priority}
            </span>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="text-red-600 hover:text-red-700"
              title="Delete order"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {order.details && (
        <div className="mb-4 space-y-2 text-sm">
          <p><strong>Customer:</strong> {order.details.customerName}</p>
          <p><strong>Ticket:</strong> {order.details.ticketNumber}</p>
          
          {!isEditing ? (
            <>
              {order.details.invoiceNumber && (
                <p><strong>Invoice:</strong> {order.details.invoiceNumber}</p>
              )}
              {order.details.note && (
                <p><strong>Note:</strong> {order.details.note}</p>
              )}
              {(order.status === 'unassigned' || order.status === 'in-progress') && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-indigo-600 hover:text-indigo-700 flex items-center"
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edit Details
                </button>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Invoice Number
                </label>
                <input
                  type="text"
                  pattern="\d{5,12}"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="Enter 5-12 digit number"
                />
                {errors.invoiceNumber && (
                  <p className="text-red-500 text-xs mt-1">{errors.invoiceNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Note
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={128}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                {errors.note && (
                  <p className="text-red-500 text-xs mt-1">{errors.note}</p>
                )}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  className="text-green-600 hover:text-green-700 flex items-center"
                >
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-red-600 hover:text-red-700 flex items-center"
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {(order.status === 'unassigned' || order.status === 'in-progress') && agents.length > 0 && (
        <div className="mb-4">
          <select
            value={order.assignedTo || ''}
            onChange={handleAssign}
            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Assign to agent...</option>
            {agents.map((agent) => (
              <option key={agent.name} value={agent.name}>
                {agent.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm text-gray-600">
            Progress: {completionPercentage}%
          </div>
          <button
            onClick={onToggleChecklist}
            className="text-indigo-600 hover:text-indigo-700 flex items-center text-sm"
          >
            {showChecklist ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1" />
                Hide Checklist
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-1" />
                Show Checklist
              </>
            )}
          </button>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {showChecklist && (
        <div className="space-y-2">
          {order.tasks?.map((task) => (
            <div key={task.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleTaskComplete(task.id)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <span className={`${task.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                {task.text}
              </span>
              {task.completed && task.completedAt && (
                <span className="text-xs text-gray-500">
                  {new Date(task.completedAt).toLocaleString()}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500">
        <p>Created: {new Date(order.createdAt).toLocaleString()}</p>
        {order.completedAt && (
          <p>Completed: {new Date(order.completedAt).toLocaleString()}</p>
        )}
      </div>
    </div>
  );
};