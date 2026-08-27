# SILUA Website — Subscrr-inspired v4

Static HTML/CSS/JS site for Vercel.

## Deploy
- Framework preset: Other
- Build command: empty
- Output directory: empty
- Root directory: repository root

Clean URLs are enabled in `vercel.json`:
- `/privacy`
- `/terms`


## v5 update
- Added an early audience-fit section based on SILUA's core use cases.
- Unified site typography with the app: DM Sans for body/UI and DM Serif Display for titles/headlines.

## v6 visual system
- Black + white base.
- Butter `#E8D56A` for CTA / notice accents.
- Butter Light `#F5EFA8` for selected feature backgrounds.
- DM Sans is used for UI and most feature headlines.
- DM Serif Display is reserved for the hero and brand-belief statement.
- Desktop and mobile layouts were reworked separately for stronger rhythm and lower copy density.
- Splash, button micro-interactions, reveal motion, subtle image movement, FAQ easing and responsive navigation are included.
- Vercel clean URLs remain enabled for `/privacy` and `/terms`.

## v7 refinement
- Header changed to a lighter translucent glass treatment with blur, saturation, a subtle highlight and soft shadow.
- Desktop shell margins increased to 48px; wide visual sections to 32px.
- Tablet shell margins increased to 24px; wide sections to 18px.
- Mobile shell margins increased to 20px; wide visual sections to 16px.
- Mobile header now sits 16px from the viewport edges.

## v8 glass system
Glass is now used selectively rather than across every card:
- translucent header
- hero shape-focus tag
- campaign photo caption
- weekly-plan label
- training photo captions
- progression stat cards
- setup pills
- workout video logging control

Large sections and primary feature cards remain solid black / white / Butter Light so the glass effect stays premium instead of turning into full-page glassmorphism.

## v9 header + logo
- Desktop floating header enlarged to a Subscrr-like scale: up to 1320px wide and 72px high.
- More internal left/right padding so the glass capsule wraps the logo, navigation and CTA more generously.
- Added the SILUA / “shape me” lockup based on the supplied logo reference.
- The logo is rendered as live typography using the site's DM Serif Display Italic + DM Sans, keeping it crisp on retina screens and transparent over glass.
- Applied the lockup to header, footer, legal pages and intro splash.

## v10 mobile header
- Replaced the mobile hamburger/menu pattern with a direct `Get the app` CTA in the floating header.
- Kept the large desktop Subscrr-scale header from v9.
- On tablet/mobile, the header now uses:
  - logo on the left
  - compact black pill CTA on the right
  - no hamburger
  - no full-screen mobile menu
- Desktop keeps the `Get SILUA ↗` CTA, while mobile switches to `Get the app`.

## v11 splash + logo cleanup
- Removed every `shape me` tagline from header, footer, legal pages and splash.
- Removed italic styling from the SILUA wordmark.
- Header/footer logo is now a clean DM Sans semibold `SILUA`.
- Splash is now a single centered `SILUA` word on a light background, inspired by the clean Subscrr intro.
- The letters use a moving grayscale liquid-gradient / sheen animation rather than moving the whole word.
- Butter remains only as a very small progress-line accent.

## v12 splash cleanup
- White background only.
- One centered `SILUA` word in DM Sans 600.
- No scale-in, no sheen, no progress line, no subtitle.
- Only the color inside the letters moves once: black → Butter `#E8D56A` → black.
- Splash fades out quickly instead of sliding away.
- Total intro time is about one second.

## v13 splash refinement
- Color sweep slowed to ~1.85s.
- Butter band made much wider and softer, with warm transition tones on both sides.
- No sheen, scaling, or extra motion added.
- Splash fade timing was extended so the full sweep can complete calmly.

## v14 splash bug fix
- Fixed the splash gradient rendering as a rectangle.
- The previous `background:` shorthand reset `background-clip:text`.
- The gradient now uses `background-image` and explicitly reapplies `-webkit-background-clip:text`, `background-clip:text`, and transparent text fill.

## v15 footer + splash cleanup
- Removed the intro splash completely. The page renders immediately.
- Rebuilt the footer as a full-width near-black editorial footer inspired by the clean structure of modern consumer-app sites.
- Added a SILUA lockup, contact email, Privacy / Terms / Contact links, copyright, launch badge, top divider and circular back-to-top control.
- Desktop uses a wide horizontal footer layout; mobile stacks cleanly with a two-column legal-link grid.
- Footer uses SILUA's black / white / Butter palette rather than copying Subscrr's orange branding.

## v16 visual cleanup
- Glass is now used only for the floating header.
- All other translucent panels were converted to solid white or solid Butter Light.
- Progression cards, setup pills, image captions, motion controls and feature labels now use clean solid surfaces with thin borders.
- This keeps the site more editorial and less glassmorphism-heavy.
