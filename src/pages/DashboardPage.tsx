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
  }, []);

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
        />
        
        <OrderColumns
          orders={filteredOrders}
          agents={departments.flatMap(dept => dept.agents)}
        />
      </div>
    </Layout>
  );
};