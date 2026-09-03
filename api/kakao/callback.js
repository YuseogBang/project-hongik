import crypto from 'node:crypto';

const STATE_COOKIE = 'hongdae_kakao_state';
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

function clear(name) {
  return `${name}=; HttpOnly; Secure; SameSite=Lax; Path=/api/kakao; Max-Age=0`;
}

export default async function handler(req, res) {
  const clientId = process.env.KAKAO_REST_API_KEY;
  const clientSecret = process.env.KAKAO_CLIENT_SECRET;
  const cookieSecret = process.env.KAKAO_COOKIE_SECRET;
  const appUrl = process.env.APP_URL;
  const { code, state, error } = req.query || {};
  const stored = cookies(req)[STATE_COOKIE] || '';
  const [storedState, storedSignature] = stored.split('.');
  const [requestState, next] = String(state || '').split(':');
  if (!clientId || !clientSecret || !cookieSecret || !appUrl || error || !code || !storedState || !storedSignature || !matches(storedState, storedSignature, cookieSecret) || storedState !== requestState || next !== '/main.html') {
    res.setHeader('Set-Cookie', clear(STATE_COOKIE));
    return res.redirect(302, `${(appUrl || '').replace(/\/$/, '') || '/main.html'}${appUrl ? '/main.html?kakao=failed' : ''}`);
  }

  const callbackUrl = `${appUrl.replace(/\/$/, '')}/api/kakao/callback`;
  const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
    body: new URLSearchParams({ grant_type: 'authorization_code', client_id: clientId, client_secret: clientSecret, redirect_uri: callbackUrl, code: String(code) })
  });
  const token = await tokenResponse.json().catch(() => ({}));
  if (!tokenResponse.ok || !token.id_token) {
    res.setHeader('Set-Cookie', clear(STATE_COOKIE));
    return res.redirect(302, `${appUrl.replace(/\/$/, '')}/main.html?kakao=failed`);
  }

  const tokenValue = `${token.id_token}.${sign(token.id_token, cookieSecret)}`;
  res.setHeader('Set-Cookie', [clear(STATE_COOKIE), `${TOKEN_COOKIE}=${tokenValue}; HttpOnly; Secure; SameSite=Lax; Path=/api/kakao; Max-Age=300`]);
  return res.redirect(302, `${appUrl.replace(/\/$/, '')}/main.html?kakao=done`);
}
