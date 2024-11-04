import { supabase } from './supabase';
import type { Agent } from '../types';

export const agentService = {
  async createAgent(agent: {
    name: string;
    department_name: string;
    email: string;
    extension: string;
  }) {
    const { data, error } = await supabase
      .from('agents')
      .insert([{
        name: agent.name,
        department_name: agent.department_name,
        email: agent.email,
        extension: agent.extension,
        completed_orders: 0,
        total_orders: 0
      }])
      .select();

    if (error) throw error;
    return data?.[0];
  },

  async updateAgent(agent: {
    name: string;
    department_name: string;
    email: string;
    extension: string;
  }) {
    const { data, error } = await supabase
      .from('agents')
      .update({
        department_name: agent.department_name,
        email: agent.email,
        extension: agent.extension
      })
      .eq('name', agent.name)
      .select();

    if (error) throw error;
    return data?.[0];
  },

  async deleteAgent(name: string) {
    const { error } = await supabase
      .from('agents')
      .delete()
      .eq('name', name);

    if (error) throw error;
  },

  async getAgentsByDepartment(departmentName: string) {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('department_name', departmentName);

    if (error) throw error;
    return data;
  },

  async updateAgentStats(name: string, completedOrders: number, totalOrders: number) {
    const { error } = await supabase
      .from('agents')
      .update({
        completed_orders: completedOrders,
        total_orders: totalOrders
      })
      .eq('name', name);

    if (error) throw error;
  }
};