import crypto from 'node:crypto';

const TOKEN_COOKIE = 'hongdae_kakao_token';

function cookies(req) {
  return Object.fromEntries((req.headers.cookie || '').split(';').map(part => part.trim().split(/=(.*)/s)).filter(([key]) => key));
}

function sign(value, secret) {
  return crypto.createHmac('sha256', secret).update(value).digest('base64url');
}

function matches(value, signature, secret) {
  const expected = sign(value, secret);
  return expected.length === signature.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export default function handler(req, res) {
  const secret = process.env.KAKAO_COOKIE_SECRET;
  const stored = cookies(req)[TOKEN_COOKIE] || '';
  const marker = stored.lastIndexOf('.');
  const token = stored.slice(0, marker);
  const signature = stored.slice(marker + 1);
  res.setHeader('Set-Cookie', `${TOKEN_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/api/kakao; Max-Age=0`);
  if (!secret || marker < 1 || !signature || !matches(token, signature, secret)) return res.status(403).json({ error: 'Invalid login session' });
  return res.status(200).json({ idToken: token });
}
