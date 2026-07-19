document.documentElement.classList.add('motion-ready');

document.addEventListener('DOMContentLoaded', () => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const progress = document.querySelector('.pbr-progress');
  const updateProgress = () => {
    if (!progress) return;
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    progress.style.transform = `scaleX(${Math.min(1, scrollY / max)})`;
  };
  addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  const menu = document.getElementById('pbrMenu');
  const openButton = document.getElementById('pbrMenuOpen');
  const closeButton = document.getElementById('pbrMenuClose');
  let returnFocus = null;
  const focusables = () => menu ? [...menu.querySelectorAll('a[href],button:not([disabled])')] : [];
  const setMenu = (open) => {
    if (!menu || !openButton) return;
    menu.dataset.open = String(open);
    if (open) menu.removeAttribute('inert');
    else menu.setAttribute('inert', '');
    openButton.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
    if (open) {
      returnFocus = document.activeElement;
      setTimeout(() => (closeButton || focusables()[0])?.focus({ preventScroll: true }), 100);
    } else {
      (returnFocus || openButton).focus();
    }
  };
  openButton?.addEventListener('click', () => setMenu(true));
  closeButton?.addEventListener('click', () => setMenu(false));
  menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', event => {
    if (!menu || menu.dataset.open !== 'true') return;
    if (event.key === 'Escape') setMenu(false);
    if (event.key !== 'Tab') return;
    const items = focusables();
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });

  document.querySelectorAll('[data-hover-style]').forEach(element => {
    const original = element.getAttribute('style') || '';
    element.addEventListener('mouseenter', () => element.style.cssText = `${original};${element.dataset.hoverStyle}`);
    element.addEventListener('mouseleave', () => element.setAttribute('style', original));
  });

  const reveals = [...document.querySelectorAll('[data-reveal]')];
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(element => element.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const delay = Number(entry.target.dataset.delay || 0);
      entry.target.style.transitionDelay = `${delay}ms`;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }), { threshold: .15, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(element => observer.observe(element));
  }

  if (!reduce) {
    const parallax = [...document.querySelectorAll('[data-parallax]')];
    const updateParallax = () => parallax.forEach(element => {
      const speed = Number(element.dataset.parallax || .05);
      element.style.transform = `translateY(${(scrollY * speed).toFixed(1)}px)`;
    });
    addEventListener('scroll', updateParallax, { passive: true });
  }

  const track = document.getElementById('heroTrack');
  const viewport = document.getElementById('heroVp');
  const dots = [0, 1, 2].map(index => document.getElementById(`hDot${index}`)).filter(Boolean);
  if (track && viewport && dots.length) {
    const mobileHero = matchMedia('(max-width: 620px)').matches;
    let current = 0;
    let timer;
    let startX = 0;
    const go = index => {
      current = (index + dots.length) % dots.length;
      track.style.transform = `translateX(-${current * 100}%)`;
      track.style.transition = reduce ? 'none' : 'transform .75s cubic-bezier(.22,1,.36,1)';
      dots.forEach((dot, i) => {
        dot.style.width = i === current ? '30px' : '16px';
        dot.style.background = i === current ? '#EE7B5B' : 'rgba(27,32,33,.18)';
        dot.setAttribute('aria-current', i === current ? 'true' : 'false');
      });
    };
    const play = () => { if (!reduce && !mobileHero) timer = setInterval(() => go(current + 1), 6500); };
    const pause = () => clearInterval(timer);
    if (!mobileHero) {
      dots.forEach((dot, index) => {
        dot.addEventListener('click', () => { pause(); go(index); play(); });
        dot.addEventListener('keydown', event => {
          if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); dot.click(); }
        });
      });
      viewport.addEventListener('pointerdown', event => { startX = event.clientX; pause(); });
      viewport.addEventListener('pointerup', event => {
        const delta = event.clientX - startX;
        if (Math.abs(delta) > 55) go(current + (delta < 0 ? 1 : -1));
        play();
      });
      viewport.addEventListener('mouseenter', pause);
      viewport.addEventListener('mouseleave', play);
      viewport.addEventListener('focusin', pause);
      viewport.addEventListener('focusout', play);
    }
    go(0);
    play();
  }
});
