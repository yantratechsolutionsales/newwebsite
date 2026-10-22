const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const requests = new Map();

const clean = (value, max = 2000) => String(value || '')
  .replace(/[\r\n]+/g, ' ')
  .replace(/[<>]/g, '')
  .trim()
  .slice(0, max);

const escapeHtml = (value) => clean(value)
  .replace(/&/g, '&amp;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const fieldLabels = {
  'rfq-category': 'Product / Category',
  'rfq-name': 'Full Name',
  'rfq-phone': 'Phone / Mobile',
  'rfq-email': 'Email Address',
  'rfq-details': 'Requirement Details',
  'c-name': 'Full Name',
  'c-company': 'Company / Organisation',
  'c-email': 'Email Address',
  'c-phone': 'Phone / Mobile',
  'c-product': 'Product / Category',
  'c-message': 'Message',
  name: 'Full Name',
  company: 'Company / Organisation',
  email: 'Email Address',
  phone: 'Phone / Mobile',
  product: 'Product / Category',
  message: 'Message',
};

function enquiryRows(fields) {
  return Object.entries(fields)
    .filter(([key, value]) => key !== 'website' && clean(value))
    .map(([key, value]) => {
      const label = fieldLabels[key] || key.replace(/[-_]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
      const safeValue = escapeHtml(value);
      const renderedValue = /email/i.test(key)
        ? `<a href="mailto:${safeValue}" style="color:#b7791f;text-decoration:none;">${safeValue}</a>`
        : safeValue;
      return `<tr><td style="padding:13px 16px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:13px;font-weight:700;width:42%;">${escapeHtml(label)}</td><td style="padding:13px 16px;border-bottom:1px solid #e5e7eb;color:#1f2937;font-size:14px;">${renderedValue}</td></tr>`;
    })
    .join('');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const ip = req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
  const now = Date.now();
  const recent = (requests.get(ip) || []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) return res.status(429).json({ ok: false, error: 'Please try again later.' });
  requests.set(ip, [...recent, now]);

  const fields = req.body?.fields || {};
  const name = clean(fields.name || fields['rfq-name'] || fields['c-name'], 120);
  const email = clean(fields.email || fields['rfq-email'] || fields['c-email'], 160);
  const phone = clean(fields.phone || fields['rfq-phone'] || fields['c-phone'], 40);

  if (!name || !email || !phone || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ ok: false, error: 'Please provide a name, valid email address, and phone number.' });
  }
  if (fields.website) return res.status(200).json({ ok: true });
  if (!process.env.RESEND_API_KEY || !process.env.ENQUIRY_FROM_EMAIL) {
    return res.status(503).json({ ok: false, error: 'Email service is not configured.' });
  }

  const enquiryType = clean(req.body?.type || 'General enquiry');
  const source = clean(req.body?.sourcePage, 300);
  const pageUrl = clean(req.body?.websiteUrl, 500);
  const submittedAt = new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  }).format(new Date());

  const html = `<!doctype html>
<html><body style="margin:0;background:#f3f4f6;font-family:Arial,sans-serif;color:#1f2937;">
  <div style="max-width:640px;margin:28px auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;">
    <div style="background:#191a18;padding:28px 32px;">
      <div style="color:#f3b93e;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Yantratech Solutions</div>
      <h1 style="margin:8px 0 0;color:#ffffff;font-size:24px;line-height:1.3;">New ${escapeHtml(enquiryType)}</h1>
    </div>
    <div style="padding:28px 32px;">
      <p style="margin:0 0 20px;font-size:15px;line-height:1.6;">A visitor has submitted an enquiry through your website.</p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e5e7eb;border-radius:8px;border-collapse:separate;border-spacing:0;overflow:hidden;">${enquiryRows(fields)}</table>
      <div style="margin-top:24px;padding:16px;background:#fffbeb;border-left:4px solid #f3b93e;border-radius:4px;font-size:13px;line-height:1.7;">
        <strong>Submitted:</strong> ${escapeHtml(submittedAt)} IST<br>
        <strong>Source page:</strong> ${escapeHtml(source || 'Website')}<br>
        <strong>Website:</strong> <a href="${escapeHtml(pageUrl)}" style="color:#b7791f;">${escapeHtml(pageUrl)}</a>
      </div>
      <p style="margin:24px 0 0;font-size:13px;color:#6b7280;">Reply to this email to contact ${escapeHtml(name)} directly.</p>
    </div>
  </div>
</body></html>`;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.ENQUIRY_FROM_EMAIL,
      to: ['sales@yantratechsolutions.co.in'],
      reply_to: email,
      subject: `New ${enquiryType} – ${name}`,
      html,
    }),
  });

  if (!response.ok) return res.status(502).json({ ok: false, error: 'Delivery failed.' });
  return res.status(200).json({ ok: true });
}
