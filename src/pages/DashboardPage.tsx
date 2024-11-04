import React, { useState, useEffect } from 'react';
import { DashboardStats } from '../components/DashboardStats';
import { ActionButtons } from '../components/ActionButtons';
import { OrderColumns } from '../components/OrderColumns';
import { Layout } from '../components/Layout';
import { db, supabase } from '../services/supabase';
import { orderService } from '../services/orders';
import { Order, Department } from '../types';

export const DashboardPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0
  });
  const [filteredAgentName, setFilteredAgentName] = useState<string | null>(null);
  const [filteredDepartment, setFilteredDepartment] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    const subscription = subscribeToOrders();
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const subscribeToOrders = () => {
    return supabase
      .channel('orders-channel')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'orders' 
        }, 
        async () => {
          await loadData();
        }
      )
      .subscribe();
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [ordersData, departmentsData, statsData] = await Promise.all([
        db.getAllOrders(),
        db.getAllDepartments(),
        db.getStats()
      ]);

      setOrders(ordersData);
      setDepartments(departmentsData);
      setStats(statsData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderCreate = async (newOrder: Omit<Order, 'id'>) => {
    try {
      setError(null);
      const createdOrder = await orderService.createOrder(newOrder);
      if (createdOrder) {
        setOrders(prevOrders => [createdOrder, ...prevOrders]);
        const statsData = await db.getStats();
        setStats(statsData);
      }
    } catch (err) {
      console.error('Failed to create order:', err);
      setError('Failed to create order. Please try again.');
    }
  };

  const handleAssignOrder = async (orderId: string, agentName: string) => {
    try {
      await orderService.assignOrder(orderId, agentName);
      await loadData();
    } catch (err) {
      console.error('Failed to assign order:', err);
      setError('Failed to assign order. Please try again.');
    }
  };

  const handleCompleteTask = async (orderId: string, taskId: string) => {
    try {
      const orderToUpdate = orders.find(o => o.id === orderId);
      if (!orderToUpdate) return;

      const task = orderToUpdate.tasks.find(t => t.id === taskId);
      if (!task) return;

      const updatedTasks = await orderService.completeTask(orderId, taskId, !task.completed);
      const allTasksCompleted = updatedTasks.every((task: any) => task.completed);

      // Update the order in state immediately
      setOrders(prevOrders => prevOrders.map(order => {
        if (order.id === orderId) {
          return {
            ...order,
            tasks: updatedTasks,
            status: allTasksCompleted ? 'completed' : 'in-progress',
            completedAt: allTasksCompleted ? new Date().toISOString() : order.completedAt
          };
        }
        return order;
      }));

      // Update stats if order is completed
      if (allTasksCompleted) {
        const statsData = await db.getStats();
        setStats(statsData);
      }
    } catch (err) {
      console.error('Failed to update task:', err);
      setError('Failed to update task. Please try again.');
    }
  };

  const handleUpdateDetails = async (orderId: string, details: { invoiceNumber?: string; note?: string; priority?: 'low' | 'medium' | 'high' }) => {
    try {
      const orderToUpdate = orders.find(o => o.id === orderId);
      if (!orderToUpdate) return;

      const updatedOrder: Order = {
        ...orderToUpdate,
        details: {
          ...orderToUpdate.details,
          invoiceNumber: details.invoiceNumber,
          note: details.note
        },
        priority: details.priority || orderToUpdate.priority
      };

      await orderService.updateOrder(updatedOrder);
      
      // Update order in state immediately
      setOrders(prevOrders => prevOrders.map(order => 
        order.id === orderId ? updatedOrder : order
      ));
    } catch (err) {
      console.error('Failed to update order details:', err);
      setError('Failed to update order details. Please try again.');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await orderService.deleteOrder(orderId);
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
      const statsData = await db.getStats();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to delete order:', err);
      setError('Failed to delete order. Please try again.');
    }
  };

  const handleAgentClick = (agentName: string) => {
    setFilteredAgentName(agentName);
    setFilteredDepartment(null);
  };

  const handleDepartmentClick = (departmentName: string) => {
    setFilteredDepartment(departmentName);
    setFilteredAgentName(null);
  };

  const filteredOrders = orders.filter(order => {
    if (filteredAgentName) {
      return order.assignedTo === filteredAgentName;
    }
    if (filteredDepartment) {
      const departmentAgents = departments
        .find(d => d.name === filteredDepartment)
        ?.agents.map(a => a.name) || [];
      return order.assignedTo && departmentAgents.includes(order.assignedTo);
    }
    return true;
  });

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {error}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <DashboardStats 
          stats={stats} 
          departments={departments}
          onAgentClick={handleAgentClick}
          onDepartmentClick={handleDepartmentClick}
        />
        
        <ActionButtons 
          departments={departments}
          orders={orders}
          onOrderCreate={handleOrderCreate}
        />
        
        <OrderColumns
          orders={filteredOrders}
          agents={departments.flatMap(dept => dept.agents)}
          onAssignOrder={handleAssignOrder}
          onCompleteTask={handleCompleteTask}
          onUpdateDetails={handleUpdateDetails}
          onDeleteOrder={handleDeleteOrder}
        />
      </div>
    </Layout>
  );
};