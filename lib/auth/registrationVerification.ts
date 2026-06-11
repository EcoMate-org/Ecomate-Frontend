/**
 * Company / NGO registration-number verification.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * RESEARCH SUMMARY — Verifying registered Nigerian companies (CAC)
 * ─────────────────────────────────────────────────────────────────────────
 * The Corporate Affairs Commission (CAC) runs the Companies Registration
 * Portal (https://cac.gov.ng) where RC/BN numbers can be searched, but it is
 * a web UI only — there is **no free, official public API**, and automated
 * bulk access is disallowed by its terms of service.
 *
 * Verification is therefore only available through commercial KYB providers,
 * all of which require a **paid API key**:
 *   • Dojah      POST https://api.dojah.io/api/v1/kyc/cac/basic   (rc_number, company_type)
 *   • VerifyMe   POST https://vapi.verifyme.ng/v1/verifications/identities/cac
 *   • Prembly / IdentityPass, Youverify, SourceID — similar paid endpoints.
 *
 * Because none of these are reliable *public* (key-free) APIs, registration
 * numbers are currently validated for **uniqueness only** (enforced by the
 * Prisma `@unique` constraint on `User.registrationNumber` plus a pre-insert
 * check in the register route).
 *
 * ─────────────────────────────────────────────────────────────────────────
 * FUTURE INTEGRATION POINT
 * ─────────────────────────────────────────────────────────────────────────
 * When you obtain a KYB provider key, set the env vars below and implement the
 * real lookup inside `verifyWithProvider`. The register route already calls
 * `verifyRegistrationNumber` and stores the boolean result on `User.isVerified`,
 * so enabling real verification requires no changes elsewhere.
 *
 *   CAC_VERIFICATION_ENABLED=true
 *   CAC_PROVIDER=dojah              # or "verifyme"
 *   CAC_PROVIDER_API_KEY=...        # secret key from the provider
 *   CAC_PROVIDER_APP_ID=...         # Dojah app id, if applicable
 */

import type { SessionRole } from "./session";

export type RegistrationVerificationResult = {
  /** Whether the number was confirmed against an external registry. */
  verified: boolean;
  /** Which provider performed the check, or null when uniqueness-only. */
  provider: string | null;
  /** Human-readable explanation, useful for logging / UI. */
  detail: string;
};

function isVerificationEnabled(): boolean {
  return (
    process.env.CAC_VERIFICATION_ENABLED === "true" &&
    !!process.env.CAC_PROVIDER_API_KEY
  );
}

/**
 * Placeholder for the real KYB provider call. Implement this when a key is
 * available. Kept isolated so the register flow never has to change.
 */
async function verifyWithProvider(
  registrationNumber: string,
  role: SessionRole,
): Promise<RegistrationVerificationResult> {
  // Example (Dojah) — left intentionally unimplemented until a key exists:
  //
  // const res = await fetch("https://api.dojah.io/api/v1/kyc/cac/basic?" +
  //   new URLSearchParams({ rc_number: registrationNumber, company_type: "COMPANY" }), {
  //   headers: {
  //     Authorization: process.env.CAC_PROVIDER_API_KEY!,
  //     AppId: process.env.CAC_PROVIDER_APP_ID!,
  //   },
  // });
  // const data = await res.json();
  // return { verified: res.ok && !!data?.entity?.rc_number, provider: "dojah", detail: ... };

  void registrationNumber;
  void role;
  return {
    verified: false,
    provider: process.env.CAC_PROVIDER ?? null,
    detail: "Provider verification not implemented.",
  };
}

/**
 * Verify a registration number for an NGO/COMPANY signup.
 *
 * Today this returns `verified: false` (uniqueness-only mode). Uniqueness
 * itself is enforced separately by the database `@unique` constraint and the
 * register route's pre-insert check.
 */
export async function verifyRegistrationNumber(
  registrationNumber: string,
  role: SessionRole,
): Promise<RegistrationVerificationResult> {
  if (isVerificationEnabled()) {
    try {
      return await verifyWithProvider(registrationNumber, role);
    } catch (err) {
      console.error("Registration verification provider failed:", err);
      return {
        verified: false,
        provider: process.env.CAC_PROVIDER ?? null,
        detail: "Provider request failed; falling back to uniqueness-only.",
      };
    }
  }

  return {
    verified: false,
    provider: null,
    detail:
      "No public CAC API available — registration number stored and validated for uniqueness only.",
  };
}
