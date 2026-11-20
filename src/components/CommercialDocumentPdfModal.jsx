import React, { useState } from 'react';
import { Printer, Download, X, ZoomIn, ZoomOut, FileText } from 'lucide-react';
import { AlZaydanCrest } from './AlZaydanLogo';

/**
 * Converts numeric AED amount to proper English words format
 * Example: 1374.82 -> "One Thousand Three Hundred Seventy Four Dirhams and Eighty Two Fils Only"
 */
export function numberToAEDWords(amount) {
  const num = Math.round(Number(amount || 0) * 100) / 100;
  if (isNaN(num) || num === 0) return 'Zero Dirhams Only';

  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const scales = ['', 'Thousand', 'Million', 'Billion'];

  function convertGroup(n) {
    let group = '';
    const h = Math.floor(n / 100);
    const rem = n % 100;
    if (h > 0) {
      group += units[h] + ' Hundred';
      if (rem > 0) group += ' ';
    }
    if (rem >= 10 && rem < 20) {
      group += teens[rem - 10];
    } else {
      const t = Math.floor(rem / 10);
      const u = rem % 10;
      if (t > 0) {
        group += tens[t];
        if (u > 0) group += ' ' + units[u];
      } else if (u > 0) {
        group += units[u];
      }
    }
    return group;
  }

  const dirhams = Math.floor(num);
  const fils = Math.round((num - dirhams) * 100);

  let dirhamWords = '';
  if (dirhams === 0) {
    dirhamWords = 'Zero';
  } else {
    let temp = dirhams;
    let scaleIdx = 0;
    const parts = [];
    while (temp > 0) {
      const groupVal = temp % 1000;
      if (groupVal > 0) {
        const str = convertGroup(groupVal) + (scales[scaleIdx] ? ' ' + scales[scaleIdx] : '');
        parts.unshift(str);
      }
      temp = Math.floor(temp / 1000);
      scaleIdx++;
    }
    dirhamWords = parts.join(' ');
  }

  let result = `${dirhamWords.trim()} Dirham${dirhams === 1 ? '' : 's'}`;
  if (fils > 0) {
    let filsWords = convertGroup(fils);
    result += ` and ${filsWords.trim()} Fils`;
  }
  result += ' Only';
  return result;
}

/**
 * CommercialDocumentPdfModal - Official A4 Fullscreen PDF Document Viewer
 * Exactly matches Reference Image 2:
 * - PDF Canvas Background (#525659) with native PDF reader top toolbar (Print, Download, Zoom, Close)
 * - Official Al Zaydan Corporate Colors: Deep Navy (#011635) and Corporate Blue (#16477A)
 * - Authentic 210mm A4 proportion sheet with realistic paper shadow
 * - Top Left: Official Al Zaydan Logo & Registered Address
 * - Top Center: QUOTATION / DOCUMENT TITLE in Deep Navy
 * - Top Right: Company Tel, Mobile, Email, Website, TRN
 * - 2-Column Section: | To and | Document Details with Al Zaydan Corporate Blue vertical accent bar
 * - Full Items Table: #011635 Deep Navy Header (SL, Code, Item Description, UoM, Brand, Qty, Price, Total)
 * - Financial Summary: Total, VAT (5%), Grand Total in AED
 * - Amount in Words in Corporate Blue (#16477A)
 * - Signatory: For AL ZAYDAN INTERNATIONAL FZE
 * - Page 1 of 1
 */
export default function CommercialDocumentPdfModal({
  isOpen,
  onClose,
  docType = 'QUOTATION', // 'QUOTATION' | 'OPPORTUNITY'
  data = null
}) {
  const [zoomLevel, setZoomLevel] = useState(100);

  if (!isOpen || !data) return null;

  // Extract financial values
  const rawAmt = parseFloat(String(data.amount || data.total || '0').replace(/[^0-9.]/g, '')) || 0;
  const disc = parseFloat(String(data.discount || '0').replace(/[^0-9.]/g, '')) || 0;
  const netAmt = Math.max(0, rawAmt - disc);
  const vatRate = parseFloat(data.vatRate || data.vat || '5') || 5;
  const isWithVat = data.vatType === 'With VAT' || data.vatType === undefined;
  const vatAmt = isWithVat ? Math.round(((netAmt * vatRate) / 100) * 100) / 100 : 0;
  const adj = parseFloat(String(data.adjustment || '0').replace(/[^0-9.]/g, '')) || 0;
  const totalAmt = netAmt + vatAmt + adj;

  // Extract reference number & filename
  const docNumber =
    data.quotationNumber ||
    data.quotationNo ||
    data.code ||
    data.opportunityNumber ||
    (docType === 'QUOTATION' ? 'CTSQ#4340' : 'CTEQ#7539');

  const pdfFileName = `${docNumber}_${(data.quotationDate || data.opportunityDate || '20261120').replace(/[^0-9]/g, '')}.pdf`;

  // Dates & representative
  const docDate = data.quotationDate || data.opportunityDate || data.oppDate || data.date || '20-11-2026';
  const preparedBy = data.owner || data.opportunityOwner || data.preparedBy || 'Super Admin';

  // Customer details
  const customerName = data.customer || data.customerName || 'COMMERCIAL CLIENT';
  const customerLocation = data.location || data.address || 'Dubai / UAE';
  const contactPerson = data.contactPerson || data.primaryContact || data.pointOfContact || 'Procurement In-Charge';
  const contactMobile = data.mobile || data.businessMobile || data.phone || '+971 50 123 4567';

  // Line items list
  const productsList =
    data.products && Array.isArray(data.products) && data.products.length > 0
      ? data.products
      : [
          {
            id: 1,
            itemName: data.name || data.opportunity || data.description || 'Industrial Cooling Equipment & Technical Supply',
            description: data.description || 'Commercial supply and technical equipment as mutually agreed',
            itemCode: 'AZ-ENG-01',
            brand: 'AL ZAYDAN',
            uom: 'Pcs',
            quantity: 1,
            price: netAmt,
            total: netAmt
          }
        ];

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(140, prev + 10));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(70, prev - 10));
  const handleResetZoom = () => setZoomLevel(100);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#323639] flex flex-col overflow-hidden animate-in fade-in duration-150">
      {/* Dynamic CSS Print Media Rule strictly isolating the A4 page for 1:1 true print */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #alzaydan-printable-doc, #alzaydan-printable-doc * {
            visibility: visible !important;
          }
          #alzaydan-printable-doc {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 12mm 15mm !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            transform: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
        }
      `}</style>

      {/* TOP PDF VIEWER TOOLBAR (Authentic Chrome PDF Reader Top Bar matching Image 2) */}
      <header className="h-12 bg-[#2a2d30] border-b border-[#1f2124] text-white flex items-center justify-between px-3 sm:px-6 shrink-0 select-none print:hidden z-10 shadow-md">
        {/* Left: Document Name */}
        <div className="flex items-center gap-2.5 min-w-0">
          <FileText className="w-4 h-4 text-slate-300 shrink-0" />
          <span className="text-xs font-mono text-slate-200 truncate max-w-[200px] sm:max-w-xs font-medium">
            {pdfFileName}
          </span>
        </div>

        {/* Center: Page indicator & Zoom Controls (like native PDF viewer) */}
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-[#3c4043] text-slate-200">
            1 / 1
          </span>

          <span className="h-4 w-px bg-slate-600 mx-1 hidden sm:block" />

          <div className="hidden sm:flex items-center gap-1 bg-[#3c4043] rounded-md px-1 py-0.5">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1 hover:text-white hover:bg-slate-600 rounded transition cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="text-[11px] font-mono px-1.5 hover:text-white font-medium"
              title="Reset Zoom"
            >
              {zoomLevel}%
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1 hover:text-white hover:bg-slate-600 rounded transition cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Green Print Button, Download Icon, Close X Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-md bg-[#107c41] hover:bg-[#0e6b37] text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm active:scale-95"
            title="Print or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-[#3c4043] rounded-md transition cursor-pointer"
            title="Download PDF"
          >
            <Download className="w-4 h-4" />
          </button>

          <span className="h-4 w-px bg-slate-600 mx-0.5" />

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-[#3c4043] rounded-md transition cursor-pointer"
            title="Close PDF Viewer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* PDF CANVAS (Dark grey viewer canvas holding the A4 paper sheet) */}
      <main className="flex-1 overflow-y-auto overflow-x-auto bg-[#525659] p-4 sm:p-10 flex justify-center items-start print:p-0 print:bg-white print:overflow-visible">
        {/* A4 PAPER SHEET (Exact 210mm proportions, crisp typography, official Al Zaydan colors) */}
        <article
          id="alzaydan-printable-doc"
          style={{
            transform: zoomLevel !== 100 ? `scale(${zoomLevel / 100})` : 'none',
            transformOrigin: 'top center',
            WebkitPrintColorAdjust: 'exact',
            printColorAdjust: 'exact'
          }}
          className="w-full max-w-[210mm] min-h-[297mm] bg-white p-8 sm:p-14 shadow-[0_0_25px_rgba(0,0,0,0.45)] text-slate-800 flex flex-col justify-between print:shadow-none print:p-0 print:m-0 print:max-w-none print:w-full print:rounded-none shrink-0"
        >
          {/* Top Half of A4 Page */}
          <div className="space-y-6">
            {/* 1. TOP HEADER: Logo & Address (Left), Title (Center), Contact Info (Right) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 items-start gap-4 pb-5 border-b border-slate-200">
              {/* Left: Official Vector Crest + Company Typography */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <AlZaydanCrest className="w-10 h-10 shrink-0" twoTone={true} />
                  <div>
                    <div className="text-base font-black tracking-tight text-[#011635] leading-none">
                      AL ZAYDAN
                    </div>
                    <div className="text-[8.5px] font-bold tracking-[0.2em] text-[#16477A] mt-0.5 leading-none">
                      INTERNATIONAL FZE
                    </div>
                  </div>
                </div>
                <div className="text-[9.5px] text-slate-600 leading-tight space-y-0.5 pt-0.5">
                  <p className="font-bold text-slate-800">AL ZAYDAN INTERNATIONAL FZE</p>
                  <p>Business Center 4, Level 5, JAFZA One</p>
                  <p>Jebel Ali Free Zone, Dubai, UAE</p>
                </div>
              </div>

              {/* Center: Title (QUOTATION) in Al Zaydan Deep Navy (#011635) */}
              <div className="text-center pt-1">
                <h1 className="text-xl sm:text-2xl font-black text-[#011635] tracking-widest uppercase">
                  {docType}
                </h1>
              </div>

              {/* Right: Contact Details */}
              <div className="text-left sm:text-right text-[10px] text-slate-700 space-y-0.5">
                <div>
                  <span className="font-semibold text-slate-500">Tel : </span>
                  <span className="font-mono text-slate-900 font-medium">+971 4 881 9900</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500">Mobile : </span>
                  <span className="font-mono text-slate-900 font-medium">+971 50 123 4567</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500">Email : </span>
                  <span className="text-[#16477A] font-semibold">info@alzaydan.ae</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500">Website : </span>
                  <span className="text-[#16477A] font-semibold">www.alzaydan.ae</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500">TRN : </span>
                  <span className="font-mono font-bold text-slate-900">100 234 567 800 003</span>
                </div>
              </div>
            </div>

            {/* 2. SECTION: | To and | Document Details with Al Zaydan Corporate Blue Bar (#16477A) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-2 text-xs">
              {/* Left Column: To */}
              <div>
                <div className="border-l-[3.5px] border-[#16477A] pl-2 text-xs font-bold text-[#16477A] uppercase tracking-wide">
                  To
                </div>
                <div className="mt-2 text-xs font-bold text-slate-900 uppercase">
                  {customerName}
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  {customerLocation}
                </div>
                <div className="text-[11px] text-slate-700 mt-2">
                  <span className="text-slate-500 font-medium">Attn : </span>
                  <span className="font-semibold text-slate-900">{contactPerson}</span>
                </div>
                <div className="text-[11px] text-slate-700 mt-0.5">
                  <span className="text-slate-500 font-medium">Mobile : </span>
                  <span className="font-mono text-slate-900">{contactMobile}</span>
                </div>
              </div>

              {/* Right Column: Document Details */}
              <div>
                <div className="border-l-[3.5px] border-[#16477A] pl-2 text-xs font-bold text-[#16477A] uppercase tracking-wide">
                  Document Details
                </div>
                <div className="mt-2 space-y-1.5 text-[11px] text-slate-700">
                  <div className="flex">
                    <span className="w-28 text-slate-500 font-medium">Number :</span>
                    <span className="font-bold font-mono text-slate-900">{docNumber}</span>
                  </div>
                  <div className="flex">
                    <span className="w-28 text-slate-500 font-medium">Date :</span>
                    <span className="font-bold text-slate-900">{docDate}</span>
                  </div>
                  <div className="flex">
                    <span className="w-28 text-slate-500 font-medium">Prepared By :</span>
                    <span className="font-bold text-slate-900">{preparedBy}</span>
                  </div>
                  <div className="flex">
                    <span className="w-28 text-slate-500 font-medium">No. of Pages :</span>
                    <span className="text-slate-900 font-medium">1</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. ITEMS TABLE: Al Zaydan Deep Navy (#011635) Header matching website theme */}
            <div className="mt-2 border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#011635] text-white font-bold text-[11px]">
                    <th className="py-2.5 px-3 text-center w-12 border-r border-[#0a274e]">SL</th>
                    <th className="py-2.5 px-3 w-40 border-r border-[#0a274e]">Code</th>
                    <th className="py-2.5 px-3 border-r border-[#0a274e]">Item Description</th>
                    <th className="py-2.5 px-3 text-center w-14 border-r border-[#0a274e]">UoM</th>
                    <th className="py-2.5 px-3 w-24 border-r border-[#0a274e]">Brand</th>
                    <th className="py-2.5 px-3 text-center w-14 border-r border-[#0a274e]">Qty</th>
                    <th className="py-2.5 px-3 text-right w-24 border-r border-[#0a274e]">Price</th>
                    <th className="py-2.5 px-3 text-right w-24">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-[11px]">
                  {productsList.map((p, idx) => {
                    const q = parseFloat(p.quantity) || 1;
                    const pr = parseFloat(String(p.price || '0').replace(/[^0-9.]/g, '')) || 0;
                    const lineTotal = parseFloat(p.total) || (q * pr);
                    return (
                      <tr key={p.id || idx} className="hover:bg-slate-50/50">
                        <td className="py-3 px-3 text-center font-bold text-slate-800 border-r border-slate-200">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600 border-r border-slate-200 text-[10px]">
                          {p.itemCode || '—'}
                        </td>
                        <td className="py-3 px-3 border-r border-slate-200">
                          <div className="font-bold text-slate-900 uppercase">{p.itemName || 'Item'}</div>
                          {p.description && (
                            <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                              {p.description}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-700 border-r border-slate-200">
                          {p.uom || 'Pcs'}
                        </td>
                        <td className="py-3 px-3 text-slate-700 border-r border-slate-200">
                          {p.brand || '—'}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-slate-800 border-r border-slate-200">
                          {q}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-800 border-r border-slate-200">
                          {pr.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                          {lineTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* 4. FINANCIAL SUMMARY BLOCK: Bottom Right of Table */}
              <div className="border-t border-slate-200 bg-white">
                <div className="flex justify-end">
                  <div className="w-80 divide-y divide-slate-100 text-xs">
                    <div className="flex justify-between py-2 px-4 text-slate-700">
                      <span className="font-bold">Total</span>
                      <span className="font-mono font-bold">
                        {netAmt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    {disc > 0 && (
                      <div className="flex justify-between py-2 px-4 text-emerald-600">
                        <span className="font-bold">Discount</span>
                        <span className="font-mono font-bold">
                          - {disc.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 px-4 text-slate-700">
                      <span className="font-bold">VAT ({vatRate}%)</span>
                      <span className="font-mono font-bold">
                        {vatAmt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    {adj !== 0 && (
                      <div className="flex justify-between py-2 px-4 text-slate-700">
                        <span className="font-bold">Adjustment</span>
                        <span className="font-mono font-bold">
                          {adj.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between py-2.5 px-4 bg-slate-50 border-t border-slate-300">
                      <span className="font-black text-[#011635]">Grand Total in AED</span>
                      <span className="font-mono font-black text-[#16477A] text-sm">
                        {totalAmt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. AMOUNT IN WORDS in Al Zaydan Corporate Blue */}
            <div className="mt-8 pt-4 border-t border-slate-100">
              <div className="text-xs font-semibold text-slate-500">Amount in words</div>
              <div className="text-xs font-bold text-[#16477A] mt-1 leading-relaxed">
                {numberToAEDWords(totalAmt)}
              </div>
            </div>
          </div>

          {/* Bottom Half of A4 Page: Signatory Section & Page Number Footer */}
          <div className="pt-12 mt-auto">
            <div className="flex justify-between items-end text-xs">
              <div className="space-y-1">
                <div className="font-bold text-slate-900 uppercase">
                  For AL ZAYDAN INTERNATIONAL FZE
                </div>
                <div className="text-[#011635] font-bold pt-12">
                  {preparedBy}
                </div>
                <div className="text-[10.5px] text-slate-400">
                  Authorized Signatory
                </div>
              </div>

              <div className="text-right text-[11px] text-slate-400">
                Page 1 of 1
              </div>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}
