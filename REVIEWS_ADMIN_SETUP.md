# 리뷰와 관리자 통계 연결

이 기능은 기존 Supabase 계정 서버를 사용합니다. 새 서비스를 구매하거나 별도 서버를 실행할 필요는 없습니다.

1. Supabase SQL Editor에서 `supabase/migrations/20261004_reviews_and_interest.sql`을 실행합니다. 기존 `supabase/schema.sql` 설치가 먼저 필요합니다.
2. `supabase/seed_places_20261004.sql`을 실행해 지도 내장 장소 213곳을 `places` 테이블에 등록합니다. 기존 행은 덮어쓰지 않습니다. 이 단계가 있어야 컬렉션 저장의 외래 키가 정상 작동하고 관리자 화면에 업체명이 표시됩니다.
3. Vercel 환경 변수 `SUPABASE_URL`, `SUPABASE_ANON_KEY`가 실제 프로젝트를 가리키는지 확인합니다. 2026-10-04에 제공된 프로젝트는 복원이 완료된 뒤 `Healthy` 상태로 확인되었고, Vercel의 URL도 일치했습니다. 무료 프로젝트가 다시 일시 중지되면 복원을 기다려야 합니다.
4. 사이트에서 본인 계정으로 한 번 로그인한 뒤, Supabase SQL Editor에서 다음을 실행해 관리자 권한을 부여합니다. 이메일은 실제 가입 주소로 바꿉니다.

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = '본인@example.com');
```

5. `admin.html`에 접속합니다. 일반 사용자는 데이터베이스의 접근 정책에 의해 리뷰 관리와 관심도 통계를 조회할 수 없습니다.

리뷰는 로그인 계정당 업체별 한 건이고 수정·삭제할 수 있습니다. 관리자는 부적절한 리뷰를 숨기거나 삭제할 수 있습니다. 관심도는 로그인 사용자의 업체 조회(같은 업체는 30분 중복 제외), 컬렉션 저장, 길찾기 실행만 기록합니다. 비로그인 활동과 실제 매장 방문 여부는 집계하지 않습니다. 업체명이 데이터베이스의 `places`에 아직 없으면 관리자 화면에 업체 ID가 표시됩니다.
