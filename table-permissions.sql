-- Grant table permissions
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_history ENABLE ROW LEVEL SECURITY;

-- Grant access to departments table
CREATE POLICY "Enable read access for all users" ON departments FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON departments FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON departments FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON departments FOR DELETE USING (true);

-- Grant access to agents table
CREATE POLICY "Enable read access for all users" ON agents FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON agents FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON agents FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON agents FOR DELETE USING (true);

-- Grant access to orders table
CREATE POLICY "Enable read access for all users" ON orders FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON orders FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON orders FOR DELETE USING (true);

-- Grant access to assignment_history table
CREATE POLICY "Enable read access for all users" ON assignment_history FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON assignment_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON assignment_history FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON assignment_history FOR DELETE USING (true);

-- Grant table permissions to anon and authenticated roles
GRANT ALL ON departments TO anon, authenticated;
GRANT ALL ON agents TO anon, authenticated;
GRANT ALL ON orders TO anon, authenticated;
GRANT ALL ON assignment_history TO anon, authenticated;
GRANT USAGE ON SEQUENCE assignment_history_id_seq TO anon, authenticated;