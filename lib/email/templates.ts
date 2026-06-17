/**
 * Plain, dependency-free HTML email templates. Inline styles only — email
 * clients strip <style> blocks and external CSS unreliably, so every
 * style is written inline. Kept deliberately simple (no images, no
 * external fonts) to avoid spam-filter issues and rendering inconsistencies
 * across Gmail/Outlook/Apple Mail.
 */

const BRAND_GREEN = "#16a34a";
const BRAND_DARK = "#0d2818";

function wrapper(bodyHtml: string): string {
  return `
  <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="display: inline-flex; align-items: center; gap: 8px; font-size: 20px; font-weight: 700; color: ${BRAND_DARK};">
        🌱 EcoMate <span style="color: ${BRAND_GREEN};">AI</span>
      </span>
    </div>
    ${bodyHtml}
    <p style="margin-top: 32px; font-size: 12px; color: #9ca3af; text-align: center;">
      EcoMate AI — Digital Recycling Marketplace
    </p>
  </div>`;
}

function button(href: string, label: string): string {
  return `
  <div style="text-align: center; margin: 28px 0;">
    <a href="${href}" style="background-color: ${BRAND_GREEN}; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">
      ${label}
    </a>
  </div>`;
}

export function verificationEmail(verifyUrl: string, firstNameOrCompany: string) {
  const subject = "Verify your EcoMate AI email address";

  const html = wrapper(`
    <h1 style="font-size: 18px; color: ${BRAND_DARK};">Hi ${firstNameOrCompany},</h1>
    <p style="font-size: 14px; color: #374151; line-height: 1.6;">
      Thanks for signing up for EcoMate AI. Please confirm your email address
      to activate your account and start recycling, trading, and joining
      challenges.
    </p>
    ${button(verifyUrl, "Verify Email Address")}
    <p style="font-size: 12px; color: #6b7280; line-height: 1.6;">
      This link expires in 24 hours. If you didn't create an EcoMate AI
      account, you can safely ignore this email.
    </p>
    <p style="font-size: 12px; color: #9ca3af;">
      If the button doesn't work, copy and paste this link into your browser:<br/>
      <span style="word-break: break-all;">${verifyUrl}</span>
    </p>
  `);

  const text = `Hi ${firstNameOrCompany},

Thanks for signing up for EcoMate AI. Please confirm your email address by visiting:

${verifyUrl}

This link expires in 24 hours. If you didn't create an EcoMate AI account, you can safely ignore this email.`;

  return { subject, html, text };
}

export function passwordResetEmail(resetUrl: string, firstNameOrCompany: string) {
  const subject = "Reset your EcoMate AI password";

  const html = wrapper(`
    <h1 style="font-size: 18px; color: ${BRAND_DARK};">Hi ${firstNameOrCompany},</h1>
    <p style="font-size: 14px; color: #374151; line-height: 1.6;">
      We received a request to reset your EcoMate AI password. Click the
      button below to choose a new one.
    </p>
    ${button(resetUrl, "Reset Password")}
    <p style="font-size: 12px; color: #6b7280; line-height: 1.6;">
      This link expires in 1 hour. If you didn't request a password reset,
      you can safely ignore this email — your password will remain
      unchanged.
    </p>
    <p style="font-size: 12px; color: #9ca3af;">
      If the button doesn't work, copy and paste this link into your browser:<br/>
      <span style="word-break: break-all;">${resetUrl}</span>
    </p>
  `);

  const text = `Hi ${firstNameOrCompany},

We received a request to reset your EcoMate AI password. Visit this link to choose a new one:

${resetUrl}

This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.`;

  return { subject, html, text };
}
