// Mobile menu
const toggle = document.querySelector('.menu-toggle');
const nav = document.getElementById('nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => { const o = nav.classList.toggle('open'); toggle.setAttribute('aria-expanded', o); });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', false); }));
}

// Calendar (May 2026) in playback phone
const grid = document.getElementById('calGrid');
if (grid) {
  ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].forEach(d => grid.insertAdjacentHTML('beforeend', `<span>${d}</span>`));
  const first = new Date(2026, 4, 1).getDay();
  const total = new Date(2026, 5, 0).getDate();
  for (let i = 0; i < first; i++) grid.insertAdjacentHTML('beforeend', '<span class="d dim"></span>');
  for (let d = 1; d <= total; d++) {
    grid.insertAdjacentHTML('beforeend', `<span class="d${d === 18 ? ' sel' : ''}">${d}</span>`);
  }
  grid.addEventListener('click', e => {
    if (!e.target.classList.contains('d') || e.target.classList.contains('dim')) return;
    grid.querySelectorAll('.sel').forEach(el => el.classList.remove('sel'));
    e.target.classList.add('sel');
  });
}

// Toggle switch in settings phone
document.querySelectorAll('.toggle').forEach(t => t.addEventListener('click', () => t.classList.toggle('on')));

// Reveal on scroll
const targets = document.querySelectorAll('.strip-item, .features-text, .phones, .phones-img, .step, .banner, .card, .f-row, .explore-card, .step-row, .cta');
targets.forEach(t => t.classList.add('reveal'));
const io = new IntersectionObserver(entries => {
  entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
}, { threshold: .1 });
targets.forEach(t => io.observe(t));

// Screenshots: filters + lightbox
const filters = document.getElementById('filters');
if (filters) {
  filters.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    filters.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
    document.querySelectorAll('.shot').forEach(s => s.classList.toggle('hide', b.dataset.f !== 'all' && s.dataset.cat !== b.dataset.f));
  });
}
const lb = document.getElementById('lightbox');
if (lb) {
  const lbImg = lb.querySelector('img'), lbCap = lb.querySelector('p');
  document.querySelectorAll('.shot').forEach(s => s.addEventListener('click', () => {
    lbImg.src = s.querySelector('img').src;
    lbCap.textContent = s.querySelector('figcaption').textContent;
    lb.classList.add('open');
  }));
  lb.addEventListener('click', e => { if (e.target !== lbImg) lb.classList.remove('open'); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') lb.classList.remove('open'); });
}

// Support: forms (front-end only) + one FAQ open at a time
['contactForm', 'reportForm'].forEach(id => {
  const f = document.getElementById(id);
  if (!f) return;
  f.addEventListener('submit', e => {
    e.preventDefault();
    f.querySelector('.form-note').hidden = false;
    f.reset();
  });
});
document.querySelectorAll('.faq details').forEach(d => d.addEventListener('toggle', () => {
  if (d.open) d.parentElement.querySelectorAll('details[open]').forEach(o => { if (o !== d) o.open = false; });
}));

// Support: help search filters FAQ
const faqSearch = document.getElementById('faqSearch');
if (faqSearch) {
  faqSearch.addEventListener('submit', e => {
    e.preventDefault();
    const q = faqSearch.querySelector('input').value.trim().toLowerCase();
    let hits = 0;
    document.querySelectorAll('#faq .faq details').forEach(d => {
      const ok = !q || d.textContent.toLowerCase().includes(q);
      d.classList.toggle('hide', !ok);
      if (ok) hits++;
    });
    const f = document.getElementById('faq');
    f.scrollIntoView({ behavior: 'smooth' });
    if (q && hits === 1) document.querySelector('#faq details:not(.hide)').open = true;
  });
  faqSearch.querySelector('input').addEventListener('input', e => {
    if (!e.target.value) document.querySelectorAll('#faq .faq details').forEach(d => d.classList.remove('hide'));
  });
}

// Clean address bar: hide "index.html" (e.g. 127.0.0.1:5500/index.html -> 127.0.0.1:5500/)
try {
  if (/^https?:$/.test(location.protocol) && /\/index\.html$/.test(location.pathname)) {
    history.replaceState(null, '', location.pathname.replace(/index\.html$/, '') + location.search + location.hash);
  }
} catch (e) { /* ignore */ }

// Screenshots hero: images rotate one by one (coverflow)
(function () {
  const cf = document.getElementById('coverflow');
  if (!cf) return;
  const slides = [...cf.querySelectorAll('.slide')];
  const dotsBox = document.getElementById('cfDots');
  const n = slides.length;
  let idx = 0, timer = null;
  const dots = slides.map((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', 'Show picture ' + (i + 1));
    b.addEventListener('click', () => { go(i); restart(); });
    dotsBox.appendChild(b);
    return b;
  });
  function render() {
    slides.forEach((s, i) => {
      const d = (i - idx + n) % n;
      s.className = 'slide' + (d === 0 ? ' p0' : d === 1 ? ' p1' : d === n - 1 ? ' pm1' : '');
    });
    dots.forEach((b, i) => b.classList.toggle('on', i === idx));
  }
  function go(i) { idx = (i + n) % n; render(); }
  function restart() { stop(); if (!matchMedia('(prefers-reduced-motion: reduce)').matches) timer = setInterval(() => go(idx + 1), 3200); }
  function stop() { if (timer) clearInterval(timer); timer = null; }
  slides.forEach((s, i) => s.addEventListener('click', () => { if (i !== idx) { go(i); restart(); } }));
  cf.addEventListener('mouseenter', stop);
  cf.addEventListener('mouseleave', restart);
  let x0 = null;
  cf.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; stop(); }, { passive: true });
  cf.addEventListener('touchend', e => {
    if (x0 !== null) { const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1)); }
    x0 = null; restart();
  });
  render(); restart();
})();
