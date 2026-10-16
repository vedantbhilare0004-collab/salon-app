"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Check, Copy, ExternalLink, FileSpreadsheet, HelpCircle, ShieldCheck, Sparkles, Trash2 } from "lucide-react";

export const GOOGLE_APPS_SCRIPT_CODE = `function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    var records = data.records || [];
    
    if (records.length === 0) {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        added: 0,
        skipped: 0,
        message: "No records to export"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Column Headers for detailed salon booking analytics
    var headers = [
      "Booking Ref",
      "Date",
      "Time",
      "Customer Name",
      "Phone",
      "Email",
      "Services Booked",
      "Stylist / Staff",
      "Total Earning (₹)",
      "Status",
      "Payment Mode",
      "Exported At"
    ];
    
    var lastRow = sheet.getLastRow();
    
    // Create header row if empty sheet
    if (lastRow === 0) {
      sheet.appendRow(headers);
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#302A24");
      headerRange.setFontColor("#FFFDFA");
      headerRange.setFontWeight("bold");
      headerRange.setFontFamily("Inter");
      sheet.setFrozenRows(1);
      lastRow = 1;
    }
    
    // Read all existing Booking References from Column A to PREVENT DUPLICATES
    var existingRefs = {};
    if (lastRow > 1) {
      var refValues = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
      for (var i = 0; i < refValues.length; i++) {
        var ref = String(refValues[i][0]).trim();
        if (ref) {
          existingRefs[ref] = true;
        }
      }
    }
    
    var addedCount = 0;
    var skippedCount = 0;
    var rowsToAppend = [];
    var nowTimestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "GMT+5:30", "dd MMM yyyy, hh:mm a");
    
    for (var j = 0; j < records.length; j++) {
      var rec = records[j];
      var bookingRef = String(rec.reference || rec.id || "").trim();
      
      // Strict Deduplication Check: Skip if reference already exists
      if (existingRefs[bookingRef]) {
        skippedCount++;
        continue;
      }
      
      rowsToAppend.push([
        bookingRef,
        rec.date || "",
        rec.time || "",
        rec.customerName || "Walk-in Guest",
        rec.customerPhone || "-",
        rec.customerEmail || "-",
        rec.services || "General Salon Service",
        rec.stylistName || "General Team",
        rec.totalAmount || 0,
        rec.status || "Completed",
        rec.paymentMode || "Direct",
        nowTimestamp
      ]);
      
      // Mark as added to prevent in-batch duplicates
      existingRefs[bookingRef] = true;
      addedCount++;
    }
    
    // Append rows if any new records exist
    if (rowsToAppend.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, rowsToAppend.length, headers.length).setValues(rowsToAppend);
      for (var col = 1; col <= headers.length; col++) {
        sheet.autoResizeColumn(col);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      added: addedCount,
      skipped: skippedCount,
      total: records.length,
      message: "Synced " + addedCount + " new record(s). " + skippedCount + " existing record(s) skipped (no duplicates)."
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    service: "Glow & Glamour Google Sheets Sync Service"
  })).setMimeType(ContentService.MimeType.JSON);
}`;

export function GoogleSheetDialog({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (url: string) => void;
}) {
  const DEFAULT_WEBHOOK =
    process.env.NEXT_PUBLIC_GOOGLE_SHEETS_WEBHOOK_URL ||
    "https://script.google.com/macros/s/AKfycbxkzev3KbzN6xxVSl1DLORA4cGVXbO6IfgFCrv3jCf74RoCJg-vCfmSICDnpB-2NKh_/exec";

  const [url, setUrl] = useState("");
  const [testing, setTesting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showScript, setShowScript] = useState(false);

  useEffect(() => {
    if (open) {
      const stored = localStorage.getItem("gg_google_sheet_webhook") || DEFAULT_WEBHOOK;
      setUrl(stored);
    }
  }, [open, DEFAULT_WEBHOOK]);

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopied(true);
    toast.success("Google Apps Script code copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSave = () => {
    const trimmed = url.trim();
    if (!trimmed) {
      toast.error("Please enter a valid Google Apps Script Web App URL.");
      return;
    }
    if (!trimmed.startsWith("https://script.google.com/")) {
      toast.error("URL must start with https://script.google.com/");
      return;
    }
    localStorage.setItem("gg_google_sheet_webhook", trimmed);
    toast.success("Google Sheet Webhook URL saved successfully!");
    onSaved?.(trimmed);
    onOpenChange(false);
  };

  const handleClear = () => {
    localStorage.removeItem("gg_google_sheet_webhook");
    setUrl("");
    toast.info("Google Sheet Webhook disconnected.");
    onSaved?.("");
  };

  const handleTestConnection = async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      toast.error("Please enter a Web App URL first.");
      return;
    }
    setTesting(true);
    try {
      const res = await fetch("/api/owner/sync-sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          webhookUrl: trimmed,
          records: [
            {
              reference: "TEST-PING",
              date: new Date().toISOString().split("T")[0],
              time: "12:00 PM",
              customerName: "G&G Connection Test",
              customerPhone: "0000000000",
              customerEmail: "test@glowandglamour.com",
              services: "Connection Verification",
              stylistName: "System",
              totalAmount: 0,
              status: "Completed",
              paymentMode: "Test",
            },
          ],
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Connection verified! Google Sheet is active and responding.");
      } else {
        toast.error(data.error || "Could not connect to Google Sheet. Check your script deployment.");
      }
    } catch (e: any) {
      toast.error("Connection failed: " + (e.message || "Network error"));
    } finally {
      setTesting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24] rounded-none max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-[#A27C48] mb-1">
            <FileSpreadsheet className="h-5 w-5" />
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase">100% Free Integration</span>
          </div>
          <DialogTitle className="text-xl font-semibold text-[#302A24]">
            Connect Google Sheet
          </DialogTitle>
          <DialogDescription className="text-xs text-[#74695E]">
            Export completed appointments, earnings, customer details, and stylist productivity directly to your Google Sheet with zero duplicate entries.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Webhook Input */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-[#74695E]">
              Google Apps Script Web App URL
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="https://script.google.com/macros/s/.../exec"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="rounded-none border-[#E9E1D6] bg-[#FFFDFA] text-xs text-[#302A24] focus-visible:ring-[#A27C48] font-mono"
              />
              {url && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  className="rounded-none border-[#E9E1D6] text-[#8C3930] hover:bg-[#F7E7E3] px-3 shrink-0"
                  title="Disconnect URL"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-[11px] text-[#74695E]">
              Your webhook URL is stored securely in your browser and will never be shared.
            </p>
          </div>

          {/* Quick Setup Instructions */}
          <div className="rounded-none border border-[#E9E1D6] bg-[#F0EBE3]/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#302A24] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-[#A27C48]" /> 60-Second Setup (100% Free)
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyCode}
                className="h-7 text-xs rounded-none border-[#A27C48] text-[#A27C48] hover:bg-[#A27C48] hover:text-white transition-all gap-1.5 font-medium"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied Script!" : "Copy Free Script Code"}
              </Button>
            </div>

            <ol className="text-xs text-[#74695E] space-y-2 list-decimal list-inside leading-relaxed">
              <li>
                Create or open any Google Sheet at{" "}
                <a
                  href="https://sheets.new"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[#A27C48] underline inline-flex items-center gap-0.5"
                >
                  sheets.new <ExternalLink className="h-3 w-3 inline" />
                </a>
              </li>
              <li>
                Click <strong>Extensions</strong> → <strong>Apps Script</strong> in the top menu.
              </li>
              <li>
                Delete any existing placeholder text, paste the copied script code, and click <strong>Save</strong> (💾).
              </li>
              <li>
                Click <strong>Deploy</strong> (top right) → <strong>New deployment</strong>.
                <div className="pl-4 pt-1 space-y-0.5 text-[11px] text-[#302A24]">
                  • Select type: <strong>Web app</strong><br />
                  • Execute as: <strong>Me</strong><br />
                  • Who has access: <strong>Anyone</strong>
                </div>
              </li>
              <li>
                Click <strong>Deploy</strong>, authorize permissions, and copy the <strong>Web app URL</strong>.
              </li>
              <li>Paste the URL in the box above and click <strong>Save & Connect</strong>!</li>
            </ol>

            {/* Collapsible script preview */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowScript(!showScript)}
                className="text-[11px] font-semibold text-[#A27C48] hover:underline flex items-center gap-1"
              >
                {showScript ? "Hide Script Preview" : "View / Inspect Apps Script Code"}
              </button>
              {showScript && (
                <div className="mt-2 p-3 bg-[#302A24] text-[#FFFDFA] font-mono text-[10px] rounded-none overflow-x-auto max-h-48 border border-[#E9E1D6]">
                  <pre>{GOOGLE_APPS_SCRIPT_CODE}</pre>
                </div>
              )}
            </div>
          </div>

          {/* Deduplication Guarantee Note */}
          <div className="flex items-start gap-2.5 p-3 rounded-none border border-[#E0EBDD] bg-[#E0EBDD]/40 text-[#355B3C] text-xs">
            <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Automatic Deduplication Guarantee</p>
              <p className="text-[11px] text-[#355B3C]/90 mt-0.5 leading-normal">
                Every booking has a unique reference number (e.g. GNG-7291). The script scans existing rows before adding. If a booking already exists in your sheet, it is automatically skipped. You can safely click sync anytime without duplicate rows!
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          {url && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestConnection}
              disabled={testing}
              className="rounded-none border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24] hover:bg-[#F0EBE3]"
            >
              {testing ? "Testing..." : "Test Connection"}
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="rounded-none border-[#E9E1D6] bg-[#FFFDFA] text-[#74695E] hover:bg-[#F0EBE3]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            className="rounded-none bg-[#A27C48] hover:bg-[#876438] text-white font-medium"
          >
            Save &amp; Connect
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
