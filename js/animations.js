/* ============================================================
   animations.js — GSAP animations, preloader, scroll triggers
   Depends on: gsap.min.js, ScrollTrigger.min.js
   ============================================================ */

gsap.registerPlugin(ScrollTrigger);

/* ── SCROLL PROGRESS BAR ─────────────────────────────────────
   Updates the thin top bar based on page scroll position
   ─────────────────────────────────────────────────────────── */
(function initProgress() {
  const bar = document.getElementById('prog');
  window.addEventListener('scroll', () => {
    const maxScroll = document.body.scrollHeight - innerHeight;
    const pct       = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
    bar.style.width = pct + '%';
  });
})();

/* ── SECTION ENTRANCE TRANSITIONS ───────────────────────────
   IntersectionObserver adds .visible to .sec-transition
   when the section enters the viewport — CSS handles the
   fade + slide-up animation via transition property.
   ─────────────────────────────────────────────────────────── */
(function initSectionTransitions() {
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add('visible');
      });
    },
    { threshold: 0.08 }
  );
  document.querySelectorAll('.sec-transition').forEach((s) => obs.observe(s));
})();

/* ── CHAR ANIMATION HELPER ───────────────────────────────────
   Animates .char spans inside an element from translateY(110%)
   to their natural position, staggered.
   ─────────────────────────────────────────────────────────── */
function animChars(el, delay = 0) {
  if (!el) return;
  gsap.to(el.querySelectorAll('.char'), {
    y: 0, opacity: 1, rotation: 0,
    duration: 0.9, stagger: 0.03,
    ease: 'power4.out', delay
  });
}

/* ── PRELOADER ───────────────────────────────────────────────
   Runs on DOMContentLoaded. Animates logo + letters + count
   then wipes loader away with clip-path.
   cb() is called once loader exits.
   ─────────────────────────────────────────────────────────── */
function runLoader(cb) {
  const spans = document.querySelectorAll('#ldw span');
  const bar   = document.getElementById('lbar');
  const num   = document.getElementById('lnum');
  const logo  = document.getElementById('ldlogo');

  // Logo pops in
  gsap.to(logo,  { opacity: 1, scale: 1, duration: 0.9, ease: 'back.out(1.4)', delay: 0.1 });
  // Letters stagger up
  gsap.to(spans, { y: 0, opacity: 1, duration: 0.6, stagger: 0.04, ease: 'power3.out', delay: 0.4 });

  let n = 0;
  const iv = setInterval(() => {
    n += Math.floor(Math.random() * 5) + 2;
    if (n >= 100) { n = 100; clearInterval(iv); }
    bar.style.width  = n + '%';
    num.textContent  = n + '%';

    if (n === 100) {
      setTimeout(() => {
        // Letters exit upward
        gsap.to(spans, { y: '-110%', opacity: 0, duration: 0.45, stagger: 0.03, ease: 'power3.in' });
        gsap.to([logo, '#lbar', '#lnum'], { opacity: 0, duration: 0.3, delay: 0.3 });
        // Wipe loader upward
        gsap.to('#loader', {
          clipPath: 'inset(0 0 100% 0)',
          duration: 1,
          delay: 0.65,
          ease: 'power4.inOut',
          onComplete: () => {
            document.getElementById('loader').style.display = 'none';
            if (typeof cb === 'function') cb();
          }
        });
      }, 350);
    }
  }, 35);
}

/* ── HERO ENTRANCE ───────────────────────────────────────────
   Runs after preloader exits. Staggers in nav, tag, title
   chars, subtitle chars, bottom row, and side stamps.
   ─────────────────────────────────────────────────────────── */
function heroIn() {
  const tl = gsap.timeline();
  tl.to('#nav',     { opacity: 1, y: 0,      duration: 0.8, ease: 'power3.out' }, 0)
    .to('#htag',    { opacity: 1, y: 0,      duration: 0.6, ease: 'power3.out' }, 0.3)
    .add(() => animChars(document.getElementById('htitle'), 0), 0.5)
    .add(() => animChars(document.getElementById('hsubt'),  0.6), 0.5)
    .to('#hbot',    { opacity: 1, y: 0,      duration: 0.8, ease: 'power3.out' }, 1.3)
    .to('#hstamps', { opacity: 1,            duration: 0.7, ease: 'power3.out' }, 1.5);
}

/* ── HERO PARALLAX SCRUB ─────────────────────────────────────
   Scrubs hero content position/opacity directly to scroll.
   ─────────────────────────────────────────────────────────── */
function heroParallax() {
  ScrollTrigger.create({
    trigger: '#hero',
    start: 'top top',
    end: 'bottom top',
    scrub: 1.2,
    onUpdate: (self) => {
      const p = self.progress;
      gsap.set('#htitle',  { y: p * 80,  opacity: 1 - p * 0.9  });
      gsap.set('#hsubt',   { y: p * 50,  opacity: 1 - p * 1.1  });
      gsap.set('#htag',    { y: p * 40,  opacity: 1 - p         });
      gsap.set('#hbot',    { y: p * 60,  opacity: 1 - p * 1.3  });
    }
  });
}

/* ── SCROLL TRIGGERS ─────────────────────────────────────────
   Initialises all section-level animations triggered by scroll.
   ─────────────────────────────────────────────────────────── */
function initScrollTriggers() {

  // ── Horizontal rules wipe in from left ─────────────────
  document.querySelectorAll('.s-rule').forEach((el) => {
    ScrollTrigger.create({
      trigger: el, start: 'top 90%', once: true,
      onEnter: () => gsap.to(el, { scaleX: 1, duration: 1.2, ease: 'power4.inOut' })
    });
  });

  // ── Eyebrow labels slide in from left ──────────────────
  document.querySelectorAll('.s-eye').forEach((el) => {
    ScrollTrigger.create({
      trigger: el, start: 'top 88%', once: true,
      onEnter: () => gsap.to(el, { opacity: 1, x: 0, duration: 0.65, ease: 'power3.out' })
    });
  });

  // ── Section heading char reveals ───────────────────────
  ['sh1', 'sh2', 'sh3', 'sh4'].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    ScrollTrigger.create({
      trigger: el, start: 'top 83%', once: true,
      onEnter: () => animChars(el)
    });
  });

  // ── Section subtitle char reveals ──────────────────────
  ['ss1', 'ss2', 'ss3', 'ss4'].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    ScrollTrigger.create({
      trigger: el, start: 'top 83%', once: true,
      onEnter: () => animChars(el, 0.15)
    });
  });

  // ── About paragraphs fade up one by one ────────────────
  document.querySelectorAll('.ab-p').forEach((p, i) => {
    ScrollTrigger.create({
      trigger: p, start: 'top 86%', once: true,
      onEnter: () => gsap.to(p, { opacity: 1, y: 0, duration: 0.7, delay: i * 0.1, ease: 'power3.out' })
    });
  });

  // ── Stat counter grid ───────────────────────────────────
  const numsEl = document.getElementById('nums');
  if (numsEl) {
    ScrollTrigger.create({
      trigger: numsEl, start: 'top 82%', once: true,
      onEnter: () => gsap.to(numsEl, { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out' })
    });
  }

  // ── Profile card slides in from right ──────────────────
  const pcardEl = document.getElementById('pcard');
  if (pcardEl) {
    ScrollTrigger.create({
      trigger: pcardEl, start: 'top 82%', once: true,
      onEnter: () => gsap.to(pcardEl, { opacity: 1, x: 0, duration: 0.85, ease: 'power3.out' })
    });
  }

  // ── Skill cards — stagger zoom-in ──────────────────────
  const skGrid = document.getElementById('skgrid');
  if (skGrid) {
    ScrollTrigger.create({
      trigger: skGrid, start: 'top 78%', once: true,
      onEnter: () => {
        gsap.to(skGrid, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' });
        gsap.fromTo('.sk-card',
          { opacity: 0, y: 28, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: { amount: 0.5 }, ease: 'power3.out', delay: 0.1 }
        );
      }
    });
  }

  // ── Project rows slide in from left ────────────────────
  document.querySelectorAll('.prow').forEach((row, i) => {
    ScrollTrigger.create({
      trigger: row, start: 'top 88%', once: true,
      onEnter: () => gsap.to(row, { opacity: 1, x: 0, duration: 0.6, delay: i * 0.04, ease: 'power3.out' })
    });
  });

  // ── Education cards zoom in ─────────────────────────────
  ['#ec1', '#ec2', '#ec3'].forEach((id, i) => {
    const el = document.querySelector(id);
    if (!el) return;
    ScrollTrigger.create({
      trigger: el, start: 'top 82%', once: true,
      onEnter: () => gsap.to(el, { opacity: 1, scale: 1, y: 0, duration: 0.8, delay: i * 0.1, ease: 'power3.out' })
    });
  });

  // ── Contact section ─────────────────────────────────────
  const cthEl = document.getElementById('cth');
  if (cthEl) {
    ScrollTrigger.create({
      trigger: cthEl, start: 'top 83%', once: true,
      onEnter: () => animChars(cthEl)
    });
  }
  const ctsEl = document.getElementById('cts');
  if (ctsEl) {
    ScrollTrigger.create({
      trigger: ctsEl, start: 'top 83%', once: true,
      onEnter: () => animChars(ctsEl, 0.2)
    });
  }
  ['#clbl', '#csub', '#cbtns', '.hire-form', '#clnks'].forEach((id, i) => {
    const el = document.querySelector(id);
    if (!el) return;
    ScrollTrigger.create({
      trigger: '#contact', start: 'top 75%', once: true,
      onEnter: () => gsap.to(el, { opacity: 1, y: 0, duration: 0.65, delay: i * 0.1, ease: 'power3.out' })
    });
  });
}

/* ── TITLE MAGNETIC HOVER ────────────────────────────────────
   Headings follow the cursor slightly; spring back on leave.
   ─────────────────────────────────────────────────────────── */
function initTitleMagnets() {
  document.querySelectorAll('.s-head, .h-title').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      gsap.to(el, {
        x: (e.clientX - r.left - r.width  / 2) * 0.025,
        y: (e.clientY - r.top  - r.height / 2) * 0.025,
        duration: 0.5, ease: 'power2.out'
      });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' });
    });
  });
}

/* ── PRE-HIDE HERO ELEMENTS ──────────────────────────────────
   Must run synchronously before any animation starts so
   elements start in their hidden state.
   ─────────────────────────────────────────────────────────── */
function preHide() {
  const nav     = document.getElementById('nav');
  const htag    = document.getElementById('htag');
  const hbot    = document.getElementById('hbot');
  const hstamps = document.getElementById('hstamps');

  if (nav)     { nav.style.cssText     = 'opacity:0;transform:translateY(-16px)'; }
  if (htag)    { htag.style.cssText    = 'opacity:0;transform:translateY(16px)';  }
  if (hbot)    { hbot.style.cssText    = 'opacity:0;transform:translateY(20px)';  }
  if (hstamps) { hstamps.style.opacity = '0'; }

  document.querySelectorAll('.char').forEach((c) => {
    c.style.cssText = 'display:inline-block;transform:translateY(110%);opacity:0;';
  });
}

/* ── PROJECT FILTER ──────────────────────────────────────────
   Exposed globally so inline onclick handlers can call it.
   ─────────────────────────────────────────────────────────── */
function filterP(type, btn) {
  document.querySelectorAll('.pf').forEach((b) => b.classList.remove('on'));
  btn.classList.add('on');

  document.querySelectorAll('.prow').forEach((row, i) => {
    const show = type === 'all' || row.dataset.cat === type;
    if (show) {
      row.style.display = 'grid';
      gsap.fromTo(row,
        { opacity: 0, x: -16 },
        { opacity: 1, x: 0, duration: 0.45, delay: i * 0.04, ease: 'power3.out' }
      );
    } else {
      gsap.to(row, {
        opacity: 0, x: -10, duration: 0.25, ease: 'power2.in',
        onComplete: () => { row.style.display = 'none'; }
      });
    }
  });
}

/* ── BOOT ────────────────────────────────────────────────────
   Entry point — runs when DOM is ready.
   ─────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  preHide();
  runLoader(() => {
    heroIn();
    heroParallax();
    initScrollTriggers();
    initTitleMagnets();
  });
});
