// Chana Mirel Photography — shared site scripts
// Handles: scroll reveal, sticky nav shadow, mobile menu toggle, count-up stats

(() => {
  'use strict';

  // ---- Scroll reveal ----
  // v0 simple: mark all .reveal elements visible immediately.
  // (The fancier staggered IO animation can return in production once
  // we're confident screenshots + bots render reliably.)
  const reveals = document.querySelectorAll('.reveal');
  reveals.forEach(el => el.classList.add('visible'));

  // ---- Sticky nav shadow on scroll ----
  const nav = document.getElementById('nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ---- Mobile menu toggle ----
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('active');
      toggle.classList.toggle('active', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    // Close menu when a link is tapped
    links.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        links.classList.remove('active');
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ---- Count-up stats ----
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fmt = new Intl.NumberFormat('en-US');
  const animate = (el) => {
    const target = +el.dataset.target;
    if (reduce) { el.textContent = fmt.format(target); return; }
    const duration = 1800, start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt.format(Math.floor(eased * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const countNums = document.querySelectorAll('.stat-num');
  if (countNums.length) {
    const countIo = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => { if (e.isIntersecting) { animate(e.target); obs.unobserve(e.target); } });
    }, { threshold: 0.4 });
    countNums.forEach(el => countIo.observe(el));
  }

  // ---- Basic form submit (Formspree) ----
  const form = document.getElementById('inquiry-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const status = form.querySelector('.form-status');
      const honey = form.querySelector('input[name="_gotcha"]');
      if (honey && honey.value) return; // spam
      btn.disabled = true;
      btn.textContent = 'Sending...';
      try {
        const data = new FormData(form);
        const res = await fetch(form.action, {
          method: 'POST',
          body: data,
          headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
          form.reset();
          if (status) { status.textContent = "Thanks! I'll get back to you within 1-2 business days."; status.className = 'form-status success'; }
          btn.textContent = 'Sent';
        } else {
          throw new Error('Network');
        }
      } catch (err) {
        if (status) { status.textContent = 'Something went wrong. Please email chanamirelphotography@gmail.com directly.'; status.className = 'form-status error'; }
        btn.disabled = false;
        btn.textContent = 'Send inquiry';
      }
    });
  }
})();
