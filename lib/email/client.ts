import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.warn("RESEND_API_KEY is not set — emails will not send");
}

export const resend = new Resend(resendApiKey ?? "placeholder");

export const RESEND_FROM = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "Luxe";
