# ShapeMe

운동, 식단, 물 섭취, 눈바디 기록을 한곳에서 관리하는 Next.js + Supabase 셀프케어 웹앱입니다.

## 환경변수

프로젝트 루트에 `.env.local`을 만들고 아래 값을 입력합니다.

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Vercel에도 같은 이름으로 두 변수를 등록한 뒤 다시 배포해야 합니다.

## 실행

```bash
npm install
npm run dev
```

## PWA 설치

배포 후 HTTPS 주소를 휴대폰에서 엽니다.

- iPhone: Safari → 공유 → 홈 화면에 추가
- Android: Chrome → 메뉴 → 앱 설치 또는 홈 화면에 추가

앱 이름은 `ShapeMe`, 실행 방식은 standalone으로 설정되어 있습니다.
