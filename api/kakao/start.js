import crypto from 'node:crypto';

const COOKIE = 'hongdae_kakao_state';
const maxAge = 600;

function sign(value, secret) {
  return crypto.createHmac('sha256', secret).update(value).digest('base64url');
}

export default function handler(req, res) {
  const clientId = process.env.KAKAO_REST_API_KEY;
  const secret = process.env.KAKAO_COOKIE_SECRET;
  const appUrl = process.env.APP_URL;
  if (!clientId || !secret || !appUrl) return res.status(503).send('카카오 로그인 설정이 아직 완료되지 않았습니다.');

  const next = req.query?.next === '/main.html' ? '/main.html' : '/main.html';
  const state = crypto.randomBytes(24).toString('base64url');
  const value = `${state}.${sign(state, secret)}`;
  const callbackUrl = `${appUrl.replace(/\/$/, '')}/api/kakao/callback`;
  const url = new URL('https://kauth.kakao.com/oauth/authorize');
  url.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callbackUrl,
    response_type: 'code',
    scope: 'openid profile_nickname profile_image',
    state: `${state}:${next}`
  }).toString();
  res.setHeader('Set-Cookie', `${COOKIE}=${value}; HttpOnly; Secure; SameSite=Lax; Path=/api/kakao; Max-Age=${maxAge}`);
  res.redirect(302, url.toString());
}
