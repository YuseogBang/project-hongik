# 이메일 없는 카카오 로그인 설정

카카오 API 키와 비밀키는 GitHub나 브라우저 코드에 넣지 않습니다. Vercel의 **Settings > Environment Variables**에 아래 값을 Production 환경으로 추가한 뒤 재배포합니다.

| 이름 | 값 |
| --- | --- |
| `APP_URL` | `https://project-hongik.vercel.app` |
| `KAKAO_REST_API_KEY` | Kakao Developers의 REST API 키 |
| `KAKAO_CLIENT_SECRET` | Kakao Login Client Secret (활성화된 값) |
| `KAKAO_COOKIE_SECRET` | 임의의 긴 비밀값 (32자 이상) |

Kakao Developers에서 다음을 설정합니다.

1. **제품 설정 > 카카오 로그인**: 카카오 로그인과 OpenID Connect를 ON으로 둡니다.
2. **동의항목**: `profile_nickname`은 필수, `profile_image`는 선택 동의로 둡니다. `account_email`은 설정하지 않습니다.
3. **앱 설정 > 앱 > 플랫폼 키 > REST API 키**의 카카오 로그인 Redirect URI를 아래 값으로 교체합니다.

   `https://project-hongik.vercel.app/api/kakao/callback`

Supabase의 Kakao Provider는 켠 상태로 유지합니다. 이 서버가 받은 Kakao ID 토큰을 Supabase 세션으로 교환하기 때문에, Supabase의 REST API 키와 Client Secret도 계속 필요합니다. `Allow users without an email`은 ON으로 둡니다.
