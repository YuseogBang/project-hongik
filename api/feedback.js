export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { type = 'idea', message, contact = '' } = req.body || {};
  if (!['bug', 'idea', 'place', 'other'].includes(type) || typeof message !== 'string' || message.trim().length < 3 || message.length > 2000) return res.status(400).json({ error: '피드백 내용을 3자 이상 입력해주세요.' });
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return res.status(503).json({ error: '피드백 서버가 아직 연결되지 않았어요.' });
  const response = await fetch(`${url}/rest/v1/feedbacks`, { method: 'POST', headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify({ type, message: message.trim(), contact: String(contact).trim() || null }) });
  if (!response.ok) return res.status(500).json({ error: '피드백 저장에 실패했어요.' });
  return res.status(201).json({ ok: true });
}
