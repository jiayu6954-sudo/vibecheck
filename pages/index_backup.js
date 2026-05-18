import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const [email, setEmail] = useState('')
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [usageCount, setUsageCount] = useState(0)
  const FREE_LIMIT = 3

  // 监听登录状态
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchUsage(session.user)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) fetchUsage(session.user)
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  // 获取今日使用次数
  async function fetchUsage(currentUser) {
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('user_usage')
      .select('scan_count')
      .eq('user_id', currentUser.id)
      .eq('date', today)
      .single()
    setUsageCount(data?.scan_count ?? 0)
  }

  // 发送 Magic Link
  async function sendMagicLink() {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
    })
    if (error) alert(error.message)
    else setMagicLinkSent(true)
  }

  // 退出登录
  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setUsageCount(0)
  }

  // 扫描代码
  async function scanCode() {
    if (!code.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const session = await supabase.auth.getSession()
      const token = session.data.session?.access_token
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({ code, language })
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 429) {
          setError('LIMIT_REACHED')
        } else {
          setError(data.error || '扫描失败，请重试')
        }
        return
      }
      setResult(data)
      if (user) fetchUsage(user)
    } catch (e) {
      setError('网络错误，请检查连接后重试')
    } finally {
      setLoading(false)
    }
  }

  const gradeColor = {
    A: '#1D9E75', B: '#4d96f5', C: '#f0a500', D: '#ff7043', F: '#e8404a'
  }

  const severityColor = {
    critical: '#e8404a', high: '#ff7043', medium: '#f0a500', low: '#9b9890'
  }

  // ── 未登录界面 ──
  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: '#0c0c0c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ width: 400, padding: '40px', background: '#111', border: '1px solid #232323', borderRadius: 16 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 13, color: '#1D9E75', fontFamily: 'monospace', letterSpacing: '.1em', marginBottom: 12 }}>VIBECHECK</div>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: '#e2e0da', marginBottom: 8 }}>AI 代码安全扫描器</h1>
            <p style={{ fontSize: 13, color: '#9b9890', lineHeight: 1.6 }}>免费试用 3 次 · 无需信用卡<br />登录后保存扫描历史</p>
          </div>

          {!magicLinkSent ? (
            <div>
              <input
                type="email"
                placeholder="输入你的邮箱"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMagicLink()}
                style={{ width: '100%', padding: '12px 14px', background: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: 8, color: '#e2e0da', fontSize: 14, outline: 'none', marginBottom: 10 }}
              />
              <button
                onClick={sendMagicLink}
                disabled={!email}
                style={{ width: '100%', padding: '12px', background: email ? '#1D9E75' : '#232323', color: email ? '#fff' : '#5c5a56', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: email ? 'pointer' : 'not-allowed' }}
              >
                发送登录链接
              </button>
              <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#5c5a56' }}>
                不需要密码 · 点击邮件链接即可登录
              </p>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📬</div>
              <p style={{ fontSize: 14, color: '#e2e0da', marginBottom: 6 }}>登录链接已发送</p>
              <p style={{ fontSize: 13, color: '#9b9890' }}>查看 <strong style={{ color: '#e2e0da' }}>{email}</strong> 的收件箱，点击链接完成登录</p>
              <button onClick={() => setMagicLinkSent(false)} style={{ marginTop: 16, background: 'none', border: 'none', color: '#4d96f5', fontSize: 13, cursor: 'pointer' }}>
                重新发送
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── 已登录主界面 ──
  return (
    <div style={{ minHeight: '100vh', background: '#0c0c0c', fontFamily: 'system-ui, sans-serif' }}>

      {/* 顶部导航 */}
      <nav style={{ height: 48, background: 'rgba(12,12,12,.94)', borderBottom: '1px solid #232323', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, zIndex: 10 }}>
        <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#1D9E75', letterSpacing: '.1em' }}>VIBECHECK</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* 使用次数计数器 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i <= usageCount ? '#e8404a' : '#1D9E75' }} />
            ))}
            <span style={{ fontSize: 11, color: '#9b9890', fontFamily: 'monospace' }}>
              {Math.max(0, FREE_LIMIT - usageCount)} 次剩余
            </span>
          </div>
          <span style={{ fontSize: 12, color: '#5c5a56' }}>{user.email}</span>
          <button onClick={signOut} style={{ fontSize: 12, color: '#5c5a56', background: 'none', border: 'none', cursor: 'pointer' }}>退出</button>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>

        {/* 输入区 */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label style={{ fontSize: 12, color: '#9b9890', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '.06em' }}>粘贴 AI 生成的代码</label>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              style={{ background: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: 6, color: '#e2e0da', fontSize: 12, padding: '4px 8px', outline: 'none' }}
            >
              {['javascript','typescript','python','java','go','rust','php','ruby','css','html'].map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <textarea
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="粘贴你的代码..."
            style={{ width: '100%', height: 220, background: '#111', border: '1px solid #232323', borderRadius: 10, color: '#e2e0da', fontSize: 13, fontFamily: 'monospace', lineHeight: 1.7, padding: '14px 16px', outline: 'none', resize: 'vertical' }}
          />
        </div>

        {/* 扫描按钮或升级提示 */}
        {(error === 'LIMIT_REACHED' || usageCount >= FREE_LIMIT) ? (
          <div style={{ background: '#1a1a1a', border: '1px solid #f0a500', borderRadius: 12, padding: '20px 24px', marginBottom: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 500, color: '#f0a500', marginBottom: 6 }}>今日免费次数已用完</div>
            <p style={{ fontSize: 13, color: '#9b9890', marginBottom: 16, lineHeight: 1.6 }}>升级 Pro 解锁无限扫描 · 完整修复方案 · 历史记录<br/>
            一个安全漏洞的修复成本超过 $800，Pro 订阅 $15/月</p>
            <button style={{ background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
              升级 Pro — $15/月
            </button>
            <button onClick={() => setError(null)} style={{ marginLeft: 12, background: 'none', border: 'none', color: '#5c5a56', fontSize: 13, cursor: 'pointer' }}>
              继续免费使用
            </button>
          </div>
        ) : (
          <button
            onClick={scanCode}
            disabled={loading || !code.trim()}
            style={{
              width: '100%', padding: '13px', marginBottom: 20,
              background: loading || !code.trim() ? '#1a1a1a' : '#1D9E75',
              color: loading || !code.trim() ? '#5c5a56' : '#fff',
              border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 500,
              cursor: loading || !code.trim() ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '扫描中...' : '扫描代码'}
          </button>
        )}

        {/* 错误提示 */}
        {error && error !== 'LIMIT_REACHED' && (
          <div style={{ background: '#e8404a18', border: '1px solid #e8404a35', borderRadius: 8, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#e8404a' }}>
            {error}
          </div>
        )}

        {/* 扫描结果 */}
        {result && (
          <div>
            {/* 评分 */}
            <div style={{ background: '#111', border: '1px solid #232323', borderRadius: 12, padding: '20px 24px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 36, fontWeight: 700, color: gradeColor[result.grade] || '#e2e0da', fontFamily: 'monospace' }}>{result.grade}</div>
                <div style={{ fontSize: 11, color: '#5c5a56', textTransform: 'uppercase', letterSpacing: '.06em' }}>Grade</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 500, color: '#e2e0da', marginBottom: 4 }}>{result.summary?.headline}</div>
                <div style={{ fontSize: 13, color: '#9b9890', lineHeight: 1.6 }}>{result.summary?.detail}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 28, fontWeight: 600, color: gradeColor[result.grade] }}>{result.score}</div>
                <div style={{ fontSize: 11, color: '#5c5a56' }}>/ 100</div>
              </div>
            </div>

            {/* 优点 */}
            {result.positives?.length > 0 && (
              <div style={{ background: '#1D9E7510', border: '1px solid #1D9E7530', borderRadius: 10, padding: '14px 18px', marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: '#1D9E75', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>✅ 代码优点</div>
                {result.positives.map((p, i) => (
                  <div key={i} style={{ fontSize: 13, color: '#9b9890', padding: '3px 0', display: 'flex', gap: 8 }}>
                    <span style={{ color: '#5c5a56' }}>·</span>{p}
                  </div>
                ))}
              </div>
            )}

            {/* 问题列表 */}
            {result.issues?.length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 500, color: '#9b9890', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>
                  发现 {result.issues.length} 个问题
                </div>
                {result.issues.map((issue, i) => (
                  <IssueCard key={i} issue={issue} severityColor={severityColor} />
                ))}
              </div>
            )}

            {result.issues?.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px', background: '#111', border: '1px solid #232323', borderRadius: 12 }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
                <div style={{ fontSize: 15, fontWeight: 500, color: '#1D9E75' }}>未发现明显问题</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function IssueCard({ issue, severityColor }) {
  const [showFix, setShowFix] = useState(false)
  const categoryIcon = { security: '🔒', maintainability: '🔧', performance: '⚡', bug_risk: '🐛' }

  return (
    <div style={{ background: '#111', border: `1px solid ${severityColor[issue.severity]}40`, borderLeft: `3px solid ${severityColor[issue.severity]}`, borderRadius: 10, padding: '14px 18px', marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>{categoryIcon[issue.category] || '⚠️'}</span>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#e2e0da' }}>{issue.title}</span>
        </div>
        <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: `${severityColor[issue.severity]}20`, color: severityColor[issue.severity], fontFamily: 'monospace', flexShrink: 0, marginLeft: 8 }}>
          {issue.severity}
        </span>
      </div>
      <p style={{ fontSize: 13, color: '#9b9890', lineHeight: 1.65, marginBottom: 8 }}>{issue.plain_english}</p>
      {issue.location && (
        <div style={{ fontSize: 11, color: '#5c5a56', marginBottom: 8, fontFamily: 'monospace' }}>📍 {issue.location}</div>
      )}
      {issue.fix && (
        <div>
          <button onClick={() => setShowFix(!showFix)} style={{ fontSize: 12, color: '#4d96f5', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            {showFix ? '▾ 隐藏修复方案' : '▸ 查看修复方案'}
          </button>
          {showFix && (
            <div style={{ marginTop: 8 }}>
              <p style={{ fontSize: 12, color: '#9b9890', marginBottom: 6 }}>{issue.fix.description}</p>
              {issue.fix.code && (
                <pre style={{ background: '#0c0c0c', border: '1px solid #2e2e2e', borderRadius: 6, padding: '10px 12px', fontSize: 11, color: '#e2e0da', overflow: 'auto', margin: 0 }}>
                  {issue.fix.code}
                </pre>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
