import { supabase } from './supabase';
import type { Order } from '../types';
import { db } from './database';

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
        console.error('Supabase save failed, using local data:', error);
        // Fallback to local database
        const localOrder = {
          id,
          ...order,
          createdAt: new Date().toISOString(),
          completedAt: null
        };
        await db.saveOrder(localOrder);
        return localOrder;
      }

      return data?.[0];
    } catch (error) {
      console.error('Order creation failed:', error);
      throw error;
    }
  },

  async updateOrder(order: Order) {
    try {
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

      if (error) {
        console.error('Supabase update failed, using local data:', error);
        // Fallback to local database
        await db.updateOrder(order);
        return order;
      }

      return data?.[0];
    } catch (error) {
      console.error('Order update failed:', error);
      throw error;
    }
  },

  async deleteOrder(id: string) {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase delete failed, using local data:', error);
        // Fallback to local database
        await db.deleteOrder(id);
        return;
      }
    } catch (error) {
      console.error('Order deletion failed:', error);
      throw error;
    }
  },

  async getAllOrders(): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase fetch failed, using local data:', error);
        // Fallback to local database
        return await db.getAllOrders();
      }

      return data.map(order => ({
        ...order,
        assignedTo: order.assigned_to,
        createdAt: order.created_at,
        completedAt: order.completed_at
      }));
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      // Fallback to local database
      return await db.getAllOrders();
    }
  }
};