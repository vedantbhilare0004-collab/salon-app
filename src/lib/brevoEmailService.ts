/**
 * Brevo Transactional Email Engine (formerly Sendinblue)
 * Direct REST endpoint over standard fetch with fail-safe error handling.
 */

interface SendEmailOptions {
  toEmail: string;
  toName: string;
  subject: string;
  htmlContent: string;
  attachmentBase64?: string;
  attachmentFileName?: string;
}

export async function sendBrevoEmail(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    console.warn("[Brevo] BREVO_API_KEY is not configured in environment variables. Email skipping gracefully.");
    return { success: false, error: "BREVO_API_KEY missing" };
  }

  const senderEmail = process.env.BREVO_SENDER_EMAIL || "prathmeshbhilare52@gmail.com";
  const senderName = process.env.BREVO_SENDER_NAME || "Glow & Glamour Hair Studio";

  try {
    const payload: Record<string, any> = {
      sender: { name: senderName, email: senderEmail },
      to: [{ email: options.toEmail, name: options.toName }],
      subject: options.subject,
      htmlContent: options.htmlContent,
    };

    if (options.attachmentBase64 && options.attachmentFileName) {
      // Reliably extract raw base64 by splitting at ;base64,
      const cleanBase64 = options.attachmentBase64.includes(";base64,")
        ? options.attachmentBase64.split(";base64,").pop() || ""
        : options.attachmentBase64.replace(/^data:[^,]+,/, "");
      payload.attachment = [
        {
          name: options.attachmentFileName,
          content: cleanBase64,
        },
      ];
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("[Brevo] API Error:", response.status, errText);
      return { success: false, error: `Brevo error ${response.status}: ${errText}` };
    }

    const data = await response.json();
    return { success: true, messageId: data.messageId };
  } catch (error: any) {
    console.error("[Brevo] Dispatch error (fail-safe):", error);
    return { success: false, error: error.message };
  }
}

/**
 * Sends a rich booking confirmation email with attached PDF ticket.
 */
export async function sendBookingConfirmationEmail(data: {
  toEmail: string;
  customerName: string;
  appointmentId: string;
  reference: string;
  serviceName: string;
  date: string;
  time: string;
  pdfBase64?: string;
}) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #faf9f6; margin: 0; padding: 20px; color: #2B2B2B; }
        .card { max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 6px; border: 1px solid #ebe8e1; overflow: hidden; }
        .header { background-color: #2B2B2B; padding: 28px 24px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 20px; letter-spacing: 0.05em; font-weight: 600; }
        .header p { color: #E5D3B3; margin: 6px 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; }
        .content { padding: 32px 28px; }
        .greeting { font-size: 16px; font-weight: 600; margin-bottom: 12px; }
        .info-box { background-color: #faf9f5; border: 1px solid #f0ede5; border-radius: 4px; padding: 20px; margin: 20px 0; }
        .row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
        .row:last-child { margin-bottom: 0; }
        .label { color: #76736d; }
        .val { font-weight: 600; color: #2B2B2B; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #9a978f; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>GLOW &amp; GLAMOUR HAIR STUDIO</h1>
          <p>Beautiful Hair. Expert Care.</p>
        </div>
        <div class="content">
          <div class="greeting">Warm greetings, ${data.customerName}</div>
          <p style="font-size: 14px; line-height: 1.6; color: #4a4843;">
            Your appointment has been confirmed. Attached to this email is your official booking ticket with a scannable QR verification code.
          </p>
          <div class="info-box">
            <div class="row"><span class="label">Booking Ref:</span><span class="val">#${data.reference}</span></div>
            <div class="row"><span class="label">Service:</span><span class="val">${data.serviceName}</span></div>
            <div class="row"><span class="label">Date:</span><span class="val">${data.date}</span></div>
            <div class="row"><span class="label">Scheduled Time:</span><span class="val">${data.time}</span></div>
            <div class="row"><span class="label">Location:</span><span class="val">Laxmi Nagar, Koregaon</span></div>
          </div>
          <p style="font-size: 13px; color: #76736d; line-height: 1.5;">
            Please present your digital ticket QR code upon arrival at the salon reception for fast check-in.
          </p>
        </div>
        <div class="footer">
          Glow &amp; Glamour Hair Studio · Near ZP School, Laxmi Nagar, Koregaon · +91 70582 39061
        </div>
      </div>
    </body>
    </html>
  `;

  return sendBrevoEmail({
    toEmail: data.toEmail,
    toName: data.customerName,
    subject: `Reservation Confirmed: ${data.serviceName} (#${data.reference}) — Glow & Glamour`,
    htmlContent,
    attachmentBase64: data.pdfBase64,
    attachmentFileName: `Booking-${data.reference}.pdf`,
  });
}
