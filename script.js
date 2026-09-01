const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('[data-menu-button]');
const mobileMenu = document.querySelector('[data-mobile-menu]');

if (document.body.classList.contains('legal-page')) {
  const legalStyles = document.createElement('link');
  legalStyles.rel = 'stylesheet';
  legalStyles.href = '/legal.css';
  document.head.appendChild(legalStyles);
}

document.body.classList.add('page-ready');

const setHeader = () => header?.classList.toggle('scrolled', window.scrollY > 20);
setHeader();
window.addEventListener('scroll', setHeader, { passive: true });

document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

if (menuButton && mobileMenu) {
  const close = () => {
    menuButton.setAttribute('aria-expanded','false');
    mobileMenu.classList.remove('open');
    document.body.classList.remove('menu-open');
  };
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    mobileMenu.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
  });
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
}

const reveals = [...document.querySelectorAll('.reveal')];
if (reducedMotion) {
  reveals.forEach(el => el.classList.add('visible'));
} else {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .1, rootMargin: '0px 0px -6% 0px' });
  reveals.forEach(el => observer.observe(el));
}

document.querySelectorAll('.faq-item').forEach(item => {
  const button = item.querySelector('.faq-question');
  button?.addEventListener('click', () => {
    const open = item.classList.toggle('open');
    button.setAttribute('aria-expanded', String(open));
  });
});

if (!reducedMotion) {
  const depthEls = [...document.querySelectorAll('[data-depth]')];
  let raf = 0;
  const updateDepth = () => {
    const vh = innerHeight;
    depthEls.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      const p = ((r.top + r.height/2) - vh/2) / vh;
      const img = el.querySelector('img');
      if (img) img.style.transform = `translate3d(0,${p * -Number(el.dataset.depth || 6)}px,0) scale(1.025)`;
    });
    raf = 0;
  };
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(updateDepth); }, { passive:true });
  addEventListener('resize', updateDepth);
  updateDepth();
}
