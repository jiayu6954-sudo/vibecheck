-- VibeCheck Database Schema
-- Execute this in Supabase SQL Editor

-- 用户扩展表
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  plan TEXT DEFAULT 'free',
  ls_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 每日使用量
CREATE TABLE user_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles,
  date DATE DEFAULT CURRENT_DATE,
  scan_count INT DEFAULT 0,
  UNIQUE(user_id, date)
);

-- 扫描历史
CREATE TABLE scan_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles,
  language TEXT,
  score INT,
  grade TEXT,
  issues_count INT,
  result_json JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 策略
ALTER TABLE scan_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own data only" ON scan_history
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own usage only" ON user_usage
  FOR ALL USING (auth.uid() = user_id);

-- 自动创建 profile 的触发器 (当用户注册时)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, plan)
  VALUES (new.id, 'free');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
