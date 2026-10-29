import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

/**
 * High-fidelity PDF export using html2canvas-pro & jsPDF.
 * Renders the live styled document with full modern CSS support (including OKLCH),
 * exact A4 dimensions, razor-sharp vector-like typography, and smart pagination.
 */
export async function exportQuotationToPdf(
  elementId: string,
  quotationNumber: string
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id ${elementId} not found`);
  }

  // Ensure high quality rasterization at 2x scale (300 DPI)
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: element.scrollWidth || 794,
  });

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

  // Proportional height in mm
  const imgHeightMm = (canvasHeight * pdfWidth) / canvasWidth;

  // Smart single-page fit:
  // If the document is within 310mm, scale slightly to fit on 1 complete page
  if (imgHeightMm <= 310) {
    const scale = Math.min(1, pdfHeight / imgHeightMm);
    const renderWidth = pdfWidth * scale;
    const renderHeight = imgHeightMm * scale;
    const offsetX = (pdfWidth - renderWidth) / 2;
    const imgData = canvas.toDataURL('image/png', 1.0);
    pdf.addImage(imgData, 'PNG', offsetX, 0, renderWidth, renderHeight, undefined, 'FAST');
  } else {
    // Multi-page document
    const imgData = canvas.toDataURL('image/png', 1.0);
    let heightLeft = imgHeightMm;
    let position = 0;
    let page = 1;

    while (heightLeft > 5) {
      if (page > 1) {
        pdf.addPage();
      }
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightMm, undefined, 'FAST');
      position -= pdfHeight;
      heightLeft -= pdfHeight;
      page++;
    }
  }

  const cleanFileName = `Quotation_${quotationNumber.replace(/[\/\\]/g, '_')}.pdf`;
  pdf.save(cleanFileName);
}

/**
 * Triggers standard browser window.print() formatted with @media print CSS
 */
export function printQuotation(): void {
  window.print();
}
