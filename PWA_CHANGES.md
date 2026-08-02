# PWA 및 브랜드 적용 내역

## 추가

- `src/app/manifest.ts`
- `public/icon-192x192.png`
- `public/icon-512x512.png`
- `public/apple-touch-icon.png`
- ShapeMe 전용 favicon

## 수정

- `src/app/layout.tsx`
  - PWA manifest 연결
  - Apple Web App 메타데이터 추가
  - 모바일 theme color 및 viewport-fit 적용
  - Cormorant Garamond 로고 폰트 연결
- `src/app/globals.css`
  - Pretendard 로딩
  - ShapeMe 로고 전용 스타일 추가
  - iPhone safe-area 대응
- 홈, 로그인, 회원가입 화면
  - 로고 표기를 `ShapeMe`로 통일
- 하단 내비게이션
  - iPhone 홈 인디케이터 영역 대응

## 배포

1. 이 프로젝트 내용을 기존 GitHub 저장소에 반영합니다.
2. 커밋 후 `main` 브랜치에 푸시합니다.
3. Vercel이 자동 재배포되면 휴대폰에서 주소를 다시 엽니다.
4. 기존에 홈 화면 바로가기를 만들어 두었다면 삭제 후 다시 추가해야 새 아이콘이 반영될 수 있습니다.
