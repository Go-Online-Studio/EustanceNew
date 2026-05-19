/* ================================================
   EUSTANCE TECHNOLOGY — Main Script
   ================================================ */

document.addEventListener("DOMContentLoaded", () => {
  // ---------- CONFIG ----------
  const CONFIG = {
    whatsappNumber: '919998094801',
    callNumber: '+919998094801'
  };

  // ---------- Navbar Scroll ----------
  const navbar = document.querySelector(".navbar");
  const handleScroll = () => {
    if (window.scrollY > 80) {
      navbar.classList.add("scrolled");
      if (navbar.classList.contains("homePage")) {
        document.querySelector(".homePage .navbar-logo img").src =
          "./images/EustanceLogoWhite.svg";
      }
    } else {
      navbar.classList.remove("scrolled");
      if (navbar.classList.contains("homePage")) {
        document.querySelector(".homePage .navbar-logo img").src =
          "./images/EustanceLogo.svg";
      }
    }
  };
  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  // ---------- Mobile Menu ----------
  const toggle = document.querySelector(".navbar-toggle");
  const menu = document.querySelector(".navbar-menu");

  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      toggle.classList.toggle("active");
      menu.classList.toggle("open");
      document.body.style.overflow = menu.classList.contains("open")
        ? "hidden"
        : "";
    });

    // Close menu on link click (but not dropdown parent)
    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", (e) => {
        // If this is a dropdown toggle on mobile, handle toggle instead
        if (
          link.closest(".nav-item") &&
          link === link.closest(".nav-item").querySelector(":scope > a") &&
          window.innerWidth <= 768
        ) {
          e.preventDefault();
          const dropdown = link
            .closest(".nav-item")
            .querySelector(".nav-dropdown");
          if (dropdown) {
            dropdown.classList.toggle("mobile-open");
          }
          return;
        }
        toggle.classList.remove("active");
        menu.classList.remove("open");
        document.body.style.overflow = "";
      });
    });
  }

  // ---------- Hero Particles (Bubbles) ----------
  // const particleContainer = document.querySelector(".hero-particles");
  // if (particleContainer) {
  //   for (let i = 0; i < 20; i++) {
  //     const bubble = document.createElement("div");
  //     bubble.classList.add("bubble");
  //     const size = Math.random() * 12 + 4;
  //     bubble.style.width = size + "px";
  //     bubble.style.height = size + "px";
  //     bubble.style.left = Math.random() * 100 + "%";
  //     bubble.style.animationDuration = Math.random() * 10 + 8 + "s";
  //     bubble.style.animationDelay = Math.random() * 8 + "s";
  //     particleContainer.appendChild(bubble);
  //   }
  // }

  // ---------- AOS Init ----------
  if (typeof AOS !== "undefined") {
    AOS.init({
      duration: 800,
      offset: 80,
      once: true,
      easing: "ease-out-cubic",
      disable: window.innerWidth < 768 ? "mobile" : false,
    });
  }

  // ---------- Smooth scroll for anchor links ----------
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const offset = navbar ? navbar.offsetHeight + 20 : 80;
        const top =
          target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: "smooth" });
      }
    });
  });

  // ---------- Copyright Year ----------
  const yearEl = document.querySelector(".footer-year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- Dynamic FABs & Back to Top ----------
  const injectFABs = () => {
    if (document.getElementById("dynamic-fabs")) return;

    // Inject CSS
    const styleEl = document.createElement("style");
    styleEl.id = "dynamic-fabs-css";
    styleEl.textContent = `
      #dynamic-fabs {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 99999;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 14px;
        pointer-events: none;
      }
      .fab-btn-item {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
        transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        cursor: pointer;
        pointer-events: auto;
        border: none;
        text-decoration: none;
        outline: none;
      }
      .fab-container {
        background: transparent;
        animation: fab-whatsapp-pulse 2s infinite;
      }
      .fab-container a {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        border-radius: 50%;
      }
      .fab-container svg {
        width: 100%;
        height: 100%;
        display: block;
      }
      .Call-fab-container {
        background: #1b6fc4;
        color: #ffffff;
        border: 1px solid rgba(119, 212, 255, 0.15);
      }
      .Call-fab-container a {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        color: inherit;
      }
      .Call-fab-container svg {
        width: 24px;
        height: 24px;
        fill: currentColor;
        transition: transform 0.3s ease;
      }
      .back-to-top-btn {
        background: rgba(1, 5, 49, 0.85);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        color: #77d4ff;
        border: 1px solid rgba(119, 212, 255, 0.2);
        opacity: 0;
        transform: translateY(20px) scale(0.8);
        pointer-events: none;
        visibility: hidden;
      }
      .back-to-top-btn.visible {
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
        visibility: visible;
      }
      .back-to-top-btn svg {
        width: 20px;
        height: 20px;
        fill: none;
        stroke: currentColor;
        stroke-width: 2.5;
        stroke-linecap: round;
        stroke-linejoin: round;
        transition: transform 0.3s ease;
      }
      /* Hover states */
      .fab-btn-item:hover {
        transform: scale(1.1) translateY(-3px);
      }
      .fab-container:hover {
        box-shadow: 0 8px 24px rgba(37, 211, 102, 0.5);
      }
      .Call-fab-container:hover {
        box-shadow: 0 8px 24px rgba(27, 111, 196, 0.5);
      }
      .Call-fab-container:hover svg {
        transform: rotate(15deg) scale(1.05);
      }
      .back-to-top-btn:hover {
        background: #1b6fc4;
        color: #ffffff;
        box-shadow: 0 8px 24px rgba(119, 212, 255, 0.4);
      }
      .back-to-top-btn:hover svg {
        transform: translateY(-2px);
      }
      /* Animations */
      @keyframes fab-whatsapp-pulse {
        0% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.5); }
        70% { box-shadow: 0 0 0 15px rgba(37, 211, 102, 0); }
        100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0); }
      }
      /* Responsive */
      @media (max-width: 768px) {
        #dynamic-fabs {
          bottom: 16px;
          right: 16px;
          gap: 10px;
        }
        .fab-btn-item {
          width: 48px;
          height: 48px;
        }
        .Call-fab-container svg {
          width: 20px;
          height: 20px;
        }
        .back-to-top-btn svg {
          width: 18px;
          height: 18px;
        }
      }
    `;
    document.head.appendChild(styleEl);

    // Create container
    const fabContainer = document.createElement("div");
    fabContainer.id = "dynamic-fabs";

    const getWhatsAppUrl = () => {
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
      return isMobile 
        ? `https://api.whatsapp.com/send?phone=${CONFIG.whatsappNumber}`
        : `https://web.whatsapp.com/send?phone=${CONFIG.whatsappNumber}`;
    };

    fabContainer.innerHTML = `
      <!-- Back to Top FAB -->
      <button class="back-to-top-btn fab-btn-item" id="back-to-top" aria-label="Back to Top">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="m4.5 15.75l7.5-7.5l7.5 7.5"/>
        </svg>
      </button>
      <!-- Call FAB -->
      <div class="Call-fab-container fab-btn-item">
        <a href="tel:${CONFIG.callNumber}" rel="noopener" aria-label="Call us">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M6.62 10.79c1.44 2.83 3.76 5.15 6.59 6.59l2.2-2.2c.28-.28.67-.36 1.02-.25c1.12.37 2.32.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57c.11.35.03.74-.25 1.02z"></path>
          </svg>
        </a>
      </div>
      <!-- WhatsApp FAB -->
      <div class="fab-container fab-btn-item">
        <a href="${getWhatsAppUrl()}" rel="noopener" target="_blank" aria-label="Chat on WhatsApp">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 258">
            <defs>
              <linearGradient id="SVGBRLHCcSy" x1="50%" x2="50%" y1="100%" y2="0%">
                <stop offset="0%" stop-color="#1faf38"/><stop offset="100%" stop-color="#60d669"/>
              </linearGradient>
              <linearGradient id="SVGHW6lecxh" x1="50%" x2="50%" y1="100%" y2="0%">
                <stop offset="0%" stop-color="#f9f9f9"/><stop offset="100%" stop-color="#fff"/>
              </linearGradient>
            </defs>
            <path fill="url(#SVGBRLHCcSy)" d="M5.463 127.456c-.006 21.677 5.658 42.843 16.428 61.499L4.433 252.697l65.232-17.104a123 123 0 0 0 58.8 14.97h.054c67.815 0 123.018-55.183 123.047-123.01c.013-32.867-12.775-63.773-36.009-87.025c-23.23-23.25-54.125-36.061-87.043-36.076c-67.823 0-123.022 55.18-123.05 123.004"/>
            <path fill="url(#SVGHW6lecxh)" d="M1.07 127.416c-.007 22.457 5.86 44.38 17.014 63.704L0 257.147l67.571-17.717c18.618 10.151 39.58 15.503 60.91 15.511h.055c70.248 0 127.434-57.168 127.464-127.423c.012-34.048-13.236-66.065-37.3-90.15C194.633 13.286 162.633.014 128.536 0C58.276 0 1.099 57.16 1.071 127.416m40.24 60.376l-2.523-4.005c-10.606-16.864-16.204-36.352-16.196-56.363C22.614 69.029 70.138 21.52 128.576 21.52c28.3.012 54.896 11.044 74.9 31.06c20.003 20.018 31.01 46.628 31.003 74.93c-.026 58.395-47.551 105.91-105.943 105.91h-.042c-19.013-.01-37.66-5.116-53.922-14.765l-3.87-2.295l-40.098 10.513z"/>
            <path fill="#fff" d="M96.678 74.148c-2.386-5.303-4.897-5.41-7.166-5.503c-1.858-.08-3.982-.074-6.104-.074c-2.124 0-5.575.799-8.492 3.984c-2.92 3.188-11.148 10.892-11.148 26.561s11.413 30.813 13.004 32.94c1.593 2.123 22.033 35.307 54.405 48.073c26.904 10.609 32.379 8.499 38.218 7.967c5.84-.53 18.844-7.702 21.497-15.139c2.655-7.436 2.655-13.81 1.859-15.142c-.796-1.327-2.92-2.124-6.105-3.716s-18.844-9.298-21.763-10.361c-2.92-1.062-5.043-1.592-7.167 1.597c-2.124 3.184-8.223 10.356-10.082 12.48c-1.857 2.129-3.716 2.394-6.9.801c-3.187-1.598-13.444-4.957-25.613-15.806c-9.468-8.442-15.86-18.867-17.718-22.056c-1.858-3.184-.199-4.91 1.398-6.497c1.431-1.427 3.186-3.719 4.78-5.578c1.588-1.86 2.118-3.187 3.18-5.311c1.063-2.126.531-3.986-.264-5.579c-.798-1.593-6.987-17.343-9.819-23.64" stroke-width="6.5" stroke="#fff"/>
          </svg>
        </a>
      </div>
    `;

    document.body.appendChild(fabContainer);

    // Scroll Logic for Back to Top
    const backToTopBtn = document.getElementById("back-to-top");
    if (backToTopBtn) {
      const handleScrollVisibility = () => {
        if (window.scrollY > 300) {
          backToTopBtn.classList.add("visible");
        } else {
          backToTopBtn.classList.remove("visible");
        }
      };
      window.addEventListener("scroll", handleScrollVisibility, { passive: true });
      handleScrollVisibility();

      backToTopBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    // Debounced window resize handler to dynamically update WhatsApp URL
    const debounce = (func, wait) => {
      let timeout;
      return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    };

    const updateWhatsAppLink = () => {
      const waLink = document.querySelector("#dynamic-fabs .fab-container a");
      if (waLink) {
        waLink.setAttribute("href", getWhatsAppUrl());
      }
    };

    window.addEventListener("resize", debounce(updateWhatsAppLink, 250), { passive: true });
  };

  injectFABs();
});
