import { supabase } from './supabase';
import type { Order } from '../types';

export const orderService = {
  async createOrder(order: Omit<Order, 'id'>) {
    try {
      const id = `order-${Date.now()}`;
      const { data, error } = await supabase
        .from('orders')
        .insert([{
          id,
          title: order.title,
          type: order.type,
          status: order.status,
          priority: order.priority,
          details: order.details || {},
          tasks: order.tasks || [],
          assigned_to: order.assignedTo,
          created_at: new Date().toISOString(),
          completed_at: null
        }])
        .select();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      // If order is assigned to an agent, update their stats
      if (order.assignedTo) {
        const { error: statsError } = await supabase.rpc('increment_agent_orders', {
          agent_name: order.assignedTo
        });

        if (statsError) {
          console.error('Failed to update agent stats:', statsError);
        }
      }

      return data?.[0];
    } catch (error) {
      console.error('Order creation failed:', error);
      throw error;
    }
  },

  async updateOrder(order: Order) {
    const { data, error } = await supabase
      .from('orders')
      .update({
        title: order.title,
        type: order.type,
        status: order.status,
        priority: order.priority,
        details: order.details || {},
        tasks: order.tasks || [],
        assigned_to: order.assignedTo,
        completed_at: order.completedAt
      })
      .eq('id', order.id)
      .select();

    if (error) throw error;
    return data?.[0];
  },

  async deleteOrder(id: string) {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};