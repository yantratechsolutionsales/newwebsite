import { put, list } from '@vercel/blob';
import { createHmac, timingSafeEqual } from 'node:crypto';

const cookieName = 'yt_admin';
const blobPath = 'yantratech/site-content.json';
const key = () => process.env.ADMIN_SESSION_SECRET || '';
function signature(value) { return createHmac('sha256', key()).update(value).digest('base64url'); }
function valid(req) {
  const raw = (req.headers.cookie || '').split(';').map((x) => x.trim()).find((x) => x.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
  if (!raw || !key()) return false;
  const [expires, sig] = raw.split('.');
  if (!expires || Number(expires) < Date.now() || !sig) return false;
  const expected = Buffer.from(signature(expires)); const actual = Buffer.from(sig);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
async function readContent() {
  const blobs = await list({ prefix: blobPath });
  if (!blobs.blobs.length) return {};
  const response = await fetch(blobs.blobs[0].url, { cache: 'no-store' });
  return response.ok ? response.json() : {};
}
function cleanPageContent(input) {
  const safe = {};
  for (const [page, values] of Object.entries(input)) {
    if (!/^(index|products|why-us|brands|industries|contact|privacy-policy|terms)\.html$/.test(page) || !values || typeof values !== 'object' || Array.isArray(values)) continue;
    safe[page] = {};
    for (const [field, value] of Object.entries(values)) {
      if (/^text-\d+$/.test(field) && typeof value === 'string') {
        safe[page][field] = value.slice(0, 12000)
          .replace(/<\s*(script|iframe|object|embed|style|svg|math)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
          .replace(/\s+(?:on[a-z]+|style)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
          .replace(/\bhref\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/gi, (_all, _attr, doubleValue, singleValue, unquoted) => {
            const url = doubleValue || singleValue || unquoted || '';
            return /^(https?:\/\/|mailto:|tel:|\/[^/])/i.test(url) ? `href="${url.replace(/"/g, '&quot;')}"` : 'href="#"';
          })
          .replace(/<(?!\/?(?:a|b|strong|i|em|u|br|span|sub|sup|small)\b)[^>]*>/gi, '');
      } else if (/^image-\d+$/.test(field) && value && typeof value === 'object') {
        const src = String(value.src || '');
        if (/^https:\/\//i.test(src) || (src.startsWith('/') && !src.startsWith('//'))) safe[page][field] = { src:src.slice(0, 1600), alt:String(value.alt || '').slice(0, 400) };
      }
    }
  }
  return safe;
}
export default async function handler(req, res) {
  if (req.method === 'POST' && req.body?.action === 'login') {
    if (!process.env.ADMIN_PASSWORD || !key() || !process.env.BLOB_READ_WRITE_TOKEN) return res.status(503).json({ ok:false, error:'Admin is not configured. Follow the deployment setup in README.' });
    const a = Buffer.from(String(req.body.password || '')); const b = Buffer.from(process.env.ADMIN_PASSWORD);
    if (a.length !== b.length || !timingSafeEqual(a,b)) return res.status(401).json({ ok:false, error:'Incorrect password.' });
    const expires = String(Date.now() + 8 * 60 * 60 * 1000);
    res.setHeader('Set-Cookie', `${cookieName}=${expires}.${signature(expires)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`);
    return res.status(200).json({ok:true});
  }
  if (req.method === 'POST' && req.body?.action === 'logout') { res.setHeader('Set-Cookie', `${cookieName}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`); return res.status(200).json({ok:true}); }
  if (req.method === 'GET' && !req.query?.session) return res.status(200).json(await readContent());
  if (!valid(req)) return res.status(401).json({ok:false,error:'Please sign in.'});
  if (req.method === 'GET') return res.status(200).json(await readContent());
  if (req.method === 'PUT') {
    const content = req.body?.content;
    if (!content || typeof content !== 'object' || JSON.stringify(content).length > 2_000_000) return res.status(400).json({ok:false,error:'Invalid or oversized content.'});
    await put(blobPath, JSON.stringify(cleanPageContent(content)), { access:'public', addRandomSuffix:false, allowOverwrite:true, cacheControlMaxAge:60, contentType:'application/json', token:process.env.BLOB_READ_WRITE_TOKEN });
    return res.status(200).json({ok:true});
  }
  return res.status(405).json({ok:false,error:'Method not allowed'});
}
