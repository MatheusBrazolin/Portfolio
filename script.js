(function () {
  'use strict';

  const html = document.documentElement;
  html.classList.add('js');

  // ─── Tema (o valor inicial é aplicado no <head> para não piscar) ─────────────
  const themeBtn = document.getElementById('toggle-tema');
  const themeColor = document.querySelector('meta[name="theme-color"]');

  function applyTheme(t, persist) {
    html.setAttribute('data-theme', t);
    if (themeColor) themeColor.setAttribute('content', t === 'dark' ? '#0d0d14' : '#f7f8fb');
    if (persist) { try { localStorage.setItem('tema', t); } catch (e) {} }
  }

  applyTheme(html.getAttribute('data-theme') || 'dark', false);
  themeBtn.addEventListener('click', () => {
    applyTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true);
  });

  // ─── Menu mobile ──────────────────────────────────────────────────────────────
  const navToggle = document.getElementById('nav-toggle');
  const navPanel  = document.getElementById('nav-links');

  function setNavOpen(open) {
    navPanel.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  }

  navToggle.addEventListener('click', () => setNavOpen(!navPanel.classList.contains('open')));
  navPanel.addEventListener('click', e => { if (e.target.closest('.nav-link')) setNavOpen(false); });
  document.addEventListener('click', e => {
    if (navPanel.classList.contains('open') && !navPanel.contains(e.target) && !navToggle.contains(e.target)) setNavOpen(false);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navPanel.classList.contains('open')) { setNavOpen(false); navToggle.focus(); }
  });

  // ─── Link ativo no menu conforme a rolagem ────────────────────────────────────
  const navLinks = document.querySelectorAll('.nav-link');
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.toggle('active', l.dataset.section === entry.target.id));
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  document.querySelectorAll('section[id]').forEach(s => sectionObserver.observe(s));

  // ─── Animação de entrada (o hero não anima: aparece na hora) ──────────────────
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // ─── Copiar e-mail ────────────────────────────────────────────────────────────
  const toast = document.getElementById('toast');
  let toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  const copyBtn = document.getElementById('copy-email');
  copyBtn.addEventListener('click', async () => {
    const email = copyBtn.dataset.email;
    try {
      await navigator.clipboard.writeText(email);
      showToast('E-mail copiado');
    } catch (e) {
      showToast(email);
    }
  });
})();
