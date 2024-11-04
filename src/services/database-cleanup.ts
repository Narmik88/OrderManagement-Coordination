import { supabase } from './supabase';

export async function deleteInitialAgents() {
  try {
    const { error } = await supabase
      .from('agents')
      .delete()
      .in('name', ['Kashan Chaudhry', 'Saad Munir']);

    if (error) {
      throw new Error(`Failed to delete agents: ${error.message}`);
    }
  } catch (error: any) {
    console.error('Failed to delete agents:', error);
    throw new Error(error.message || 'Failed to delete agents');
  }
}