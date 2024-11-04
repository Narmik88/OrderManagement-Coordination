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
      // Test connection
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .limit(1);

      if (error && error.code !== 'PGRST116') {
        throw new Error('Failed to connect to Supabase');
      }

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw new Error('Database initialization failed');
    }
  }

  async getAllOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        tasks (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async saveOrder(order: Omit<Order, 'id'>): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .insert([order])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateOrder(order: Order): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update(order)
      .eq('id', order.id);

    if (error) throw error;
  }

  async getAllDepartments(): Promise<Department[]> {
    const { data, error } = await supabase
      .from('departments')
      .select(`
        *,
        agents (*)
      `)
      .order('name');

    if (error) throw error;
    return data || [];
  }

  async saveDepartments(departments: Department[]): Promise<void> {
    const { error } = await supabase
      .from('departments')
      .upsert(departments, { onConflict: 'name' });

    if (error) throw error;
  }

  async saveStats(stats: DashboardStats): Promise<void> {
    const { error } = await supabase
      .from('stats')
      .upsert([{ ...stats, id: 'current' }], { onConflict: 'id' });

    if (error) throw error;
  }

  async getStats(): Promise<DashboardStats | null> {
    const { data, error } = await supabase
      .from('stats')
      .select('*')
      .eq('id', 'current')
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

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