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

document.querySelectorAll('.faq-item').forEach(item => { const button=item.querySelector('.faq-question'); button?.addEventListener('click',()=>{ const open=item.classList.toggle('open'); button.setAttribute('aria-expanded',String(open)); }); });

const reveals=[...document.querySelectorAll('.reveal')];
if(reducedMotion){reveals.forEach(el=>el.classList.add('visible'));}else{const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}});},{threshold:.08,rootMargin:'0px 0px -5% 0px'});reveals.forEach(el=>observer.observe(el));}

const ko={
  navHow:'이용 방법',navCoaches:'코치',navCoaching:'코칭',navProgress:'Progress',downloadApp:'앱 다운로드',
  heroKicker:'여성을 위한 퍼스널 근력 코칭',heroTitle:'혼자 운동해도,<br><em>코칭은 개인적으로.</em>',heroBody:'실제 코치에게 프로그램을 받고, 내 방식대로 운동하고, 한 세트를 보내 피드백을 받으며 계속 발전하세요.',seeHow:'SILUA 이용 방법 보기 ↓',
  howKicker:'SILUA 이용 방법',howTitle:'내 운동 뒤에,<br><em>실제 코치가 있습니다.</em>',step1Title:'코치 선택',step1Body:'전문 분야, 코칭 스타일, 가격을 보고 나에게 맞는 코치를 선택하세요.',step2Title:'프로그램 받기',step2Body:'목표, 운동 경험과 환경을 바탕으로 코치가 프로그램을 만듭니다.',step3Title:'운동하고 기록하기',step3Body:'계획대로 운동하며 세트, 횟수, 중량을 기록하세요.',step4Title:'세트 보내기',step4Body:'코치가 자세히 봐줬으면 하는 운동 영상을 보내세요.',step5Title:'개선하기',step5Body:'피드백과 프로그램 조정을 다음 운동에 적용하세요.',
  sendKicker:'SEND A SET',sendTitle:'운동법은 영상이 보여줘도,<br><em>내 세트는 코치가 봐줍니다.</em>',sendBody:'자세, 가동범위, 자극, 중량 선택, 불편한 점을 물어보세요. 코치는 실제 수행 영상을 보고 다음 운동에서 바꿀 점을 알려줍니다.',
  programKicker:'개인 맞춤 프로그램',programTitle:'실제로 내가 운동하는 방식에<br><em>맞춘 프로그램.</em>',programBody:'코치는 목표, 운동 경험, 일정과 장비를 바탕으로 운동 선택, 세트, 횟수, 휴식, 중량 가이드와 큐를 정합니다.',factGoal:'목표',factExp:'운동 경험',factSchedule:'일정',factEquipment:'장비',coachNote:'나를 위해 만들고, 코치가 최종 완성합니다.',
  coachKicker:'코치 만나기',coachTitle:'목표도 다르고,<br><em>맞는 코칭도 다릅니다.</em>',coachBody:'전문 분야, 코칭 스타일과 가격을 보고 선택하세요. 코칭은 SILUA 앱에서 시작됩니다.',minaMsg:'더 좋은 테크닉으로 강하고 탄탄한 둔근과 하체를 만드세요.',minaProducts:'Form Check · 월간 코칭',sophieMsg:'혼자서도 자신 있게 운동할 수 있도록.',sophieProducts:'Personalized Program · Form Check',jiwonMsg:'근육을 키우고 체지방을 줄여 몸의 라인을 바꿔보세요.',jiwonProducts:'Personalized Program · 월간 코칭',emmaMsg:'강하고 균형 잡힌 상체를 만드세요.',emmaProducts:'Form Check · Personalized Program',danielMsg:'체계적인 점진적 과부하로 더 강해지세요.',danielProducts:'Personalized Program · 월간 코칭',browseCoaches:'앱에서 코치 둘러보기 →',
  productsKicker:'코칭',productsTitle:'지금 내 운동에 필요한 만큼<br><em>시작하세요.</em>',productsBody:'한 세트 피드백부터 전체 프로그램, 지속적인 코칭까지. 지금 필요한 지원 수준을 선택하세요.',formBody:'운동 영상 한 개를 보내고 실제 코치에게 구체적인 피드백을 받습니다.',personalBody:'Training Profile을 바탕으로 코치가 완성하는 개인 근력운동 프로그램.',monthlyBody:'프로그램, 영상 피드백, 메시지, 프로그램 수정과 Progress Review까지 지속적으로.',priceNote:'앱에서는 각 지역의 현지화 가격으로 표시됩니다.',
  progressKicker:'PROGRESS',progressTitle:'운동이 쌓이면,<br><em>변화가 보입니다.</em>',progressBody:'근력, 꾸준함, 몸의 변화를 시간의 흐름으로 확인하세요. 하나의 숫자로만 Progress를 판단하지 않습니다.',trainingProgress:'Training: 운동 횟수 · 기록 · PR · 근력 추세',bodyProgress:'Body: 사진 · 체중 · 측정값 · 체크인',
  brandTitle:'강해진다는 건<br><em>몸 이상의 변화입니다.</em>',brandBody:'SILUA는 자신의 방식으로 강해지는 여성을 위한 서비스입니다. 독립적으로 운동하면서도 꾸준히 발전할 수 있는 코칭을 지향합니다.',
  faqTitle:'궁금한 점.',q1:'혼자 운동해도 SILUA를 사용할 수 있나요?',a1:'네. SILUA는 혼자 운동하는 경험을 중심으로 설계되어 있습니다. 코치는 프로그램과 피드백을 제공하고, 사용자는 원하는 시간과 장소에서 운동합니다.',q2:'영상을 보내려면 월간 코칭이 필요한가요?',a2:'아니요. 한 번의 Form Check로 시작할 수 있습니다. 월간 코칭에서는 코칭 플랜에 따라 지속적인 영상 피드백을 받을 수 있습니다.',q3:'내 프로그램은 누가 만드나요?',a3:'실제 코치가 Training Profile을 바탕으로 최종 프로그램을 만듭니다. 목표, 운동 경험, 일정, 장비와 집중 부위를 확인합니다.',q4:'코치를 바꿀 수 있나요?',a4:'코치 availability와 서비스 상태는 앱에서 관리됩니다. 월간 코칭은 한 번에 한 명의 active coach와 진행하는 구조입니다.',
  downloadKicker:'SILUA',downloadTitle:'다음 세트를<br><em>더 이상 추측하지 마세요.</em>',downloadBody:'SILUA를 다운로드하고, 내 코치를 선택해 지금 필요한 코칭부터 시작하세요.',downloadStore:'App Store에서 다운로드',footerLine:'여성을 위한 퍼스널 근력 코칭.'
};
const en={};document.querySelectorAll('[data-i18n]').forEach(el=>en[el.dataset.i18n]=el.innerHTML);
let lang='en';
langToggle?.addEventListener('click',()=>{lang=lang==='en'?'ko':'en';document.documentElement.lang=lang;langToggle.textContent=lang==='en'?'KR':'EN';document.querySelectorAll('[data-i18n]').forEach(el=>{const key=el.dataset.i18n;const value=lang==='ko'?ko[key]:en[key];if(value!=null)el.innerHTML=value;});});
