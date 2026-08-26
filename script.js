const header=document.querySelector('[data-header]');
const menuButton=document.querySelector('[data-menu-button]');
const menu=document.querySelector('[data-mobile-menu]');
const year=document.querySelector('[data-year]');
if(year) year.textContent=new Date().getFullYear();
const onScroll=()=>header?.classList.toggle('scrolled',window.scrollY>10);
onScroll(); addEventListener('scroll',onScroll,{passive:true});
if(menuButton&&menu){menuButton.addEventListener('click',()=>{const open=menu.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open));});menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.classList.remove('open');menuButton.setAttribute('aria-expanded','false');}));}
const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target);}}),{threshold:.12,rootMargin:'0px 0px -5% 0px'});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
document.querySelectorAll('details').forEach(d=>d.addEventListener('toggle',()=>{if(d.open){document.querySelectorAll('details').forEach(other=>{if(other!==d)other.open=false;});}}));
