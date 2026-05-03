import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  // Pinning the API version protects us from breaking changes when Stripe ships updates.
  apiVersion: "2024-06-20",
  typescript: true,
  appInfo: {
    name: "Luxe Store",
    version: "0.4.0",
  },
});

/**
 * Helper to format Stripe webhook errors consistently.
 */
export function isStripeError(err: unknown): err is Stripe.errors.StripeError {
  return err instanceof Stripe.errors.StripeError;
}
