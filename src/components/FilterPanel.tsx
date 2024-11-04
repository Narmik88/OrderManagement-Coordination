import React from 'react';
import { Filter } from 'lucide-react';

interface FilterState {
  customerName: string;
  assignedTo: string;
  createdWithin: string;
  closedAfter: string;
  status: {
    unassigned: boolean;
    inProgress: boolean;
    completed: boolean;
  };
  priority: string[];
}

interface FilterPanelProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  agents: { name: string }[];
}

const timeFrameOptions = [
  { value: 'all', label: 'All Time' },
  { value: '1h', label: 'Last 1 Hour' },
  { value: '12h', label: 'Last 12 Hours' },
  { value: '24h', label: 'Last 24 Hours' },
  { value: '3d', label: 'Last 3 Days' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '15d', label: 'Last 15 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '45d', label: 'Last 45 Days' },
  { value: '60d', label: 'Last 60 Days' },
  { value: '6m', label: 'Last 6 Months' },
  { value: '12m', label: 'Last 12 Months' },
  { value: '24m', label: 'Last 24 Months' }
];

const closedAfterOptions = [
  { value: '', label: 'Any Time' },
  { value: '1h', label: '1 Hour' },
  { value: '12h', label: '12 Hours' },
  { value: '24h', label: '24 Hours' },
  { value: '3d', label: '3 Days' },
  { value: '7d', label: '7 Days' },
  { value: '15d', label: '15 Days' },
  { value: '30d', label: '30 Days' },
  { value: '45d', label: '45 Days' },
  { value: '60d', label: '60 Days' },
  { value: '6m', label: '6 Months' },
  { value: '12m', label: '12 Months' }
];

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  setFilters,
  agents
}) => {
  const handleStatusChange = (status: keyof typeof filters.status) => {
    setFilters(prev => ({
      ...prev,
      status: {
        ...prev.status,
        [status]: !prev.status[status]
      }
    }));
  };

  const handlePriorityChange = (priority: string) => {
    setFilters(prev => ({
      ...prev,
      priority: prev.priority.includes(priority)
        ? prev.priority.filter(p => p !== priority)
        : [...prev.priority, priority]
    }));
  };

  return (
    <div className="w-80 bg-white rounded-lg shadow-md p-4 h-fit">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-semibold">Filters</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer Name
          </label>
          <input
            type="text"
            value={filters.customerName}
            onChange={(e) => setFilters(prev => ({ ...prev, customerName: e.target.value }))}
            placeholder="Filter by customer name..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assigned To
          </label>
          <select
            value={filters.assignedTo}
            onChange={(e) => setFilters(prev => ({ ...prev, assignedTo: e.target.value }))}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Any Agent</option>
            {agents.map(agent => (
              <option key={agent.name} value={agent.name}>
                {agent.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Created Within
          </label>
          <select
            value={filters.createdWithin}
            onChange={(e) => setFilters(prev => ({ ...prev, createdWithin: e.target.value }))}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {timeFrameOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Closed After
          </label>
          <select
            value={filters.closedAfter}
            onChange={(e) => setFilters(prev => ({ ...prev, closedAfter: e.target.value }))}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {closedAfterOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.status.unassigned}
                onChange={() => handleStatusChange('unassigned')}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-600">Unassigned</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.status.inProgress}
                onChange={() => handleStatusChange('inProgress')}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-600">In Progress</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.status.completed}
                onChange={() => handleStatusChange('completed')}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-600">Completed</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.priority.includes('low')}
                onChange={() => handlePriorityChange('low')}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-600">Low</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.priority.includes('medium')}
                onChange={() => handlePriorityChange('medium')}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-600">Medium</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.priority.includes('high')}
                onChange={() => handlePriorityChange('high')}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-600">High</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};