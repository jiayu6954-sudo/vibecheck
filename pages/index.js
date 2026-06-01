import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// ── 颜色系统（ChatGPT/Gemini 风格：白底、极简）──
const C = {
  bg: '#ffffff',
  bgSub: '#f7f7f8',
  bgHover: '#f0f0f1',
  border: '#e5e5e6',
  borderStrong: '#d1d1d2',
  text: '#0d0d0d',
  textSub: '#6b6b6b',
  textMuted: '#adadad',
  green: '#10a37f',   // ChatGPT 绿
  greenDim: '#10a37f18',
  greenBorder: '#10a37f30',
  red: '#ef4444',
  redDim: '#ef444418',
  amber: '#f59e0b',
  amberDim: '#f59e0b18',
  blue: '#3b82f6',
  blueDim: '#3b82f618',
  gray: '#6b6b6b',
}

const severity = {
  critical: { color: '#ef4444', bg: '#ef444412', label: 'Critical' },
  high:     { color: '#f97316', bg: '#f9731612', label: 'High' },
  medium:   { color: '#f59e0b', bg: '#f59e0b12', label: 'Medium' },
  low:      { color: '#6b6b6b', bg: '#6b6b6b12', label: 'Low' },
}

const grade = {
  A: '#10a37f', B: '#3b82f6', C: '#f59e0b', D: '#f97316', F: '#ef4444'
}

const categoryIcon = {
  security: '🔒', maintainability: '🔧', performance: '⚡', bug_risk: '🐛'
}

export default function Home() {
  const [code, setCode]               = useState('')
  const [language, setLanguage]       = useState('javascript')
  const [outputLang, setOutputLang]   = useState('en') // 'en' or 'zh'
  const [result, setResult]           = useState(null)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState(null)
  const [user, setUser]               = useState(null)
  const [email, setEmail]             = useState('')
  const [magicSent, setMagicSent]     = useState(false)
  const [usageCount, setUsageCount]   = useState(0)
  const [authLoading, setAuthLoading] = useState(true)
  const [userPlan, setUserPlan]       = useState('free')
  const [inviteCode, setInviteCode]   = useState('')
  const [redeemLoading, setRedeemLoading] = useState(false)
  const [redeemMessage, setRedeemMessage] = useState(null)
  const FREE_LIMIT = 3

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchUsage(session.user)
      setAuthLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchUsage(session.user)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function fetchUsage(u) {
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('user_usage').select('scan_count')
      .eq('user_id', u.id).eq('date', today).single()
    setUsageCount(data?.scan_count ?? 0)

    // Fetch user plan
    const { data: profile } = await supabase
      .from('profiles').select('plan')
      .eq('id', u.id).single()
    setUserPlan(profile?.plan ?? 'free')
  }

  async function redeemInviteCode() {
    if (!inviteCode.trim() || redeemLoading) return
    setRedeemLoading(true)
    setRedeemMessage(null)

    try {
      const res = await fetch('/api/redeem-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: inviteCode.trim().toUpperCase(),
          userId: user.id
        })
      })
      const data = await res.json()

      if (data.success) {
        setRedeemMessage({ type: 'success', text: '🎉 Pro plan activated! You now have unlimited scans.' })
        setUserPlan('pro')
        setInviteCode('')
        setTimeout(() => setRedeemMessage(null), 5000)
      } else {
        setRedeemMessage({ type: 'error', text: data.error || 'Invalid invite code' })
      }
    } catch (err) {
      setRedeemMessage({ type: 'error', text: 'Failed to redeem code. Please try again.' })
    } finally {
      setRedeemLoading(false)
    }
  }

  async function sendMagicLink() {
    const { error } = await supabase.auth.signInWithOtp({
      email, options: { emailRedirectTo: window.location.origin }
    })
    if (error) alert(error.message)
    else setMagicSent(true)
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null); setUsageCount(0); setResult(null)
  }

  async function scanCode() {
    if (!code.trim() || loading) return
    setLoading(true); setError(null); setResult(null)
    try {
      const session = await supabase.auth.getSession()
      const token = session.data.session?.access_token
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ code, language, outputLang })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(res.status === 429 ? 'LIMIT_REACHED' : (data.error || 'Scan failed. Please try again.'))
        return
      }
      setResult(data)
      if (user) fetchUsage(user)
    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 20, height: 20, border: `2px solid ${C.border}`, borderTopColor: C.green, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  // ── 未登录 ──
  if (!user) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif', padding: '0 20px' }}>

      {/* Logo */}
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <div style={{ width: 44, height: 44, background: C.green, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 22 }}>🛡️</div>
        <h1 style={{ fontSize: 26, fontWeight: 600, color: C.text, margin: '0 0 6px' }}>VibeCheck</h1>
        <p style={{ fontSize: 14, color: C.textSub, margin: 0 }}>Find security issues in your AI-generated code — in 30 seconds</p>
      </div>

      {/* 登录卡片 */}
      <div style={{ width: '100%', maxWidth: 360, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: '28px 24px' }}>
        {!magicSent ? (
          <>
            <p style={{ fontSize: 13, color: C.textSub, marginBottom: 16, lineHeight: 1.6 }}>
              Sign in to get started. Free plan includes <strong style={{ color: C.text }}>3 scans per day</strong>.
            </p>
            <input
              type="email" placeholder="you@example.com" value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMagicLink()}
              style={{ width: '100%', padding: '10px 12px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 14, color: C.text, outline: 'none', marginBottom: 10, boxSizing: 'border-box', fontFamily: 'inherit' }}
            />
            <button onClick={sendMagicLink} disabled={!email}
              style={{ width: '100%', padding: '10px', background: email ? C.green : C.bgSub, color: email ? '#fff' : C.textMuted, border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: email ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>
              Continue with Email
            </button>
            <p style={{ textAlign: 'center', fontSize: 12, color: C.textMuted, marginTop: 12, marginBottom: 0 }}>No password needed · Click the link in your email</p>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📬</div>
            <p style={{ fontSize: 14, fontWeight: 500, color: C.text, marginBottom: 6 }}>Check your inbox</p>
            <p style={{ fontSize: 13, color: C.textSub, marginBottom: 16 }}>We sent a link to <strong>{email}</strong></p>
            <button onClick={() => setMagicSent(false)} style={{ background: 'none', border: 'none', color: C.green, fontSize: 13, cursor: 'pointer' }}>Resend email</button>
          </div>
        )}
      </div>

      <p style={{ fontSize: 12, color: C.textMuted, marginTop: 24 }}>Free · No credit card · Cancel anytime</p>
    </div>
  )

  const isPro = userPlan === 'pro'
  const remaining = isPro ? '∞' : Math.max(0, FREE_LIMIT - usageCount)
  const limitReached = !isPro && (usageCount >= FREE_LIMIT || error === 'LIMIT_REACHED')

  // ── 主界面 ──
  return (
    <div style={{ minHeight: '100vh', background: C.bgSub, fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' }}>

      {/* 顶部导航 */}
      <nav style={{ background: C.bg, borderBottom: `1px solid ${C.border}`, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>🛡️</span>
          <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>VibeCheck</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Plan badge */}
          {isPro ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: C.greenDim, border: `1px solid ${C.greenBorder}`, borderRadius: 20, padding: '4px 12px' }}>
              <span style={{ fontSize: 12 }}>✨</span>
              <span style={{ fontSize: 12, color: C.green, fontWeight: 500 }}>Pro · Unlimited</span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: C.bgSub, border: `1px solid ${C.border}`, borderRadius: 20, padding: '4px 12px' }}>
              <span style={{ fontSize: 12 }}>{remaining === 0 ? '🔴' : '🟢'}</span>
              <span style={{ fontSize: 12, color: C.textSub }}>{remaining} scan{remaining !== 1 ? 's' : ''} left today</span>
            </div>
          )}
          <span style={{ fontSize: 12, color: C.textMuted }}>{user.email}</span>
          <button onClick={signOut} style={{ fontSize: 12, color: C.textSub, background: 'none', border: `1px solid ${C.border}`, borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>Sign out</button>
        </div>
      </nav>

      {/* 主内容 */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 20px' }}>

        {/* 价值主张 */}
        <div style={{ background: 'linear-gradient(135deg, #10a37f08 0%, #3b82f608 100%)', border: `1px solid ${C.greenBorder}`, borderRadius: 12, padding: '24px', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <span style={{ fontSize: 32, lineHeight: 1 }}>🎯</span>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 600, color: C.text, margin: '0 0 8px' }}>
                专治 AI 代码陷阱 — Claude 不会告诉你的问题
              </h1>
              <p style={{ fontSize: 13, color: C.textSub, margin: '0 0 12px', lineHeight: 1.6 }}>
                Cursor、Copilot 生成的代码看起来能用？但可能隐藏了<strong>硬编码密钥、SQL注入、未处理异常</strong>等致命问题。
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: C.green }}>
                  <span>✓</span><span>AI 特有问题检测</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: C.green }}>
                  <span>✓</span><span>中文报告</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: C.green }}>
                  <span>✓</span><span>可复制的修复代码</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: C.green }}>
                  <span>✓</span><span>免费无限扫描</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 对比卡片 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '16px' }}>
            <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 8 }}>❌ 直接问 Claude</div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: C.textSub, lineHeight: 1.8 }}>
              <li>需要手动写提示词</li>
              <li>输出格式不统一</li>
              <li>无法追踪历史</li>
              <li>每次 ¥0.26</li>
            </ul>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #10a37f08 0%, #3b82f608 100%)', border: `1px solid ${C.greenBorder}`, borderRadius: 8, padding: '16px' }}>
            <div style={{ fontSize: 12, color: C.green, fontWeight: 500, marginBottom: 8 }}>✓ 用 VibeCheck</div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: C.textSub, lineHeight: 1.8 }}>
              <li>一键扫描，零配置</li>
              <li>结构化报告 + 评分</li>
              <li>保存扫描历史</li>
              <li>每次 ¥0.005（52x 便宜）</li>
            </ul>
          </div>
        </div>

        {/* 页头 */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: C.text, margin: '0 0 4px' }}>开始扫描</h2>
          <p style={{ fontSize: 14, color: C.textSub, margin: 0 }}>粘贴 AI 生成的代码，3 秒获得安全 + 质量报告</p>
        </div>

        {/* 输入卡片 */}
        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>

          {/* 卡片顶部工具栏 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: `1px solid ${C.border}`, background: C.bgSub }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: C.textSub }}>Paste code</span>
            <div style={{ display: 'flex', gap: 8 }}>
              {/* Output Language Selector */}
              <select value={outputLang} onChange={e => setOutputLang(e.target.value)}
                style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 12, padding: '3px 8px', outline: 'none', cursor: 'pointer' }}>
                <option value="en">🇬🇧 English</option>
                <option value="zh">🇨🇳 中文</option>
              </select>
              {/* Code Language Selector */}
              <select value={language} onChange={e => setLanguage(e.target.value)}
                style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, fontSize: 12, padding: '3px 8px', outline: 'none', cursor: 'pointer' }}>
                {['javascript','typescript','python','java','go','rust','php','ruby','css','html'].map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 代码输入区 */}
          <textarea value={code} onChange={e => setCode(e.target.value)}
            placeholder="// Paste your AI-generated code here..."
            style={{ width: '100%', minHeight: 200, border: 'none', outline: 'none', resize: 'vertical', fontSize: 13, fontFamily: '"SF Mono","Fira Code",monospace', lineHeight: 1.75, padding: '16px', color: C.text, background: C.bg, boxSizing: 'border-box' }}
          />

          {/* 卡片底部操作栏 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderTop: `1px solid ${C.border}`, background: C.bgSub }}>
            <span style={{ fontSize: 12, color: C.textMuted }}>{code.split('\n').length} lines</span>
            <button onClick={scanCode}
              disabled={loading || !code.trim() || limitReached}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', background: loading || !code.trim() || limitReached ? C.bgHover : C.green, color: loading || !code.trim() || limitReached ? C.textMuted : '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: loading || !code.trim() || limitReached ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'background .15s' }}>
              {loading ? (
                <><div style={{ width: 13, height: 13, border: '2px solid #ffffff60', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />Scanning...</>
              ) : limitReached ? '— Limit reached' : '→ Scan code'}
            </button>
          </div>
        </div>

        {/* 错误提示 */}
        {error && error !== 'LIMIT_REACHED' && (
          <div style={{ background: C.redDim, border: `1px solid ${C.red}30`, borderRadius: 8, padding: '11px 14px', marginBottom: 14, fontSize: 13, color: C.red }}>{error}</div>
        )}

        {/* 限流提示 + 邀请码 */}
        {limitReached && (
          <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: '24px', marginBottom: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>You've used all 3 free scans today</div>
            <p style={{ fontSize: 13, color: C.textSub, marginBottom: 20, lineHeight: 1.6 }}>
              Come back tomorrow or unlock unlimited scans with an invite code.
            </p>

            {/* 邀请码输入 */}
            <div style={{ maxWidth: 360, margin: '0 auto 20px' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  placeholder="Enter invite code"
                  value={inviteCode}
                  onChange={e => setInviteCode(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && redeemInviteCode()}
                  style={{ flex: 1, padding: '10px 12px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, color: C.text, outline: 'none', fontFamily: 'inherit', textAlign: 'center', letterSpacing: '0.5px' }}
                />
                <button
                  onClick={redeemInviteCode}
                  disabled={!inviteCode.trim() || redeemLoading}
                  style={{ padding: '10px 20px', background: inviteCode.trim() && !redeemLoading ? C.green : C.bgHover, color: inviteCode.trim() && !redeemLoading ? '#fff' : C.textMuted, border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: inviteCode.trim() && !redeemLoading ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>
                  {redeemLoading ? '...' : 'Redeem'}
                </button>
              </div>
              {redeemMessage && (
                <div style={{ marginTop: 12, padding: '8px 12px', background: redeemMessage.type === 'success' ? C.greenDim : C.redDim, border: `1px solid ${redeemMessage.type === 'success' ? C.greenBorder : C.red + '30'}`, borderRadius: 6, fontSize: 12, color: redeemMessage.type === 'success' ? C.green : C.red }}>
                  {redeemMessage.text}
                </div>
              )}
            </div>

            <button onClick={() => { setError(null) }} style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 16px', fontSize: 13, color: C.textSub, cursor: 'pointer', fontFamily: 'inherit' }}>
              I'll wait until tomorrow
            </button>
          </div>
        )}

        {/* 扫描结果 */}
        {result && <ScanResult result={result} />}

        {/* 真实案例展示（仅在没有扫描结果时显示） */}
        {!result && !loading && (
          <div style={{ marginTop: 24, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: '24px' }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: C.text, margin: '0 0 16px' }}>
              🔍 VibeCheck 能发现什么？
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* 案例 1 */}
              <div style={{ borderLeft: `3px solid ${C.red}`, paddingLeft: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 4 }}>
                  🔴 硬编码密钥（Critical）
                </div>
                <div style={{ fontSize: 12, color: C.textSub, marginBottom: 8, lineHeight: 1.6 }}>
                  AI 经常直接生成 <code style={{ background: C.bgSub, padding: '2px 6px', borderRadius: 4 }}>apiKey = "sk-..."</code>，导致密钥泄露风险
                </div>
                <pre style={{ background: C.bgSub, border: `1px solid ${C.border}`, borderRadius: 6, padding: '8px 10px', fontSize: 11, color: C.textSub, margin: 0, fontFamily: '"SF Mono","Fira Code",monospace' }}>
{`- const apiKey = "sk-abc123";
+ const apiKey = process.env.API_KEY;`}
                </pre>
              </div>

              {/* 案例 2 */}
              <div style={{ borderLeft: `3px solid ${C.amber}`, paddingLeft: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 4 }}>
                  🟡 SQL 注入风险（High）
                </div>
                <div style={{ fontSize: 12, color: C.textSub, marginBottom: 8, lineHeight: 1.6 }}>
                  AI 生成的查询经常直接拼接用户输入，易受 SQL 注入攻击
                </div>
                <pre style={{ background: C.bgSub, border: `1px solid ${C.border}`, borderRadius: 6, padding: '8px 10px', fontSize: 11, color: C.textSub, margin: 0, fontFamily: '"SF Mono","Fira Code",monospace' }}>
{`- db.query(\`SELECT * FROM users WHERE id=\${userId}\`)
+ db.query('SELECT * FROM users WHERE id=?', [userId])`}
                </pre>
              </div>

              {/* 案例 3 */}
              <div style={{ borderLeft: `3px solid ${C.blue}`, paddingLeft: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 4 }}>
                  🔵 未处理的 Promise（Medium）
                </div>
                <div style={{ fontSize: 12, color: C.textSub, marginBottom: 8, lineHeight: 1.6 }}>
                  AI 生成的异步代码常缺少错误处理，导致未捕获异常
                </div>
                <pre style={{ background: C.bgSub, border: `1px solid ${C.border}`, borderRadius: 6, padding: '8px 10px', fontSize: 11, color: C.textSub, margin: 0, fontFamily: '"SF Mono","Fira Code",monospace' }}>
{`- await fetch(url);
+ await fetch(url).catch(err => console.error(err));`}
                </pre>
              </div>
            </div>

            <div style={{ marginTop: 16, padding: '12px', background: C.greenDim, border: `1px solid ${C.greenBorder}`, borderRadius: 8, fontSize: 12, color: C.textSub, lineHeight: 1.6 }}>
              💡 <strong>为什么 Claude 不会主动检查？</strong><br/>
              因为这些是它自己写代码时的"习惯"。就像你不会主动检查自己的盲区一样。
            </div>
          </div>
        )}

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        * { box-sizing: border-box }
        textarea::placeholder { color: #adadad }
        input::placeholder { color: #adadad }
        button:hover:not(:disabled) { opacity: .88 }
      `}</style>
    </div>
  )
}

function ScanResult({ result }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* 评分卡 */}
      <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 20 }}>
        {/* Grade */}
        <div style={{ width: 56, height: 56, borderRadius: 12, background: `${grade[result.grade] || C.green}15`, border: `2px solid ${grade[result.grade] || C.green}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 24, fontWeight: 700, color: grade[result.grade], fontFamily: 'monospace' }}>{result.grade}</span>
        </div>
        {/* Summary */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 3 }}>{result.summary?.headline}</div>
          <div style={{ fontSize: 13, color: C.textSub, lineHeight: 1.6 }}>{result.summary?.detail}</div>
        </div>
        {/* Score */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 30, fontWeight: 700, color: grade[result.grade], lineHeight: 1 }}>{result.score}</div>
          <div style={{ fontSize: 11, color: C.textMuted }}>/ 100</div>
        </div>
      </div>

      {/* 优点 */}
      {result.positives?.length > 0 && (
        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.green, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>What's working</div>
          {result.positives.map((p, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '4px 0', fontSize: 13, color: C.textSub, lineHeight: 1.5 }}>
              <span style={{ color: C.green, flexShrink: 0 }}>✓</span>{p}
            </div>
          ))}
        </div>
      )}

      {/* 问题列表 */}
      {result.issues?.length > 0 && (
        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{result.issues.length} issue{result.issues.length !== 1 ? 's' : ''} found</span>
          </div>
          {result.issues.map((issue, i) => (
            <IssueRow key={i} issue={issue} last={i === result.issues.length - 1} />
          ))}
        </div>
      )}

      {result.issues?.length === 0 && (
        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: '36px', textAlign: 'center' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
          <div style={{ fontSize: 15, fontWeight: 500, color: C.text }}>No issues found</div>
          <div style={{ fontSize: 13, color: C.textSub, marginTop: 4 }}>This code looks good.</div>
        </div>
      )}

      {/* Meta */}
      {result.meta && (
        <div style={{ padding: '12px 4px', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {[
            ['Language', result.meta.language_detected],
            ['Lines', result.meta.lines_analyzed],
            ['AI confidence', result.meta.ai_generated_confidence],
          ].map(([l, v]) => v && (
            <span key={l} style={{ fontSize: 11, color: C.textMuted }}>{l}: <span style={{ color: C.textSub }}>{v}</span></span>
          ))}
        </div>
      )}
    </div>
  )
}

function IssueRow({ issue, last }) {
  const [open, setOpen] = useState(false)
  const sv = severity[issue.severity] || severity.low

  return (
    <div style={{ borderBottom: last ? 'none' : `1px solid ${C.border}` }}>
      <div onClick={() => setOpen(!open)}
        style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 20px', cursor: 'pointer' }}
        onMouseEnter={e => e.currentTarget.style.background = C.bgSub}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        {/* 严重程度色块 */}
        <div style={{ width: 3, height: 36, borderRadius: 2, background: sv.color, flexShrink: 0, marginTop: 2 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13 }}>{categoryIcon[issue.category] || '⚠️'}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{issue.title}</span>
            <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 20, background: sv.bg, color: sv.color }}>{sv.label}</span>
          </div>
          <div style={{ fontSize: 13, color: C.textSub, lineHeight: 1.55 }}>{issue.plain_english}</div>
          {issue.location && <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4, fontFamily: 'monospace' }}>📍 {issue.location}</div>}
        </div>
        <span style={{ fontSize: 12, color: C.textMuted, flexShrink: 0 }}>{open ? '▾' : '▸'}</span>
      </div>

      {open && issue.fix && (
        <div style={{ padding: '0 20px 16px 47px' }}>
          {issue.fix.description && (
            <p style={{ fontSize: 13, color: C.textSub, marginBottom: 8, lineHeight: 1.6 }}>{issue.fix.description}</p>
          )}
          {issue.fix.code && (
            <pre style={{ background: C.bgSub, border: `1px solid ${C.border}`, borderRadius: 8, padding: '12px 14px', fontSize: 12, color: C.text, overflowX: 'auto', margin: 0, fontFamily: '"SF Mono","Fira Code",monospace', lineHeight: 1.7 }}>
              {issue.fix.code}
            </pre>
          )}
        </div>
      )}
    </div>
  )
}
