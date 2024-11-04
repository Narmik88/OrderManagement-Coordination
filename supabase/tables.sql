-- Update orders table
drop table if exists orders cascade;
create table orders (
  id text primary key,
  title text not null,
  type text not null,
  status text not null,
  priority text not null,
  details jsonb default '{}'::jsonb,
  tasks jsonb default '[]'::jsonb,
  assigned_to text references agents(name),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone,
  constraint valid_status check (status in ('unassigned', 'in-progress', 'completed')),
  constraint valid_priority check (priority in ('low', 'medium', 'high'))
);

-- Create function to increment agent orders
create or replace function increment_agent_orders(agent_name text)
returns void as $$
begin
  update agents
  set total_orders = total_orders + 1
  where name = agent_name;
end;
$$ language plpgsql;