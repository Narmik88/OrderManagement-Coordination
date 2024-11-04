import { supabase } from './supabase';
import type { Order, AgentAssignment } from '../types';

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

      if (order.assignedTo) {
        await Promise.all([
          supabase.rpc('increment_agent_orders', {
            p_agent_name: order.assignedTo
          }),
          supabase.rpc('add_assignment_history', {
            p_order_id: id,
            p_agent_name: order.assignedTo
          })
        ]);
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
  },

  async assignOrder(orderId: string, agentName: string) {
    const { error } = await supabase.rpc('assign_order', {
      p_order_id: orderId,
      p_agent_name: agentName
    });

    if (error) {
      console.error('Failed to assign order:', error);
      throw error;
    }
  },

  async getAssignmentHistory(orderId: string): Promise<AgentAssignment[]> {
    const { data, error } = await supabase.rpc('get_assignment_history', {
      p_order_id: orderId
    });

    if (error) throw error;
    return data.map(({ agent_name, assigned_at }) => ({
      agentName: agent_name,
      assignedAt: assigned_at
    }));
  },

  async completeTask(orderId: string, taskId: string, completed: boolean) {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('tasks, assigned_to')
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError;

    const updatedTasks = order.tasks.map((task: any) =>
      task.id === taskId
        ? { ...task, completed, completedAt: completed ? new Date().toISOString() : null }
        : task
    );

    const allTasksCompleted = updatedTasks.every((task: any) => task.completed);

    if (allTasksCompleted && order.assigned_to) {
      await supabase.rpc('increment_completed_orders', {
        p_agent_name: order.assigned_to
      });
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        tasks: updatedTasks,
        status: allTasksCompleted ? 'completed' : 'in-progress',
        completed_at: allTasksCompleted ? new Date().toISOString() : null
      })
      .eq('id', orderId);

    if (updateError) throw updateError;

    return updatedTasks;
  }
};