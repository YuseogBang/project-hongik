// Supabase의 anon key는 브라우저에서 사용되는 공개 키입니다. 서비스 역할 키는 절대 넣지 마세요.
export default function handler(req, res) {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ configured: Boolean(url && anonKey), url: url || null, anonKey: anonKey || null });
}
