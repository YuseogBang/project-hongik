# 로그인·개인 컬렉션·관리자 기능 연결

1. Supabase에서 새 프로젝트를 만들고 SQL Editor에 `supabase/schema.sql`을 실행합니다.
2. Authentication > URL Configuration에 `https://project-hongik.vercel.app`와 개발 주소를 등록합니다.
3. Vercel 환경 변수에 아래 두 값을 추가한 뒤 재배포합니다.
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
4. 회원 가입 뒤 `schema.sql` 맨 아래의 관리자 지정 쿼리에서 이메일을 바꿔 실행합니다.

`SUPABASE_ANON_KEY`는 클라이언트 공개 키이며, `SUPABASE_SERVICE_ROLE_KEY`는 어떤 경우에도 Vercel이나 GitHub에 넣지 않습니다.

초기 매장 데이터는 관리자로 로그인한 뒤 `admin.html`의 가져오기 버튼으로 DB에 복사합니다. 그 전까지 지도는 기존 내장 데이터를 계속 사용합니다.
