-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  unique_id VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  batch VARCHAR(50),
  department VARCHAR(100),
  phone VARCHAR(20),
  address TEXT,
  year_of_passing VARCHAR(10),
  registration_date DATE DEFAULT CURRENT_DATE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for unique_id for efficient retrieval
CREATE INDEX IF NOT EXISTS idx_users_unique_id ON public.users(unique_id);

-- Function to generate unique user ID
CREATE OR REPLACE FUNCTION generate_unique_user_id()
RETURNS TEXT AS $$
DECLARE
  current_year INTEGER;
  user_count INTEGER;
  new_unique_id TEXT;
  id_exists BOOLEAN;
BEGIN
  current_year := EXTRACT(YEAR FROM NOW());
  
  -- Get count of users created this year
  SELECT COUNT(*) INTO user_count
  FROM public.users
  WHERE unique_id LIKE 'ALM-' || current_year || '-%';
  
  -- Generate new unique ID
  LOOP
    user_count := user_count + 1;
    new_unique_id := 'ALM-' || current_year || '-' || LPAD(user_count::TEXT, 3, '0');
    
    -- Check if ID already exists
    SELECT EXISTS(
      SELECT 1 FROM public.users WHERE unique_id = new_unique_id
    ) INTO id_exists;
    
    -- If ID doesn't exist, we can use it
    IF NOT id_exists THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN new_unique_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Allow public registration" ON public.users;

-- Create policies
-- Users can read their own data
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Users can update their own data
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Admins can read all users (using auth.jwt() to avoid recursion)
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR role = 'admin' AND id::text = auth.uid()::text
  );

-- Admins can update all users (using auth.jwt() to avoid recursion)
CREATE POLICY "Admins can update all users" ON public.users
  FOR UPDATE USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR role = 'admin' AND id::text = auth.uid()::text
  );

-- Allow public registration (insert)
CREATE POLICY "Allow public registration" ON public.users
  FOR INSERT WITH CHECK (true);

-- Insert default admin user
INSERT INTO public.users (id, unique_id, email, name, role, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'ALM-2024-001',
  'admin@alumni.com',
  'Admin User',
  'admin',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Insert default test user
INSERT INTO public.users (id, unique_id, email, name, role, batch, department, phone, address, year_of_passing, registration_date, status, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'ALM-2024-002',
  'test@alumni.com',
  'Rajesh Kumar',
  'user',
  '1995-2000',
  'Computer Science',
  '+91 98765 43210',
  'Jorhat, Assam',
  '2000',
  '2025-01-15',
  'active',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Create function to get registration stats
CREATE OR REPLACE FUNCTION get_registration_stats()
RETURNS JSON AS $$
DECLARE
  total_users INTEGER;
  active_users INTEGER;
  pending_users INTEGER;
  suspended_users INTEGER;
  available_slots INTEGER;
  capacity INTEGER := 1000;
BEGIN
  SELECT COUNT(*) INTO total_users FROM public.users WHERE role = 'user';
  SELECT COUNT(*) INTO active_users FROM public.users WHERE role = 'user' AND status = 'active';
  SELECT COUNT(*) INTO pending_users FROM public.users WHERE role = 'user' AND status = 'pending';
  SELECT COUNT(*) INTO suspended_users FROM public.users WHERE role = 'user' AND status = 'suspended';
  
  available_slots := capacity - total_users;
  
  RETURN json_build_object(
    'totalUsers', total_users,
    'activeUsers', active_users,
    'pendingUsers', pending_users,
    'suspendedUsers', suspended_users,
    'availableSlots', available_slots,
    'capacity', capacity,
    'isCapacityFull', total_users >= capacity
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_registration_stats() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION generate_unique_user_id() TO anon, authenticated;