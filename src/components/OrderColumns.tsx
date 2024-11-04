import React, { useState, useMemo } from 'react';
import { Order } from '../types';
import { Clock, Loader, CheckCircle2, User, Search, SortAsc, SortDesc, Eye, EyeOff } from 'lucide-react';
import { OrderCard } from './OrderCard';
import { FilterPanel } from './FilterPanel';
import { orderService } from '../services/orders';

interface OrderColumnsProps {
  orders: Order[];
  onAssignOrder?: (orderId: string, agentName: string) => void;
  onCompleteTask?: (orderId: string, taskId: string) => void;
  onUpdateDetails?: (orderId: string, details: { invoiceNumber?: string; note?: string }) => void;
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
  agents = []
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('ticket');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState<SearchField>('customer');
  const [showCompleted, setShowCompleted] = useState(false);
  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [localOrders, setLocalOrders] = useState<Order[]>(orders);

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

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await orderService.deleteOrder(orderId);
      setLocalOrders(prev => prev.filter(o => o.id !== orderId));
    } catch (error) {
      console.error('Failed to delete order:', error);
    }
  };

  const handleAssignOrder = async (orderId: string, agentName: string) => {
    try {
      setLocalOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, assignedTo: agentName, status: 'in-progress' }
          : order
      ));
      onAssignOrder?.(orderId, agentName);
    } catch (error) {
      console.error('Failed to assign order:', error);
    }
  };

  const handleCompleteTask = async (orderId: string, taskId: string) => {
    try {
      const order = localOrders.find(o => o.id === orderId);
      if (!order) return;

      const updatedOrder = {
        ...order,
        tasks: order.tasks.map(task => 
          task.id === taskId 
            ? { ...task, completed: !task.completed, completedAt: !task.completed ? new Date().toISOString() : undefined }
            : task
        )
      };

      const allTasksCompleted = updatedOrder.tasks.every(task => task.completed);
      if (allTasksCompleted && updatedOrder.status !== 'completed') {
        updatedOrder.status = 'completed';
        updatedOrder.completedAt = new Date().toISOString();
      }

      setLocalOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
      await orderService.updateOrder(updatedOrder);
      onCompleteTask?.(orderId, taskId);
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  const handleUpdateDetails = async (orderId: string, details: any) => {
    try {
      setLocalOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, details: { ...order.details, ...details } }
          : order
      ));
      onUpdateDetails?.(orderId, details);
    } catch (error) {
      console.error('Failed to update details:', error);
    }
  };

  const filteredAndSortedOrders = useMemo(() => {
    let filtered = localOrders.filter(order => {
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

      if (filters.customerName && !order.details?.customerName.toLowerCase().includes(filters.customerName.toLowerCase())) {
        return false;
      }

      if (filters.assignedTo && order.assignedTo !== filters.assignedTo) {
        return false;
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
  }, [localOrders, sortBy, sortDirection, searchTerm, searchField, filters]);

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
                    onAssign={(agentName) => handleAssignOrder(order.id, agentName)}
                    onCompleteTask={(taskId) => handleCompleteTask(order.id, taskId)}
                    onUpdateDetails={(details) => handleUpdateDetails(order.id, details)}
                    onDelete={() => handleDeleteOrder(order.id)}
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