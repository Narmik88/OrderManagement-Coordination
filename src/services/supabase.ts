import { createClient } from '@supabase/supabase-js';
import type { Order, Department, DashboardStats } from '../types';

const SUPABASE_URL = 'https://covlghocbmreatukbgdc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvdmxnaG9jYm1yZWF0dWtiZ2RjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA3MzI0MTksImV4cCI6MjA0NjMwODQxOX0.ZBbyUFHKJMm27FygO68Tk3ycq1iHWdGYrVc4T85ayEQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

class DatabaseService {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Create departments table
      const { error: deptError } = await supabase.from('departments')
        .select('name')
        .limit(1);

      if (deptError && deptError.message.includes('does not exist')) {
        const { error } = await supabase.from('departments')
          .insert([{ name: 'Management' }]);
        if (error) throw error;
      }

      // Create agents table
      const { error: agentsError } = await supabase.from('agents')
        .select('name')
        .limit(1);

      if (agentsError && agentsError.message.includes('does not exist')) {
        const { error } = await supabase.from('agents')
          .insert([{ 
            name: 'Admin',
            department_name: 'Management',
            email: 'admin@example.com',
            extension: '100',
            completed_orders: 0,
            total_orders: 0
          }]);
        if (error) throw error;
      }

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw new Error('Database initialization failed');
    }
  }

  async getAllDepartments(): Promise<Department[]> {
    try {
      const { data: departments, error: deptError } = await supabase
        .from('departments')
        .select('name');

      if (deptError) throw deptError;

      const { data: agents, error: agentsError } = await supabase
        .from('agents')
        .select('*');

      if (agentsError) throw agentsError;

      return (departments || []).map(dept => ({
        name: dept.name,
        agents: (agents || [])
          .filter(agent => agent.department_name === dept.name)
          .map(agent => ({
            name: agent.name,
            email: agent.email || '',
            extension: agent.extension || '',
            completedOrders: agent.completed_orders || 0,
            totalOrders: agent.total_orders || 0
          }))
      }));
    } catch (error) {
      console.error('Error fetching departments:', error);
      throw new Error('Failed to fetch departments');
    }
  }

  async getAllOrders(): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw new Error('Failed to fetch orders');
    }
  }

  async saveOrder(order: Order): Promise<void> {
    try {
      const { error } = await supabase
        .from('orders')
        .upsert(order);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving order:', error);
      throw new Error('Failed to save order');
    }
  }

  async updateOrder(order: Order): Promise<void> {
    return this.saveOrder(order);
  }

  async saveDepartment(department: Department): Promise<void> {
    try {
      // First, save the department
      const { error: deptError } = await supabase
        .from('departments')
        .upsert({ name: department.name });

      if (deptError) throw deptError;

      // Then, update agents
      if (department.agents.length > 0) {
        const { error: agentsError } = await supabase
          .from('agents')
          .upsert(
            department.agents.map(agent => ({
              name: agent.name,
              department_name: department.name,
              email: agent.email || '',
              extension: agent.extension || '',
              completed_orders: agent.completedOrders || 0,
              total_orders: agent.totalOrders || 0
            }))
          );

        if (agentsError) throw agentsError;
      }
    } catch (error) {
      console.error('Error saving department:', error);
      throw new Error('Failed to save department');
    }
  }

  async deleteDepartment(departmentName: string): Promise<void> {
    try {
      // Delete agents first
      const { error: agentsError } = await supabase
        .from('agents')
        .delete()
        .eq('department_name', departmentName);

      if (agentsError) throw agentsError;

      // Then delete the department
      const { error: deptError } = await supabase
        .from('departments')
        .delete()
        .eq('name', departmentName);

      if (deptError) throw deptError;
    } catch (error) {
      console.error('Error deleting department:', error);
      throw new Error('Failed to delete department');
    }
  }

  async getStats(): Promise<DashboardStats | null> {
    const orders = await this.getAllOrders();
    return {
      totalOrders: orders.length,
      completedOrders: orders.filter(order => order.status === 'completed').length,
      pendingOrders: orders.filter(order => order.status !== 'completed').length
    };
  }

  async saveStats(stats: DashboardStats): Promise<void> {
    // Stats are calculated on-the-fly, no need to save
    return;
  }

  // Add subscriptions for real-time updates
  subscribeToOrders(callback: (orders: Order[]) => void): () => void {
    const subscription = supabase
      .channel('orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, 
        () => this.getAllOrders().then(callback))
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }

  subscribeToDepartments(callback: (departments: Department[]) => void): () => void {
    const subscription = supabase
      .channel('departments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'departments' },
        () => this.getAllDepartments().then(callback))
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }
}

export const db = new DatabaseService();