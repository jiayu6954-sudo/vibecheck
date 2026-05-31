-- ==========================================
-- Fix profiles table RLS policies (修正版)
-- ==========================================

-- 1. 删除可能冲突的旧策略
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for users to their own profile" ON profiles;
DROP POLICY IF EXISTS "Enable update for users to their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow function to update profiles" ON profiles;

-- 2. 创建正确的 RLS 策略
CREATE POLICY "Enable read access for users to their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Enable update for users to their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. 允许 service role 和函数更新任何用户的 profile
CREATE POLICY "Allow service role to manage profiles"
  ON profiles FOR ALL
  USING (true)
  WITH CHECK (true);

-- 4. 验证您的 profile 是否存在（不查询 email）
SELECT id, plan, created_at, updated_at
FROM profiles
WHERE id = 'f239fba7-4637-4192-91b2-0cb3c6d76091';
