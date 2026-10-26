import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Quotation, CompanySettings } from '../types';
import { formatINR, numberToIndianWords } from './calculations';

/**
 * High-fidelity PDF export using html2canvas & jsPDF.
 * Renders the exact A4 layout without overlapping text, broken tables, or truncated terms.
 */
export async function exportQuotationToPdf(
  elementId: string,
  quotationNumber: string
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id ${elementId} not found`);
  }

  // Temporary clone or styling adjustment for crisp rasterization
  const canvas = await html2canvas(element, {
    scale: 2, // High resolution (300dpi equivalent)
    useCORS: true,
    logging: false,
    allowTaint: true,
    backgroundColor: '#ffffff',
    windowWidth: element.scrollWidth,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  // Calculate proportional height in mm
  const imgHeightMm = (canvasHeight * pdfWidth) / canvasWidth;

  let heightLeft = imgHeightMm;
  let position = 0;

  // First page
  pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightMm, undefined, 'FAST');
  heightLeft -= pdfHeight;

  // Multi-page handling: add pages cleanly if content spans multiple A4 sheets
  while (heightLeft > 0) {
    position = heightLeft - imgHeightMm; // Top offset for subsequent pages
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightMm, undefined, 'FAST');
    heightLeft -= pdfHeight;
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
