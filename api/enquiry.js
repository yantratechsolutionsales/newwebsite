const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const requests = new Map();
const clean = (value, max = 2000) => String(value || '').replace(/[\r\n]+/g, ' ').replace(/[<>]/g, '').trim().slice(0, max);

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
  if (!name || !email || !phone || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ ok: false, error: 'Please provide a name, valid email address, and phone number.' });
  if (fields.website) return res.status(200).json({ ok: true });
  if (!process.env.RESEND_API_KEY || !process.env.ENQUIRY_FROM_EMAIL) return res.status(503).json({ ok: false, error: 'Email service is not configured.' });
  const rows = Object.entries(fields).filter(([key]) => key !== 'website').map(([key, value]) => `<tr><th align="left" style="padding:6px 12px 6px 0">${clean(key, 80)}</th><td>${clean(value)}</td></tr>`).join('');
  const source = clean(req.body?.sourcePage, 300);
  const pageUrl = clean(req.body?.websiteUrl, 500);
  const html = `<h2>New website enquiry</h2><table>${rows}</table><p><strong>Enquiry type:</strong> ${clean(req.body?.type || 'General enquiry')}</p><p><strong>Submitted:</strong> ${new Date().toISOString()}<br><strong>Source page:</strong> ${source}<br><strong>Website URL:</strong> ${pageUrl}</p>`;
  const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: process.env.ENQUIRY_FROM_EMAIL, to: ['sales@yantratechsolutions.co.in'], reply_to: email, subject: `New Website Enquiry - ${name}`, html }) });
  if (!response.ok) return res.status(502).json({ ok: false, error: 'Delivery failed.' });
  return res.status(200).json({ ok: true });
}
