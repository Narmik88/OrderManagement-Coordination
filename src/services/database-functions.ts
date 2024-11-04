import { supabase } from './supabase';

export async function createAssignmentHistoryFunction() {
  try {
    const { error: historyError } = await supabase.query(`
      CREATE OR REPLACE FUNCTION public.get_assignment_history(p_order_id TEXT)
      RETURNS TABLE (
        agent_name TEXT,
        assigned_at TIMESTAMP WITH TIME ZONE
      ) 
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        RETURN QUERY
        SELECT ah.agent_name, ah.assigned_at
        FROM assignment_history ah
        WHERE ah.order_id = p_order_id
        ORDER BY ah.assigned_at DESC;
      END;
      $$;
    `);

    if (historyError) throw historyError;

    const { error: assignError } = await supabase.query(`
      CREATE OR REPLACE FUNCTION public.assign_order(
        p_order_id TEXT,
        p_agent_name TEXT
      ) RETURNS void AS $$
      BEGIN
        UPDATE orders
        SET 
          assigned_to = p_agent_name,
          status = CASE 
            WHEN status = 'unassigned' THEN 'in-progress'
            ELSE status
          END
        WHERE id = p_order_id;

        INSERT INTO assignment_history (order_id, agent_name)
        VALUES (p_order_id, p_agent_name);

        UPDATE agents
        SET total_orders = total_orders + 1
        WHERE name = p_agent_name
        AND NOT EXISTS (
          SELECT 1 FROM assignment_history
          WHERE order_id = p_order_id AND agent_name = p_agent_name
          AND assigned_at < NOW()
        );
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `);

    if (assignError) throw assignError;

    const { error: completeError } = await supabase.query(`
      CREATE OR REPLACE FUNCTION public.complete_order(
        p_order_id TEXT
      ) RETURNS void AS $$
      DECLARE
        v_agent_name TEXT;
      BEGIN
        SELECT assigned_to INTO v_agent_name
        FROM orders
        WHERE id = p_order_id;

        UPDATE orders
        SET 
          status = 'completed',
          completed_at = NOW()
        WHERE id = p_order_id;

        IF v_agent_name IS NOT NULL THEN
          UPDATE agents
          SET completed_orders = completed_orders + 1
          WHERE name = v_agent_name;
        END IF;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `);

    if (completeError) throw completeError;

    const { error: incrementCompletedError } = await supabase.query(`
      CREATE OR REPLACE FUNCTION public.increment_completed_orders(
        p_agent_name TEXT
      ) RETURNS void AS $$
      BEGIN
        UPDATE agents
        SET completed_orders = completed_orders + 1
        WHERE name = p_agent_name;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `);

    if (incrementCompletedError) throw incrementCompletedError;

    const { error: incrementTotalError } = await supabase.query(`
      CREATE OR REPLACE FUNCTION public.increment_agent_orders(
        p_agent_name TEXT
      ) RETURNS void AS $$
      BEGIN
        UPDATE agents
        SET total_orders = total_orders + 1
        WHERE name = p_agent_name;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `);

    if (incrementTotalError) throw incrementTotalError;

    // Grant permissions
    const { error: grantError } = await supabase.query(`
      GRANT EXECUTE ON FUNCTION public.get_assignment_history(TEXT) TO anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION public.assign_order(TEXT, TEXT) TO anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION public.complete_order(TEXT) TO anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION public.increment_completed_orders(TEXT) TO anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION public.increment_agent_orders(TEXT) TO anon, authenticated, service_role;
    `);

    if (grantError) throw grantError;

    console.log('Successfully created all database functions');
  } catch (error: any) {
    console.error('Failed to create database functions:', error);
    throw new Error(error.message || 'Failed to create database functions');
  }
}