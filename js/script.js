/* ================================================
   EUSTANCE TECHNOLOGY — Main Script
   ================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // ---------- Navbar Scroll ----------
  const navbar = document.querySelector('.navbar');
  const handleScroll = () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // ---------- Mobile Menu ----------
  const toggle = document.querySelector('.navbar-toggle');
  const menu = document.querySelector('.navbar-menu');

  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      menu.classList.toggle('open');
      document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
    });

    // Close menu on link click (but not dropdown parent)
    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', (e) => {
        // If this is a dropdown toggle on mobile, handle toggle instead
        if (link.closest('.nav-item') && link === link.closest('.nav-item').querySelector(':scope > a') && window.innerWidth <= 768) {
          e.preventDefault();
          const dropdown = link.closest('.nav-item').querySelector('.nav-dropdown');
          if (dropdown) {
            dropdown.classList.toggle('mobile-open');
          }
          return;
        }
        toggle.classList.remove('active');
        menu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // ---------- Hero Particles (Bubbles) ----------
  const particleContainer = document.querySelector('.hero-particles');
  if (particleContainer) {
    for (let i = 0; i < 20; i++) {
      const bubble = document.createElement('div');
      bubble.classList.add('bubble');
      const size = Math.random() * 12 + 4;
      bubble.style.width = size + 'px';
      bubble.style.height = size + 'px';
      bubble.style.left = Math.random() * 100 + '%';
      bubble.style.animationDuration = Math.random() * 10 + 8 + 's';
      bubble.style.animationDelay = Math.random() * 8 + 's';
      particleContainer.appendChild(bubble);
    }
  }

  // ---------- AOS Init ----------
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      offset: 80,
      once: true,
      easing: 'ease-out-cubic',
      disable: window.innerWidth < 768 ? 'mobile' : false
    });
  }

  // ---------- Smooth scroll for anchor links ----------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const offset = navbar ? navbar.offsetHeight + 20 : 80;
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ---------- Copyright Year ----------
  const yearEl = document.querySelector('.footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
