(function () {
  'use strict';

  const html = document.documentElement;
  html.classList.add('js');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // ─── Tema (o valor inicial é aplicado no <head> para não piscar) ─────────────
  const themeBtn = document.getElementById('toggle-tema');
  const themeColor = document.querySelector('meta[name="theme-color"]');

  function applyTheme(t, persist) {
    html.setAttribute('data-theme', t);
    if (themeColor) themeColor.setAttribute('content', t === 'dark' ? '#0e1116' : '#f5f6f8');
    if (persist) { try { localStorage.setItem('tema', t); } catch (e) {} }
  }

  applyTheme(html.getAttribute('data-theme') || 'dark', false);
  themeBtn.addEventListener('click', () => {
    applyTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true);
  });

  // ─── Nome do hero: letra por letra ───────────────────────────────────────────
  document.querySelectorAll('[data-split]').forEach(line => {
    const text = line.textContent;
    line.textContent = '';
    line.setAttribute('aria-hidden', 'true');
    [...text].forEach((c, i) => {
      const s = document.createElement('span');
      s.className = 'ch';
      s.style.setProperty('--i', i);
      s.textContent = c;
      line.appendChild(s);
    });
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

  // ─── Link ativo + pílula que desliza até ele ─────────────────────────────────
  const navLinks = document.querySelectorAll('.nav-link');
  const indicator = document.querySelector('.nav-indicator');

  function moveIndicator(link) {
    if (!indicator) return;
    if (!link) { indicator.style.opacity = '0'; return; }
    indicator.style.width = link.offsetWidth + 'px';
    indicator.style.transform = `translateX(${link.offsetLeft}px)`;
    indicator.style.opacity = '1';
  }

  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      let active = null;
      navLinks.forEach(l => {
        const on = l.dataset.section === entry.target.id;
        l.classList.toggle('active', on);
        if (on) active = l;
      });
      moveIndicator(active);
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  document.querySelectorAll('section[id]').forEach(s => sectionObserver.observe(s));
  window.addEventListener('resize', () => moveIndicator(document.querySelector('.nav-link.active')));

  // ─── Cabeçalho, barra de progresso e linha do tempo conforme a rolagem ───────
  const header = document.querySelector('.nav-header');
  const progress = document.querySelector('.scroll-progress span');
  const timeline = document.getElementById('timeline');
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle('scrolled', y > 12);
    if (progress) progress.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);
    if (timeline) {
      const r = timeline.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.6 - r.top) / r.height));
      timeline.style.setProperty('--tl', p.toFixed(4));
    }
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  // ─── Animação de entrada das seções ───────────────────────────────────────────
  document.querySelectorAll('.stack-grid, .timeline, .edu-grid, .case-pair, .cases').forEach(group => {
    group.querySelectorAll(':scope > .reveal').forEach((el, i) => el.style.setProperty('--stagger', `${i * 90}ms`));
  });

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // ─── Números dos destaques contam até o valor ────────────────────────────────
  const counters = document.querySelectorAll('[data-count]');
  if (!reduceMotion) {
    counters.forEach(el => { el.textContent = '0'; });
    const countObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = Number(el.dataset.count);
        const dur = 1400;
        const start = performance.now() + 900;
        const step = now => {
          const t = Math.min(1, Math.max(0, (now - start) / dur));
          const eased = 1 - Math.pow(1 - t, 4);
          el.textContent = Math.round(target * eased).toLocaleString('pt-BR');
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        countObserver.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach(el => countObserver.observe(el));
  }

  // ─── Capturas dos projetos inclinam acompanhando o mouse ─────────────────────
  if (finePointer && !reduceMotion) {
    document.querySelectorAll('.case-shot').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        card.classList.add('is-tilting');
        card.style.setProperty('--ry', `${(x - 0.5) * 7}deg`);
        card.style.setProperty('--rx', `${(0.5 - y) * 6}deg`);
        card.style.setProperty('--mx', `${x * 100}%`);
        card.style.setProperty('--my', `${y * 100}%`);
      });
      card.addEventListener('pointerleave', () => {
        card.classList.remove('is-tilting');
        card.style.setProperty('--ry', '0deg');
        card.style.setProperty('--rx', '0deg');
      });
    });

    document.querySelectorAll('.stack-group').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });
  }

  // ─── Feed de negócios (ilustração do gap-fill) ───────────────────────────────
  const rowsEl = document.getElementById('feed-rows');
  const seqEl = document.getElementById('feed-seq');
  const statusEl = document.querySelector('.feed-status');
  const statusText = document.getElementById('feed-status-text');

  if (rowsEl) {
    const tickers = [
      ['PETR4', 37.42], ['VALE3', 61.18], ['ITUB4', 35.06], ['BBDC4', 14.21],
      ['WEGE3', 52.77], ['BBAS3', 27.9], ['ABEV3', 12.64], ['B3SA3', 13.35],
      ['RENT3', 41.2], ['WINZ26', 128450], ['DOLZ26', 5342.5]
    ];
    const MAX_ROWS = 8;
    let seq = 18412;
    let sinceGap = 0;
    let busy = false;
    let timer = null;
    const fmt = n => n >= 1000
      ? n.toLocaleString('pt-BR', { minimumFractionDigits: n % 1 ? 1 : 0, maximumFractionDigits: 1 })
      : n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    function clock() {
      const d = new Date();
      return d.toLocaleTimeString('pt-BR', { hour12: false });
    }

    function tradeRow(s, cls) {
      const t = tickers[Math.floor(Math.random() * tickers.length)];
      const big = t[1] >= 1000;
      const drift = (Math.random() - 0.48) * (big ? t[1] * 0.0006 : t[1] * 0.0015);
      const old = t[1];
      t[1] = big ? Math.round((t[1] + drift) * 2) / 2 : Math.round((t[1] + drift) * 100) / 100;
      const dir = t[1] >= old ? 'up' : 'down';
      const qty = big ? 1 + Math.floor(Math.random() * 20) : 100 * (1 + Math.floor(Math.random() * 30));
      const li = document.createElement('li');
      li.className = 'feed-row' + (cls ? ' ' + cls : '');
      li.innerHTML =
        `<span class="seq">${s}</span><span class="tk">${t[0]}</span>` +
        `<span class="r ${dir}">${fmt(t[1])}</span><span class="r">${qty.toLocaleString('pt-BR')}</span>` +
        `<span class="r hr">${clock()}</span>`;
      return li;
    }

    function noteRow(text, cls) {
      const li = document.createElement('li');
      li.className = 'feed-row ' + cls;
      li.textContent = text;
      return li;
    }

    function push(li) {
      rowsEl.prepend(li);
      while (rowsEl.children.length > MAX_ROWS) rowsEl.lastElementChild.remove();
    }

    function setStatus(gap) {
      statusEl.classList.toggle('is-gap', gap);
      statusText.textContent = gap ? 'buscando o que faltou' : 'recebendo';
    }

    // Passo a passo ao lado (desktop) ou em cima (celular): 0 recebe, 1 vê o buraco, 2 pede, 3 recupera
    const steps = [...document.querySelectorAll('#sim-steps li')];
    function setStep(n) {
      steps.forEach((li, i) => {
        li.classList.toggle('is-on', i === n);
        li.classList.toggle('is-done', i < n);
      });
    }

    // No celular os avisos ficam curtos para caber numa linha
    const narrow = window.matchMedia('(max-width: 560px)');
    const msgGap = (a, b) => narrow.matches ? `faltaram ${a}–${b} · buscando` : `faltaram os nº ${a} a ${b}, buscando`;
    const msgOk = () => narrow.matches ? '3 recuperados, sem duplicar' : '3 negócios recuperados, sem duplicar';

    function tick() {
      if (busy) return;
      sinceGap++;
      if (sinceGap > 6) {
        // Simula três negócios que não chegaram
        busy = true;
        sinceGap = 0;
        const first = seq + 1;
        const last = seq + 3;
        seq += 4;
        push(tradeRow(seq));
        seqEl.textContent = seq;
        setTimeout(() => {
          setStatus(true);
          setStep(1);
          push(noteRow(msgGap(first, last), 'is-alert'));
        }, 450);
        setTimeout(() => setStep(2), 1050);
        [first, first + 1, last].forEach((s, i) => {
          setTimeout(() => { if (i === 0) setStep(3); push(tradeRow(s, 'is-recovered')); }, 1600 + i * 420);
        });
        setTimeout(() => {
          push(noteRow(msgOk(), 'is-ok'));
          setStatus(false);
          busy = false;
        }, 3200);
        return;
      }
      setStep(0);
      seq++;
      seqEl.textContent = seq;
      push(tradeRow(seq));
    }

    // Já começa com algumas linhas, sem animação
    for (let i = 0; i < 5; i++) {
      seq++;
      const li = tradeRow(seq);
      li.style.animation = 'none';
      rowsEl.prepend(li);
    }
    seqEl.textContent = seq;

    if (reduceMotion) {
      // Estático: mostra um episódio completo de lacuna e recuperação
      push(noteRow(msgOk(), 'is-ok'));
      setStep(4);
      [...rowsEl.children].forEach(li => { li.style.animation = 'none'; });
    } else {
      const start = () => { if (!timer) timer = setInterval(tick, 1000); };
      const stop = () => { clearInterval(timer); timer = null; };
      // Dentro de um case fechado (<details>) a simulação só roda quando ele está aberto
      const holder = rowsEl.closest('details');
      if (holder) {
        const sync = () => (holder.open && !document.hidden ? start() : stop());
        holder.addEventListener('toggle', sync);
        document.addEventListener('visibilitychange', sync);
        sync();
      } else {
        let inView = false;
        const sync = () => (inView && !document.hidden ? start() : stop());
        new IntersectionObserver(([e]) => { inView = e.isIntersecting; sync(); }).observe(rowsEl);
        document.addEventListener('visibilitychange', sync);
      }
    }
  }

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

  // Chegou até aqui sem erro: o <head> não precisa desligar as animações
  window.__siteReady = true;
})();
