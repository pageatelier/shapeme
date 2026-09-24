const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('[data-menu-button]');
const mobileMenu = document.querySelector('[data-mobile-menu]');
const langToggle = document.querySelector('[data-lang-toggle]');

if (document.body.classList.contains('legal-page')) {
  const legalStyles = document.createElement('link');
  legalStyles.rel = 'stylesheet';
  legalStyles.href = 'legal.css';
  document.head.appendChild(legalStyles);
}

const setHeader = () => header?.classList.toggle('scrolled', window.scrollY > 20);
setHeader();
window.addEventListener('scroll', setHeader, { passive:true });
document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

if (menuButton && mobileMenu) {
  const close = () => { menuButton.setAttribute('aria-expanded','false'); mobileMenu.classList.remove('open'); document.body.classList.remove('menu-open'); };
  menuButton.addEventListener('click', () => { const open = menuButton.getAttribute('aria-expanded') !== 'true'; menuButton.setAttribute('aria-expanded',String(open)); mobileMenu.classList.toggle('open',open); document.body.classList.toggle('menu-open',open); });
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
}

const reveals=[...document.querySelectorAll('.reveal')];
if(reducedMotion){reveals.forEach(el=>el.classList.add('visible'));}else{const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}});},{threshold:.08,rootMargin:'0px 0px -5% 0px'});reveals.forEach(el=>observer.observe(el));}

const ko={
  navServices:'서비스',navHow:'이용 방법',navPricing:'가격',navCoaches:'코치',startFree:'무료로 시작하기',
  heroKicker:'여성 온라인 퍼스널 근력 코칭',heroTitle:'어디서든 부담없이<br><em>코칭받으며 운동하세요</em>',
  heroBody:'원하는 시간과 장소에서 운동하고, <br>실제 코치의 맞춤 프로그램과 피드백을 받아보세요.',
  heroNote:'무료 트레이닝 프로필 만들기',
  forYouKicker:'이런 분께 추천드려요',
  forYouTitle:'근력 운동은 나를 위한<br><em>최고의 선물입니다.</em>',
  need1:'내 운동 자세가 정확한지 확인받고 싶어요.',
  need2:'오프라인 PT의 가격이나 일정이 부담스러워요.',
  need3:'정해진 PT 시간 대신 내가 원하는 시간과 장소에서 운동하고 싶어요.',
  need4:'근력운동을 꾸준히 하고 있지만 전문가의 가이드가 필요해요.',
  need5:'여성의 몸과 근력운동을 이해하는 코치에게 도움받고 싶어요.',
  servicesKicker:'필요할 때 받는 코칭',
  servicesTitle:'필요한 만큼 온라인으로<br><em>코칭받아보세요.</em>',
  servicesBody:'한 번의 자세 피드백부터 개인 프로그램, 지속적인 월간 코칭까지. <br>지금 내 운동에 필요한 만큼 시작하세요.',
  formTitle:'딱 한 동작만<br><em>도움받고 싶을 때.</em>',formBody:'운동 영상 한 세트를 보내고 코치에게 자세, 가동범위, 자극, 중량 선택 등에 대한 구체적인 피드백을 받으세요.',formCta:'Form Check 시작하기 →',
  programTitle:'나에게 맞는 운동 루틴이<br><em>필요할 때.</em>',programBody:'운동 목표, 경험, 집중 부위, 주당 운동 횟수, 운동 시간과 장비를 바탕으로 전문 코치가 나를 위한 근력운동 프로그램을 구성합니다.',programCta:'내 프로그램 받기 →',
  monthlyTitle:'혼자 운동하면서도<br><em>꾸준히 관리받고 싶을 때.</em>',monthlyBody:'개인 맞춤 프로그램, 영상 피드백, 메시지, 프로그램 수정과 Progress Review까지. 한 명의 코치와 지속적으로 운동을 발전시킵니다.',monthlyCta:'월간 코칭 시작하기 →',
  howKicker:'SILUA 이용 방법',howTitle:'온라인 코치와<br><em>더욱 정확하고 자신감있게</em>',how1Title:'SILUA 시작하기',how1Body:'SILUA를 설치하고 나의 Training Profile을 만듭니다.',how2Title:'운동 정보 입력하기',how2Body:'운동 목표, 경험, 집중 부위, 운동 횟수, 시간과 장비를 입력합니다.',how3Title:'나에게 맞는 코치 찾기',how3Body:'전문 분야와 코칭 스타일을 확인하고 나에게 맞는 코치를 선택합니다.',how4Title:'필요한 코칭 선택하기',how4Body:'Form Check, Personalized Program 또는 Monthly Coaching 중 필요한 서비스를 선택합니다.',how5Title:'운동 시작하기',how5Body:'원하는 시간과 장소에서 프로그램을 따라 운동합니다.',how6Title:'기록하고 보내기',how6Body:'세트, 횟수와 중량을 기록하고 폼 체크가 필요한 운동 영상을 코치에게 보냅니다.',how7Title:'더 나아지기',how7Body:'운동 기록과 코치 피드백을 다음 운동에 적용합니다.', how8Title:'변화 확인하기',how8Body:'운동 횟수, 꾸준함, 운동별 기록, 중량과 반복 횟수의 변화와 눈바디를 시간의 흐름으로 확인하세요.',
  pricingKicker:'필요에 맞는 코칭',pricingTitle:'필요한 코칭부터<br><em>가볍게 시작하세요.</em>',pricingBody:'나에게 맞는 코치와 지금 필요한 서비스를 선택하세요.',priceNote:'실제 결제 가격은 앱에서 사용자의 지역에 맞는 현지화 가격으로 표시됩니다.',
  freedomKicker:'점점 더 강해지는 나',freedomTitle:'어디서든 자유롭게 운동하고<br><em>필요한 도움을 받아보세요.</em>',freedomBody:'더욱 정확한 자세와 전문 코치의 맞춤 루틴으로, 운동 효과를 높여보세요. ',
  whyKicker:'여성에게 근력은',whyTitle:'우리의 일상을<br><em> 지탱해주는 힘이 됩니다.</em>',whyBody1:'근력운동은 체중을 줄이거나 아름다운 몸을 만드는 것, 그 이상입니다.',whyBody2:'소중한 내 몸과 함께, 나의 능력을 끊임없이 도전해가는 과정입니다.',whyStatement:'SILUA는 더 많은 여성이 정확하고 꾸준하게 근력을 쌓을 수 있기를 바랍니다.',
  valuesTitle:'강해진다는 건<br><em>보여지는 것 이상의 변화입니다.</em>',valueStrength:'내면의 강인함을 신체와 연결시켜보세요.',valueIdentity:'근력 운동을 통해 점점 더 나다운 나를 만나보세요.',valueLongevity:'오래 지속할 수 있는 끈기와 강함을 만듭니다.',valueUnderstanding:'여성의 몸과 근력운동을 이해하고 지원합니다.',valueAbility:'나의 몸이 할 수 있는 능력들을 새롭게 발견합니다.',
  coachKicker:'SILUA 코치',coachTitle:'목표도 다르고,<br><em>필요한 코칭도 다르니까.</em>',coachBody:'전문 분야, 코칭 스타일과 가격을 확인하고 나에게 맞는 코치를 찾아보세요.',minaMsg:'더 좋은 테크닉으로 강하고 탄탄한 둔근과 하체를 만드세요.',sophieMsg:'혼자서도 자신 있게 운동할 수 있도록.',jiwonMsg:'근육을 키우고 체지방을 줄여 몸의 라인을 바꿔보세요.',emmaMsg:'강하고 균형 잡힌 상체를 만드세요.',danielMsg:'체계적인 점진적 과부하로 더 강해지세요.',minaFrom:'$9.99부터',sophieFrom:'$9.99부터',jiwonFrom:'$9.99부터',emmaFrom:'$9.99부터',danielFrom:'$29.99부터',coachCta:'SILUA에서 코치 둘러보기 →',
  progressKicker:'나의 변화',progressTitle:'오늘 운동이 기록 되고,<br><em>기록은 변화를 만듭니다.</em>',progressBody:'운동 횟수, 꾸준함, 운동별 기록, 중량과 반복 횟수의 변화와 측정값, 눈바디를 시간의 흐름으로 확인하세요.',trainingProgress:'Training · 운동 횟수 · 기록 · PR · 근력 추세',bodyProgress:'Body · 사진 · 체중 · 측정값 · 체크인',
  downloadTitle:'다음 세트는<br><em>더 자신감 있게.</em>',downloadBody:'나의 Training Profile을 만들고, 내 운동 방식에 맞는 코칭을 찾아보세요.',downloadNote:'Training Profile은 무료로 만들 수 있습니다.',privacyLink:'개인정보 처리방침',termsLink:'이용약관',contactLink:'문의',footerLine:'여성을 위한 온라인 근력 코칭.',navForCoaches:'코치 지원',coachRecruitKicker:'SILUA에서 코칭하기',coachRecruitTitle:'헬스장을 넘어.<br><em>어디서든 여성을 코칭하세요.</em>',coachRecruitBody:'프로그램을 만들고, 실제 운동 세트를 확인하고, SILUA에서 비동기 방식으로 여성 고객을 코칭하세요.',coachRecruitCta:'SILUA 코치 지원하기',coachSignIn:'코치 로그인 →',coachSignInShort:'코치 로그인',coachRecruitMeta1:'어디서든 코칭',coachRecruitMeta2:'내 언어로 코칭',coachRecruitMeta3:'SILUA 검증 코치'
};

const en={};document.querySelectorAll('[data-i18n]').forEach(el=>en[el.dataset.i18n]=el.innerHTML);
const isLegalPage = document.body.classList.contains('legal-page');
const isForCoachesPage = document.body.classList.contains('for-coaches-page');
const pageKo = isLegalPage ? (window.SILUA_LEGAL_KO || {}) : isForCoachesPage ? (window.SILUA_FOR_COACHES_KO || {}) : ko;
const pageTitles = isLegalPage || isForCoachesPage ? (window.SILUA_PAGE_TITLES || null) : null;
const readSavedLang = () => { try { return localStorage.getItem('silua-lang') || 'en'; } catch { return 'en'; } };
const saveLang = value => { try { localStorage.setItem('silua-lang', value); } catch {} };
let lang = readSavedLang(); if (lang !== 'ko') lang = 'en';
const applyLanguage = value => {
  lang = value === 'ko' ? 'ko' : 'en'; document.documentElement.lang = lang;
  if (langToggle) langToggle.textContent = lang === 'en' ? 'KR' : 'EN';
  document.querySelectorAll('[data-i18n]').forEach(el => { const key=el.dataset.i18n; const translated=lang==='ko'?pageKo[key]:en[key]; if(translated!=null) el.innerHTML=translated; });
  if(pageTitles) document.title = lang==='ko' ? pageTitles.ko : pageTitles.en;
};
applyLanguage(lang);
langToggle?.addEventListener('click',()=>{const next=lang==='en'?'ko':'en';saveLang(next);applyLanguage(next);});
