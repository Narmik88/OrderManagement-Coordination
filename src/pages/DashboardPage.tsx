import React, { useState, useEffect } from 'react';
import { DashboardStats } from '../components/DashboardStats';
import { ActionButtons } from '../components/ActionButtons';
import { OrderColumns } from '../components/OrderColumns';
import { Layout } from '../components/Layout';
import { db } from '../services/supabase';
import { Order, Department } from '../types';

export const DashboardPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0
  });
  const [filteredAgent, setFilteredAgent] = useState<string | null>(null);
  const [filteredDepartment, setFilteredDepartment] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [ordersData, departmentsData, statsData] = await Promise.all([
          db.getAllOrders(),
          db.getAllDepartments(),
          db.getStats()
        ]);

        setOrders(ordersData);
        setDepartments(departmentsData);
        if (statsData) setStats(statsData);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();

    // Set up real-time subscriptions
    const unsubOrders = db.subscribeToOrders(setOrders);
    const unsubDepartments = db.subscribeToDepartments(setDepartments);

    return () => {
      unsubOrders();
      unsubDepartments();
    };
  }, []);

  useEffect(() => {
    const newStats = {
      totalOrders: orders.length,
      completedOrders: orders.filter(order => order.status === 'completed').length,
      pendingOrders: orders.filter(order => order.status !== 'completed').length
    };

    setStats(newStats);
    db.saveStats(newStats);
  }, [orders]);

  const handleOrderCreate = async (newOrder: Omit<Order, 'id'>) => {
    const order: Order = {
      ...newOrder,
      id: `order-${Date.now()}`
    };
    await db.saveOrder(order);
  };

  const handleAssignOrder = async (orderId: string, agentName: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const updatedOrder: Order = {
      ...order,
      status: 'in-progress',
      assignedTo: agentName
    };
    await db.updateOrder(updatedOrder);
  };

  const handleCompleteTask = async (orderId: string, taskId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const updatedTasks = order.tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          completed: !task.completed,
          completedAt: !task.completed ? new Date().toISOString() : undefined
        };
      }
      return task;
    });

    const allTasksCompleted = updatedTasks.every(task => task.completed);
    
    const updatedOrder: Order = {
      ...order,
      tasks: updatedTasks,
      status: allTasksCompleted ? 'completed' : order.status,
      completedAt: allTasksCompleted ? new Date().toISOString() : undefined
    };

    await db.updateOrder(updatedOrder);
  };

  const handleUpdateOrderDetails = async (orderId: string, details: { invoiceNumber?: string; note?: string }) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const updatedOrder: Order = {
      ...order,
      details: {
        ...order.details!,
        ...details
      }
    };

    await db.updateOrder(updatedOrder);
  };

  const handleAgentClick = (agentName: string) => {
    setFilteredAgent(agentName);
    setFilteredDepartment(null);
  };

  const handleDepartmentClick = (departmentName: string) => {
    setFilteredDepartment(departmentName);
    setFilteredAgent(null);
  };

  const filteredOrders = orders.filter(order => {
    if (filteredAgent) {
      return order.assignedTo === filteredAgent;
    }
    if (filteredDepartment) {
      const dept = departments.find(d => d.name === filteredDepartment);
      return dept?.agents.some(agent => agent.name === order.assignedTo);
    }
    return true;
  });

  const agents = departments.flatMap(dept => 
    dept.agents.map(agent => ({ name: agent.name }))
  );

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
          onOrderCreate={handleOrderCreate}
          departments={departments}
          orders={orders}
        />
        
        <OrderColumns
          orders={filteredOrders}
          onAssignOrder={handleAssignOrder}
          onCompleteTask={handleCompleteTask}
          onUpdateDetails={handleUpdateOrderDetails}
          agents={agents}
        />
      </div>
    </Layout>
  );
};