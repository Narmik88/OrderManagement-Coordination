import React, { useState, useMemo } from 'react';
import { Order } from '../types';
import { Clock, Loader, CheckCircle2, User, Search, SortAsc, SortDesc, Eye, EyeOff, Filter } from 'lucide-react';
import { OrderCard } from './OrderCard';
import { FilterPanel } from './FilterPanel';

interface OrderColumnsProps {
  orders: Order[];
  onAssignOrder?: (orderId: string, agentName: string) => void;
  onCompleteTask?: (orderId: string, taskId: string) => void;
  onUpdateDetails?: (orderId: string, details: { invoiceNumber?: string; note?: string; priority?: 'low' | 'medium' | 'high' }) => void;
  onDeleteOrder?: (orderId: string) => void;
  agents?: { name: string }[];
}

type SortOption = 'agent' | 'date' | 'time' | 'ticket';
type SortDirection = 'asc' | 'desc';
type SearchField = 'customer' | 'agent' | 'ticket';

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

const initialFilterState: FilterState = {
  customerName: '',
  assignedTo: '',
  createdWithin: 'all',
  closedAfter: '',
  status: {
    unassigned: true,
    inProgress: true,
    completed: true
  },
  priority: ['low', 'medium', 'high']
};

export const OrderColumns: React.FC<OrderColumnsProps> = ({
  orders = [],
  onAssignOrder,
  onCompleteTask,
  onUpdateDetails,
  onDeleteOrder,
  agents = []
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('ticket');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState<SearchField>('customer');
  const [showCompleted, setShowCompleted] = useState(false);
  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const toggleCardExpansion = (orderId: string) => {
    const newExpandedCards = new Set(expandedCards);
    if (newExpandedCards.has(orderId)) {
      newExpandedCards.delete(orderId);
    } else {
      newExpandedCards.add(orderId);
    }
    setExpandedCards(newExpandedCards);
  };

  const getTimeInMilliseconds = (timeFrame: string): number => {
    const now = new Date().getTime();
    switch (timeFrame) {
      case '1h': return 60 * 60 * 1000;
      case '12h': return 12 * 60 * 60 * 1000;
      case '24h': return 24 * 60 * 60 * 1000;
      case '3d': return 3 * 24 * 60 * 60 * 1000;
      case '7d': return 7 * 24 * 60 * 60 * 1000;
      case '15d': return 15 * 24 * 60 * 60 * 1000;
      case '30d': return 30 * 24 * 60 * 60 * 1000;
      case '45d': return 45 * 24 * 60 * 60 * 1000;
      case '60d': return 60 * 24 * 60 * 60 * 1000;
      case '6m': return 180 * 24 * 60 * 60 * 1000;
      case '12m': return 365 * 24 * 60 * 60 * 1000;
      case '24m': return 730 * 24 * 60 * 60 * 1000;
      default: return Infinity;
    }
  };

  const filteredAndSortedOrders = useMemo(() => {
    let filtered = orders.filter(order => {
      // Basic search filter
      const searchLower = searchTerm.toLowerCase();
      if (searchTerm) {
        switch (searchField) {
          case 'customer':
            if (!order.details?.customerName.toLowerCase().includes(searchLower)) return false;
            break;
          case 'agent':
            if (!order.assignedTo?.toLowerCase().includes(searchLower)) return false;
            break;
          case 'ticket':
            if (!order.details?.ticketNumber.includes(searchTerm)) return false;
            break;
        }
      }

      // Advanced filters
      if (filters.customerName && !order.details?.customerName.toLowerCase().includes(filters.customerName.toLowerCase())) {
        return false;
      }

      if (filters.assignedTo && order.assignedTo !== filters.assignedTo) {
        return false;
      }

      if (filters.createdWithin !== 'all') {
        const timeLimit = getTimeInMilliseconds(filters.createdWithin);
        const orderTime = new Date(order.createdAt).getTime();
        const now = new Date().getTime();
        if (now - orderTime > timeLimit) return false;
      }

      if (filters.closedAfter && order.completedAt) {
        const timeLimit = getTimeInMilliseconds(filters.closedAfter);
        const createdTime = new Date(order.createdAt).getTime();
        const completedTime = new Date(order.completedAt).getTime();
        if (completedTime - createdTime > timeLimit) return false;
      }

      if (!filters.status.unassigned && order.status === 'unassigned') return false;
      if (!filters.status.inProgress && order.status === 'in-progress') return false;
      if (!filters.status.completed && order.status === 'completed') return false;

      if (!filters.priority.includes(order.priority)) return false;

      return true;
    });

    return filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'agent':
          comparison = (a.assignedTo || '').localeCompare(b.assignedTo || '');
          break;
        case 'date':
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
        case 'time':
          comparison = new Date(b.createdAt).getHours() - new Date(a.createdAt).getHours();
          break;
        case 'ticket':
          comparison = (a.details?.ticketNumber || '').localeCompare(b.details?.ticketNumber || '');
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [orders, sortBy, sortDirection, searchTerm, searchField, filters]);

  const baseColumns = [
    {
      title: 'Unassigned',
      icon: Clock,
      orders: filteredAndSortedOrders.filter(order => order.status === 'unassigned'),
      bgColor: 'bg-gray-50'
    },
    {
      title: 'In Progress',
      icon: Loader,
      orders: filteredAndSortedOrders.filter(order => order.status === 'in-progress'),
      bgColor: 'bg-blue-50'
    }
  ];

  const completedColumn = {
    title: 'Completed',
    icon: CheckCircle2,
    orders: filteredAndSortedOrders.filter(order => order.status === 'completed'),
    bgColor: 'bg-green-50'
  };

  const columns = [
    ...baseColumns.filter(column => 
      column.title !== 'Unassigned' || 
      filteredAndSortedOrders.some(order => order.status === 'unassigned')
    ),
    ...(showCompleted ? [completedColumn] : [])
  ];

  const columnWidth = columns.length === 1 
    ? 'md:w-full' 
    : columns.length === 2 
      ? 'md:w-[48%]' 
      : 'md:w-[32%]';

  const completedCount = filteredAndSortedOrders.filter(order => order.status === 'completed').length;

  return (
    <div className="flex gap-6">
      <div className="flex-1 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value as SearchField)}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="customer">By Customer</option>
              <option value="agent">By Agent</option>
              <option value="ticket">By Ticket</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSortDirection}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              {sortDirection === 'asc' ? (
                <SortAsc className="text-gray-400 h-5 w-5" />
              ) : (
                <SortDesc className="text-gray-400 h-5 w-5" />
              )}
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="ticket">Sort by Ticket #</option>
              <option value="agent">Sort by Agent</option>
              <option value="date">Sort by Date</option>
              <option value="time">Sort by Time</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
          >
            {showCompleted ? (
              <>
                <EyeOff className="w-4 h-4" />
                Hide Completed
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Show Completed ({completedCount})
              </>
            )}
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6 justify-start">
          {columns.map(({ title, icon: Icon, orders: columnOrders, bgColor }) => (
            <div key={title} className={`${bgColor} rounded-lg p-4 ${columnWidth}`}>
              <div className="flex items-center mb-4">
                <Icon className="w-5 h-5 mr-2 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
                <span className="ml-2 bg-gray-200 px-2 rounded-full text-sm text-gray-600">
                  {columnOrders.length}
                </span>
              </div>
              <div className="space-y-4">
                {columnOrders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onAssign={
                      onAssignOrder 
                        ? (agentName) => onAssignOrder(order.id, agentName)
                        : undefined
                    }
                    onCompleteTask={
                      onCompleteTask
                        ? (taskId) => onCompleteTask(order.id, taskId)
                        : undefined
                    }
                    onUpdateDetails={
                      onUpdateDetails
                        ? (details) => onUpdateDetails(order.id, details)
                        : undefined
                    }
                    onDelete={
                      onDeleteOrder
                        ? () => onDeleteOrder(order.id)
                        : undefined
                    }
                    agents={agents}
                    showChecklist={expandedCards.has(order.id)}
                    onToggleChecklist={() => toggleCardExpansion(order.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <FilterPanel
        filters={filters}
        setFilters={setFilters}
        agents={agents}
      />
    </div>
  );
};