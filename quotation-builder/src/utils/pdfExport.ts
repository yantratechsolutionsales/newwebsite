import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * High-fidelity, bulletproof PDF export using an isolated iframe & jsPDF.
 * Renders the exact A4 layout without Tailwind OKLCH parser conflicts,
 * cross-origin canvas tainting, or broken table alignments.
 */
export async function exportQuotationToPdf(
  elementId: string,
  quotationNumber: string
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id ${elementId} not found`);
  }

  // Create an isolated hidden iframe with exact A4 dimensions at 96 DPI (210mm = ~794px)
  const iframe = document.createElement('iframe');
  iframe.id = '__pdf_export_sandbox';
  iframe.style.position = 'fixed';
  iframe.style.left = '-9999px';
  iframe.style.top = '0';
  iframe.style.width = '794px';
  iframe.style.minHeight = '1123px'; // 297mm A4 height
  iframe.style.border = 'none';
  iframe.style.backgroundColor = '#ffffff';
  iframe.style.zIndex = '-99999';
  document.body.appendChild(iframe);

  try {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      throw new Error('Unable to access export iframe document');
    }

    // Clone element and sanitize interactive elements
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.width = '794px';
    clone.style.maxWidth = '794px';
    clone.style.margin = '0';
    clone.style.boxShadow = 'none';
    clone.style.border = 'none';
    clone.style.borderRadius = '0';

    // Convert interactive buttons (e.g. datasheet link) to clean plain spans
    clone.querySelectorAll('button').forEach((btn) => {
      const span = document.createElement('span');
      span.innerHTML = btn.innerHTML;
      span.className = btn.className.replace(/cursor-pointer|hover:[^\s]+/g, '');
      btn.parentNode?.replaceChild(span, btn);
    });

    // Standalone CSS without modern OKLCH or variables that crash html2canvas
    const standaloneStyles = `
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800&family=Roboto:wght@400;500;700&display=swap');
      
      * {
        box-sizing: border-box !important;
        margin: 0;
        padding: 0;
      }
      
      body {
        font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif !important;
        background-color: #ffffff !important;
        color: #111827 !important;
        width: 794px !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      #${elementId} {
        width: 794px !important;
        max-width: 794px !important;
        padding: 36px 44px !important;
        background-color: #ffffff !important;
        box-shadow: none !important;
        border: none !important;
        border-radius: 0 !important;
      }

      table {
        table-layout: fixed !important;
        width: 100% !important;
        border-collapse: collapse !important;
      }

      th, td {
        box-sizing: border-box !important;
        word-break: break-word !important;
        overflow-wrap: break-word !important;
      }

      .bg-\\[\\#191A18\\] { background-color: #191A18 !important; }
      .text-\\[\\#F3B93E\\] { color: #F3B93E !important; }
      .border-\\[\\#F3B93E\\] { border-color: #F3B93E !important; }
      .text-\\[\\#a8740f\\] { color: #a8740f !important; }
      .bg-amber-50 { background-color: #fffbeb !important; }
      .bg-slate-50 { background-color: #f8fafc !important; }
      .bg-slate-100 { background-color: #f1f5f9 !important; }
      .border-slate-200 { border-color: #e2e8f0 !important; }
      .border-slate-300 { border-color: #cbd5e1 !important; }
      .border-slate-700 { border-color: #334155 !important; }
      .text-slate-900, .text-slate-950 { color: #0f172a !important; }
      .text-slate-800 { color: #1e293b !important; }
      .text-slate-700 { color: #334155 !important; }
      .text-slate-600 { color: #475569 !important; }
      .text-slate-500 { color: #64748b !important; }
      .text-slate-400 { color: #94a3b8 !important; }
      .text-emerald-700 { color: #047857 !important; }
      .font-outfit { font-family: 'Outfit', sans-serif !important; }
      .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important; }
      
      .grid-cols-2 {
        display: grid !important;
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      }
    `;

    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <style>${standaloneStyles}</style>
      </head>
      <body>
        ${clone.outerHTML}
      </body>
      </html>
    `);
    iframeDoc.close();

    // Allow browser 150ms to settle fonts & images inside the iframe
    await new Promise((resolve) => setTimeout(resolve, 150));

    const targetElement = iframeDoc.getElementById(elementId) || iframeDoc.body;

    const canvas = await html2canvas(targetElement, {
      scale: 2, // High resolution (300 DPI)
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      width: 794,
      windowWidth: 794,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = 297; // A4 height in mm
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const imgHeightMm = (canvasHeight * pdfWidth) / canvasWidth;

    let heightLeft = imgHeightMm;
    let position = 0;

    // First page
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightMm, undefined, 'FAST');
    heightLeft -= pdfHeight;

    // Multi-page handling: add subsequent pages cleanly if quotation spans multiple pages
    while (heightLeft > 5) {
      position -= pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightMm, undefined, 'FAST');
      heightLeft -= pdfHeight;
    }

    const cleanFileName = `Quotation_${quotationNumber.replace(/[\/\\]/g, '_')}.pdf`;
    pdf.save(cleanFileName);
  } finally {
    // Clean up temporary sandbox iframe
    if (document.body.contains(iframe)) {
      document.body.removeChild(iframe);
    }
  }
}

/**
 * Triggers standard browser window.print() formatted with @media print CSS
 */
export function printQuotation(): void {
  window.print();
}
