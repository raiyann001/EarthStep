/* ==========================================================================
   EarthStep — Shared Script
   Handles: nav scroll state, mobile menu, AOS/GSAP init, animated counters,
   ring meters, FAQ accordion, leaderboard tabs, contact form, charts,
   and daily challenges.
   Real authentication (Sign Up / Log In / Log Out / nav avatar) now lives
   in assets/js/auth.js, backed by Firebase — see that file.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Icons ---------- */
  if (window.lucide) lucide.createIcons();

  /* ---------- AOS ---------- */
  if (window.AOS) {
    AOS.init({ duration: 800, easing: 'ease-out-cubic', once: true, offset: 60 });
  } else {
    // Fallback IntersectionObserver so [data-aos] elements still reveal without the CDN
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('aos-animate'); });
    }, { threshold: 0.15 });
    document.querySelectorAll('[data-aos]').forEach(el => io.observe(el));
  }

  /* ---------- Sticky nav shadow ---------- */
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Active nav link ---------- */
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });

  /* ---------- Mobile menu ---------- */
  const toggle = document.querySelector('.nav-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const closeBtn = document.querySelector('.mobile-close');
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => mobileMenu.classList.add('open'));
    closeBtn?.addEventListener('click', () => mobileMenu.classList.remove('open'));
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileMenu.classList.remove('open')));
  }

  /* ---------- GSAP hero entrance ---------- */
  if (window.gsap) {
    gsap.from('.hero-copy > *', { y: 24, opacity: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out', delay: 0.1 });
    gsap.from('.earth-stage', { scale: 0.8, opacity: 0, duration: 1.1, ease: 'power3.out', delay: 0.2 });
    gsap.to('.earth-orb', {
      y: -14, duration: 3, repeat: -1, yoyo: true, ease: 'sine.inOut'
    });
  }

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll('[data-count]');
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.count);
      const decimals = (el.dataset.count.split('.')[1] || '').length;
      const suffix = el.dataset.suffix || '';
      const duration = 1600;
      const start = performance.now();
      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const val = target * eased;
        el.textContent = val.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + suffix;
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      countIO.unobserve(el);
    });
  }, { threshold: 0.4 });
  counters.forEach(c => countIO.observe(c));

  /* ---------- Ring meters (Earth Health / XP / progress rings) ---------- */
  document.querySelectorAll('.ring-meter').forEach(ring => {
    const pct = parseFloat(ring.dataset.value || '0');
    const circle = ring.querySelector('.value');
    if (!circle) return;
    const radius = circle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    circle.style.strokeDasharray = `${circumference}`;
    circle.style.strokeDashoffset = `${circumference}`;
    const ringIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        circle.style.strokeDashoffset = `${circumference * (1 - pct / 100)}`;
        ringIO.unobserve(ring);
      });
    }, { threshold: 0.4 });
    ringIO.observe(ring);
  });

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-item').forEach(item => {
    item.querySelector('.faq-q')?.addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      item.parentElement.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });

  /* ---------- Leaderboard tabs ---------- */
  document.querySelectorAll('.tabs[data-tabs]').forEach(tabGroup => {
    const targetName = tabGroup.dataset.tabs;
    const panels = document.querySelectorAll(`[data-panel="${targetName}"]`);
    tabGroup.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        tabGroup.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        panels.forEach(p => p.style.display = (p.dataset.key === btn.dataset.key) ? '' : 'none');
      });
    });
  });

  /* ---------- Contact form ---------- */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      contactForm.style.display = 'none';
      document.getElementById('form-success')?.classList.add('show');
    });
  }

  /* ---------- Charts (Chart.js) ---------- */
  const green = { primary: '#2E7D32', secondary: '#4CAF50', accent: '#81C784', line: '#DCEEDD', ink: '#3C5245' };

  const impactChartEl = document.getElementById('impactChart');
  if (impactChartEl && window.Chart) {
    new Chart(impactChartEl, {
      type: 'line',
      data: {
        labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul'],
        datasets: [{
          label: 'CO₂ Reduced (tonnes)',
          data: [1200, 1900, 2600, 3400, 4300, 5400, 6800],
          borderColor: green.primary,
          backgroundColor: 'rgba(76,175,80,0.12)',
          borderWidth: 3, fill: true, tension: 0.4, pointRadius: 0
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: green.ink, font: { family: 'Inter', size: 11 } } },
          y: { grid: { color: green.line }, ticks: { color: green.ink, font: { family: 'Inter', size: 11 } } }
        }
      }
    });
  }

  const impactBreakdownEl = document.getElementById('impactBreakdownChart');
  if (impactBreakdownEl && window.Chart) {
    new Chart(impactBreakdownEl, {
      type: 'doughnut',
      data: {
        labels: ['Trees Planted','Water Saved','Plastic Recycled','Transit & Cycling'],
        datasets: [{ data: [32, 28, 18, 22], backgroundColor: [green.primary, green.secondary, green.accent, '#B7DFB9'], borderWidth: 0 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '68%',
        plugins: { legend: { position: 'bottom', labels: { color: green.ink, font: { family: 'Inter', size: 11 }, padding: 16, usePointStyle: true } } }
      }
    });
  }

  const surveyChartEl = document.getElementById('surveyChart');
  if (surveyChartEl && window.Chart) {
    new Chart(surveyChartEl, {
      type: 'bar',
      data: {
        labels: ['Formed a lasting habit', 'Reduced weekly waste', 'Reported feeling more informed', 'Would recommend to a friend'],
        datasets: [{ data: [78, 64, 89, 92], backgroundColor: green.secondary, borderRadius: 8, maxBarThickness: 36 }]
      },
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { max: 100, grid: { color: green.line }, ticks: { color: green.ink, callback: v => v + '%', font: { family: 'Inter', size: 11 } } },
          y: { grid: { display: false }, ticks: { color: green.ink, font: { family: 'Inter', size: 12 } } }
        }
      }
    });
  }

  const growthChartEl = document.getElementById('growthChart');
  if (growthChartEl && window.Chart) {
    new Chart(growthChartEl, {
      type: 'bar',
      data: {
        labels: ['2024 Q1','2024 Q2','2024 Q3','2024 Q4','2025 Q1','2025 Q2'],
        datasets: [{ label: 'Active Users', data: [12000, 25000, 41000, 63000, 92000, 128000], backgroundColor: green.primary, borderRadius: 8 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: green.ink, font: { family: 'Inter', size: 11 } } },
          y: { grid: { color: green.line }, ticks: { color: green.ink, font: { family: 'Inter', size: 11 } } }
        }
      }
    });
  }

  // Today's Challenges widget (#challengeList on the homepage) is now
  // rendered and driven by assets/js/challenges.js — real Firestore data,
  // real XP/streak/Earth Health updates. See that file.
});
