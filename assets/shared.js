/* ============================================================
   YANTRATECH SOLUTIONS — shared.js
   Common interactive behaviour shared across all pages.
   ============================================================ */

/* ---- Mobile Menu ---- */
function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  if (menu) menu.classList.toggle('hidden');
}

/* ---- RFQ Modal ---- */
function openRFQModal(preselectCategory) {
  const modal = document.getElementById('rfq-modal');
  if (!modal) return;
  modal.classList.remove('hidden');
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
  if (modal) modal.classList.add('hidden');
}

async function handleRFQSubmit(e) {
  e.preventDefault();
  await submitEnquiry(e.currentTarget, { type: 'Quote request' });
}

async function submitEnquiry(form, extra = {}) {
  const button = form.querySelector('[type="submit"]');
  const initialText = button ? button.textContent : '';
  const fields = {};
  form.querySelectorAll('input, select, textarea').forEach((field) => {
    if (field.type !== 'submit' && field.type !== 'button' && field.type !== 'hidden') fields[field.name || field.id] = field.value.trim();
  });
  if (fields.website) return; // Honeypot.
  if (button) { button.disabled = true; button.textContent = 'Sending...'; }
  try {
    const response = await fetch('/api/enquiry', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields, sourcePage: location.pathname, websiteUrl: location.href, ...extra })
    });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error('Unable to send enquiry');
    form.reset();
    let status = form.querySelector('[data-form-status]');
    if (!status) { status = document.createElement('p'); status.dataset.formStatus = ''; status.className = 'text-sm font-semibold text-green-700'; form.append(status); }
    status.textContent = 'Thank you. Your enquiry has been submitted successfully. Our sales team will contact you shortly.'; status.hidden = false;
    if (form.id === 'rfq-form') setTimeout(closeRFQModal, 1600);
  } catch (_) {
    let status = form.querySelector('[data-form-status]');
    if (!status) { status = document.createElement('p'); status.dataset.formStatus = ''; status.className = 'text-sm font-semibold text-red-700'; form.append(status); }
    status.textContent = 'We could not send your enquiry. Please call or email our sales team.'; status.hidden = false;
  } finally {
    if (button) { button.disabled = false; button.textContent = initialText; }
  }
}

function sendViaEmailDirect() {
  const cat     = document.getElementById('rfq-category').value;
  const name    = document.getElementById('rfq-name').value    || 'Customer';
  const phone   = document.getElementById('rfq-phone').value   || 'Not provided';
  const details = document.getElementById('rfq-details').value || 'N/A';

  const subject = `Quote Inquiry: ${cat} - ${name}`;
  const body    = `Category: ${cat}\nName: ${name}\nPhone: ${phone}\nDetails: ${details}`;
  window.location.href = `mailto:sales@yantratechsolutions.co.in?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/* ---- Close modal on outside click ---- */
document.addEventListener('click', (e) => {
  const modal = document.getElementById('rfq-modal');
  if (modal && e.target === modal) closeRFQModal();
});

/* ---- Scroll Reveal (IntersectionObserver) ---- */
document.addEventListener('DOMContentLoaded', () => {
  const main = document.querySelector('main');
  if (main && !document.querySelector('.skip-link')) {
    const skip = document.createElement('a');
    skip.className = 'skip-link'; skip.href = `#${main.id || 'main-content'}`; skip.textContent = 'Skip to content';
    if (!main.id) main.id = 'main-content'; document.body.prepend(skip);
  }
  document.querySelectorAll('form[id="rfq-form"] button[type="submit"]').forEach((button) => {
    if (/WhatsApp/i.test(button.textContent)) button.textContent = 'Submit Enquiry';
  });
  // The enquiry forms use the secure API endpoint. Remove legacy mail-client
  // fallbacks so a visitor is never sent to Outlook instead of submitting.
  document.querySelectorAll('[onclick="sendViaEmailDirect()"], [onclick="handleContactEmail()"]').forEach((button) => button.remove());
  document.querySelectorAll('footer').forEach((footer) => {
    if (!footer.querySelector('[data-legal-links]')) {
      const legal = document.createElement('p'); legal.dataset.legalLinks = ''; legal.className = 'mt-3 text-xs text-slate-500';
      legal.innerHTML = '<a class="hover:text-secondaryGold" href="privacy-policy.html">Privacy Policy</a> <span aria-hidden="true">|</span> <a class="hover:text-secondaryGold" href="terms.html">Terms and Conditions</a>';
      footer.append(legal);
    }
  });
  const observer = new IntersectionObserver(
    (entries) => entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('revealed');
    }),
    { threshold: 0.08 }
  );
  document.querySelectorAll('.reveal-item').forEach(el => observer.observe(el));

  const counters = document.querySelectorAll('[data-counter]');
  const counterObserver = new IntersectionObserver((entries, obs) => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = Number(el.dataset.counter || 0);
    const suffix = el.dataset.suffix || '';
    const start = performance.now();
    const duration = 1100;
    const tick = now => {
      const progress = Math.min((now - start) / duration, 1);
      el.textContent = `${Math.floor(target * (1 - Math.pow(1 - progress, 3)))}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    obs.unobserve(el);
  }), { threshold: .45 });
  counters.forEach(el => counterObserver.observe(el));

  /* ---- Active Nav Link ---- */
  const path = window.location.pathname.replace(/\/$/, '') || '/index.html';
  document.querySelectorAll('nav a[data-page]').forEach(link => {
    const page = link.getAttribute('data-page');
    if (path.endsWith(page)) link.classList.add('nav-active');
  });
});
