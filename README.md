# SILUA Homepage — Editorial V5

Homepage rebuilt around the approved service narrative:

1. Hero — online strength coaching for women
2. Recommended for / user needs
3. Core services — Form Check, Personalized Program, Monthly Coaching
4. How SILUA works
5. Pricing
6. Brand message — independent training + coaching when needed
7. Why strength matters for women
8. SILUA values — Strength, Identity, Longevity, Understanding, Ability
9. Coaches
10. Progress
11. Final Start Free CTA

## Design
- Original SILUA editorial language preserved: DM Serif Display + DM Sans, large type, generous whitespace, asymmetric image blocks.
- Korean uses Noto Sans KR, while the SILUA wordmark keeps DM Serif Display in both languages.
- Accent color: `#7E354D`.
- Legal pages remain bilingual and share the EN/KR preference via `localStorage`.

## CTA
`Start Free` currently points to the final CTA area. Replace the final placeholder href with the live App Store / onboarding destination when available.


## v6 KR typography tweaks
- Increased horizontal gutters and reduced content max-width for more breathing room.
- Loosened Korean display typography with lighter weight, less negative tracking, and taller line-height.
- Slightly reduced KR display sizes on small screens to prevent cramped wrapping.


## Coach acquisition page
- Added `for-coaches.html` as the public coach recruitment landing page.
- Added `For Coaches` to desktop/mobile navigation.
- Added a coach recruitment banner to the main homepage.
- Added `Coach Sign In` and `For Coaches` to the homepage footer.
- EN/KR switching uses the existing `data-i18n` system.
- Coach application/sign-in CTAs currently point to `https://coach.silua.app`. Replace with a dedicated application route later if one is added.
- `admin.silua.app` is intentionally not linked publicly.

## v7 Coach visual refresh
- `for-coaches.html` hero now uses `assets/community.webp` as a full-bleed image with a dark overlay instead of a large light/burgundy field.
- Coach Workspace section changed from full burgundy to charcoal/black; burgundy is now an accent.
- Final coach CTA uses `assets/feedback.webp` with a dark overlay rather than a full burgundy block.
- Added `coach-app-theme.css` with a dark workspace palette for `coach.silua.app`.


## Homepage visual refresh
- Main `index.html` now follows the same visual direction as the coach landing page.
- Large burgundy surfaces were replaced with charcoal/black or photography + dark overlays.
- Burgundy remains as an accent for buttons, labels, dividers and highlighted text.
- Monthly Coaching and featured pricing use charcoal rather than solid burgundy.
- Coach recruitment uses `assets/community.webp` with a dark overlay.
- Final CTA uses `assets/feedback.webp` with a dark overlay.
