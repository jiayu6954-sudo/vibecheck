-- ==========================================
-- 重新创建邀请码兑换函数（简化版，稳定）
-- ==========================================

-- 1. 删除旧函数
DROP FUNCTION IF EXISTS redeem_invite_code(uuid, text);

-- 2. 创建新的简化函数
CREATE OR REPLACE FUNCTION redeem_invite_code(
  p_user_id UUID,
  p_code TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invite_code RECORD;
  v_already_used BOOLEAN;
  v_profile_exists BOOLEAN;
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

  -- 检查 profile 是否存在
  SELECT EXISTS(
    SELECT 1 FROM profiles WHERE id = p_user_id
  ) INTO v_profile_exists;

  -- 如果 profile 不存在，创建它
  IF NOT v_profile_exists THEN
    INSERT INTO profiles (id, plan, created_at)
    VALUES (p_user_id, 'pro', NOW());
  ELSE
    -- 更新为 Pro
    UPDATE profiles
    SET plan = 'pro'
    WHERE id = p_user_id;
  END IF;

  -- 插入使用记录
  INSERT INTO user_invites (user_id, invite_code, used_at)
  VALUES (p_user_id, p_code, NOW());

  -- 更新邀请码使用次数
  UPDATE invite_codes
  SET used_count = used_count + 1
  WHERE code = p_code;

  RETURN json_build_object('success', true, 'message', 'Pro plan activated successfully!');

EXCEPTION WHEN OTHERS THEN
  -- 捕获所有错误并返回详细信息
  RETURN json_build_object(
    'success', false,
    'error', 'Database error: ' || SQLERRM
  );
END;
$$;

-- 3. 测试函数（用您的新邮箱 ID）
-- 先获取新邮箱的 user_id
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 3;
