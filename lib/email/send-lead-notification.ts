import "server-only";
import { getResendClient } from "@/lib/email/resend";

interface LeadNotificationInput {
  name: string;
  email: string;
  phone: string;
  interest: string;
  message: string;
  to: string;
  adminUrl: string;
}

// Best-effort side effect: called from `after()` in submitLead, so it never
// delays or affects the lead-creation response. Every failure path (missing
// config, Resend API error, unexpected exception) logs and returns — it
// must never throw, or it risks surfacing as an unrelated server error long
// after the actual request/response cycle it was scheduled from.
export async function sendLeadNotificationEmail(input: LeadNotificationInput): Promise<void> {
  try {
    const resend = getResendClient();
    const fromEmail = process.env["RESEND_FROM_EMAIL"];
    if (!resend || !fromEmail) {
      console.error(
        "[lead-notification] skipped: RESEND_API_KEY or RESEND_FROM_EMAIL not configured",
      );
      return;
    }

    const { name, email, phone, interest, message, to, adminUrl } = input;

    // Lead fields are public, untrusted input — never interpolate them into
    // HTML unescaped (an email client rendering a crafted <img>/<a> from a
    // "message" field is the same class of risk as reflected XSS).
    const html = `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #292524;">
        <h2 style="margin-bottom: 24px;">Novo contato pelo site — La Linda</h2>
        <p><strong>Nome:</strong> ${escapeHtml(name)}</p>
        <p><strong>E-mail:</strong> ${escapeHtml(email)}</p>
        <p><strong>Telefone:</strong> ${escapeHtml(phone)}</p>
        <p><strong>Assunto:</strong> ${escapeHtml(interest)}</p>
        <p><strong>Mensagem:</strong><br/>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>
        <p style="margin-top: 24px;">
          <a href="${escapeHtml(adminUrl)}" style="color: #b45309;">Ver no painel administrativo</a>
        </p>
      </div>
    `;

    const text = [
      "Novo contato pelo site — La Linda",
      "",
      `Nome: ${name}`,
      `E-mail: ${email}`,
      `Telefone: ${phone}`,
      `Assunto: ${interest}`,
      `Mensagem: ${message}`,
      "",
      `Ver no painel: ${adminUrl}`,
    ].join("\n");

    const { error } = await resend.emails.send({
      from: fromEmail,
      to,
      subject: `Novo contato: ${name}`,
      html,
      text,
    });

    if (error) {
      console.error("[lead-notification] Resend returned an error:", error);
    }
  } catch (error) {
    console.error("[lead-notification] unexpected failure:", error);
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
