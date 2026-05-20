-- ==========================================
-- VibeCheck Invite Code System
-- ==========================================

-- 1. 邀请码表
CREATE TABLE IF NOT EXISTS invite_codes (
  code TEXT PRIMARY KEY,
  max_uses INTEGER DEFAULT 1,
  used_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  description TEXT
);

-- 2. 用户邀请码使用记录表
CREATE TABLE IF NOT EXISTS user_invites (
  user_id UUID REFERENCES auth.users(id),
  invite_code TEXT REFERENCES invite_codes(code),
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, invite_code)
);

-- 3. 添加索引
CREATE INDEX IF NOT EXISTS idx_invite_codes_expires ON invite_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_invites_user_id ON user_invites(user_id);

-- 4. 启用 RLS (Row Level Security)
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_invites ENABLE ROW LEVEL SECURITY;

-- 5. RLS 策略：所有已认证用户都可以查看邀请码（验证时需要）
CREATE POLICY "Anyone can view invite codes"
  ON invite_codes FOR SELECT
  TO authenticated
  USING (true);

-- 6. RLS 策略：用户只能查看自己的使用记录
CREATE POLICY "Users can view their own invite usage"
  ON user_invites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 7. RLS 策略：用户可以插入自己的使用记录
CREATE POLICY "Users can insert their own invite usage"
  ON user_invites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 8. 插入初始邀请码
INSERT INTO invite_codes (code, max_uses, expires_at, description) VALUES
  ('EARLY2025', 100, '2025-12-31 23:59:59+00', 'Early adopter program - 100 users'),
  ('VIP-FOUNDER', 999999, NULL, 'Founder VIP access - unlimited'),
  ('BETA-TEST', 50, '2025-06-30 23:59:59+00', 'Beta testing program'),
  ('VIBECHECK2025', 200, '2025-12-31 23:59:59+00', 'Launch promotion')
ON CONFLICT (code) DO NOTHING;

-- 9. 创建函数：检查用户是否有 Pro 权限（通过邀请码）
CREATE OR REPLACE FUNCTION has_pro_access(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- 检查用户的 plan 字段
  IF EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_uuid AND plan = 'pro'
  ) THEN
    RETURN TRUE;
  END IF;

  -- 检查用户是否使用过有效的邀请码
  IF EXISTS (
    SELECT 1 FROM user_invites
    WHERE user_id = user_uuid
  ) THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. 创建函数：验证并使用邀请码
CREATE OR REPLACE FUNCTION redeem_invite_code(
  p_user_id UUID,
  p_code TEXT
)
RETURNS JSON AS $$
DECLARE
  v_invite_code RECORD;
  v_already_used BOOLEAN;
BEGIN
  -- 检查邀请码是否存在
  SELECT * INTO v_invite_code
  FROM invite_codes
  WHERE code = p_code;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid invite code');
  END IF;

  -- 检查是否已过期
  IF v_invite_code.expires_at IS NOT NULL AND v_invite_code.expires_at < NOW() THEN
    RETURN json_build_object('success', false, 'error', 'Invite code has expired');
  END IF;

  -- 检查使用次数是否已满
  IF v_invite_code.used_count >= v_invite_code.max_uses THEN
    RETURN json_build_object('success', false, 'error', 'Invite code has reached maximum uses');
  END IF;

  -- 检查用户是否已经使用过这个邀请码
  SELECT EXISTS(
    SELECT 1 FROM user_invites
    WHERE user_id = p_user_id AND invite_code = p_code
  ) INTO v_already_used;

  IF v_already_used THEN
    RETURN json_build_object('success', false, 'error', 'You have already used this invite code');
  END IF;

  -- 插入使用记录
  INSERT INTO user_invites (user_id, invite_code)
  VALUES (p_user_id, p_code);

  -- 更新邀请码使用次数
  UPDATE invite_codes
  SET used_count = used_count + 1
  WHERE code = p_code;

  -- 更新用户为 Pro
  UPDATE profiles
  SET plan = 'pro', updated_at = NOW()
  WHERE id = p_user_id;

  RETURN json_build_object('success', true, 'message', 'Pro plan activated successfully!');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 完成！
