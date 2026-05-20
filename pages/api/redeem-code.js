import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, userId } = req.body;

    // 验证必需参数
    if (!code || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters'
      });
    }

    // 调用 Supabase 函数验证邀请码
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

    // 返回结果
    return res.status(200).json(data);

  } catch (error) {
    console.error('Redeem code error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
