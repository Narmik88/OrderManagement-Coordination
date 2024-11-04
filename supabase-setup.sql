-- Drop existing tables and functions to ensure clean slate
DROP TABLE IF EXISTS assignment_history CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS agents CASCADE;
DROP TABLE IF EXISTS departments CASCADE;

-- Create departments table first
CREATE TABLE departments (
  name TEXT PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create agents table with department reference
CREATE TABLE agents (
  name TEXT PRIMARY KEY,
  email TEXT,
  extension TEXT,
  department_name TEXT REFERENCES departments(name) ON DELETE CASCADE,
  completed_orders INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create orders table
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  priority TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  tasks JSONB DEFAULT '[]'::jsonb,
  assigned_to TEXT REFERENCES agents(name) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT valid_status CHECK (status IN ('unassigned', 'in-progress', 'completed')),
  CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high'))
);

-- Create assignment history table
CREATE TABLE assignment_history (
  id SERIAL PRIMARY KEY,
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  agent_name TEXT REFERENCES agents(name) ON DELETE SET NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_assigned_to ON orders(assigned_to);
CREATE INDEX idx_assignment_history_order_id ON assignment_history(order_id);
CREATE INDEX idx_agents_department ON agents(department_name);

-- Function to get assignment history
CREATE OR REPLACE FUNCTION get_assignment_history(p_order_id TEXT)
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

-- Function to assign order and track history
CREATE OR REPLACE FUNCTION assign_order(
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

-- Function to complete order and update stats
CREATE OR REPLACE FUNCTION complete_order(
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

-- Function to increment completed orders for an agent
CREATE OR REPLACE FUNCTION increment_completed_orders(
  p_agent_name TEXT
) RETURNS void AS $$
BEGIN
  UPDATE agents
  SET completed_orders = completed_orders + 1
  WHERE name = p_agent_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment total orders for an agent
CREATE OR REPLACE FUNCTION increment_agent_orders(
  p_agent_name TEXT
) RETURNS void AS $$
BEGIN
  UPDATE agents
  SET total_orders = total_orders + 1
  WHERE name = p_agent_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_assignment_history(TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION assign_order(TEXT, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION complete_order(TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION increment_completed_orders(TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION increment_agent_orders(TEXT) TO anon, authenticated, service_role;

-- Insert initial departments
INSERT INTO departments (name) VALUES
  ('Management'),
  ('Support'),
  ('Sales')
ON CONFLICT (name) DO NOTHING;