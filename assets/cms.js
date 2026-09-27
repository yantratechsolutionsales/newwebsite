(() => {
  const editable = 'header a, header button, main h1, main h2, main h3, main h4, main p, main li, main a, main button, main summary, footer h3, footer p, footer a';
  const page = () => { const name = location.pathname.split('/').pop(); return !name ? 'index.html' : name.endsWith('.html') ? name : `${name}.html`; };
  const nodes = () => [...document.querySelectorAll(editable)].filter((el) => !el.closest('#rfq-modal'));
  const images = () => [...document.querySelectorAll('img')];
  async function load() {
    try {
      const response = await fetch('/api/admin', { cache:'no-store' });
      if (!response.ok) return;
      const content = await response.json();
      const saved = content[page()] || {};
      nodes().forEach((el, i) => { if (Object.hasOwn(saved, `text-${i}`)) el.innerHTML = saved[`text-${i}`]; });
      images().forEach((img, i) => { const item = saved[`image-${i}`]; if (item) { img.src = item.src; img.alt = item.alt; } });
    } catch (_) { /* Public site remains usable if CMS storage is unavailable. */ }
  }
  window.ytCmsCollect = () => Object.fromEntries([...nodes().map((el, i) => [`text-${i}`, el.innerHTML]), ...images().map((img, i) => [`image-${i}`, {src:img.src,alt:img.alt}])]);
  window.ytCmsEnableEdit = () => {
    nodes().forEach((el) => { el.contentEditable = 'true'; el.classList.add('cms-editing'); });
    images().forEach((img) => { img.classList.add('cms-editing'); img.title = 'Click to change image URL and alt text'; img.onclick = (event) => { event.preventDefault(); event.stopPropagation(); const src = prompt('Image URL', img.src); if (src) img.src = src; const alt = prompt('Image description (alt text)', img.alt); if (alt !== null) img.alt = alt; }; });
  };
  load();
})();
