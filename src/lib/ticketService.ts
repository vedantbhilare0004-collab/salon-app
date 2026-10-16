import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";
import type { Appointment, Service } from "./types";
import { formatPrice, formatTime, formatDate, numberToWords } from "./format";

export interface TicketPdfOptions {
  appointment: Appointment;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  services?: Service[];
  staffName?: string;
}

const SALON_NAME = "Glow & Glamour Hair Studio";
const SALON_TAGLINE = "Beautiful Hair. Expert Care.";
const SALON_ADDRESS = "Near ZP School, Laxmi Nagar, Koregaon, Maharashtra 415501";
const SALON_PHONE = "+91 70582 39061";

/**
 * Generates an official Base64 PDF Booking Ticket matching soul.txt specifications.
 */
export async function generateBookingTicketPdf(options: TicketPdfOptions): Promise<{ doc: jsPDF; base64: string; blobUrl: string }> {
  const { appointment, customerName = appointment.customerName, customerPhone = appointment.customerPhone, services = [], staffName } = options;
  
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const getDisplayName = (s?: Service) => {
    if (!s) return "Salon Treatment";
    if (s.variant) return `${s.name} (${s.variant})`;
    return s.name;
  };
  const primaryService = getDisplayName(services[0]);
  const allServicesText = services.length > 0 ? services.map(s => getDisplayName(s)).join(", ") : primaryService;
  const totalPrice = appointment.priceAtBooking || services.reduce((acc, s) => acc + (s.price || 0), 0) || 0;

  // 1. Generate QR Code image as data URL
  // QR contains Appointment ID or verify URL
  const qrData = appointment.id || appointment.reference;
  let qrDataUrl = "";
  try {
    qrDataUrl = await QRCode.toDataURL(qrData, {
      margin: 1,
      width: 250,
      color: {
        dark: "#2B2B2B",
        light: "#FFFFFF",
      },
    });
  } catch (err) {
    console.error("QR Code generation error:", err);
  }

  // 2. Top Dark Charcoal Banner (#2B2B2B)
  doc.setFillColor(43, 43, 43); // #2B2B2B
  doc.rect(0, 0, pageWidth, 36, "F");

  // Header Typography
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(SALON_NAME, pageWidth / 2, 16, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(229, 211, 179); // Champagne Gold #E5D3B3
  doc.text(SALON_TAGLINE, pageWidth / 2, 23, { align: "center" });

  doc.setFontSize(7.5);
  doc.setTextColor(200, 200, 200);
  doc.text(SALON_ADDRESS, pageWidth / 2, 29, { align: "center" });

  // 3. Official Title Card Banner
  doc.setFillColor(245, 245, 243);
  doc.roundedRect(15, 42, pageWidth - 30, 14, 1.5, 1.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(43, 43, 43);
  doc.text("OFFICIAL BOARDING PASS & BOOKING TICKET", pageWidth / 2, 51, { align: "center" });

  // 4. Main Ticket Body Card
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(15, 62, pageWidth - 30, 160, 2, 2, "FD");

  // Left Column: Service Details
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(30, 30, 30);
  doc.text(primaryService.substring(0, 32), 25, 78);

  if (services.length > 1) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`+ includes: ${allServicesText.substring(0, 50)}`, 25, 85);
  }

  // Date and Time
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(120, 120, 120);
  doc.text("DATE & TIME", 25, 96);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(40, 40, 40);
  const timeFormatted = formatTime(appointment.startTime || appointment.time);
  doc.text(`${formatDate(appointment.date)}  ·  ${timeFormatted}`, 25, 104);

  // Address block
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text("SALON LOCATION", 25, 115);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.text(SALON_ADDRESS, 25, 121, { maxWidth: 90 });

  // Right Column: QR Code Box
  if (qrDataUrl) {
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(pageWidth - 75, 70, 50, 56, 1.5, 1.5, "F");
    doc.addImage(qrDataUrl, "PNG", pageWidth - 70, 72, 40, 40);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("SCAN TO VERIFY", pageWidth - 50, 121, { align: "center" });
  }

  // Mid-Section Hairline Divider
  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.3);
  doc.line(25, 134, pageWidth - 25, 134);

  // Guest Details Grid
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(130, 130, 130);
  doc.text("GUEST NAME", 25, 143);
  doc.text("CONTACT NUMBER", 85, 143);
  doc.text("ASSIGNED STYLIST", 145, 143);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(40, 40, 40);
  doc.text(customerName || "Valued Guest", 25, 151);
  doc.text(customerPhone || "N/A", 85, 151);
  doc.text(staffName || "Master Stylist", 145, 151);

  // Amount & Booking Reference Block
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(130, 130, 130);
  doc.text("LOCKED PRICE", 25, 163);
  doc.text("REFERENCE CODE", 85, 163);
  doc.text("BOOKING DATE", 145, 163);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(30, 30, 30);
  doc.text(totalPrice > 0 ? formatPrice(totalPrice) : "Consultation", 25, 171);
  doc.text(`#${appointment.reference}`, 85, 171);
  doc.setFontSize(10);
  doc.text(appointment.createdAt ? formatDate(appointment.createdAt.split("T")[0]) : formatDate(appointment.date), 145, 171);

  // Lower Badges
  // Booking ID badge (Alice Blue)
  doc.setFillColor(240, 248, 255); // Alice Blue
  doc.roundedRect(25, 182, 70, 12, 1, 1, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(40, 90, 160);
  const idShort = appointment.id ? appointment.id.substring(0, 12) : appointment.reference;
  doc.text(`ID: ${idShort}`, 60, 189.5, { align: "center" });

  // Status badge (Light Green)
  doc.setFillColor(235, 247, 238);
  doc.roundedRect(102, 182, 50, 12, 1, 1, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(34, 139, 34);
  const statusUpper = (appointment.status || "CONFIRMED").toUpperCase();
  doc.text(`STATUS: ${statusUpper}`, 127, 189.5, { align: "center" });

  // Verification Notice
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(130, 130, 130);
  doc.text("Present this digital ticket at the front desk upon arrival for instant check-in.", pageWidth / 2, 210, { align: "center" });

  // 5. Official Footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`For rescheduling or questions, contact ${SALON_PHONE} | Koregaon, Maharashtra`, pageWidth / 2, 240, { align: "center" });

  const base64 = doc.output("datauristring");
  const blobUrl = String(doc.output("bloburl"));

  return { doc, base64, blobUrl };
}

/**
 * Formats appointment date into e.g. "14 October 2026"
 */
function formatBillDate(iso?: string | null): string {
  if (!iso) {
    const d = new Date();
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  }
  const parts = iso.split("-");
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2].split("T")[0], 10);
    const d = new Date(year, month, day);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  }
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

/**
 * Formats currency values as proper strings with Indian numbering convention
 */
function formatBillAmount(amount: number): string {
  const safeNum = typeof amount === "number" && !isNaN(amount) ? amount : 0;
  return `Rs. ${safeNum.toLocaleString("en-IN")}`;
}

export function getFormattedInvoiceNumber(appointment: Appointment, customNum?: string): string {
  if (customNum) return customNum.startsWith("INV-") ? customNum : `INV-${customNum}`;
  const raw = appointment.reference || appointment.id.slice(0, 8).toUpperCase();
  return raw.startsWith("INV-") ? raw : `INV-${raw}`;
}

export interface InvoicePdfOptions {
  appointment: Appointment;
  invoiceNumber?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  services?: Service[];
  staffName?: string;
  discountAmount?: number;
  paymentMethod?: string;
  notes?: string;
}

/**
 * 1. Detailed A4 Printed Bill
 * Full-featured official tax invoice with customer details, appointment records,
 * itemized services, discounts, taxes (CGST/SGST), and payment status.
 */
export async function generatePrintedInvoiceA4(
  options: InvoicePdfOptions
): Promise<{ doc: jsPDF; base64: string; blobUrl: string }> {
  const {
    appointment,
    customerName = appointment.customerName || "Valued Client",
    customerPhone = appointment.customerPhone || "",
    customerEmail = "",
    services = [],
    staffName = "Senior Salon Specialist",
    discountAmount = 0,
    paymentMethod = "UPI / Card / Cash",
  } = options;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const invoiceNum = getFormattedInvoiceNumber(appointment, options.invoiceNumber);

  // 1. Clean Warm Ivory Luxury Background
  doc.setFillColor(252, 251, 248);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // 2. Top Dark Charcoal Banner (#22201D)
  doc.setFillColor(34, 32, 29);
  doc.rect(0, 0, pageWidth, 42, "F");

  // Gold Shimmer Accent Line (#A27C48)
  doc.setFillColor(162, 124, 72);
  doc.rect(0, 42, pageWidth, 2, "F");

  // G&G Gold Monogram Emblem Box
  doc.setFillColor(162, 124, 72);
  doc.roundedRect(14, 9, 14, 14, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("G&G", 21, 18, { align: "center" });

  // Salon Brand Title & Tagline
  doc.setFontSize(17);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text(SALON_NAME.toUpperCase(), 32, 16);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(226, 195, 146); // Champagne Gold
  doc.text("LUXURY HAIR STUDIO & SPA  ·  KOREGAON", 32, 22);

  doc.setFontSize(7.5);
  doc.setTextColor(190, 185, 178);
  doc.text(SALON_ADDRESS, 32, 28);
  doc.text(`Phone: ${SALON_PHONE}  ·  Laxmi Nagar, Koregaon 415501`, 32, 33);

  // Right Side: Tax Invoice Header Details
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(226, 195, 146);
  doc.text("TAX INVOICE", pageWidth - 14, 16, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text(invoiceNum, pageWidth - 14, 22, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(200, 195, 190);
  doc.text(`Bill Date: ${formatBillDate(appointment.date)}`, pageWidth - 14, 28, { align: "right" });
  doc.text(`Booking Ref: #${appointment.reference || appointment.id.slice(0, 8)}`, pageWidth - 14, 33, { align: "right" });

  // 3. Two Info Cards: Billed To & Appointment Summary
  const cardY = 50;
  const cardW = 88;
  const cardH = 26;

  // Left Card: Customer Details
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(233, 225, 214);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, cardY, cardW, cardH, 2, 2, "FD");

  // Card Header Strip
  doc.setFillColor(246, 242, 235);
  doc.roundedRect(14, cardY, cardW, 6, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(162, 124, 72);
  doc.text("BILLED TO (CUSTOMER DETAILS)", 18, cardY + 4.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(34, 32, 29);
  doc.text(customerName, 18, cardY + 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(116, 105, 94);
  doc.text(`Phone: ${customerPhone || "Not provided"}`, 18, cardY + 17);
  doc.text(`Client ID: #${appointment.customerId ? appointment.customerId.slice(0, 10) : "WALK-IN"}`, 18, cardY + 22);

  // Right Card: Appointment Details
  const rightCardX = pageWidth - 14 - cardW;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(233, 225, 214);
  doc.setLineWidth(0.3);
  doc.roundedRect(rightCardX, cardY, cardW, cardH, 2, 2, "FD");

  doc.setFillColor(246, 242, 235);
  doc.roundedRect(rightCardX, cardY, cardW, 6, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(162, 124, 72);
  doc.text("APPOINTMENT & SERVICE RECORD", rightCardX + 4, cardY + 4.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(34, 32, 29);
  doc.text(`${formatDate(appointment.date)}  ·  ${formatTime(appointment.startTime || appointment.time)}`, rightCardX + 4, cardY + 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(116, 105, 94);
  doc.text(`Stylist: ${staffName}`, rightCardX + 4, cardY + 17);
  doc.text("Branch: Laxmi Nagar, Koregaon", rightCardX + 4, cardY + 22);

  // 4. Detailed Services Table
  const tableStartY = 81;
  const tableRows =
    services.length > 0
      ? services.map((s, idx) => [
          `${idx + 1}`,
          s.variant ? `${s.name} (${s.variant})` : s.name,
          `${s.durationMin || s.durationMinutes || 30} mins`,
          formatBillAmount(s.price || 0),
          "Rs. 0",
          formatBillAmount(s.price || 0),
        ])
      : [
          [
            "1",
            "Salon Service & Styling Treatment",
            `${appointment.durationMinutes || 30} mins`,
            formatBillAmount(appointment.priceAtBooking || 0),
            "Rs. 0",
            formatBillAmount(appointment.priceAtBooking || 0),
          ],
        ];

  const subtotal =
    appointment.priceAtBooking ||
    services.reduce((acc, s) => acc + (s.price || 0), 0) ||
    0;
  const finalPayable = Math.max(0, subtotal - discountAmount);
  // Tax calculations (GST 18% inclusive)
  const taxableAmount = +(finalPayable / 1.18).toFixed(2);
  const totalTax = +(finalPayable - taxableAmount).toFixed(2);
  const cgst = +(totalTax / 2).toFixed(2);
  const sgst = +(totalTax / 2).toFixed(2);

  autoTable(doc, {
    startY: tableStartY,
    head: [["#", "Treatment / Service Description", "Duration", "Rate", "Discount", "Net Amount"]],
    body: tableRows,
    theme: "striped",
    headStyles: {
      fillColor: [34, 32, 29], // #22201D Deep Charcoal
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
      cellPadding: 4,
    },
    bodyStyles: {
      fillColor: [255, 255, 255],
      textColor: [34, 32, 29],
      fontSize: 8.5,
      cellPadding: 3.5,
      lineColor: [233, 225, 214],
      lineWidth: 0.15,
    },
    alternateRowStyles: {
      fillColor: [248, 245, 240], // Light subtle cream
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 10 },
      1: { halign: "left" },
      2: { halign: "center", cellWidth: 24 },
      3: { halign: "right", cellWidth: 25 },
      4: { halign: "right", cellWidth: 22 },
      5: { halign: "right", cellWidth: 28, fontStyle: "bold" },
    },
    margin: { left: 14, right: 14 },
  });

  // 5. Financial Summary & Payment Breakdown Block
  let finalY = (doc as any).lastAutoTable?.finalY || 130;
  if (finalY > 215) {
    doc.addPage();
    doc.setFillColor(252, 251, 248);
    doc.rect(0, 0, pageWidth, pageHeight, "F");
    finalY = 20;
  }

  const summaryBlockY = finalY + 6;

  // Left Block: Payment Status & Amount In Words
  const leftSummaryW = 98;
  const leftSummaryH = 46;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(233, 225, 214);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, summaryBlockY, leftSummaryW, leftSummaryH, 2, 2, "FD");

  // Status Badge
  const isPaid = (appointment.status || "").toLowerCase() === "completed" || true;
  doc.setFillColor(235, 243, 236);
  doc.roundedRect(18, summaryBlockY + 5, 34, 7, 1.5, 1.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(53, 91, 60);
  doc.text("PAID IN FULL", 35, summaryBlockY + 9.8, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(116, 105, 94);
  doc.text(`Payment Mode: ${paymentMethod}`, 56, summaryBlockY + 9.8);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(162, 124, 72);
  doc.text("AMOUNT IN WORDS:", 18, summaryBlockY + 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(34, 32, 29);
  doc.text(numberToWords(finalPayable), 18, summaryBlockY + 23, { maxWidth: 90 });

  // Verification QR Code
  try {
    const qrData = `https://glowglamour.in/book/success/${appointment.reference || appointment.id}`;
    const qrDataUrl = await QRCode.toDataURL(qrData, {
      margin: 1,
      width: 120,
      color: { dark: "#22201D", light: "#FFFFFF" },
    });
    doc.addImage(qrDataUrl, "PNG", 18, summaryBlockY + 28, 14, 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(116, 105, 94);
    doc.text("Scan QR to verify digital receipt", 35, summaryBlockY + 34);
    doc.text("and view warranty on hair services", 35, summaryBlockY + 38);
  } catch {
    /* QR optional */
  }

  // Right Block: Financial Calculation Card
  const rightSummaryW = 78;
  const rightSummaryX = pageWidth - 14 - rightSummaryW;
  doc.setFillColor(248, 245, 240);
  doc.setDrawColor(233, 225, 214);
  doc.setLineWidth(0.3);
  doc.roundedRect(rightSummaryX, summaryBlockY, rightSummaryW, leftSummaryH, 2, 2, "FD");

  const addCalcRow = (label: string, value: string, yPos: number, isBold = false) => {
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(isBold ? 34 : 116, isBold ? 32 : 105, isBold ? 29 : 94);
    doc.text(label, rightSummaryX + 5, yPos);
    doc.text(value, rightSummaryX + rightSummaryW - 5, yPos, { align: "right" });
  };

  addCalcRow("Subtotal", formatBillAmount(subtotal), summaryBlockY + 7);
  addCalcRow("Discount", `- ${formatBillAmount(discountAmount)}`, summaryBlockY + 13);
  addCalcRow("Taxable Value", `Rs. ${taxableAmount.toLocaleString("en-IN")}`, summaryBlockY + 19);
  addCalcRow("CGST (9%)", `Rs. ${cgst.toLocaleString("en-IN")}`, summaryBlockY + 24);
  addCalcRow("SGST (9%)", `Rs. ${sgst.toLocaleString("en-IN")}`, summaryBlockY + 29);

  // Grand Total Line & Amount
  doc.setDrawColor(210, 200, 185);
  doc.setLineWidth(0.3);
  doc.line(rightSummaryX + 5, summaryBlockY + 33, rightSummaryX + rightSummaryW - 5, summaryBlockY + 33);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(34, 32, 29);
  doc.text("GRAND TOTAL", rightSummaryX + 5, summaryBlockY + 40);

  doc.setFontSize(13);
  doc.setTextColor(162, 124, 72); // Gold
  doc.text(formatBillAmount(finalPayable), rightSummaryX + rightSummaryW - 5, summaryBlockY + 40, { align: "right" });

  // 6. Professional Footer
  const footerY = 270;
  doc.setDrawColor(233, 225, 214);
  doc.setLineWidth(0.4);
  doc.line(14, footerY, pageWidth - 14, footerY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(162, 124, 72);
  doc.text("GLOW & GLAMOUR TERMS & POLICIES", 14, footerY + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(116, 105, 94);
  doc.text("• All services performed by certified stylists with premium salon-grade cosmetics.", 14, footerY + 9);
  doc.text("• Treatments and products once billed are non-refundable. For feedback: +91 70582 39061.", 14, footerY + 13);
  doc.text("• Thank you for visiting Glow & Glamour Hair Studio & Spa, Koregaon!", 14, footerY + 17);

  // Authorized Signatory
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(34, 32, 29);
  doc.text("For GLOW & GLAMOUR HAIR STUDIO", pageWidth - 14, footerY + 7, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(116, 105, 94);
  doc.text("Authorized Salon Signatory", pageWidth - 14, footerY + 17, { align: "right" });

  const base64 = doc.output("datauristring");
  const blobUrl = String(doc.output("bloburl"));

  return { doc, base64, blobUrl };
}

/**
 * 2. WhatsApp / Digital PDF Bill
 * Polished mobile-optimized digital invoice card designed for smartphone screens,
 * customer downloads, and instant WhatsApp sharing.
 */
export async function generateWhatsAppDigitalPdf(
  options: InvoicePdfOptions
): Promise<{ doc: jsPDF; base64: string; blobUrl: string }> {
  const {
    appointment,
    customerName = appointment.customerName || "Valued Client",
    customerPhone = appointment.customerPhone || "",
    services = [],
    staffName = "Senior Stylist",
    discountAmount = 0,
    paymentMethod = "UPI / Online",
  } = options;

  // Mobile card dimensions (115mm x 215mm)
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [115, 215],
  });

  const pageWidth = 115;
  const pageHeight = 215;
  const invoiceNum = getFormattedInvoiceNumber(appointment, options.invoiceNumber);

  // Background
  doc.setFillColor(252, 251, 248);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Top Dark Luxury Header
  doc.setFillColor(34, 32, 29);
  doc.rect(0, 0, pageWidth, 36, "F");

  doc.setFillColor(162, 124, 72);
  doc.rect(0, 36, pageWidth, 2, "F");

  // G&G Gold Badge
  doc.setFillColor(162, 124, 72);
  doc.roundedRect(pageWidth / 2 - 7, 6, 14, 12, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("G&G", pageWidth / 2, 14, { align: "center" });

  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text("GLOW & GLAMOUR", pageWidth / 2, 24, { align: "center" });

  doc.setFontSize(7);
  doc.setTextColor(226, 195, 146);
  doc.text("DIGITAL SERVICE INVOICE · KOREGAON", pageWidth / 2, 30, { align: "center" });

  // Hero Total Paid Box
  const subtotal =
    appointment.priceAtBooking ||
    services.reduce((acc, s) => acc + (s.price || 0), 0) ||
    0;
  const finalPayable = Math.max(0, subtotal - discountAmount);

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(233, 225, 214);
  doc.roundedRect(8, 44, pageWidth - 16, 26, 2, 2, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(116, 105, 94);
  doc.text("TOTAL PAID", pageWidth / 2, 51, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(162, 124, 72);
  doc.text(formatBillAmount(finalPayable), pageWidth / 2, 60, { align: "center" });

  // Verified Paid Badge
  doc.setFillColor(235, 243, 236);
  doc.roundedRect(pageWidth / 2 - 16, 62, 32, 5.5, 1.5, 1.5, "F");
  doc.setFontSize(7);
  doc.setTextColor(53, 91, 60);
  doc.text("PAID IN FULL", pageWidth / 2, 66, { align: "center" });

  // Customer & Appointment Card
  const infoY = 74;
  doc.setFillColor(248, 245, 240);
  doc.roundedRect(8, infoY, pageWidth - 16, 30, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(162, 124, 72);
  doc.text("CLIENT & APPOINTMENT", 12, infoY + 6);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(34, 32, 29);
  doc.text(customerName, 12, infoY + 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(116, 105, 94);
  doc.text(`Mobile: ${customerPhone || "N/A"}`, 12, infoY + 17);
  doc.text(`Date: ${formatDate(appointment.date)}  ·  ${formatTime(appointment.startTime || appointment.time)}`, 12, infoY + 22);
  doc.text(`Invoice: ${invoiceNum}`, 12, infoY + 27);

  // Services Rendered Section
  let curY = 110;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(162, 124, 72);
  doc.text("SERVICES RENDERED", 8, curY);

  curY += 4;
  const tableRows =
    services.length > 0
      ? services.map((s) => [s.name, `${s.durationMin || 30}m`, formatBillAmount(s.price || 0)])
      : [["Salon Treatment", "30m", formatBillAmount(finalPayable)]];

  autoTable(doc, {
    startY: curY,
    head: [["Service", "Dur", "Price"]],
    body: tableRows,
    theme: "striped",
    headStyles: {
      fillColor: [34, 32, 29],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      cellPadding: 2.5,
    },
    bodyStyles: {
      fontSize: 7.5,
      cellPadding: 2.5,
    },
    columnStyles: {
      0: { halign: "left" },
      1: { halign: "center", cellWidth: 16 },
      2: { halign: "right", cellWidth: 24, fontStyle: "bold" },
    },
    margin: { left: 8, right: 8 },
  });

  let afterTableY = (doc as any).lastAutoTable?.finalY || 155;

  // Tax and Grand Total summary line
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(116, 105, 94);
  doc.text(`Taxes (GST 18% incl.): Rs. ${(finalPayable - finalPayable / 1.18).toFixed(2)}`, 8, afterTableY + 6);
  doc.text(`Payment: ${paymentMethod}`, pageWidth - 8, afterTableY + 6, { align: "right" });

  // QR Code Verification
  try {
    const qrData = `https://glowglamour.in/book/success/${appointment.reference || appointment.id}`;
    const qrDataUrl = await QRCode.toDataURL(qrData, {
      margin: 1,
      width: 100,
      color: { dark: "#22201D", light: "#FFFFFF" },
    });
    doc.addImage(qrDataUrl, "PNG", pageWidth / 2 - 9, afterTableY + 10, 18, 18);
  } catch {
    /* QR optional */
  }

  // Footer
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(34, 32, 29);
  doc.text("Thank You for Visiting Glow & Glamour!", pageWidth / 2, afterTableY + 34, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(116, 105, 94);
  doc.text("Laxmi Nagar, Koregaon  ·  Ph: +91 70582 39061", pageWidth / 2, afterTableY + 38, { align: "center" });
  doc.text("Save this digital slip for your beauty care records", pageWidth / 2, afterTableY + 42, { align: "center" });

  const base64 = doc.output("datauristring");
  const blobUrl = String(doc.output("bloburl"));

  return { doc, base64, blobUrl };
}

/**
 * 3. Compact Receipt (80mm POS Thermal Slip)
 * Formatted strictly for standard 80mm thermal receipt counter printers.
 */
export async function generateCompactReceiptPdf(
  options: InvoicePdfOptions
): Promise<{ doc: jsPDF; base64: string; blobUrl: string }> {
  const {
    appointment,
    customerName = appointment.customerName || "Valued Patron",
    customerPhone = appointment.customerPhone || "",
    services = [],
    staffName = "Specialist",
    discountAmount = 0,
    paymentMethod = "UPI / Cash",
  } = options;

  // 80mm width standard thermal roll (80mm x 170mm)
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [80, 170],
  });

  const pageWidth = 80;
  const invoiceNum = getFormattedInvoiceNumber(appointment, options.invoiceNumber);

  // Clean white thermal background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, 170, "F");

  let y = 8;
  doc.setFont("courier", "bold");
  doc.setFontSize(13);
  doc.setTextColor(0, 0, 0);
  doc.text("GLOW & GLAMOUR", pageWidth / 2, y, { align: "center" });

  y += 4.5;
  doc.setFontSize(8);
  doc.text("HAIR STUDIO & SPA", pageWidth / 2, y, { align: "center" });

  y += 4;
  doc.setFont("courier", "normal");
  doc.setFontSize(7);
  doc.text("Laxmi Nagar, Koregaon 415501", pageWidth / 2, y, { align: "center" });
  y += 3.5;
  doc.text(`Phone: ${SALON_PHONE}`, pageWidth / 2, y, { align: "center" });

  y += 4;
  doc.text("----------------------------------------", pageWidth / 2, y, { align: "center" });

  y += 4.5;
  doc.setFont("courier", "bold");
  doc.setFontSize(7.5);
  doc.text(`INVOICE: ${invoiceNum}`, 5, y);

  y += 4;
  doc.setFont("courier", "normal");
  doc.text(`DATE   : ${formatDate(appointment.date)} ${formatTime(appointment.startTime || appointment.time)}`, 5, y);

  y += 4;
  doc.text(`CLIENT : ${customerName.substring(0, 24)}`, 5, y);

  if (customerPhone) {
    y += 4;
    doc.text(`MOBILE : ${customerPhone}`, 5, y);
  }

  y += 4;
  doc.text(`STYLIST: ${staffName.substring(0, 24)}`, 5, y);

  y += 4;
  doc.text("----------------------------------------", pageWidth / 2, y, { align: "center" });

  y += 4;
  doc.setFont("courier", "bold");
  doc.text("ITEM                    DUR      AMOUNT", 5, y);

  y += 3;
  doc.setFont("courier", "normal");
  doc.text("----------------------------------------", pageWidth / 2, y, { align: "center" });

  const subtotal =
    appointment.priceAtBooking ||
    services.reduce((acc, s) => acc + (s.price || 0), 0) ||
    0;
  const finalPayable = Math.max(0, subtotal - discountAmount);

  const items = services.length > 0 ? services : [{ name: "Salon Treatment", price: finalPayable, durationMin: 30 }];

  items.forEach((item) => {
    y += 4.5;
    const itemName = item.name.substring(0, 18).padEnd(19, " ");
    const dur = `${(item as any).durationMin || 30}m`.padEnd(5, " ");
    const priceStr = `${item.price || 0}`.padStart(7, " ");
    doc.text(`${itemName} ${dur} ${priceStr}`, 5, y);
  });

  y += 4;
  doc.text("----------------------------------------", pageWidth / 2, y, { align: "center" });

  y += 4.5;
  doc.text(`SUBTOTAL                      Rs. ${subtotal.toFixed(2).padStart(8, " ")}`, 5, y);

  if (discountAmount > 0) {
    y += 4;
    doc.text(`DISCOUNT                     -Rs. ${discountAmount.toFixed(2).padStart(8, " ")}`, 5, y);
  }

  y += 4;
  const tax = (finalPayable - finalPayable / 1.18).toFixed(2);
  doc.text(`GST (18% INCLUSIVE)           Rs. ${tax.padStart(8, " ")}`, 5, y);

  y += 3.5;
  doc.text("----------------------------------------", pageWidth / 2, y, { align: "center" });

  y += 5;
  doc.setFont("courier", "bold");
  doc.setFontSize(10);
  doc.text("TOTAL AMOUNT", 5, y);
  doc.text(`Rs. ${finalPayable.toFixed(2)}`, pageWidth - 5, y, { align: "right" });

  y += 4.5;
  doc.setFontSize(7.5);
  doc.text(`PAYMENT: ${paymentMethod} [PAID]`, 5, y);

  y += 4;
  doc.setFont("courier", "normal");
  doc.text("----------------------------------------", pageWidth / 2, y, { align: "center" });

  y += 5;
  doc.setFont("courier", "bold");
  doc.setFontSize(8);
  doc.text("THANK YOU FOR YOUR VISIT!", pageWidth / 2, y, { align: "center" });

  y += 4;
  doc.setFont("courier", "normal");
  doc.setFontSize(7);
  doc.text("Hair · Skin · Spa · Aesthetics", pageWidth / 2, y, { align: "center" });
  y += 3.5;
  doc.text("Koregaon's Premier Salon Destination", pageWidth / 2, y, { align: "center" });

  const base64 = doc.output("datauristring");
  const blobUrl = String(doc.output("bloburl"));

  return { doc, base64, blobUrl };
}

/**
 * Prepares pre-filled WhatsApp billing message
 */
export function getWhatsAppShareMessage(options: InvoicePdfOptions): string {
  const { appointment, customerName = appointment.customerName, services = [] } = options;
  const subtotal = appointment.priceAtBooking || services.reduce((acc, s) => acc + (s.price || 0), 0) || 0;
  const serviceList = services.length > 0
    ? services.map(s => `• ${s.name} (₹${s.price})`).join("\n")
    : `• Salon Treatment (₹${subtotal})`;

  return `✨ *GLOW & GLAMOUR HAIR STUDIO & SPA* ✨\n` +
    `Laxmi Nagar, Koregaon | 📞 +91 70582 39061\n\n` +
    `Hello *${customerName}*,\n` +
    `Thank you for visiting Glow & Glamour! Here is your official service bill:\n\n` +
    `📄 *Invoice No:* ${getFormattedInvoiceNumber(appointment, options.invoiceNumber)}\n` +
    `📅 *Date:* ${formatDate(appointment.date)} (${formatTime(appointment.startTime || appointment.time)})\n` +
    `✂️ *Services Rendered:*\n${serviceList}\n\n` +
    `💰 *Total Amount Paid:* ₹${subtotal.toLocaleString("en-IN")}\n` +
    `✅ *Status:* Paid in Full\n\n` +
    `We look forward to pampering you again! For appointments or hair care consultations, message us here. Have a radiant day! ✨`;
}

/**
 * Backward compatible alias for generatePrintedInvoiceA4
 */
export async function generateInvoicePdf(
  options: InvoicePdfOptions
): Promise<{ doc: jsPDF; base64: string; blobUrl: string }> {
  return await generatePrintedInvoiceA4(options);
}

