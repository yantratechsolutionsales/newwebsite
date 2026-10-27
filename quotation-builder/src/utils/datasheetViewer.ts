/**
 * Utility functions for viewing and downloading product technical datasheets.
 * Guarantees that when opening or downloading a datasheet, ONLY the Product Name
 * and Yantratech Solutions branding are displayed, never third-party vendor names.
 */

export function sanitizeProductName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
}

/**
 * Directly downloads the datasheet with a clean, professional filename:
 * e.g. "Meco_153B_TRMS_Digital_Multimeter_Datasheet.pdf"
 * Uses same-origin proxy to eliminate CORS errors and browser download blocking.
 */
export async function downloadDatasheetPdf(productName: string, datasheetUrl: string) {
  if (!datasheetUrl) return;

  const fileName = `${sanitizeProductName(productName || 'Product')}_Datasheet.pdf`;
  const proxyDownloadUrl = `/api/datasheet-download?url=${encodeURIComponent(datasheetUrl)}&name=${encodeURIComponent(fileName)}`;

  try {
    const link = document.createElement('a');
    link.href = proxyDownloadUrl;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('Proxy download failed, fallback to direct tab:', err);
    window.open(datasheetUrl, '_blank');
  }
}

/**
 * Opens the datasheet in a dedicated browser window/tab where the page title,
 * header, and document preview display ONLY the Product Name and Yantratech Solutions branding.
 */
export function openCleanDatasheetWindow(productName: string, datasheetUrl: string) {
  if (!datasheetUrl) return;

  const cleanName = productName || 'Industrial Equipment';
  const displayTitle = `${cleanName} - Technical Datasheet`;
  const downloadFileName = `${sanitizeProductName(cleanName)}_Datasheet.pdf`;

  const newWindow = window.open('about:blank', '_blank');
  if (!newWindow) {
    // Fallback if popup blocked
    window.open(datasheetUrl, '_blank');
    return;
  }

  const escapedTitle = displayTitle.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const escapedName = cleanName.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow, noarchive, nosnippet">
  <title>${escapedTitle}</title>
  <link rel="icon" type="image/webp" href="/yantratech-logo.webp">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Roboto', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: #111210;
      color: #f8fafc;
      height: 100vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    header {
      background: #191A18;
      border-bottom: 2px solid #F3B93E;
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
      z-index: 10;
    }
    .brand-section {
      display: flex;
      align-items: center;
      gap: 16px;
      min-width: 0;
    }
    .logo {
      height: 34px;
      width: auto;
      object-fit: contain;
    }
    .divider {
      height: 28px;
      width: 1px;
      background: rgba(255,255,255,0.18);
    }
    .title-group {
      min-width: 0;
    }
    .product-title {
      font-family: 'Outfit', sans-serif;
      font-size: 16px;
      font-weight: 700;
      color: #ffffff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 650px;
      letter-spacing: -0.01em;
    }
    .badge-sub {
      font-size: 11px;
      color: #F3B93E;
      font-weight: 600;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 2px;
    }
    .actions {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }
    .btn {
      padding: 8px 18px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;
      font-family: 'Outfit', sans-serif;
      border: none;
    }
    .btn-download {
      background: #F3B93E;
      color: #191A18;
      box-shadow: 0 2px 8px rgba(243, 185, 62, 0.35);
    }
    .btn-download:hover {
      background: #e2a82e;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(243, 185, 62, 0.5);
    }
    .btn-close {
      background: rgba(255,255,255,0.08);
      color: #cbd5e1;
      border: 1px solid rgba(255,255,255,0.15);
    }
    .btn-close:hover {
      background: rgba(255,255,255,0.15);
      color: #ffffff;
    }
    .viewer-frame {
      flex: 1;
      width: 100%;
      height: calc(100vh - 64px);
      background: #323639;
      position: relative;
    }
    iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
  </style>
</head>
<body>
  <header>
    <div class="brand-section">
      <img src="/yantratech-logo.webp" alt="Yantratech Solutions" class="logo" onerror="this.src='/yantratech-logo.png'">
      <div class="divider"></div>
      <div class="title-group">
        <h1 class="product-title">${escapedName}</h1>
        <div class="badge-sub">
          <span>Official Technical Datasheet</span>
          <span>•</span>
          <span>Yantratech Solutions</span>
        </div>
      </div>
    </div>
    <div class="actions">
      <button id="downloadBtn" class="btn btn-download">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Download PDF
      </button>
      <button onclick="window.close()" class="btn btn-close">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        Close
      </button>
    </div>
  </header>
  <div class="viewer-frame">
    <iframe src="${datasheetUrl}" title="${escapedName} - Technical Datasheet"></iframe>
  </div>
  <script>
    document.getElementById('downloadBtn').addEventListener('click', () => {
      const proxyDownloadUrl = '/api/datasheet-download?url=' + encodeURIComponent('${datasheetUrl}') + '&name=' + encodeURIComponent('${downloadFileName}');
      const a = document.createElement('a');
      a.href = proxyDownloadUrl;
      a.download = '${downloadFileName}';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  <\/script>
</body>
</html>`;

  newWindow.document.open();
  newWindow.document.write(html);
  newWindow.document.close();
}
