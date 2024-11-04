import { createClient } from '@supabase/supabase-js';
import type { Order, Department, DashboardStats } from '../types';

const SUPABASE_URL = 'https://covlghocbmreatukbgdc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvdmxnaG9jYm1yZWF0dWtiZ2RjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA3MzI0MTksImV4cCI6MjA0NjMwODQxOX0.ZBbyUFHKJMm27FygO68Tk3ycq1iHWdGYrVc4T85ayEQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

class DatabaseService {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const { data, error } = await supabase.from('departments').select('count');
      if (error) throw error;
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw new Error('Database initialization failed');
    }
  }

  async getAllDepartments(): Promise<Department[]> {
    const { data: departments, error: deptError } = await supabase
      .from('departments')
      .select('name');

    if (deptError) throw deptError;

    const { data: agents, error: agentsError } = await supabase
      .from('agents')
      .select('*');

    if (agentsError) throw agentsError;

    return departments.map(dept => ({
      name: dept.name,
      agents: agents
        .filter(agent => agent.department_name === dept.name)
        .map(agent => ({
          name: agent.name,
          email: agent.email || '',
          extension: agent.extension || '',
          completedOrders: agent.completed_orders || 0,
          totalOrders: agent.total_orders || 0
        }))
    }));
  }

  async getAllOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getStats(): Promise<DashboardStats> {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('status');

    if (error) throw error;

    const totalOrders = orders.length;
    const completedOrders = orders.filter(order => order.status === 'completed').length;
    const pendingOrders = totalOrders - completedOrders;

    return {
      totalOrders,
      completedOrders,
      pendingOrders
    };
  }

  async saveDepartment(department: Department): Promise<void> {
    const { error } = await supabase
      .from('departments')
      .upsert({ name: department.name });

    if (error) throw error;
  }

  async deleteDepartment(name: string): Promise<void> {
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('name', name);

    if (error) throw error;
  }
}

export const db = new DatabaseService();