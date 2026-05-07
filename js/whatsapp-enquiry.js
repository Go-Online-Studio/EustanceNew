/* ============================================================
   EUSTANCE TECHNOLOGY — WhatsApp Enquiry System
   File: assets/js/whatsapp-enquiry.js
   Version: 1.0.0
   Description: Complete WhatsApp enquiry functionality system
                for Eustance Technology website.
   ============================================================

   Features:
   ─ Responsive WhatsApp URL generation (mobile / desktop)
   ─ Product quick enquiry button handling (.WhatsappEnquiry)
   ─ Product name auto-detection from DOM siblings
   ─ Contact form validation + WhatsApp submission
   ─ Real-time field validation (email, phone, required)
   ─ Animated toast notification system (dark-theme)
   ─ Debounced resize handler for device re-detection
   ─ Loading / disabled state on submit button
   ─ Anti-spam debounce on enquiry buttons
   ─ Zero dependencies — pure Vanilla ES6+
   ============================================================ */

(function () {
  'use strict';

  /* ────────────────────────────────────────────────────────────
     0. CONFIGURATION
  ──────────────────────────────────────────────────────────── */
  const CONFIG = {
    /** WhatsApp business phone number — country code + number, no spaces or + */
    PHONE: '916354710794', 

    /** Company display name used in messages */
    COMPANY: 'Eustance Technology',

    /** Mobile breakpoint (px) — below this, use api.whatsapp.com */
    MOBILE_BREAKPOINT: 768,

    /** Debounce delay for resize handler (ms) */
    RESIZE_DEBOUNCE: 300,

    /** Debounce delay preventing rapid button clicks (ms) */
    CLICK_DEBOUNCE: 1500,

    /** Toast auto-hide delay (ms) */
    TOAST_DURATION: 3800,

    /** Toast slide-out animation duration (ms) — must match CSS */
    TOAST_EXIT_DURATION: 400,

    /** Submit button loading state duration before redirect (ms) */
    REDIRECT_DELAY: 900,
  };

  /* ────────────────────────────────────────────────────────────
     1. UTILITY FUNCTIONS
  ──────────────────────────────────────────────────────────── */

  /**
   * Detects mobile device using user-agent string with
   * a screen-width fallback.
   * @returns {boolean}
   */
  function isMobileDevice() {
    const ua = navigator.userAgent || '';
    const mobileUARegex =
      /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    if (mobileUARegex.test(ua)) return true;
    return window.innerWidth <= CONFIG.MOBILE_BREAKPOINT;
  }

  /**
   * Builds the correct WhatsApp deep-link based on the current
   * device type (mobile API vs Web WhatsApp).
   * @param {string} message — The raw, un-encoded message text.
   * @returns {string} Full WhatsApp URL ready to open.
   */
  function getWhatsAppURL(message) {
    const encodedMsg = encodeURIComponent(message.trim());
    const base = isMobileDevice()
      ? 'https://api.whatsapp.com/send'
      : 'https://web.whatsapp.com/send';
    return `${base}?phone=${CONFIG.PHONE}&text=${encodedMsg}`;
  }

  /**
   * Generic debounce factory.
   * @param {Function} fn    — Function to debounce.
   * @param {number}   delay — Delay in milliseconds.
   * @returns {Function} Debounced function.
   */
  function debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  /**
   * Safely trims and returns an element's text content.
   * @param {Element|null} el
   * @returns {string}
   */
  function getText(el) {
    return el ? el.textContent.trim() : '';
  }

  /* ────────────────────────────────────────────────────────────
     2. TOAST NOTIFICATION SYSTEM
  ──────────────────────────────────────────────────────────── */

  /** Internal toast container reference (created once). */
  let _toastContainer = null;

  /**
   * Returns (or creates) the singleton toast container element.
   * @returns {HTMLElement}
   */
  function getToastContainer() {
    if (_toastContainer) return _toastContainer;

    _toastContainer = document.createElement('div');
    _toastContainer.id = 'et-toast-container';
    _toastContainer.setAttribute('aria-live', 'polite');
    _toastContainer.setAttribute('aria-atomic', 'false');
    document.body.appendChild(_toastContainer);
    return _toastContainer;
  }

  /**
   * Displays an animated toast notification.
   * @param {string} message — The message to display.
   * @param {'success'|'error'|'info'|'warning'} [type='info']
   */
  function showToast(message, type = 'info') {
    const container = getToastContainer();

    const toast = document.createElement('div');
    toast.className = `et-toast et-toast--${type}`;
    toast.setAttribute('role', 'status');

    /* Icon map */
    const icons = {
      success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                  stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>`,
      error: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>`,
      warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                  stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86
                           a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>`,
      info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
               stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
               <circle cx="12" cy="12" r="10"/>
               <line x1="12" y1="8" x2="12" y2="12"/>
               <line x1="12" y1="16" x2="12.01" y2="16"/>
             </svg>`,
    };

    toast.innerHTML = `
      <span class="et-toast__icon">${icons[type] || icons.info}</span>
      <span class="et-toast__message">${message}</span>
      <button class="et-toast__close" aria-label="Close notification" tabindex="0">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
             stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    `;

    container.appendChild(toast);

    /* Force reflow before adding active class to trigger CSS animation */
    void toast.offsetWidth;
    toast.classList.add('et-toast--active');

    /** Dismiss helper */
    function dismiss() {
      toast.classList.remove('et-toast--active');
      toast.classList.add('et-toast--exit');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, CONFIG.TOAST_EXIT_DURATION);
    }

    /* Close button */
    toast.querySelector('.et-toast__close').addEventListener('click', dismiss);

    /* Auto-hide */
    const autoHide = setTimeout(dismiss, CONFIG.TOAST_DURATION);

    /* Cancel auto-hide on manual dismiss */
    toast.querySelector('.et-toast__close').addEventListener('click', () => {
      clearTimeout(autoHide);
    });
  }

  /* ────────────────────────────────────────────────────────────
     3. PRODUCT MESSAGE GENERATOR
  ──────────────────────────────────────────────────────────── */

  /**
   * Builds a professional product enquiry WhatsApp message.
   * @param {string} productName — Name of the product.
   * @param {string} category    — Product category / tag.
   * @returns {string}
   */
  function buildProductMessage(productName, category) {
    const product = productName || 'Your Product';
    const cat     = category    || 'Marine Technology';

    return (
      `Hello ${CONFIG.COMPANY},\n\n` +
      `I am interested in the following product:\n\n` +
      `Product Name: ${product}\n` +
      `Category: ${cat}\n\n` +
      `Please share:\n` +
      `- Technical specifications\n` +
      `- Pricing\n` +
      `- Availability\n` +
      `- Customization options\n\n` +
      `Thank you.`
    );
  }

  /* ────────────────────────────────────────────────────────────
     4. PRODUCT ENQUIRY BUTTON LOGIC
  ──────────────────────────────────────────────────────────── */

  /**
   * Extracts the product name from the button's surrounding DOM.
   *
   * Priority order:
   *  1. data-product attribute on the button itself
   *  2. data-product-name attribute on the button itself
   *  3. Nearest <h3> inside the sibling .product-info (or parent)
   *  4. Alt text of the nearest product image
   *  5. 'Marine Product' fallback
   *
   * @param {Element} btn — The clicked .WhatsappEnquiry element.
   * @returns {string}
   */
  function detectProductName(btn) {
    /* Direct data attributes */
    if (btn.dataset.product)     return btn.dataset.product.trim();
    if (btn.dataset.productName) return btn.dataset.productName.trim();

    /* Walk up the DOM to find .product-info or .product-showcase */
    const productInfo =
      btn.closest('.product-info') ||
      btn.closest('.product-showcase');

    if (productInfo) {
      const h3 = productInfo.querySelector('h3');
      if (h3 && getText(h3)) return getText(h3);
    }

    /* Fallback: nearest image alt text */
    const img =
      btn.closest('.product-showcase')?.querySelector('.product-visual img') ||
      document.querySelector('.product-visual img');
    if (img && img.alt) return img.alt.trim();

    return 'Marine Product';
  }

  /**
   * Extracts the product category from the button's surrounding DOM.
   *
   * Priority:
   *  1. data-category attribute on the button
   *  2. Nearest .product-tag span text
   *  3. Page title-derived category
   *  4. 'Marine Technology' fallback
   *
   * @param {Element} btn
   * @returns {string}
   */
  function detectProductCategory(btn) {
    if (btn.dataset.category) return btn.dataset.category.trim();

    const productInfo =
      btn.closest('.product-info') ||
      btn.closest('.product-showcase');

    if (productInfo) {
      const tag = productInfo.querySelector('.product-tag');
      if (tag && getText(tag)) return getText(tag);
    }

    return 'Marine Technology';
  }

  /**
   * Tracks which buttons are in their click-debounce cooldown.
   * @type {WeakSet<Element>}
   */
  const _clickedButtons = new WeakSet();

  /**
   * Handles a .WhatsappEnquiry button click.
   * @param {Event} e
   */
  function handleEnquiryClick(e) {
    e.preventDefault();
    e.stopPropagation();

    const btn = e.currentTarget;

    /* Anti-spam: ignore if already in cooldown */
    if (_clickedButtons.has(btn)) return;
    _clickedButtons.add(btn);
    setTimeout(() => _clickedButtons.delete(btn), CONFIG.CLICK_DEBOUNCE);

    const productName = detectProductName(btn);
    const category    = detectProductCategory(btn);
    const message     = buildProductMessage(productName, category);
    const url         = getWhatsAppURL(message);

    showToast('Redirecting to WhatsApp…', 'success');

    /* Small delay so toast renders before tab switches */
    setTimeout(() => {
      window.open(url, '_blank', 'noopener,noreferrer');
    }, 400);
  }

  /**
   * Attaches click handlers to all existing .WhatsappEnquiry elements
   * and sets keyboard accessibility.
   */
  function initEnquiryButtons() {
    const buttons = document.querySelectorAll('.WhatsappEnquiry');
    if (!buttons.length) return;

    buttons.forEach((btn) => {
      /* Keyboard accessibility */
      if (!btn.hasAttribute('tabindex')) btn.setAttribute('tabindex', '0');
      if (btn.tagName === 'A' && !btn.getAttribute('role')) {
        btn.setAttribute('role', 'button');
      }

      /* Remove any stale empty href (prevents hash jump on anchor tags) */
      if (btn.tagName === 'A') {
        btn.setAttribute('href', '#');
      }

      btn.addEventListener('click', handleEnquiryClick);

      /* Spacebar / Enter for <a> acting as button */
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          btn.click();
        }
      });
    });
  }

  /* ────────────────────────────────────────────────────────────
     5. CONTACT FORM MESSAGE GENERATOR
  ──────────────────────────────────────────────────────────── */

  /**
   * Builds the professional contact form WhatsApp message.
   * @param {{ name: string, phone: string, email: string,
   *           interest: string, message: string }} data
   * @returns {string}
   */
  function buildContactMessage(data) {
    const interest = data.interest || 'General Enquiry';
    const phone    = data.phone    || 'Not provided';

    return (
      `Hello ${CONFIG.COMPANY},\n\n` +
      `New Website Enquiry\n\n` +
      `Name: ${data.name}\n` +
      `Phone: ${phone}\n` +
      `Email: ${data.email}\n` +
      `Interested In: ${interest}\n\n` +
      `Message:\n${data.message}\n\n` +
      `Sent from ${CONFIG.COMPANY} Website`
    );
  }

  /* ────────────────────────────────────────────────────────────
     6. VALIDATION SYSTEM
  ──────────────────────────────────────────────────────────── */

  /**
   * Email validation regex (RFC-compliant simplified).
   */
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  /**
   * Phone validation — allows +, spaces, dashes, brackets, 7-15 digits.
   */
  const PHONE_REGEX = /^[+\d][\d\s\-().]{6,19}$/;

  /**
   * Sets a field to its valid visual state.
   * @param {HTMLElement} field
   */
  function setValid(field) {
    field.classList.remove('et-input-error');
    field.classList.add('et-input-valid');
    const errEl = field.parentElement?.querySelector('.et-error-message');
    if (errEl) errEl.textContent = '';
  }

  /**
   * Sets a field to its error visual state.
   * @param {HTMLElement} field
   * @param {string}      message — Error text to display.
   */
  function setError(field, message) {
    field.classList.remove('et-input-valid');
    field.classList.add('et-input-error');
    let errEl = field.parentElement?.querySelector('.et-error-message');
    if (!errEl) {
      errEl = document.createElement('span');
      errEl.className = 'et-error-message';
      errEl.setAttribute('role', 'alert');
      field.insertAdjacentElement('afterend', errEl);
    }
    errEl.textContent = message;
  }

  /**
   * Resets a field to neutral state.
   * @param {HTMLElement} field
   */
  function clearState(field) {
    field.classList.remove('et-input-error', 'et-input-valid');
    const errEl = field.parentElement?.querySelector('.et-error-message');
    if (errEl) errEl.textContent = '';
  }

  /**
   * Validates a single form field and applies visual feedback.
   * @param {HTMLElement} field
   * @param {boolean}     [realtime=false] — Skip empty-required check on blur.
   * @returns {boolean} true if valid.
   */
  function validateField(field, realtime = false) {
    const id    = field.id;
    const value = field.value.trim();
    const type  = field.type;
    const tag   = field.tagName.toLowerCase();

    /* Select element — validate only on submit */
    if (tag === 'select') {
      if (!value) {
        /* Optional field — do not flag during real-time */
        clearState(field);
        return true;
      }
      setValid(field);
      return true;
    }

    /* Required empty check */
    if (field.required && !value) {
      if (realtime) {
        /* Don't show error while user is typing in an untouched field */
        clearState(field);
        return false;
      }
      setError(field, 'This field is required.');
      return false;
    }

    /* Skip further checks if empty and not required */
    if (!value) {
      clearState(field);
      return true;
    }

    /* Email */
    if (type === 'email' || id === 'email') {
      if (!EMAIL_REGEX.test(value)) {
        setError(field, 'Please enter a valid email address.');
        return false;
      }
    }

    /* Phone */
    if (type === 'tel' || id === 'phone') {
      if (!PHONE_REGEX.test(value)) {
        setError(field, 'Please enter a valid phone number.');
        return false;
      }
    }

    /* Minimum length for message */
    if (id === 'message' && value.length < 10) {
      setError(field, 'Message must be at least 10 characters.');
      return false;
    }

    setValid(field);
    return true;
  }

  /**
   * Attaches real-time (on-input + on-blur) validation to form fields.
   * @param {HTMLFormElement} form
   */
  function attachRealtimeValidation(form) {
    const fields = form.querySelectorAll('input, textarea, select');
    fields.forEach((field) => {
      field.addEventListener('input', () => validateField(field, true));
      field.addEventListener('blur',  () => validateField(field, false));
      field.addEventListener('change', () => validateField(field, false));
    });
  }

  /**
   * Validates all fields in the form and returns true if all pass.
   * @param {HTMLFormElement} form
   * @returns {boolean}
   */
  function validateForm(form) {
    const fields  = form.querySelectorAll('input, textarea, select');
    let   isValid = true;
    let   firstError = null;

    fields.forEach((field) => {
      const ok = validateField(field, false);
      if (!ok) {
        isValid = false;
        if (!firstError) firstError = field;
      }
    });

    if (firstError) {
      firstError.focus();
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return isValid;
  }

  /* ────────────────────────────────────────────────────────────
     7. CONTACT FORM HANDLER
  ──────────────────────────────────────────────────────────── */

  /**
   * Sets submit button to loading state.
   * @param {HTMLButtonElement} btn
   */
  function setButtonLoading(btn) {
    btn._originalHTML = btn.innerHTML;
    btn._originalDisabled = btn.disabled;
    btn.disabled = true;
    btn.classList.add('et-btn-loading');
    btn.setAttribute('aria-busy', 'true');
    btn.innerHTML = `
      <span class="et-btn-spinner" aria-hidden="true"></span>
      Connecting to WhatsApp…
    `;
  }

  /**
   * Restores submit button from loading state.
   * @param {HTMLButtonElement} btn
   */
  function resetButton(btn) {
    btn.disabled = btn._originalDisabled || false;
    btn.classList.remove('et-btn-loading');
    btn.removeAttribute('aria-busy');
    if (btn._originalHTML) btn.innerHTML = btn._originalHTML;
  }

  /**
   * Reads and assembles contact form data.
   * @param {HTMLFormElement} form
   * @returns {{ name: string, phone: string, email: string,
   *             interest: string, message: string }}
   */
  function getFormData(form) {
    return {
      name:     (form.querySelector('#name')?.value     || '').trim(),
      phone:    (form.querySelector('#phone')?.value    || '').trim(),
      email:    (form.querySelector('#email')?.value    || '').trim(),
      interest: (form.querySelector('#interest')?.value || '').trim(),
      message:  (form.querySelector('#message')?.value  || '').trim(),
    };
  }

  /**
   * Handles contact form submission — validates, generates message,
   * opens WhatsApp, shows toast.
   * @param {Event} e
   */
  function handleContactSubmit(e) {
    e.preventDefault();

    const form    = e.currentTarget;
    const submitBtn = form.querySelector('[type="submit"]');

    /* Validate all fields */
    if (!validateForm(form)) {
      showToast('Please fill in all required fields correctly.', 'error');
      return;
    }

    const data    = getFormData(form);
    const message = buildContactMessage(data);
    const url     = getWhatsAppURL(message);

    /* Loading state */
    if (submitBtn) setButtonLoading(submitBtn);
    showToast('Redirecting to WhatsApp…', 'success');

    form.reset();
    form.querySelectorAll('input, textarea, select').forEach(clearState);

    setTimeout(() => {
      window.open(url, '_blank', 'noopener,noreferrer');
      if (submitBtn) resetButton(submitBtn);
    }, CONFIG.REDIRECT_DELAY);
  }

  /**
   * Finds and initializes the contact form (#contactForm).
   */
  function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    attachRealtimeValidation(form);
    form.addEventListener('submit', handleContactSubmit);
  }

  /* ────────────────────────────────────────────────────────────
     8. RESPONSIVE RESIZE HANDLER
  ──────────────────────────────────────────────────────────── */

  /**
   * Re-checks device type on window resize (debounced).
   * No UI update needed — isMobileDevice() is called fresh on every
   * button/form interaction, so this is kept as a hook for extensions.
   */
  const handleResize = debounce(function () {
    /* Hook: fires after resize settles. Extend as needed. */
  }, CONFIG.RESIZE_DEBOUNCE);

  function initResizeListener() {
    window.addEventListener('resize', handleResize, { passive: true });
  }

  /* ────────────────────────────────────────────────────────────
     9. MASTER INITIALIZATION
  ──────────────────────────────────────────────────────────── */

  /**
   * Initializes the entire WhatsApp enquiry system on DOMContentLoaded.
   */
  function init() {
    initEnquiryButtons();
    initContactForm();
    initResizeListener();
  }

  /* Run on DOMContentLoaded (or immediately if DOM already ready) */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ────────────────────────────────────────────────────────────
     10. PUBLIC API (optional — for external calls if needed)
  ──────────────────────────────────────────────────────────── */
  window.EustanceWA = {
    /** Show a custom toast. */
    showToast,

    /** Get the correct WhatsApp URL for a message. */
    getWhatsAppURL,

    /** Check if running on mobile. */
    isMobileDevice,

    /** Re-init buttons (use if dynamic content is added). */
    refreshButtons: initEnquiryButtons,
  };

})(); /* End IIFE */
