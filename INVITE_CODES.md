# VibeCheck 邀请码系统管理指南

本文档说明如何管理和使用VibeCheck的邀请码系统。

---

## 📋 目录

- [邀请码概述](#邀请码概述)
- [当前可用邀请码](#当前可用邀请码)
- [如何使用邀请码](#如何使用邀请码)
- [如何创建邀请码](#如何创建邀请码)
- [邀请码管理](#邀请码管理)
- [数据库结构](#数据库结构)

---

## 🎫 邀请码概述

### **用途**

邀请码用于：
- ✅ 升级用户到Pro/VIP计划
- ✅ 解锁无限扫描次数
- ✅ 控制用户增长速度
- ✅ 奖励早期支持者

### **工作流程**

```
1. 用户注册 → 免费账号（3次/天）
2. 输入邀请码 → 兑换
3. 系统验证 → 检查有效性、使用次数
4. 升级账号 → Pro/VIP（无限次数）
5. 记录使用 → 防止重复兑换
```

---

## 🎯 当前可用邀请码

### **生产环境邀请码**

| 邀请码 | 类型 | 配额 | 过期时间 | 状态 | 已用/总量 |
|--------|------|------|---------|------|----------|
| `VIP-FOUNDER` | VIP | 无限 | 永久 | ✅ 激活 | -/999999 |
| `EARLY2026` | Pro | 无限 | 2026-12-31 | ✅ 激活 | -/100 |
| `BETA-TEST` | Pro | 无限 | 2026-08-31 | ✅ 激活 | -/50 |
| `VIBECHECK2026` | Pro | 无限 | 2026-12-31 | ✅ 激活 | -/200 |

### **邀请码说明**

#### **VIP-FOUNDER（创始会员）**
```
用途：奖励早期支持者、KOL、合作伙伴
特权：
  - 无限扫描次数
  - 永久有效
  - 尊贵徽章显示
  - 优先功能体验
分发策略：
  - 限量发放
  - 人工审核
  - 重要贡献者
```

#### **EARLY2026（早鸟用户）**
```
用途：公开推广，吸引早期用户
特权：
  - 无限扫描次数
  - 2026年底前有效
配额：100个用户
分发策略：
  - 社交媒体活动
  - 博客文章发布
  - 技术社区推广
```

#### **BETA-TEST（内测用户）**
```
用途：内部测试，收集反馈
特权：无限扫描次数
配额：50个用户
分发策略：
  - 邀请制
  - 技术背景用户
  - 愿意提供反馈
```

#### **VIBECHECK2026（上线推广）**
```
用途：产品正式上线推广
特权：无限扫描次数
配额：200个用户
分发策略：
  - Product Hunt发布
  - Hacker News讨论
  - 技术大会分享
```

---

## 🔑 如何使用邀请码

### **用户端操作**

**步骤1：登录账号**
```
访问 http://120.26.204.81:3000
使用邮箱登录
```

**步骤2：打开兑换界面**
```
点击顶部 "Redeem Invite Code" 按钮
```

**步骤3：输入邀请码**
```
输入框中填写：EARLY2026
点击 "Redeem" 按钮
```

**步骤4：验证成功**
```
看到成功消息："Pro plan activated successfully!"
顶部徽章变为："✨ Pro · Unlimited"
```

### **验证规则**

系统会检查：
1. ✅ 邀请码是否存在
2. ✅ 是否已过期
3. ✅ 是否达到最大使用次数
4. ✅ 用户是否已使用过此码

任何一项不通过，都会显示错误信息。

---

## ➕ 如何创建邀请码

### **方法1：通过Supabase控制台（推荐）**

**步骤1：登录Supabase**
```
https://supabase.com/dashboard/project/xaskqsjgdsfzqayxjwjd
```

**步骤2：打开SQL Editor**
```
左侧菜单 → SQL Editor → New query
```

**步骤3：执行SQL创建**

```sql
-- 创建单个邀请码
INSERT INTO invite_codes (code, max_uses, expires_at, description) 
VALUES (
  'SUMMER2026',           -- 邀请码（大写）
  50,                     -- 最大使用次数
  '2026-08-31 23:59:59+00',  -- 过期时间（UTC）
  'Summer promotion'      -- 描述
);

-- 创建永久邀请码
INSERT INTO invite_codes (code, max_uses, expires_at, description) 
VALUES (
  'VIP-SPECIAL',
  999999,                 -- 实际无限
  NULL,                   -- 永不过期
  'Special VIP access'
);
```

**步骤4：点击Run**

**步骤5：验证创建**

```sql
SELECT code, max_uses, used_count, expires_at, description
FROM invite_codes
WHERE code = 'SUMMER2026';
```

---

### **方法2：批量创建**

```sql
-- 批量创建活动邀请码
INSERT INTO invite_codes (code, max_uses, expires_at, description) VALUES
  ('HACKATHON01', 30, '2026-12-31 23:59:59+00', 'Hackathon event'),
  ('HACKATHON02', 30, '2026-12-31 23:59:59+00', 'Hackathon event'),
  ('HACKATHON03', 30, '2026-12-31 23:59:59+00', 'Hackathon event'),
  ('MEETUP2026', 100, '2026-12-31 23:59:59+00', 'Tech meetup'),
  ('PARTNER-ACME', 200, NULL, 'ACME Corp partnership');
```

---

### **邀请码命名规范**

**推荐格式：**

```
活动类：EVENT-NAME-YEAR
  例：HACKATHON-2026, MEETUP-SHANGHAI

推广类：PLATFORM-YEAR
  例：TWITTER-2026, PRODUCTHUNT

合作类：PARTNER-NAME
  例：PARTNER-GOOGLE, PARTNER-AWS

时间限定：SEASON-YEAR
  例：SUMMER2026, Q4-2026

测试类：TEST-PURPOSE
  例：BETA-TEST, INTERNAL-TEST
```

**命名原则：**
- ✅ 全大写
- ✅ 简短易记（<20字符）
- ✅ 有意义（能看出用途）
- ✅ 避免特殊字符（只用字母、数字、连字符）

---

## 📊 邀请码管理

### **查看所有邀请码**

```sql
SELECT 
  code,
  max_uses,
  used_count,
  expires_at,
  description,
  created_at,
  CASE 
    WHEN expires_at IS NOT NULL AND expires_at < NOW() THEN '已过期'
    WHEN used_count >= max_uses THEN '已用完'
    ELSE '可用'
  END as status
FROM invite_codes
ORDER BY created_at DESC;
```

---

### **查看使用统计**

```sql
-- 查看特定邀请码的使用情况
SELECT 
  ic.code,
  ic.max_uses,
  ic.used_count,
  (ic.max_uses - ic.used_count) as remaining,
  COUNT(icu.id) as actual_redemptions
FROM invite_codes ic
LEFT JOIN invite_code_usage icu ON ic.code = icu.code
WHERE ic.code = 'EARLY2026'
GROUP BY ic.id;

-- 查看谁使用了某个邀请码
SELECT 
  icu.code,
  icu.redeemed_at,
  p.id as user_id,
  au.email
FROM invite_code_usage icu
JOIN profiles p ON icu.user_id = p.id
JOIN auth.users au ON p.id = au.id
WHERE icu.code = 'EARLY2026'
ORDER BY icu.redeemed_at DESC;
```

---

### **更新邀请码**

```sql
-- 延长过期时间
UPDATE invite_codes 
SET expires_at = '2027-12-31 23:59:59+00'
WHERE code = 'EARLY2026';

-- 增加使用配额
UPDATE invite_codes 
SET max_uses = max_uses + 50
WHERE code = 'EARLY2026';

-- 修改描述
UPDATE invite_codes 
SET description = 'Early bird special - extended'
WHERE code = 'EARLY2026';
```

---

### **停用邀请码**

```sql
-- 方法1：设置为已过期
UPDATE invite_codes 
SET expires_at = NOW()
WHERE code = 'OLD-CODE';

-- 方法2：设置为已用完
UPDATE invite_codes 
SET max_uses = used_count
WHERE code = 'OLD-CODE';

-- 方法3：直接删除（不推荐，会丢失历史记录）
DELETE FROM invite_codes WHERE code = 'OLD-CODE';
```

---

### **重置邀请码**

```sql
-- 重置使用次数（小心使用！）
UPDATE invite_codes 
SET used_count = 0
WHERE code = 'TEST-CODE';

-- 同时需要删除使用记录
DELETE FROM invite_code_usage 
WHERE code = 'TEST-CODE';
```

---

## 🗄️ 数据库结构

### **invite_codes表**

```sql
CREATE TABLE invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,        -- 邀请码（唯一）
  max_uses INT DEFAULT 100,         -- 最大使用次数
  used_count INT DEFAULT 0,         -- 已使用次数
  expires_at TIMESTAMP,             -- 过期时间（NULL=永不过期）
  description TEXT,                 -- 描述
  created_at TIMESTAMP DEFAULT NOW() -- 创建时间
);
```

### **invite_code_usage表**

```sql
CREATE TABLE invite_code_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT REFERENCES invite_codes(code),  -- 邀请码
  user_id UUID REFERENCES profiles(id),     -- 用户ID
  redeemed_at TIMESTAMP DEFAULT NOW(),      -- 兑换时间
  UNIQUE(code, user_id)                     -- 防止重复兑换
);
```

### **兑换函数**

```sql
CREATE OR REPLACE FUNCTION redeem_invite_code(
  p_user_id UUID,
  p_code TEXT
)
RETURNS JSON AS $$
DECLARE
  v_invite_code RECORD;
  v_profile_exists BOOLEAN;
BEGIN
  -- 1. 检查邀请码是否存在
  SELECT * INTO v_invite_code
  FROM invite_codes
  WHERE UPPER(code) = UPPER(p_code);
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Invalid invite code'
    );
  END IF;
  
  -- 2. 检查是否过期
  IF v_invite_code.expires_at IS NOT NULL 
     AND v_invite_code.expires_at < NOW() THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Invite code has expired'
    );
  END IF;
  
  -- 3. 检查使用次数
  IF v_invite_code.used_count >= v_invite_code.max_uses THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Invite code usage limit reached'
    );
  END IF;
  
  -- 4. 检查用户是否已使用
  IF EXISTS (
    SELECT 1 FROM invite_code_usage
    WHERE code = v_invite_code.code AND user_id = p_user_id
  ) THEN
    RETURN json_build_object(
      'success', false,
      'message', 'You have already used this invite code'
    );
  END IF;
  
  -- 5. 创建profile（如果不存在）
  SELECT EXISTS(SELECT 1 FROM profiles WHERE id = p_user_id) INTO v_profile_exists;
  IF NOT v_profile_exists THEN
    INSERT INTO profiles (id, plan) VALUES (p_user_id, 'pro');
  ELSE
    UPDATE profiles SET plan = 'pro' WHERE id = p_user_id;
  END IF;
  
  -- 6. 记录使用
  INSERT INTO invite_code_usage (code, user_id)
  VALUES (v_invite_code.code, p_user_id);
  
  -- 7. 增加使用次数
  UPDATE invite_codes
  SET used_count = used_count + 1
  WHERE code = v_invite_code.code;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Pro plan activated successfully!'
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'message', SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 📈 推广策略

### **阶段1：内测（已完成）**

```
邀请码：BETA-TEST
配额：50人
渠道：
  - 朋友圈
  - 技术群组
  - 个人联系
```

### **阶段2：公开测试（当前）**

```
邀请码：EARLY2026
配额：100人
渠道：
  - Twitter/微博发布
  - 技术博客文章
  - Reddit/V2EX讨论
  - Product Hunt预热
```

### **阶段3：正式上线**

```
邀请码：VIBECHECK2026
配额：200人
渠道：
  - Product Hunt Launch
  - Hacker News Show HN
  - 技术大会演讲
  - 媒体报道
```

### **阶段4：合作推广**

```
邀请码：PARTNER-XXX（定制）
配额：根据合作规模
渠道：
  - 企业合作
  - 技术社区赞助
  - 教育机构合作
```

---

## 🎁 分发最佳实践

### **社交媒体**

**Twitter/微博示例：**
```
🎉 VibeCheck Early Access!

AI代码安全扫描器现已开放测试

早鸟福利：
✅ 无限扫描次数
✅ 双语报告支持
✅ 2026年全年免费

邀请码：EARLY2026
仅限前100名！

👉 http://120.26.204.81:3000

#AI #CodeSecurity #Cybersecurity
```

---

### **技术博客**

**文章末尾：**
```
---

## 限时福利

感谢阅读！使用邀请码 **EARLY2026** 可免费升级Pro版本。

- 访问：http://120.26.204.81:3000
- 登录后点击"Redeem Invite Code"
- 输入：EARLY2026

前100名有效，先到先得！
```

---

### **GitHub README**

```markdown
## 🎁 Get Early Access

Use invite code `EARLY2026` for unlimited scans (first 100 users):

1. Visit http://120.26.204.81:3000
2. Sign in with email
3. Redeem code: `EARLY2026`

Happy scanning! 🚀
```

---

## 📞 FAQ

### **Q: 如何查看某个邀请码还剩多少名额？**

```sql
SELECT 
  code,
  (max_uses - used_count) as remaining
FROM invite_codes
WHERE code = 'EARLY2026';
```

---

### **Q: 如何给特定用户手动升级Pro？**

```sql
UPDATE profiles 
SET plan = 'pro' 
WHERE id = 'user-uuid-here';
```

---

### **Q: 邀请码大小写敏感吗？**

A: 不敏感。系统会自动转换为大写进行比对。

---

### **Q: 用户可以使用多个邀请码吗？**

A: 不可以。每个用户只能使用一次邀请码升级。

---

### **Q: 如何撤销某个用户的Pro权限？**

```sql
UPDATE profiles 
SET plan = 'free' 
WHERE id = 'user-uuid-here';
```

---

## 📊 监控面板（TODO）

未来计划开发管理后台，功能包括：
- [ ] 可视化邀请码列表
- [ ] 实时使用统计
- [ ] 一键创建/停用
- [ ] 用户兑换历史
- [ ] 导出数据报表

---

<p align="center">
  <i>合理使用邀请码，助力产品增长！📈</i>
  <br><br>
  VibeCheck Team
</p>
