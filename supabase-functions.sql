-- VibeCheck Database Functions
-- Execute this in Supabase SQL Editor after running supabase-schema.sql

-- Function to increment scan count (used by scan.js)
CREATE OR REPLACE FUNCTION increment_scan_count(p_user_id UUID, p_date DATE)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_usage (user_id, date, scan_count)
  VALUES (p_user_id, p_date, 1)
  ON CONFLICT (user_id, date)
  DO UPDATE SET scan_count = user_usage.scan_count + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
