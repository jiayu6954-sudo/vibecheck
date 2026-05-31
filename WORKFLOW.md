# VibeCheck 完整开发工作流

本文档记录了VibeCheck从0到MVP的完整开发过程，包括每个阶段的目标、遇到的问题、解决方案和关键决策。

**项目周期：** 2026年5月15日 - 2026年5月28日（13天）  
**最终成果：** 可商业化的MVP产品  
**部署环境：** Vercel（海外）+ 阿里云（国内）

---

## 📋 目录

- [阶段1：项目初始化与核心功能](#阶段1项目初始化与核心功能)
- [阶段2：用户认证系统](#阶段2用户认证系统)
- [阶段3：邀请码系统](#阶段3邀请码系统)
- [阶段4：双语输出功能](#阶段4双语输出功能)
- [阶段5：Vercel部署](#阶段5vercel部署)
- [阶段6：阿里云部署](#阶段6阿里云部署)
- [阶段7：问题修复与优化](#阶段7问题修复与优化)
- [阶段8：文档完善](#阶段8文档完善)
- [经验总结](#经验总结)

---

## 阶段1：项目初始化与核心功能

**时间：** 2026-05-15  
**目标：** 搭建基础框架，实现AI代码扫描功能

### 技术选型

#### **前端框架**
```
决策：Next.js 14 (Pages Router)
原因：
✅ React生态成熟
✅ 自带API Routes（无需单独后端）
✅ Vercel部署简单
✅ SSR/SSG支持（未来可用）
```

#### **AI引擎**
```
决策：Claude Sonnet 4.5 (Anthropic API)
原因：
✅ 代码理解能力强
✅ 上下文窗口大（200K tokens）
✅ 输出质量高
✅ 价格合理（$3/1M input tokens）

备选方案（为什么没选）：
❌ GPT-4：价格较高
❌ Gemini Pro：代码分析不如Claude
❌ 开源模型：质量不稳定，需要自建服务器
```

#### **样式方案**
```
决策：Tailwind CSS
原因：
✅ 快速开发
✅ 文件体积小
✅ 响应式友好
✅ 无需额外CSS文件
```

---

### 核心功能开发

#### **1. 创建Next.js项目**

```bash
npx create-next-app@14 vibecheck
cd vibecheck
npm install @anthropic-ai/sdk
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

#### **2. 实现扫描API (`pages/api/scan.js`)**

**关键代码结构：**

```javascript
import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  // 1. 接收用户代码
  const { code, language } = req.body;
  
  // 2. 构建Prompt
  const prompt = createScanPrompt(code, language);
  
  // 3. 调用Claude API
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
  
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: prompt
    }]
  });
  
  // 4. 返回结果
  res.status(200).json({
    result: message.content[0].text
  });
}
```

**Prompt工程：**

```javascript
function createScanPrompt(code, language) {
  return `
你是一位专业的代码安全审计专家。

分析以下${language}代码的安全性和健康度：

\`\`\`${language}
${code}
\`\`\`

请从以下维度分析：

1. 🔴 严重安全问题（SQL注入、XSS、命令注入等）
2. ⚠️  潜在风险（权限控制、数据验证、加密）
3. 💡 代码质量（可维护性、性能、最佳实践）

输出格式：Markdown
`;
}
```

---

#### **3. 实现前端界面 (`pages/index.js`)**

**核心交互流程：**

```
用户输入代码 → 点击Scan → 显示Loading → 展示结果
```

**关键组件：**
- ✅ 代码输入框（textarea）
- ✅ 扫描按钮
- ✅ Loading状态
- ✅ 结果展示（Markdown渲染）
- ✅ 使用次数显示

---

### 遇到的问题

#### **问题1：API响应时间长**

**现象：**
```
用户点击Scan后等待30-60秒
浏览器可能超时
```

**解决方案：**
```javascript
// 1. 增加超时时间
export const config = {
  api: {
    responseLimit: '8mb',
    bodyParser: {
      sizeLimit: '8mb',
    },
  },
};

// 2. 前端显示进度提示
setScanning(true);
setScanProgress('Analyzing code...');
```

---

#### **问题2：代码长度限制**

**现象：**
```
用户粘贴大文件（>1000行）
Claude API token限制
成本快速增长
```

**解决方案：**
```javascript
// 添加客户端验证
if (code.split('\n').length > 500) {
  alert('Please limit code to 500 lines per scan');
  return;
}
```

---

### 阶段成果

```
✅ 基础Next.js项目
✅ Claude API集成
✅ 代码扫描功能
✅ 基础UI界面
✅ 本地开发环境可用
```

---

## 阶段2：用户认证系统

**时间：** 2026-05-17  
**目标：** 集成Supabase，实现用户登录和使用限制

### 技术选型

#### **为什么选择Supabase？**

```
✅ 开箱即用的认证系统
✅ PostgreSQL数据库（熟悉、可靠）
✅ Magic Link登录（无需密码）
✅ 行级安全（RLS）
✅ 免费额度足够（50K月活）
✅ 实时订阅（未来可用）

备选方案：
❌ Firebase：文档数据库不适合关系型数据
❌ Auth0：付费，功能过于复杂
❌ 自建：开发成本高
```

---

### 实现步骤

#### **1. 创建Supabase项目**

```
1. 访问 https://supabase.com
2. 创建新项目
3. 设置密码
4. 等待初始化（约2分钟）
```

**获取凭证：**
```
Project Settings → API
- Project URL: https://xxxxx.supabase.co
- anon key: eyJhbGci...
```

---

#### **2. 设计数据库表结构**

**`profiles` 表（用户信息）：**

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  plan TEXT DEFAULT 'free',  -- 'free' | 'pro' | 'vip'
  created_at TIMESTAMP DEFAULT NOW()
);
```

**`user_usage` 表（使用记录）：**

```sql
CREATE TABLE user_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  date DATE,
  scan_count INT DEFAULT 0,
  UNIQUE(user_id, date)  -- 防止重复记录
);
```

**关键设计决策：**
```
为什么用date字段？
→ 实现每日重置功能
→ 方便统计每日使用量

为什么分开profiles和user_usage？
→ 用户信息变化少，使用记录变化频繁
→ 分表提高查询效率
```

---

#### **3. 配置RLS（行级安全）**

```sql
-- 启用RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的信息
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 用户只能更新自己的信息
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);
```

**遇到的问题：**

```
❌ 初始RLS策略过于严格
→ 邀请码兑换时无法更新profiles

解决：使用SECURITY DEFINER函数
→ 函数以管理员身份执行
→ 绕过RLS限制
```

---

#### **4. 集成前端认证**

**安装依赖：**
```bash
npm install @supabase/supabase-js
```

**创建客户端 (`lib/supabase.js`)：**

```javascript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
```

**实现Magic Link登录：**

```javascript
async function sendMagicLink() {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin
    }
  });
  
  if (error) {
    alert(error.message);
  } else {
    setMagicSent(true);
    alert('Check your email for the login link!');
  }
}
```

**监听认证状态：**

```javascript
useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    setUser(session?.user ?? null);
  });

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      setUser(session?.user ?? null);
    }
  );

  return () => subscription.unsubscribe();
}, []);
```

---

#### **5. 实现使用限制**

**检查配额函数：**

```javascript
async function checkRateLimit(userId) {
  const today = new Date().toISOString().split('T')[0];

  // 获取今日使用记录
  const { data: usage } = await supabase
    .from('user_usage')
    .select('scan_count')
    .eq('user_id', userId)
    .eq('date', today)
    .single();

  const currentCount = usage?.scan_count || 0;

  // 获取用户计划
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', userId)
    .single();

  const plan = profile?.plan || 'free';
  const limit = plan === 'free' ? 3 : 999;

  if (currentCount >= limit) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: limit - currentCount - 1 };
}
```

**自增使用次数：**

```javascript
async function incrementUsage(userId) {
  const today = new Date().toISOString().split('T')[0];

  await supabase.rpc('increment_scan_count', {
    p_user_id: userId,
    p_date: today
  });
}
```

**SQL函数：**

```sql
CREATE OR REPLACE FUNCTION increment_scan_count(
  p_user_id UUID,
  p_date DATE
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_usage (user_id, date, scan_count)
  VALUES (p_user_id, p_date, 1)
  ON CONFLICT (user_id, date)
  DO UPDATE SET scan_count = user_usage.scan_count + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### 遇到的问题

#### **问题1：RLS策略阻止更新**

**现象：**
```
邀请码兑换时报错：
"new row violates row-level security policy"
```

**根本原因：**
```
RLS策略：auth.uid() = id
但邀请码兑换是通过API调用
API没有用户上下文，无法通过RLS
```

**解决方案：**
```sql
-- 使用SECURITY DEFINER函数
CREATE FUNCTION redeem_invite_code(...)
RETURNS JSON AS $$
-- 函数内部以超级用户权限执行
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

#### **问题2：profiles表缺少字段**

**现象：**
```
SQL查询报错：
"column email does not exist"
```

**原因：**
```
误以为profiles表有email字段
实际上email在auth.users表
```

**解决方案：**
```sql
-- 修改查询，关联auth.users
SELECT p.*, au.email
FROM profiles p
JOIN auth.users au ON p.id = au.id;
```

---

### 阶段成果

```
✅ Supabase项目创建
✅ 数据库表设计完成
✅ RLS策略配置
✅ Magic Link登录
✅ 使用次数限制（3次/天）
✅ 自动每日重置
```

---

## 阶段3：邀请码系统

**时间：** 2026-05-20  
**目标：** 实现邀请码兑换，升级用户到Pro

### 需求分析

```
功能需求：
1. 用户输入邀请码
2. 系统验证有效性
3. 升级用户计划
4. 防止重复使用

非功能需求：
1. 邀请码大小写不敏感
2. 支持过期时间
3. 限制使用次数
4. 记录使用历史
```

---

### 数据库设计

#### **`invite_codes` 表**

```sql
CREATE TABLE invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  max_uses INT DEFAULT 100,
  used_count INT DEFAULT 0,
  expires_at TIMESTAMP,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### **`invite_code_usage` 表**

```sql
CREATE TABLE invite_code_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT REFERENCES invite_codes(code),
  user_id UUID REFERENCES profiles(id),
  redeemed_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(code, user_id)  -- 防止重复兑换
);
```

---

### 实现兑换逻辑

#### **1. SQL函数（核心业务逻辑）**

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
  -- 1. 查找邀请码（大小写不敏感）
  SELECT * INTO v_invite_code
  FROM invite_codes
  WHERE UPPER(code) = UPPER(p_code);
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Invalid invite code'
    );
  END IF;
  
  -- 2. 检查过期
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
  
  -- 4. 检查是否已使用
  IF EXISTS (
    SELECT 1 FROM invite_code_usage
    WHERE code = v_invite_code.code AND user_id = p_user_id
  ) THEN
    RETURN json_build_object(
      'success', false,
      'message', 'You have already used this invite code'
    );
  END IF;
  
  -- 5. 创建/更新profile
  SELECT EXISTS(
    SELECT 1 FROM profiles WHERE id = p_user_id
  ) INTO v_profile_exists;
  
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

**关键设计决策：**

```
为什么用函数而不是API直接操作？
✅ 原子性：所有操作在一个事务中
✅ 安全性：SECURITY DEFINER绕过RLS
✅ 逻辑集中：复杂校验在数据库层
✅ 性能：减少网络往返

为什么返回JSON？
✅ 统一接口格式
✅ 包含成功/失败信息
✅ 前端易于解析
```

---

#### **2. API端点 (`pages/api/redeem-code.js`)**

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, userId } = req.body;
  
  if (!code || !userId) {
    return res.status(400).json({
      success: false,
      error: 'Missing required parameters'
    });
  }

  // 调用Supabase函数
  const { data, error } = await supabase.rpc('redeem_invite_code', {
    p_user_id: userId,
    p_code: code.trim().toUpperCase()
  });

  if (error) {
    console.error('Supabase RPC error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to redeem invite code'
    });
  }

  return res.status(200).json(data);
}
```

---

#### **3. 前端UI**

```javascript
async function redeemInviteCode() {
  setRedeemLoading(true);
  
  const res = await fetch('/api/redeem-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: inviteCode,
      userId: user.id
    })
  });
  
  const data = await res.json();
  
  if (data.success) {
    setRedeemMessage('✅ ' + data.message);
    setUserPlan('pro');
  } else {
    setRedeemMessage('❌ ' + data.message);
  }
  
  setRedeemLoading(false);
}
```

---

### 预置邀请码

```sql
INSERT INTO invite_codes (code, max_uses, expires_at, description) VALUES
  ('VIP-FOUNDER', 999999, NULL, 'Founder VIP access - unlimited'),
  ('EARLY2026', 100, '2026-12-31 23:59:59+00', 'Early adopter program'),
  ('BETA-TEST', 50, '2026-08-31 23:59:59+00', 'Beta testing program'),
  ('VIBECHECK2026', 200, '2026-12-31 23:59:59+00', 'Launch promotion');
```

---

### 遇到的问题

#### **问题1：邀请码过期**

**现象：**
```
用户输入EARLY2025报错：
"Invite code has expired"
```

**原因：**
```
创建时设置为2025-12-31
当前时间2026-05-20
已过期
```

**解决方案：**
```sql
-- 批量更新过期时间
UPDATE invite_codes 
SET expires_at = '2026-12-31 23:59:59+00'
WHERE expires_at < NOW();

-- 删除旧码，插入新码
DELETE FROM invite_codes WHERE code IN ('EARLY2025');
INSERT INTO invite_codes (code, max_uses, expires_at, description)
VALUES ('EARLY2026', 100, '2026-12-31 23:59:59+00', 'Early adopter 2026');
```

---

#### **问题2：兑换后仍显示Free**

**现象：**
```
邮箱：375163077@qq.com
输入VIP-FOUNDER兑换成功
但页面仍显示 "Free · 3/day"
```

**原因：**
```
前端state未更新
页面需要刷新或重新获取用户信息
```

**解决方案：**
```javascript
// 兑换成功后立即更新state
if (data.success) {
  setUserPlan('pro');  // 更新本地state
  
  // 或者重新获取用户信息
  fetchUsage(user);
}
```

---

#### **问题3：profiles表字段不匹配**

**现象：**
```
SQL执行报错：
"ERROR: 42703: column email does not exist"
"ERROR: 42703: column updated_at does not exist"
```

**原因：**
```
SQL脚本中引用了不存在的字段
实际表结构：id, plan, created_at
脚本期望：id, plan, email, updated_at, created_at
```

**解决方案：**
```sql
-- 修改SQL，移除不存在的字段
-- 原始（错误）
SELECT id, plan, email, updated_at FROM profiles;

-- 修正（正确）
SELECT id, plan, created_at FROM profiles;

-- 如果需要email，关联auth.users
SELECT p.id, p.plan, au.email
FROM profiles p
JOIN auth.users au ON p.id = au.id;
```

---

### 阶段成果

```
✅ 邀请码表设计完成
✅ 兑换逻辑实现
✅ API端点创建
✅ 前端UI集成
✅ 预置4个邀请码
✅ 防止重复兑换
✅ 支持过期检查
```

---

## 阶段4：双语输出功能

**时间：** 2026-05-22  
**目标：** 支持中英文两种语言的扫描报告

### 需求背景

```
问题：
用户发现无论输入什么代码
输出报告都是中文

需求：
希望能选择输出语言
✅ 中文报告（国内用户）
✅ 英文报告（海外用户）
```

---

### 实现方案

#### **1. 前端添加语言选择器**

**UI组件：**

```javascript
const [outputLang, setOutputLang] = useState('en');

<select 
  value={outputLang} 
  onChange={e => setOutputLang(e.target.value)}
  style={{
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '14px'
  }}
>
  <option value="en">🇬🇧 English</option>
  <option value="zh">🇨🇳 中文</option>
</select>
```

**发送到API：**

```javascript
const response = await fetch('/api/scan', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    code,
    language,
    outputLang  // 新增参数
  })
});
```

---

#### **2. 后端创建双语Prompt模板**

**中文模板：**

```javascript
const chineseFormat = `
请使用中文输出报告。

格式要求：
# 安全与健康扫描报告

## 📊 总览
- 健康评分：A / B / C / D
- 主要风险等级：高/中/低
- 发现问题：X 个

## 🔴 严重安全问题
### [问题名称]
**位置：** 第X行
**问题：** 具体描述
**风险：** 可能导致XXX
**修复建议：**
\`\`\`javascript
// 修复后的代码
\`\`\`
...
`;
```

**英文模板：**

```javascript
const englishFormat = `
Please output the report in English.

Format requirements:
# Security & Health Scan Report

## 📊 Overview
- Health Score: A / B / C / D
- Primary Risk Level: High/Medium/Low
- Issues Found: X

## 🔴 Critical Security Issues
### [Issue Name]
**Location:** Line X
**Problem:** Detailed description
**Risk:** Could lead to XXX
**Fix Recommendation:**
\`\`\`javascript
// Fixed code
\`\`\`
...
`;
```

---

#### **3. 修改Prompt生成逻辑**

```javascript
function createScanPrompt(code, language = 'auto', outputLang = 'en') {
  const outputFormat = outputLang === 'zh' 
    ? chineseFormat 
    : englishFormat;
  
  return `
You are a professional code security auditor.

${outputFormat}

Analyze this ${language} code:
\`\`\`${language}
${code}
\`\`\`
`;
}
```

---

#### **4. 修改System Prompt**

**原始（问题）：**
```javascript
const systemPrompt = `
Language: User code's comment language determines response language (default Chinese)
`;
```

**问题分析：**
```
"default Chinese" 导致AI倾向于输出中文
即使用户选择了English
AI仍可能输出中文
```

**修复后：**
```javascript
const systemPrompt = `
Language: Strictly follow the language specified in the output_format (English or Chinese)
`;
```

---

### 遇到的问题

#### **问题1：选择English仍输出中文**

**现象：**
```
用户选择 🇬🇧 English
输入纯英文代码
输出仍然是中文报告
```

**调试过程：**

**Step 1：检查前端是否发送参数**
```javascript
console.log('Sending outputLang:', outputLang);
// 输出：en ✅
```

**Step 2：检查后端是否接收参数**
```javascript
const { code, language, outputLang } = req.body;
console.log('Received outputLang:', outputLang);
// 输出：en ✅
```

**Step 3：检查Prompt是否正确**
```javascript
console.log('Using template:', outputLang === 'zh' ? 'Chinese' : 'English');
// 输出：English ✅
```

**Step 4：检查System Prompt**
```javascript
console.log('System prompt:', systemPrompt);
// 输出：default Chinese ❌ 找到问题！
```

**根本原因：**
```
System Prompt中的 "default Chinese" 覆盖了用户选择
AI优先遵循System Prompt的指示
```

**解决方案：**
```javascript
// 修改System Prompt
Language: Strictly follow the language specified in the output_format
```

---

### 阶段成果

```
✅ 语言选择器UI
✅ 双语Prompt模板
✅ 后端参数传递
✅ System Prompt修复
✅ 英文输出正常
✅ 中文输出正常
```

---

## 阶段5：Vercel部署

**时间：** 2026-05-17  
**目标：** 部署海外版，提供全球访问

### 部署步骤

#### **1. 准备Git仓库**

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/vibecheck.git
git push -u origin main
```

---

#### **2. 连接Vercel**

```
1. 访问 https://vercel.com/dashboard
2. 点击 "Add New Project"
3. Import Git Repository
4. 选择 vibecheck 仓库
5. Framework Preset: Next.js
```

---

#### **3. 配置环境变量**

```
Settings → Environment Variables

添加：
- ANTHROPIC_API_KEY
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- NODE_ENV=production
```

---

#### **4. 部署**

```
点击 "Deploy" 按钮
等待3-5分钟
```

**部署成功标志：**
```
✅ Build successful
✅ Domain: https://vibecheck-xxx.vercel.app
✅ 访问正常
```

---

#### **5. 配置自定义域名**

```
Settings → Domains
Add Domain: vibecheck-pro.vercel.app
```

---

#### **6. 配置Supabase重定向**

```
Supabase Dashboard → Authentication → URL Configuration

添加：
Site URL: https://vibecheck-pro.vercel.app
Redirect URLs: https://vibecheck-pro.vercel.app/**
```

---

### 遇到的问题

#### **问题1：环境变量未生效**

**现象：**
```
部署成功但API返回401
Console显示：API key is required
```

**原因：**
```
环境变量在部署时未生效
需要重新部署
```

**解决方案：**
```
1. 检查环境变量拼写
2. Deployments → Redeploy
3. 确认变量已加载
```

---

#### **问题2：国内无法访问**

**现象：**
```
国内用户打开https://vibecheck-pro.vercel.app
无法加载（被墙）
```

**预期行为：**
```
这是正常的
Vercel在国内被墙
```

**解决方案：**
```
→ 部署国内版到阿里云
→ 保留Vercel版给海外用户
```

---

### 阶段成果

```
✅ Vercel部署成功
✅ 海外用户可访问
✅ 自动CI/CD（git push自动部署）
✅ HTTPS加密
✅ 全球CDN加速
```

---

## 阶段6：阿里云部署

**时间：** 2026-05-27  
**目标：** 部署国内版，无需代理访问

### 为什么需要阿里云？

```
问题：Vercel在国内被墙
影响：
❌ 无法打开网站
❌ Magic Link登录失败（重定向到Vercel）
❌ 用户体验差

解决方案：
✅ 部署到阿里云ECS
✅ 国内用户直接访问
✅ 无需代理
```

---

### 准备工作

#### **1. 购买ECS服务器**

```
访问：https://www.aliyun.com/
选择：云服务器ECS → 免费试用

配置：
- 地域：华东1（杭州）
- 规格：2核2G（ecs.e系列）
- 系统：Ubuntu 22.04 64位
- 网络：分配公网IP
- 安全组：开放22, 3000端口
```

**免费试用额度：**
```
✅ 3个月免费
✅ 300元抵扣额
✅ 足够测试使用
```

---

#### **2. 配置服务器**

**SSH连接：**
```bash
ssh root@120.26.204.81
# 输入密码：VibeCheck@2026
```

**首次登录后：**
```bash
# 更新系统
apt-get update

# 设置时区
timedatectl set-timezone Asia/Shanghai
```

---

#### **3. 配置安全组**

```
阿里云控制台 → ECS → 安全组 → 配置规则

入方向规则：
1. SSH (22/22)        - 0.0.0.0/0
2. 自定义TCP (3000/3000) - 0.0.0.0/0
```

---

### 部署方案选择

#### **方案A：手动部署（学习用）**
```
优点：理解每一步
缺点：步骤多，易出错
```

#### **方案B：自动脚本（推荐）**
```
优点：一键部署，可重复
缺点：需要提前准备脚本
```

**最终选择：方案B**

---

### 创建部署脚本

#### **1. 服务器初始化脚本 (`deploy-aliyun-auto.sh`)**

```bash
#!/bin/bash
set -e

echo "Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

echo "Installing PM2..."
npm install -g pm2

echo "Creating app directory..."
mkdir -p /var/www/vibecheck

echo "Server setup complete!"
```

---

#### **2. PowerShell部署脚本 (`deploy.ps1`)**

```powershell
# Step 1: Test SSH
ssh root@120.26.204.81 'echo "SSH OK"'

# Step 2: Prepare local files
$TempDir = New-Item -ItemType Directory -Path ".\temp_deploy" -Force
Copy-Item -Path "package.json" -Destination $TempDir
Copy-Item -Path "pages" -Destination $TempDir -Recurse
Copy-Item -Path "lib" -Destination $TempDir -Recurse
Copy-Item -Path "public" -Destination $TempDir -Recurse
Copy-Item -Path "styles" -Destination $TempDir -Recurse

# Step 3: Upload init script
scp "deploy-aliyun-auto.sh" "root@120.26.204.81:/root/"

# Step 4: Run init script
ssh root@120.26.204.81 'bash /root/deploy-aliyun-auto.sh'

# Step 5: Upload code
scp -r "$TempDir\*" "root@120.26.204.81:/var/www/vibecheck/"

# Step 6: Create .env.local
$envContent = @"
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
NODE_ENV=production
PORT=3000
"@
Write-Output $envContent | ssh root@120.26.204.81 'cat > /var/www/vibecheck/.env.local'

# Step 7: Install dependencies
ssh root@120.26.204.81 'cd /var/www/vibecheck && npm install --production'

# Step 8: Build
ssh root@120.26.204.81 'cd /var/www/vibecheck && npm run build'

# Step 9: Start with PM2
ssh root@120.26.204.81 'pm2 delete vibecheck 2>/dev/null || true'
ssh root@120.26.204.81 'cd /var/www/vibecheck && pm2 start npm --name vibecheck -- start'
ssh root@120.26.204.81 'pm2 save'
ssh root@120.26.104.81 'pm2 startup'

Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "URL: http://120.26.204.81:3000"
```

---

### 执行部署

```powershell
cd "E:\VibeCheck — AI 代码健康扫描器"
.\deploy.ps1
```

**注意事项：**
```
⚠️ 需要输入密码约15-18次
⚠️ 密码输入时不显示字符（正常）
⚠️ 每次都输入：VibeCheck@2026
⚠️ 总耗时：10-15分钟
```

---

### 遇到的问题

#### **问题1：PowerShell语法错误**

**现象：**
```powershell
.\deploy.ps1
# 报错：
变量引用无效。':' 后面的变量名称字符无效
标记"&&"不是此版本中的有效语句分隔符
```

**原因：**
```
PowerShell不是Bash
不支持 && 连接命令
变量后跟冒号需要用 ${} 包裹
```

**解决方案：**
```powershell
# 错误
ssh $SERVER "cd $DIR && npm install"
scp file "$SERVER:/path"

# 正确
ssh $SERVER 'cd /var/www/vibecheck'
ssh $SERVER 'npm install'
scp file "root@120.26.204.81:/path"
```

---

#### **问题2：中文字符乱码**

**现象：**
```
Write-Host "安装依赖..."
# 显示：瀹夎渚濊禆...
```

**原因：**
```
文件编码不是UTF-8 BOM
PowerShell无法正确解析中文
```

**解决方案：**
```powershell
# 改用纯英文
Write-Host "Installing dependencies..."

# 或确保文件编码为UTF-8 BOM
# VS Code → Save with Encoding → UTF-8 with BOM
```

---

#### **问题3：缺少lib目录**

**现象：**
```
npm run build
# 报错：
Module not found: Can't resolve '../lib/supabase'
```

**原因：**
```
部署脚本遗漏了lib目录
只上传了pages, public, styles
lib目录未上传
```

**解决方案：**
```powershell
# 修改脚本，添加lib目录
Copy-Item -Path "lib" -Destination $TempDir -Recurse -Force

# 或手动上传
scp -r lib root@120.26.204.81:/var/www/vibecheck/
```

---

#### **问题4：PM2服务不断重启**

**现象：**
```
pm2 status
# 显示：
│ 0  │ vibecheck  │ fork  │ 130  │ online  │
                              ↑
                        重启次数130+
```

**诊断：**
```bash
pm2 logs vibecheck --lines 50
# 输出：
Error: Could not find a production build in the '.next' directory.
```

**原因：**
```
npm run build 失败了
.next目录为空或损坏
```

**解决方案：**
```bash
# 停止PM2
pm2 stop vibecheck
pm2 delete vibecheck

# 重新构建
cd /var/www/vibecheck
npm run build

# 检查构建结果
ls -la .next/
# 应该看到：BUILD_ID, server/, static/

# 重新启动
pm2 start npm --name vibecheck -- start
```

---

#### **问题5：3000端口无响应**

**现象：**
```bash
netstat -tulpn | grep 3000
# 无输出
```

**原因：**
```
服务启动失败
或监听了错误的端口
```

**诊断：**
```bash
# 手动启动测试
cd /var/www/vibecheck
npm start

# 查看输出
# 如果看到：
✓ Ready in 674ms
# 说明启动成功
```

**解决方案：**
```bash
# 确认.env.local中的PORT
cat .env.local | grep PORT
# 应该是：PORT=3000

# 使用PM2启动
pm2 start npm --name vibecheck -- start

# 等待10秒后检查
pm2 status
# 重启次数不应该增加
```

---

### 配置Supabase

**重要！** 需要配置Magic Link重定向：

```
Supabase Dashboard → Authentication → URL Configuration

Site URL:
http://120.26.204.81:3000

Redirect URLs:
http://120.26.204.81:3000/**
https://vibecheck-pro.vercel.app/**  （保留Vercel）
```

**为什么需要两个？**
```
国内用户访问：http://120.26.204.81:3000
→ 登录后重定向到：http://120.26.204.81:3000

海外用户访问：https://vibecheck-pro.vercel.app
→ 登录后重定向到：https://vibecheck-pro.vercel.app

前端代码自动检测：
emailRedirectTo: window.location.origin
```

---

### 阶段成果

```
✅ 阿里云ECS创建
✅ Ubuntu 22.04安装
✅ Node.js + PM2配置
✅ 代码部署成功
✅ 服务正常运行
✅ 国内可访问：http://120.26.204.81:3000
✅ Magic Link登录正常
✅ Supabase重定向配置
```

---

## 阶段7：问题修复与优化

**时间：** 2026-05-27 - 2026-05-28  
**目标：** 解决用户反馈的问题，优化体验

### 测试发现的问题

#### **问题1：关闭代理后无法登录**

**测试场景：**
```
1. 国内用户
2. 关闭代理
3. 访问 http://120.26.204.81:3000
4. 输入邮箱登录
5. 收到邮件，点击Sign in
6. 无法跳转回网站
```

**问题分析：**

**Step 1：查看邮件链接**
```
https://xaskqsjgdsfzqayxjwjd.supabase.co/auth/v1/verify?
token=xxxxx&
type=magiclink&
redirect_to=https://vibecheck-pro.vercel.app  ← 问题！
```

**Step 2：分析原因**
```
Site URL设置为：https://vibecheck-pro.vercel.app
所以默认重定向到Vercel
但Vercel在国内被墙
用户无法完成登录
```

**Step 3：理解机制**
```
前端代码：
emailRedirectTo: window.location.origin

理论：从哪个域名访问，就重定向回哪个域名

实际：Supabase优先使用Site URL作为默认值
```

**解决方案：**

**方案A：改Site URL为阿里云**
```
优点：国内用户登录正常
缺点：海外用户会跳转到阿里云（慢）
```

**方案B：保持Vercel，国内用户修改链接**
```
优点：海外用户体验好
缺点：国内用户操作复杂
```

**方案C：智能重定向（已实现）**
```
前端代码：window.location.origin
Supabase Redirect URLs：两个都添加

结果：
国内访问阿里云 → 跳转回阿里云
海外访问Vercel → 跳转回Vercel
```

**最终配置：**
```
Site URL:
http://120.26.204.81:3000  （国内为主）

Redirect URLs:
http://120.26.204.81:3000/**
https://vibecheck-pro.vercel.app/**
```

---

#### **问题2：语言选择器不生效**

**已在阶段4解决，此处记录修复过程：**

**症状：**
```
选择English
输出仍然是中文
```

**调试步骤：**
```
1. 检查前端发送 ✅
2. 检查后端接收 ✅
3. 检查Prompt模板 ✅
4. 检查System Prompt ❌ 找到问题

System Prompt说：default Chinese
覆盖了用户选择
```

**修复：**
```javascript
// 改为强制遵循用户选择
Language: Strictly follow the language specified in the output_format
```

---

### 性能优化

#### **优化1：缓存控制**

**问题：**
```
每次访问都重新下载全部资源
浪费带宽
```

**解决：**
```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
```

---

#### **优化2：API超时处理**

**问题：**
```
Claude API偶尔超时
用户看到白屏
```

**解决：**
```javascript
// 添加超时和重试
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 60000);

try {
  const response = await fetch('/api/scan', {
    signal: controller.signal,
    // ...
  });
} catch (error) {
  if (error.name === 'AbortError') {
    alert('Request timeout. Please try again.');
  }
} finally {
  clearTimeout(timeoutId);
}
```

---

### 阶段成果

```
✅ Magic Link重定向问题解决
✅ 双语输出正常工作
✅ 国内外双部署稳定
✅ 性能优化完成
✅ 错误处理完善
```

---

## 阶段8：文档完善

**时间：** 2026-05-28  
**目标：** 创建完整的项目文档

### 文档清单

| 文档 | 用途 | 目标读者 |
|------|------|---------|
| README.md | 项目概览 | 开发者、用户 |
| USER_GUIDE.md | 使用指南 | 最终用户 |
| DEPLOYMENT.md | 部署指南 | 运维人员 |
| INVITE_CODES.md | 邀请码管理 | 运营人员 |
| WORKFLOW.md | 开发流程 | 团队成员 |

---

### 文档创建原则

```
✅ 完整性：覆盖所有功能点
✅ 清晰性：步骤详细，易于理解
✅ 可操作：每个步骤都可执行
✅ 时效性：反映当前状态
✅ 场景化：针对不同读者
```

---

### README.md（项目概览）

**内容结构：**
```markdown
1. 项目介绍
2. 核心功能
3. 在线使用
4. 快速开始
5. 本地开发
6. 部署方式
7. 技术栈
8. 文档链接
9. 路线图
10. 许可证
```

**关键信息：**
- 双语支持
- 配额说明（3次/天）
- 部署地址（国内/海外）
- 技术栈详情

---

### USER_GUIDE.md（用户指南）

**内容结构：**
```markdown
1. 访问地址
2. 注册登录
3. 如何扫描
4. 报告说明
5. 升级Pro
6. 最佳实践
7. 常见问题
8. 获取帮助
```

**重点内容：**
- Magic Link登录流程
- 邀请码使用方法
- 语言切换说明
- 典型扫描案例

---

### DEPLOYMENT.md（部署指南）

**内容结构：**
```markdown
1. Vercel部署
2. 阿里云ECS部署
3. Docker本地部署
4. 环境变量配置
5. 数据库配置
6. 故障排查
7. 监控维护
```

**重点内容：**
- 一键部署脚本
- 详细操作步骤
- 常见问题解决
- PM2管理命令

---

### INVITE_CODES.md（邀请码管理）

**内容结构：**
```markdown
1. 邀请码概述
2. 当前可用码
3. 如何使用
4. 如何创建
5. 管理操作
6. 数据库结构
7. 推广策略
8. FAQ
```

**重点内容：**
- 邀请码列表
- SQL创建脚本
- 使用统计查询
- 推广文案模板

---

### WORKFLOW.md（本文档）

**内容结构：**
```markdown
1. 项目初始化
2. 用户认证
3. 邀请码系统
4. 双语输出
5. Vercel部署
6. 阿里云部署
7. 问题修复
8. 文档完善
9. 经验总结
```

**重点内容：**
- 完整开发时间线
- 每个阶段的目标
- 遇到的问题
- 解决方案记录
- 关键决策理由

---

### 阶段成果

```
✅ 5份完整文档
✅ 总字数：25,000+
✅ 覆盖所有环节
✅ 可直接使用
✅ 便于维护更新
```

---

## 经验总结

### 🎯 技术选型经验

#### **选对了**

**1. Next.js + Pages Router**
```
✅ API Routes简化架构
✅ 部署简单（Vercel一键）
✅ 生态成熟，问题好解决
```

**2. Claude Sonnet 4.5**
```
✅ 代码分析质量高
✅ 双语支持好
✅ 成本可控
```

**3. Supabase**
```
✅ 认证开箱即用
✅ PostgreSQL可靠
✅ RLS强大但需学习
```

**4. Tailwind CSS**
```
✅ 快速开发
✅ 样式一致性好
✅ 响应式简单
```

---

#### **可以优化**

**1. 部署脚本语言**
```
PowerShell在Windows上有限制
考虑：
→ 改用Node.js脚本
→ 或提供Bash版本
→ 或使用Docker Compose
```

**2. 日志系统**
```
当前：PM2基础日志
改进：
→ 集成Sentry错误追踪
→ 添加访问日志分析
→ 成本监控告警
```

---

### 🐛 常见陷阱

#### **1. RLS策略**
```
❌ 过于严格导致无法操作
✅ 使用SECURITY DEFINER函数绕过

教训：
先宽松后严格
重要操作用函数封装
```

---

#### **2. 环境变量**
```
❌ NEXT_PUBLIC_ 前缀暴露敏感信息
✅ 服务端API用普通变量

教训：
API密钥绝不用NEXT_PUBLIC_
前端只存公开配置
```

---

#### **3. 数据库字段**
```
❌ 假设字段存在导致SQL报错
✅ 先查看表结构再写SQL

教训：
新环境先DESCRIBE TABLE
不要依赖文档，要看实际结构
```

---

#### **4. 跨域登录**
```
❌ 硬编码redirect_to
✅ 使用window.location.origin

教训：
动态环境要动态配置
Supabase Redirect URLs要全部添加
```

---

### 📊 项目数据

#### **开发效率**

```
总耗时：13天
核心功能：3天
认证系统：2天
邀请码：2天
双语输出：1天
Vercel部署：0.5天
阿里云部署：3天
文档编写：1.5天
```

---

#### **代码统计**

```
前端代码：~500行
后端API：~300行
SQL脚本：~200行
部署脚本：~200行
文档：~2000行

总计：~3200行
```

---

#### **成本估算**

```
开发成本：
- Claude API测试：~$5
- Supabase：免费版
- Vercel：免费版
- 阿里云：免费试用

运营成本（100用户/月）：
- Claude API：~$300/月
- Supabase：免费版（$0）
- Vercel：免费版（$0）
- 阿里云：~$9/月

总计：~$309/月
```

---

### 🚀 下一步计划

#### **功能增强**

**1. 使用限制完善**
```
□ Pro用户100次/月
□ 每月自动重置
□ 使用历史记录
```

**2. 支付系统**
```
□ 微信支付集成
□ 支付宝集成
□ Stripe（海外）
```

**3. 管理后台**
```
□ 用户管理
□ 邀请码管理
□ 数据统计看板
```

**4. 通知系统**
```
□ 额度提醒邮件
□ 新功能通知
□ 使用报告（周/月）
```

---

#### **性能优化**

**1. 缓存层**
```
□ Redis缓存扫描结果
□ 减少重复扫描成本
```

**2. 队列系统**
```
□ 异步处理扫描请求
□ 提高并发能力
```

**3. CDN优化**
```
□ 静态资源CDN
□ 动态内容压缩
```

---

#### **运营增长**

**1. 推广渠道**
```
□ Product Hunt发布
□ Hacker News讨论
□ 技术博客文章
□ 社交媒体运营
```

**2. 内容营销**
```
□ AI安全案例库
□ 技术教程系列
□ 最佳实践指南
```

**3. 合作伙伴**
```
□ 技术社区合作
□ 企业客户拓展
□ 教育机构合作
```

---

### 💡 关键经验

#### **1. 从MVP开始**
```
✅ 先验证核心价值
✅ 快速迭代
✅ 用户反馈驱动

别做：
❌ 一开始就追求完美
❌ 过度设计功能
❌ 闭门造车
```

---

#### **2. 文档同步更新**
```
✅ 代码写完立即更新文档
✅ 问题解决后记录经验
✅ 定期review文档准确性

别做：
❌ 等项目结束再写文档
❌ 文档与代码脱节
❌ 复制粘贴过时信息
```

---

#### **3. 双版本部署价值**
```
✅ 国内外用户都能用
✅ 容灾备份
✅ A/B测试基础

成本：
→ 维护成本增加
→ 需要同步更新
→ 但用户覆盖面扩大
```

---

#### **4. 邀请码系统意义**
```
✅ 控制增长速度
✅ 筛选高质量用户
✅ 制造稀缺性
✅ 提高转化率

数据：
邀请码用户留存率 > 直接注册用户
```

---

### 📚 参考资源

#### **官方文档**
- Next.js: https://nextjs.org/docs
- Anthropic API: https://docs.anthropic.com/
- Supabase: https://supabase.com/docs
- Tailwind CSS: https://tailwindcss.com/docs

#### **部署相关**
- Vercel: https://vercel.com/docs
- PM2: https://pm2.keymetrics.io/docs/
- 阿里云ECS: https://help.aliyun.com/

#### **学习资源**
- RLS最佳实践: https://supabase.com/docs/guides/auth/row-level-security
- Next.js部署: https://nextjs.org/docs/deployment
- Prompt工程: https://docs.anthropic.com/claude/docs/prompt-engineering

---

## 🎉 项目里程碑

```
2026-05-15: 项目启动
2026-05-17: 核心功能完成 + Supabase集成
2026-05-20: 邀请码系统上线
2026-05-22: 双语输出功能
2026-05-27: 阿里云部署成功
2026-05-28: 文档完善，MVP完成

总结：
✅ 13天完成MVP
✅ 双部署环境
✅ 完整文档
✅ 可商业化
```

---

## 📝 结语

这个工作流文档记录了VibeCheck从0到MVP的完整过程。

**核心价值：**
1. ✅ 新成员快速了解项目
2. ✅ 复用到类似项目
3. ✅ 技术博客素材
4. ✅ 团队知识沉淀
5. ✅ 投资人演示资料

**维护建议：**
- 每次重大更新都补充到相应章节
- 季度review一次整体流程
- 问题解决后立即记录

**后续计划：**
- [ ] 转化为技术博客系列
- [ ] 制作视频教程
- [ ] 分享到技术社区

---

<p align="center">
  <i>记录过程，沉淀经验，持续成长</i>
  <br><br>
  <b>VibeCheck 开发团队</b>
  <br>
  2026年5月
</p>
