import { supabase } from './supabase';

export async function setupDatabase() {
  // Create departments table
  const { error: deptError } = await supabase.from('departments')
    .select()
    .limit(1)
    .catch(async () => {
      return await supabase.query(`
        CREATE TABLE IF NOT EXISTS departments (
          name TEXT PRIMARY KEY,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );
      `);
    });

  if (deptError) throw deptError;

  // Create agents table
  const { error: agentError } = await supabase.from('agents')
    .select()
    .limit(1)
    .catch(async () => {
      return await supabase.query(`
        CREATE TABLE IF NOT EXISTS agents (
          name TEXT PRIMARY KEY,
          email TEXT,
          extension TEXT,
          department_name TEXT REFERENCES departments(name) ON DELETE CASCADE,
          completed_orders INTEGER DEFAULT 0,
          total_orders INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );
      `);
    });

  if (agentError) throw agentError;

  // Create orders table
  const { error: orderError } = await supabase.from('orders')
    .select()
    .limit(1)
    .catch(async () => {
      return await supabase.query(`
        CREATE TABLE IF NOT EXISTS orders (
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
      `);
    });

  if (orderError) throw orderError;

  // Create indexes
  await supabase.query(`
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_orders_assigned_to ON orders(assigned_to);
    CREATE INDEX IF NOT EXISTS idx_agents_department ON agents(department_name);
  `);

  // Initialize default departments if they don't exist
  const { data: departments } = await supabase.from('departments').select('name');
  if (!departments?.length) {
    await supabase.from('departments').insert([
      { name: 'Management' },
      { name: 'Support' },
      { name: 'Sales' }
    ]);
  }
}