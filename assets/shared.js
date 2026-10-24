/* ============================================================
   YANTRATECH SOLUTIONS — shared.js
   Premium 3D Micro-interactions, Transitions & Core Functionality
   ============================================================ */

/* ---- Mobile Menu ---- */
function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  if (!menu) return;
  if (menu.classList.contains('hidden')) {
    menu.classList.remove('hidden');
    menu.style.opacity = '0';
    menu.style.transform = 'translateY(-10px)';
    requestAnimationFrame(() => {
      menu.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      menu.style.opacity = '1';
      menu.style.transform = 'translateY(0)';
    });
  } else {
    menu.style.opacity = '0';
    menu.style.transform = 'translateY(-10px)';
    setTimeout(() => menu.classList.add('hidden'), 300);
  }
}

/* ---- RFQ Modal ---- */
function openRFQModal(preselectCategory) {
  const modal = document.getElementById('rfq-modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  const modalBox = modal.querySelector('div');
  if (modalBox) {
    modalBox.style.opacity = '0';
    modalBox.style.transform = 'scale(0.92) translateY(20px)';
    requestAnimationFrame(() => {
      modalBox.style.transition = 'all 0.35s cubic-bezier(0.16,1,0.3,1)';
      modalBox.style.opacity = '1';
      modalBox.style.transform = 'scale(1) translateY(0)';
    });
  }
  if (preselectCategory) {
    const select = document.getElementById('rfq-category');
    if (select) {
      for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].value.toLowerCase().includes(preselectCategory.toLowerCase())) {
          select.selectedIndex = i;
          break;
        }
      }
    }
  }
}

function closeRFQModal() {
  const modal = document.getElementById('rfq-modal');
  if (!modal) return;
  const modalBox = modal.querySelector('div');
  if (modalBox) {
    modalBox.style.opacity = '0';
    modalBox.style.transform = 'scale(0.92) translateY(20px)';
    setTimeout(() => modal.classList.add('hidden'), 300);
  } else {
    modal.classList.add('hidden');
  }
}

async function handleRFQSubmit(e) {
  e.preventDefault();
  await submitEnquiry(e.currentTarget, { type: 'Quote request' });
}

async function handleContactSubmit(e) {
  e.preventDefault();
  await submitEnquiry(e.currentTarget, { type: 'Contact form message' });
}

async function submitEnquiry(form, extra = {}) {
  const button = form.querySelector('[type="submit"]');
  const initialText = button ? button.innerHTML : '';
  const fields = {};
  form.querySelectorAll('input, select, textarea').forEach((field) => {
    if (field.type !== 'submit' && field.type !== 'button' && field.type !== 'hidden') {
      fields[field.name || field.id] = field.value.trim();
    }
  });

  if (fields.website) return;

  if (button) {
    button.disabled = true;
    button.innerHTML = `
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-primaryDark inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span>Submitting Enquiry...</span>
    `;
  }

  let status = form.querySelector('[data-form-status]');
  if (!status) {
    status = document.createElement('div');
    status.dataset.formStatus = '';
    status.className = 'p-4 rounded-xl mt-4 font-outfit font-semibold text-sm transition-all duration-300';
    form.append(status);
  }

  try {
    const response = await fetch('/api/enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields,
        sourcePage: location.pathname,
        websiteUrl: location.href,
        ...extra
      })
    });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error('Unable to send enquiry');

    form.reset();
    if (typeof gtag === 'function') {
      gtag('event', 'generate_lead', {
        event_category: 'Engagement',
        event_label: extra.type || 'Enquiry form',
        value: 1
      });
    }

    status.className = 'p-4 rounded-xl mt-4 font-outfit font-semibold text-sm bg-green-50 border border-green-200 text-green-800 flex items-center gap-2';
    status.innerHTML = `<span>✓</span><span>Thank you. Your enquiry has been submitted successfully. Our engineering sales team will contact you shortly.</span>`;
    status.hidden = false;

    if (form.id === 'rfq-form') {
      setTimeout(closeRFQModal, 2200);
    }
  } catch (_) {
    status.className = 'p-4 rounded-xl mt-4 font-outfit font-semibold text-sm bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-2';
    status.innerHTML = `<span>⚠️</span><span>We could not reach the server right now. Please reach us directly at <a href="tel:+918655813866" class="underline font-bold">+91 8655813866</a> or <a href="mailto:sales@yantratechsolutions.co.in" class="underline font-bold">sales@yantratechsolutions.co.in</a>.</span>`;
    status.hidden = false;
  } finally {
    if (button) {
      button.disabled = false;
      button.innerHTML = initialText;
    }
  }
}

function sendViaEmailDirect() {
  const cat     = document.getElementById('rfq-category')?.value || 'Industrial Instrumentation';
  const name    = document.getElementById('rfq-name')?.value    || 'Customer';
  const phone   = document.getElementById('rfq-phone')?.value   || 'Not provided';
  const details = document.getElementById('rfq-details')?.value || 'N/A';

  const subject = `Quote Inquiry: ${cat} - ${name}`;
  const body    = `Category: ${cat}\nName: ${name}\nPhone: ${phone}\nDetails: ${details}`;
  window.location.href = `mailto:sales@yantratechsolutions.co.in?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function handleContactEmail() {
  const name    = document.getElementById('c-name')?.value    || 'Customer';
  const company = document.getElementById('c-company')?.value || 'N/A';
  const phone   = document.getElementById('c-phone')?.value   || 'Not provided';
  const email   = document.getElementById('c-email')?.value   || 'Not provided';
  const cat     = document.getElementById('c-category')?.value|| 'General';
  const subject = document.getElementById('c-subject')?.value || `Product Enquiry - ${name}`;
  const message = document.getElementById('c-message')?.value || '';

  const body = `Name: ${name}\nCompany: ${company}\nPhone: ${phone}\nEmail: ${email}\nCategory: ${cat}\n\nMessage:\n${message}`;
  window.location.href = `mailto:sales@yantratechsolutions.co.in?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

document.addEventListener('click', (e) => {
  const modal = document.getElementById('rfq-modal');
  if (modal && e.target === modal) closeRFQModal();
});

/* ---- 3D Interactive Tilt Engine (Applied to cards and interactive items) ---- */
function init3DTilt() {
  const cards = document.querySelectorAll('[data-tilt]');
  cards.forEach(card => {
    let bounds;
    function rotateToMouse(e) {
      if (!bounds) bounds = card.getBoundingClientRect();
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const leftX = mouseX - bounds.x;
      const topY = mouseY - bounds.y;
      const maxAngle = Number(card.dataset.tiltMax || 10);
      const rotateX = ((topY - bounds.height / 2) / (bounds.height / 2)) * -maxAngle;
      const rotateY = ((leftX - bounds.width / 2) / (bounds.width / 2)) * maxAngle;
      
      card.style.transform = `
        perspective(1000px)
        scale3d(1.03, 1.03, 1.03)
        rotateX(${rotateX.toFixed(2)}deg)
        rotateY(${rotateY.toFixed(2)}deg)
      `;
    }

    card.addEventListener('mouseenter', () => {
      bounds = card.getBoundingClientRect();
      document.addEventListener('mousemove', rotateToMouse);
    });

    card.addEventListener('mouseleave', () => {
      document.removeEventListener('mousemove', rotateToMouse);
      card.style.transform = '';
      bounds = null;
    });
  });
}

/* ---- Parallax Mouse Hero Effect ---- */
function initHeroParallax() {
  const hero = document.querySelector('section.relative.perspective-1500, .page-hero');
  const floatingCards = document.querySelectorAll('.hero-float-layer, .cad-hero-card');
  if (!hero || floatingCards.length === 0) return;

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    floatingCards.forEach((layer) => {
      layer.style.transform = `perspective(1000px) translate3d(${x * 20}px, ${y * 20}px, 0) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
    });
  });
}

/* ---- Header Scroll Shadow & Page Transitions ---- */
function initScrollHeader() {
  const header = document.querySelector('header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
}

/* ---- Robust Scroll Reveal (Immediately reveals elements in viewport) ---- */
function initScrollReveal() {
  const items = document.querySelectorAll('.reveal-item');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

    items.forEach(el => observer.observe(el));
  } else {
    items.forEach(el => el.classList.add('revealed'));
  }
}

/* ---- Counter Animation ---- */
function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = Number(el.dataset.counter || 0);
        const suffix = el.dataset.suffix || '';
        const start = performance.now();
        const duration = 1200;
        const tick = now => {
          const progress = Math.min((now - start) / duration, 1);
          el.textContent = `${Math.floor(target * (1 - Math.pow(1 - progress, 3)))}${suffix}`;
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        obs.unobserve(el);
      });
    }, { threshold: 0.2 });

    counters.forEach(el => counterObserver.observe(el));
  }
}

/* ---- Setup Active Nav Indicator ---- */
function initActiveNav() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav a, #mobile-menu a').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href === currentPath || (currentPath === 'index.html' && (href === '/' || href === 'index.html'))) {
      link.classList.add('nav-active');
    }
  });
}

/* ---- DOM Ready ---- */
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('page-loaded');

  const main = document.querySelector('main');
  if (main && !document.querySelector('.skip-link')) {
    const skip = document.createElement('a');
    skip.className = 'skip-link'; skip.href = `#${main.id || 'main-content'}`; skip.textContent = 'Skip to content';
    if (!main.id) main.id = 'main-content'; document.body.prepend(skip);
  }
  
  document.querySelectorAll('footer').forEach((footer) => {
    if (!footer.querySelector('[data-legal-links]')) {
      const legal = document.createElement('p'); legal.dataset.legalLinks = ''; legal.className = 'mt-3 text-xs text-slate-500';
      legal.innerHTML = '<a class="hover:text-secondaryGold transition" href="privacy-policy.html">Privacy Policy</a> <span aria-hidden="true">|</span> <a class="hover:text-secondaryGold transition" href="terms.html">Terms and Conditions</a>';
      footer.append(legal);
    }
  });

  initScrollReveal();
  initCounters();
  initActiveNav();
  init3DTilt();
  initHeroParallax();
  initScrollHeader();

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="tel:"], a[href^="mailto:"]');
    if (!link || typeof gtag !== 'function') return;
    const href = link.getAttribute('href');
    if (href.startsWith('tel:')) {
      gtag('event', 'click_to_call', {
        event_category: 'Contact',
        event_label: 'Phone Link Click'
      });
    } else if (href.startsWith('mailto:')) {
      gtag('event', 'click_to_email', {
        event_category: 'Contact',
        event_label: 'Email Link Click'
      });
    }
  });
});
