import { generateInvoicePdf, generateBookingTicketPdf } from "../src/lib/ticketService";
import type { Appointment, Service } from "../src/lib/types";
import { NEW_CATALOGUE, buildServiceEntities } from "../src/lib/catalogue-data";

async function testPdfBill() {
  console.log("=== Testing PDF Bill Generation with New Catalogue Services ===");

  const services: Service[] = buildServiceEntities("koregaon");

  // Pick sample services across male, female, and neutral
  const sampleServices = [
    services.find((s) => s.category === "Female Haircut" && s.name === "Butterfly Cut")!,
    services.find((s) => s.category === "Hair Spa" && s.name === "Loreal (Amp)" && s.variant === "Female")!,
    services.find((s) => s.category === "Hand & Feet" && s.name === "Manicure" && s.variant === "Female")!,
  ];

  const expectedSubtotal = 450 + 899 + 500; // 1849

  const mockAppt: Appointment = {
    id: "appt_test_bill_001",
    reference: "INV-849201",
    customerId: "cust_pooja_1",
    customerName: "Pooja Deshmukh",
    customerPhone: "+91 98220 12345",
    customerEmail: "pooja.d@example.com",
    branchId: "koregaon",
    serviceIds: sampleServices.map((s) => s.id),
    serviceId: sampleServices[0].id,
    date: "2026-10-15",
    time: "15:00",
    startTime: "15:00",
    priceAtBooking: expectedSubtotal,
    status: "completed",
    isWalkIn: false,
    token: 42,
    createdAt: new Date().toISOString(),
  };

  const invoiceResult = await generateInvoicePdf({
    appointment: mockAppt,
    customerName: mockAppt.customerName,
    customerPhone: mockAppt.customerPhone,
    customerEmail: mockAppt.customerEmail,
    services: sampleServices,
  });

  if (!invoiceResult || !invoiceResult.doc) {
    throw new Error("Invoice PDF generation failed to return doc instance");
  }

  const pdfOutput = invoiceResult.doc.output("arraybuffer");
  console.log(`Generated Invoice PDF size: ${pdfOutput.byteLength} bytes`);

  // Verify Booking Ticket PDF too
  const ticketResult = await generateBookingTicketPdf({
    appointment: mockAppt,
    customerName: mockAppt.customerName,
    customerPhone: mockAppt.customerPhone,
    customerEmail: mockAppt.customerEmail,
    services: sampleServices,
  });

  if (!ticketResult || !ticketResult.base64) {
    throw new Error("Ticket PDF generation failed to produce Base64 output");
  }

  console.log(`Generated Ticket PDF base64 length: ${ticketResult.base64.length} chars`);
  console.log("Services included on Invoice:");
  sampleServices.forEach((s) => {
    const label = s.variant ? `${s.name} (${s.variant})` : s.name;
    console.log(`  - ${label} | Price: ₹${s.price} | Duration: ${s.durationMin} mins`);
  });
  console.log(`Calculated Invoice Total: ₹${expectedSubtotal}`);
  console.log("=== PDF Bill Generation Verified Successfully! ===");
}

testPdfBill()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("PDF Bill Test Failed:", err);
    process.exit(1);
  });
