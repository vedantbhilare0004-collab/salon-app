"use client";

import { useState } from "react";
import {
  Receipt,
  Download,
  Printer,
  Search,
  FileText,
  Calendar,
  User,
  Scissors,
  MessageCircle,
  Eye,
  Share2,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Clock,
  Smartphone,
} from "lucide-react";
import { useData } from "@/lib/store";
import { PageHeader, Section, EmptyState } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatDate, formatTime, formatPrice, numberToWords } from "@/lib/format";
import {
  generatePrintedInvoiceA4,
  generateWhatsAppDigitalPdf,
  generateCompactReceiptPdf,
  getWhatsAppShareMessage,
} from "@/lib/ticketService";
import { toast } from "sonner";
import type { Appointment, Service } from "@/lib/types";

export default function OwnerBillingPage() {
  const { appointments, services, users } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [previewAppt, setPreviewAppt] = useState<Appointment | null>(null);
  const [activeTab, setActiveTab] = useState<"a4" | "whatsapp" | "thermal">("a4");

  // Completed appointments are billable
  const completedList = appointments.filter(
    (a) => a.status === "completed" || a.status === "Completed"
  );

  const filteredList = completedList
    .filter((a) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        a.customerName.toLowerCase().includes(q) ||
        a.reference.toLowerCase().includes(q) ||
        a.customerPhone?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => (b.date + (b.startTime || b.time)).localeCompare(a.date + (a.startTime || a.time)));

  const getAppointmentDetails = (appointment: Appointment) => {
    const apptServices: Service[] = (appointment.serviceIds || [])
      .map((sId) => services.find((s) => s.id === sId))
      .filter(Boolean) as Service[];

    const customerUser = users.find(
      (u) => u.uid === appointment.customerUid || u.id === appointment.customerId
    );

    return {
      appointment,
      customerName: appointment.customerName,
      customerPhone: appointment.customerPhone,
      customerEmail: customerUser?.email,
      services: apptServices,
    };
  };

  // 1. Download Detailed A4 Invoice
  const handleDownloadA4 = async (appointment: Appointment) => {
    try {
      setDownloadingId(appointment.id);
      const details = getAppointmentDetails(appointment);
      const { doc } = await generatePrintedInvoiceA4(details);
      doc.save(`Invoice-A4-${appointment.reference || appointment.id}.pdf`);
      toast.success("Detailed A4 Invoice downloaded!");
    } catch (err) {
      console.error(err);
      toast.error("Could not generate A4 invoice PDF");
    } finally {
      setDownloadingId(null);
    }
  };

  // 1b. Print Detailed A4 Invoice
  const handlePrintA4 = async (appointment: Appointment) => {
    try {
      const details = getAppointmentDetails(appointment);
      const { blobUrl } = await generatePrintedInvoiceA4(details);
      const printWindow = window.open(blobUrl, "_blank");
      if (printWindow) printWindow.focus();
    } catch (err) {
      console.error(err);
      toast.error("Could not open A4 print preview");
    }
  };

  // 2. Download WhatsApp Digital Card PDF
  const handleDownloadDigital = async (appointment: Appointment) => {
    try {
      setDownloadingId(appointment.id);
      const details = getAppointmentDetails(appointment);
      const { doc } = await generateWhatsAppDigitalPdf(details);
      doc.save(`DigitalBill-${appointment.reference || appointment.id}.pdf`);
      toast.success("WhatsApp Digital PDF downloaded!");
    } catch (err) {
      console.error(err);
      toast.error("Could not generate digital invoice");
    } finally {
      setDownloadingId(null);
    }
  };

  // 2b. Share on WhatsApp Directly
  const handleShareWhatsApp = (appointment: Appointment) => {
    const details = getAppointmentDetails(appointment);
    const message = getWhatsAppShareMessage(details);
    const rawPhone = appointment.customerPhone || "";
    const cleanPhone = rawPhone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    const waUrl = formattedPhone
      ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(waUrl, "_blank");
    toast.success("Opening WhatsApp with formatted bill...");
  };

  // 3. Print Compact 80mm Thermal Slip
  const handlePrintThermal = async (appointment: Appointment) => {
    try {
      const details = getAppointmentDetails(appointment);
      const { blobUrl } = await generateCompactReceiptPdf(details);
      const printWindow = window.open(blobUrl, "_blank");
      if (printWindow) printWindow.focus();
    } catch (err) {
      console.error(err);
      toast.error("Could not open thermal slip print");
    }
  };

  const totalBilled = completedList.reduce((acc, a) => {
    const svcs = (a.serviceIds || []).map((sId) => services.find((s) => s.id === sId));
    const price = a.priceAtBooking || svcs.reduce((sum, s) => sum + (s?.price || 0), 0) || 0;
    return acc + price;
  }, 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 animate-in fade-in duration-300">
      <PageHeader
        title="Salon Billing & Official Tax Invoicing"
        subtitle="Manage, print, and share bills across 3 luxury formats: Detailed A4, WhatsApp Digital Slip, and 80mm Compact POS Receipt."
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 rounded-xl border border-[#E9E1D6] bg-[#FFFDFA] shadow-xs space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#74695E] block">
            Total Completed Appointments
          </span>
          <p className="text-2xl font-bold text-[#302A24]">{completedList.length}</p>
        </Card>
        <Card className="p-4 rounded-xl border border-[#E9E1D6] bg-[#FFFDFA] shadow-xs space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#74695E] block">
            Total Revenue Billed
          </span>
          <p className="text-2xl font-bold text-[#355B3C]">{formatPrice(totalBilled)}</p>
        </Card>
        <Card className="p-4 rounded-xl border border-[#E9E1D6] bg-[#FFFDFA] shadow-xs space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#74695E] block">
            Tax Invoices Ready
          </span>
          <p className="text-2xl font-bold text-[#A27C48]">{completedList.length}</p>
        </Card>
      </div>

      {/* Invoice Formats Guide Banner */}
      <div className="rounded-xl border border-[#E9E1D6] bg-[#FFFDFA] p-4 shadow-2xs">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-[#A27C48]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#302A24]">
            3 Available Salon Invoice Formats
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-[#FAF8F5] border border-[#EFE8DD] space-y-1">
            <span className="font-bold text-[#302A24] flex items-center gap-1.5">
              <Printer className="h-3.5 w-3.5 text-[#A27C48]" /> 1. Printed Bill (A4)
            </span>
            <p className="text-[11px] text-[#74695E] leading-relaxed">
              Full official tax invoice with customer details, appointment records, discounts, CGST/SGST taxes, and authorized salon signature.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-[#FAF8F5] border border-[#EFE8DD] space-y-1">
            <span className="font-bold text-[#302A24] flex items-center gap-1.5">
              <MessageCircle className="h-3.5 w-3.5 text-[#25D366]" /> 2. WhatsApp / Digital Slip
            </span>
            <p className="text-[11px] text-[#74695E] leading-relaxed">
              Polished digital invoice card formatted for smartphone screens. Instantly shareable on WhatsApp with pre-filled billing text.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-[#FAF8F5] border border-[#EFE8DD] space-y-1">
            <span className="font-bold text-[#302A24] flex items-center gap-1.5">
              <Receipt className="h-3.5 w-3.5 text-[#A27C48]" /> 3. Compact Thermal Receipt
            </span>
            <p className="text-[11px] text-[#74695E] leading-relaxed">
              Clean 80mm monospace POS receipt formatted for thermal counter roll printers without blank paper waste.
            </p>
          </div>
        </div>
      </div>

      {/* Main Billing Table Section */}
      <Section title="Completed Appointments & Invoices">
        <div className="mb-4 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#74695E]" />
            <Input
              placeholder="Search by client name, booking reference, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-[#FFFDFA] border-[#E9E1D6] rounded-md text-xs h-9"
            />
          </div>
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="text-xs text-[#74695E] hover:text-[#302A24]"
            >
              Clear
            </Button>
          )}
        </div>

        {filteredList.length === 0 ? (
          <EmptyState
            title="No Billable Invoices Found"
            description={
              searchQuery
                ? "No completed appointments match your search criteria."
                : "Completed appointments will automatically appear here for official billing and receipt generation."
            }
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#E9E1D6] bg-[#FFFDFA] shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[#F6F3ED] border-b border-[#E9E1D6] text-[#302A24] font-semibold text-xs">
                <tr>
                  <th className="p-3.5">Invoice #</th>
                  <th className="p-3.5">Guest Client</th>
                  <th className="p-3.5">Date &amp; Time</th>
                  <th className="p-3.5">Services Rendered</th>
                  <th className="p-3.5">Amount (₹)</th>
                  <th className="p-3.5 text-right">Generate &amp; Print</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9E1D6]">
                {filteredList.map((a) => {
                  const apptServices = (a.serviceIds || [])
                    .map((sId) => services.find((s) => s.id === sId))
                    .filter(Boolean) as Service[];
                  const price =
                    a.priceAtBooking || apptServices.reduce((acc, s) => acc + (s.price || 0), 0) || 0;
                  const invoiceNum = `INV-${a.reference || a.id.substring(0, 8).toUpperCase()}`;

                  return (
                    <tr key={a.id} className="hover:bg-[#F0EBE3]/50 transition-colors">
                      <td className="p-3.5 font-mono font-semibold text-[#A27C48]">
                        {invoiceNum}
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-[#302A24]">{a.customerName}</div>
                        <div className="text-[11px] text-[#74695E]">{a.customerPhone || "N/A"}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-medium text-[#302A24]">{formatDate(a.date)}</div>
                        <div className="text-[11px] text-[#74695E]">
                          {formatTime(a.startTime || a.time)}
                        </div>
                      </td>
                      <td className="p-3.5 max-w-[220px] truncate text-[#74695E]">
                        {apptServices.map((s) => s.name).join(", ") || "Treatment & Styling"}
                      </td>
                      <td className="p-3.5 font-bold text-[#302A24]">
                        {formatPrice(price)}
                      </td>
                      <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                        {/* 1. Preview Suite Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPreviewAppt(a)}
                          className="h-8 text-xs gap-1 rounded-md border-[#E9E1D6] text-[#302A24] hover:bg-[#F0EBE3] cursor-pointer"
                          title="Preview All 3 Invoice Formats"
                        >
                          <Eye className="h-3.5 w-3.5 text-[#A27C48]" /> View
                        </Button>

                        {/* 2. Quick A4 Print */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePrintA4(a)}
                          className="h-8 text-xs gap-1 rounded-md border-[#E9E1D6] text-[#302A24] hover:bg-[#F0EBE3] cursor-pointer"
                          title="Print Detailed A4 Tax Invoice"
                        >
                          <Printer className="h-3.5 w-3.5 text-[#74695E]" /> A4
                        </Button>

                        {/* 3. Quick WhatsApp Share */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShareWhatsApp(a)}
                          className="h-8 text-xs gap-1 rounded-md border-[#C7DCC2] bg-[#EBF3EC] text-[#25D366] hover:bg-[#D8EDDA] cursor-pointer"
                          title="Send Bill via WhatsApp"
                        >
                          <MessageCircle className="h-3.5 w-3.5 fill-[#25D366] text-white" /> WhatsApp
                        </Button>

                        {/* 4. Quick Thermal Slip */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePrintThermal(a)}
                          className="h-8 text-xs gap-1 rounded-md border-[#E9E1D6] text-[#74695E] hover:bg-[#F0EBE3] cursor-pointer"
                          title="Print 80mm Compact POS Receipt"
                        >
                          <Receipt className="h-3.5 w-3.5" /> POS
                        </Button>

                        {/* 5. A4 PDF Download */}
                        <Button
                          size="sm"
                          onClick={() => handleDownloadA4(a)}
                          disabled={downloadingId === a.id}
                          className="h-8 text-xs gap-1 rounded-md bg-[#A27C48] hover:bg-[#876438] text-white cursor-pointer transition-colors shadow-2xs"
                          title="Download A4 PDF Invoice"
                        >
                          <Download className="h-3.5 w-3.5" />
                          {downloadingId === a.id ? "Saving..." : "PDF"}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* Invoice Formats Preview Modal */}
      {previewAppt && (
        <Dialog open={!!previewAppt} onOpenChange={(open) => !open && setPreviewAppt(null)}>
          <DialogContent className="max-w-4xl bg-[#FAF8F5] border-[#E9E1D6] text-[#302A24] p-6 max-h-[92vh] overflow-y-auto">
            <DialogHeader className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#F0EBE3] text-[#A27C48] border border-[#E9E1D6]">
                  INV-{previewAppt.reference || previewAppt.id.slice(0, 8).toUpperCase()}
                </span>
                <span className="text-xs text-[#74695E]">· {previewAppt.customerName}</span>
              </div>
              <DialogTitle className="font-heading text-xl sm:text-2xl font-bold text-[#302A24]">
                Invoice &amp; Bill Generator Suite
              </DialogTitle>
              <DialogDescription className="text-xs text-[#74695E]">
                Select between the 3 official invoice formats for printing, customer sharing, or counter thermal roll receipt.
              </DialogDescription>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full pt-2">
              <TabsList className="grid grid-cols-3 bg-[#EFE8DD] p-1 rounded-lg">
                <TabsTrigger value="a4" className="text-xs font-semibold gap-1.5 data-[state=active]:bg-[#FFFDFA] data-[state=active]:shadow-xs">
                  <Printer className="h-3.5 w-3.5 text-[#A27C48]" />
                  <span>1. Printed Bill (A4)</span>
                </TabsTrigger>
                <TabsTrigger value="whatsapp" className="text-xs font-semibold gap-1.5 data-[state=active]:bg-[#FFFDFA] data-[state=active]:shadow-xs">
                  <MessageCircle className="h-3.5 w-3.5 text-[#25D366]" />
                  <span>2. WhatsApp / Digital</span>
                </TabsTrigger>
                <TabsTrigger value="thermal" className="text-xs font-semibold gap-1.5 data-[state=active]:bg-[#FFFDFA] data-[state=active]:shadow-xs">
                  <Receipt className="h-3.5 w-3.5 text-[#A27C48]" />
                  <span>3. Compact Receipt</span>
                </TabsTrigger>
              </TabsList>

              {/* TAB 1: DETAILED A4 INVOICE */}
              <TabsContent value="a4" className="space-y-4 pt-3">
                {/* Visual A4 Mockup Card */}
                <div className="rounded-xl border border-[#E9E1D6] bg-[#FFFDFA] p-6 shadow-sm space-y-6">
                  {/* Mockup A4 Header */}
                  <div className="bg-[#22201D] text-white p-5 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#A27C48]">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-md bg-[#A27C48] text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                        G&amp;G
                      </div>
                      <div>
                        <h4 className="text-sm font-bold tracking-wider">GLOW &amp; GLAMOUR HAIR STUDIO</h4>
                        <p className="text-[10px] text-[#E2C392]">LUXURY HAIR STUDIO &amp; SPA · KOREGAON</p>
                        <p className="text-[9px] text-[#A8A199] mt-0.5">Laxmi Nagar, Koregaon · Ph: +91 70582 39061</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-[#E2C392] block">TAX INVOICE</span>
                      <span className="font-mono text-xs font-semibold">INV-{previewAppt.reference || previewAppt.id.slice(0, 8).toUpperCase()}</span>
                      <p className="text-[10px] text-[#A8A199] mt-0.5">Date: {formatDate(previewAppt.date)}</p>
                    </div>
                  </div>

                  {/* Customer & Appointment Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-lg bg-[#FAF8F5] border border-[#E9E1D6] space-y-1">
                      <span className="text-[10px] font-bold text-[#A27C48] uppercase tracking-wider block">Billed To (Customer)</span>
                      <p className="font-bold text-[#302A24] text-sm">{previewAppt.customerName}</p>
                      <p className="text-[#74695E]">Phone: {previewAppt.customerPhone || "Not specified"}</p>
                      <p className="text-[#74695E]">Booking Ref: #{previewAppt.reference || previewAppt.id.slice(0, 8)}</p>
                    </div>
                    <div className="p-3.5 rounded-lg bg-[#FAF8F5] border border-[#E9E1D6] space-y-1">
                      <span className="text-[10px] font-bold text-[#A27C48] uppercase tracking-wider block">Appointment Record</span>
                      <p className="font-bold text-[#302A24] text-sm">{formatDate(previewAppt.date)} at {formatTime(previewAppt.startTime || previewAppt.time)}</p>
                      <p className="text-[#74695E]">Branch: Laxmi Nagar, Koregaon</p>
                      <p className="text-[#74695E]">Stylist: Senior Hair Specialist</p>
                    </div>
                  </div>

                  {/* Services List Table */}
                  <div className="border border-[#E9E1D6] rounded-lg overflow-hidden text-xs">
                    <div className="bg-[#22201D] text-white px-3 py-2 grid grid-cols-12 font-bold text-[11px]">
                      <span className="col-span-1 text-center">#</span>
                      <span className="col-span-6">Service / Treatment Description</span>
                      <span className="col-span-2 text-center">Duration</span>
                      <span className="col-span-3 text-right">Net Amount</span>
                    </div>
                    <div className="divide-y divide-[#E9E1D6] bg-[#FFFDFA]">
                      {((previewAppt.serviceIds || [])
                        .map((id) => services.find((s) => s.id === id))
                        .filter(Boolean) as Service[]).map((s, idx) => (
                        <div key={s.id || idx} className="px-3 py-2.5 grid grid-cols-12 text-[#302A24]">
                          <span className="col-span-1 text-center text-[#74695E]">{idx + 1}</span>
                          <span className="col-span-6 font-semibold">{s.name}</span>
                          <span className="col-span-2 text-center text-[#74695E]">{s.durationMin || 30} mins</span>
                          <span className="col-span-3 text-right font-bold">{formatPrice(s.price || 0)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary & Tax Breakdown */}
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 p-4 rounded-lg bg-[#FAF8F5] border border-[#E9E1D6] text-xs">
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#EBF3EC] text-[#355B3C] font-bold text-[10px]">
                        <CheckCircle2 className="h-3 w-3" /> PAID IN FULL
                      </span>
                      <p className="text-[10px] text-[#74695E] pt-1">
                        Amount in words: <span className="italic font-medium text-[#302A24]">{numberToWords(previewAppt.priceAtBooking || 1398)}</span>
                      </p>
                    </div>
                    <div className="w-full sm:w-64 space-y-1.5 text-right">
                      <div className="flex justify-between text-[#74695E]">
                        <span>Subtotal:</span>
                        <span className="font-medium text-[#302A24]">{formatPrice(previewAppt.priceAtBooking || 0)}</span>
                      </div>
                      <div className="flex justify-between text-[#74695E]">
                        <span>Taxes (18% GST Incl.):</span>
                        <span className="font-medium text-[#302A24]">
                          ₹{((previewAppt.priceAtBooking || 0) - (previewAppt.priceAtBooking || 0) / 1.18).toFixed(2)}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-[#E9E1D6] flex justify-between font-bold text-sm text-[#302A24]">
                        <span>Grand Total:</span>
                        <span className="text-[#A27C48] text-base">{formatPrice(previewAppt.priceAtBooking || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions for A4 */}
                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => handlePrintA4(previewAppt)}
                    className="gap-2 rounded-md border-[#E9E1D6] text-xs font-semibold h-10 hover:bg-[#F0EBE3]"
                  >
                    <Printer className="h-4 w-4" /> Print A4 Invoice
                  </Button>
                  <Button
                    onClick={() => handleDownloadA4(previewAppt)}
                    className="gap-2 rounded-md bg-[#A27C48] hover:bg-[#876438] text-white text-xs font-semibold h-10"
                  >
                    <Download className="h-4 w-4" /> Download A4 PDF
                  </Button>
                </div>
              </TabsContent>

              {/* TAB 2: WHATSAPP / DIGITAL BILL */}
              <TabsContent value="whatsapp" className="space-y-4 pt-3">
                <div className="max-w-md mx-auto rounded-xl border border-[#E9E1D6] bg-[#FFFDFA] p-5 shadow-sm space-y-4 text-center">
                  <div className="h-10 w-10 mx-auto rounded-full bg-[#A27C48] text-white font-bold flex items-center justify-center text-xs">
                    G&amp;G
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#302A24]">GLOW &amp; GLAMOUR HAIR STUDIO</h4>
                    <p className="text-[10px] text-[#A27C48] font-semibold">DIGITAL SERVICE RECEIPT</p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E9E1D6] space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-[#74695E]">Total Amount Paid</span>
                    <p className="text-2xl font-bold text-[#A27C48]">{formatPrice(previewAppt.priceAtBooking || 0)}</p>
                    <span className="inline-block px-2 py-0.5 rounded text-[9px] font-bold bg-[#EBF3EC] text-[#355B3C]">
                      PAID IN FULL
                    </span>
                  </div>

                  <div className="text-left text-xs space-y-2 p-3 bg-[#FAF8F5] rounded-lg border border-[#E9E1D6]">
                    <div className="flex justify-between">
                      <span className="text-[#74695E]">Client:</span>
                      <span className="font-semibold text-[#302A24]">{previewAppt.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#74695E]">Date &amp; Time:</span>
                      <span className="font-semibold text-[#302A24]">{formatDate(previewAppt.date)} ({formatTime(previewAppt.startTime || previewAppt.time)})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#74695E]">Invoice No:</span>
                      <span className="font-mono text-[#A27C48]">INV-{previewAppt.reference || previewAppt.id.slice(0, 8).toUpperCase()}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#74695E] italic">
                    Customers can instantly view this digital slip on WhatsApp, save to photos, or verify hair care records.
                  </p>
                </div>

                {/* Actions for WhatsApp */}
                <div className="flex items-center justify-center gap-3 pt-2">
                  <Button
                    onClick={() => handleShareWhatsApp(previewAppt)}
                    className="gap-2 rounded-md bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-semibold h-10 shadow-xs cursor-pointer"
                  >
                    <MessageCircle className="h-4 w-4 fill-white" /> Send Directly via WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDownloadDigital(previewAppt)}
                    className="gap-2 rounded-md border-[#E9E1D6] text-xs font-semibold h-10 hover:bg-[#F0EBE3]"
                  >
                    <Download className="h-4 w-4 text-[#A27C48]" /> Download Mobile Slip PDF
                  </Button>
                </div>
              </TabsContent>

              {/* TAB 3: COMPACT THERMAL RECEIPT */}
              <TabsContent value="thermal" className="space-y-4 pt-3">
                <div className="max-w-xs mx-auto rounded-lg border-2 border-dashed border-[#D8C7B0] bg-white p-5 font-mono text-[11px] text-black shadow-xs space-y-2">
                  <div className="text-center space-y-0.5">
                    <p className="font-bold text-xs tracking-wider">GLOW &amp; GLAMOUR</p>
                    <p className="text-[10px]">HAIR STUDIO &amp; SPA</p>
                    <p className="text-[9px] text-neutral-600">Laxmi Nagar, Koregaon 415501</p>
                    <p className="text-[9px] text-neutral-600">Ph: +91 70582 39061</p>
                  </div>
                  <div className="border-t border-dashed border-neutral-400 pt-1 space-y-0.5">
                    <p>INVOICE: INV-{previewAppt.reference || previewAppt.id.slice(0, 8).toUpperCase()}</p>
                    <p>DATE   : {formatDate(previewAppt.date)} {formatTime(previewAppt.startTime || previewAppt.time)}</p>
                    <p>CLIENT : {previewAppt.customerName}</p>
                    <p>STYLIST: Senior Stylist</p>
                  </div>
                  <div className="border-t border-dashed border-neutral-400 pt-1">
                    <div className="flex justify-between font-bold">
                      <span>ITEM</span>
                      <span>AMOUNT</span>
                    </div>
                    {((previewAppt.serviceIds || [])
                      .map((id) => services.find((s) => s.id === id))
                      .filter(Boolean) as Service[]).map((s, i) => (
                      <div key={i} className="flex justify-between text-[10px]">
                        <span className="truncate max-w-[140px]">{s.name}</span>
                        <span>Rs. {s.price}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-dashed border-neutral-400 pt-1 space-y-0.5">
                    <div className="flex justify-between font-bold">
                      <span>TOTAL AMOUNT:</span>
                      <span>Rs. {previewAppt.priceAtBooking || 0}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-neutral-600">
                      <span>PAYMENT STATUS:</span>
                      <span>PAID IN FULL</span>
                    </div>
                  </div>
                  <div className="border-t border-dashed border-neutral-400 pt-2 text-center text-[9px] text-neutral-600">
                    <p>THANK YOU FOR YOUR VISIT!</p>
                    <p>Hair · Skin · Spa · Aesthetics</p>
                  </div>
                </div>

                {/* Actions for Thermal */}
                <div className="flex items-center justify-center gap-3 pt-2">
                  <Button
                    onClick={() => handlePrintThermal(previewAppt)}
                    className="gap-2 rounded-md bg-[#302A24] hover:bg-black text-white text-xs font-semibold h-10 shadow-xs cursor-pointer"
                  >
                    <Printer className="h-4 w-4" /> Print 80mm POS Thermal Slip
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
