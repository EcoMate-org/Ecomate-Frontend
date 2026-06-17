import nodemailer from "nodemailer";

/**
 * Gmail SMTP transport for transactional emails (verification, password
 * reset). No third-party email service required — just a Gmail account
 * with an "App Password" generated.
 *
 * Setup (one-time, per Gmail account used to send mail):
 *   1. Enable 2-Step Verification on the Gmail account:
 *      https://myaccount.google.com/security
 *   2. Generate an App Password:
 *      https://myaccount.google.com/apppasswords
 *      (Select app: "Mail", device: "Other" → name it "EcoMate")
 *   3. Set environment variables:
 *      GMAIL_USER=your.address@gmail.com
 *      GMAIL_APP_PASSWORD=the16characterapppassword   (no spaces)
 *      APP_BASE_URL=http://localhost:3000              (or your deployed URL)
 *
 * Gmail SMTP has a sending limit (~500/day for regular Gmail accounts),
 * which is more than sufficient for development and small-scale MVP use.
 * Unlike Resend's sandbox sender, Gmail SMTP delivers to ANY recipient
 * address without needing to verify a domain first — useful for testing
 * signup/reset flows with multiple teammate or test accounts.
 */

const globalForMailer = globalThis as unknown as {
  mailer: nodemailer.Transporter | undefined;
};

function createTransport(): nodemailer.Transporter {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error(
      "GMAIL_USER and GMAIL_APP_PASSWORD must be set to send email. " +
        "See lib/email/mailer.ts for setup instructions.",
    );
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

export const mailer = globalForMailer.mailer ?? createTransport();

if (process.env.NODE_ENV !== "production") {
  globalForMailer.mailer = mailer;
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Sends an email via the Gmail SMTP transport. Throws on failure — callers
 * should catch and decide whether to surface an error to the user or log
 * and continue (e.g. don't block signup entirely if email delivery fails;
 * offer a "resend verification" option instead).
 */
export async function sendEmail({ to, subject, html, text }: SendEmailOptions): Promise<void> {
  const from = process.env.GMAIL_USER;
  await mailer.sendMail({ from: `EcoMate AI <${from}>`, to, subject, html, text });
}