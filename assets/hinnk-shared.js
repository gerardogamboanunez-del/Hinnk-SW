/* =============================================================
   HINNK — Shared JavaScript
   Shared behaviors across all pages. Loaded as the last script
   before </body>. Does NOT replace per-page scripts; enhances.
   ============================================================= */

(function () {
  'use strict';

  // ── 1. NAV SCROLL EFFECT ─────────────────────────────────────
  // Adds .scrolled class to nav when page is scrolled > 20px.
  // CSS in hinnk-shared.css uses this class to solidify the bg.
  const nav = document.getElementById('nav');
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run on load in case page is mid-scroll (e.g. after refresh)
  }

  // ── 2. ACTIVE NAV LINK ───────────────────────────────────────
  // Marks the nav link matching the current page as active.
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links-glass a').forEach(link => {
    const href = link.getAttribute('href') || '';
    const linkPage = href.split('/').pop().split('#')[0];
    if (linkPage && linkPage === currentPage) {
      link.setAttribute('aria-current', 'page');
      link.classList.add('active');
    }
  });

  // ── 3. HAMBURGER MENU ────────────────────────────────────────
  // Handles open/close of mobile menu. Safe to run even if the
  // page already has its own hamburger handler (idempotent check).
  const hamburger = document.getElementById('nav-hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  if (hamburger && mobileMenu && !hamburger.dataset.sharedInit) {
    hamburger.dataset.sharedInit = '1';

    const openMenu = () => {
      mobileMenu.classList.add('is-open');
      hamburger.classList.add('is-open');
      hamburger.setAttribute('aria-expanded', 'true');
      mobileMenu.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };

    const closeMenu = () => {
      mobileMenu.classList.remove('is-open');
      hamburger.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.contains('is-open');
      isOpen ? closeMenu() : openMenu();
    });

    // Close on outside click
    document.addEventListener('click', e => {
      if (mobileMenu.classList.contains('is-open') &&
          !mobileMenu.contains(e.target) &&
          !hamburger.contains(e.target)) {
        closeMenu();
      }
    });

    // Close on Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
        closeMenu();
        hamburger.focus();
      }
    });

    // Close mobile menu when a link inside it is clicked
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  }

  // ── 4. REVEAL ON SCROLL ──────────────────────────────────────
  // Adds .is-visible to elements with .reveal-on-scroll when
  // they enter the viewport. Falls back gracefully if no IO.
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.reveal-on-scroll').forEach(el => {
      io.observe(el);
    });
  } else {
    // Fallback: show all immediately
    document.querySelectorAll('.reveal-on-scroll').forEach(el => {
      el.classList.add('is-visible');
    });
  }

  // ── 5. LUCIDE ICONS ──────────────────────────────────────────
  // Re-initializes Lucide icons after any dynamic DOM insertion.
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    // Small delay to let any inline scripts run first
    setTimeout(() => { window.lucide.createIcons(); }, 0);
  }

  // ── 6. SMOOTH ANCHOR SCROLLING ───────────────────────────────
  // Handles clicks on hash links with offset for the fixed nav.
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const hash = this.getAttribute('href');
      if (hash === '#') return;
      const target = document.querySelector(hash);
      if (!target) return;
      e.preventDefault();
      const navH = nav ? nav.offsetHeight : 80;
      const top = target.getBoundingClientRect().top + window.scrollY - navH - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ── 7. CAROUSEL NAVIGATION ───────────────────────────────────
  // Generic scroll-carousel handler for any .carousel-track element.
  document.querySelectorAll('[data-carousel]').forEach(carousel => {
    const track = carousel.querySelector('.carousel-track');
    const prev  = carousel.querySelector('[data-carousel-prev]');
    const next  = carousel.querySelector('[data-carousel-next]');
    if (!track || !prev || !next) return;

    const scroll = (dir) => {
      const amount = track.offsetWidth * 0.8;
      track.scrollBy({ left: dir * amount, behavior: 'smooth' });
    };

    prev.addEventListener('click', () => scroll(-1));
    next.addEventListener('click', () => scroll(1));

    const updateButtons = () => {
      prev.disabled = track.scrollLeft <= 0;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    };

    track.addEventListener('scroll', updateButtons, { passive: true });
    updateButtons();
  });

})();
