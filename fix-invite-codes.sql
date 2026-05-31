-- ==========================================
-- Fix Invite Codes (2026-05-20)
-- ==========================================

-- 1. 删除旧的邀请码
DELETE FROM invite_codes WHERE code IN ('EARLY2025', 'VIP-FOUNDER', 'BETA-TEST', 'VIBECHECK2025');

-- 2. 重新插入正确的邀请码（使用 2026-2027 的日期）
INSERT INTO invite_codes (code, max_uses, expires_at, description) VALUES
  ('EARLY2026', 100, '2026-12-31 23:59:59+00', 'Early adopter program - 100 users'),
  ('VIP-FOUNDER', 999999, NULL, 'Founder VIP access - unlimited'),
  ('BETA-TEST', 50, '2026-08-31 23:59:59+00', 'Beta testing program'),
  ('VIBECHECK2026', 200, '2026-12-31 23:59:59+00', 'Launch promotion');

-- 3. 验证插入结果
SELECT code, max_uses, used_count, expires_at, description
FROM invite_codes
ORDER BY code;
