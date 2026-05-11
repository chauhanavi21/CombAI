import { resend, RESEND_FROM, APP_NAME } from "./client";
import { PurchaseConfirmationEmail } from "./templates/purchase-confirmation";

interface SendPurchaseConfirmationArgs {
  to: string;
  orderId: string;
  orderTotalCents: number;
  items: Array<{
    productTitle: string;
    variantName: string;
    priceCents: number;
    downloadUrl: string;
  }>;
}

export async function sendPurchaseConfirmation({
  to,
  orderId,
  orderTotalCents,
  items,
}: SendPurchaseConfirmationArgs): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const { error } = await resend.emails.send({
      from: `${APP_NAME} <${RESEND_FROM}>`,
      to,
      subject: `Your ${APP_NAME} order is ready`,
      react: PurchaseConfirmationEmail({
        customerEmail: to,
        orderId,
        orderTotalCents,
        appName: APP_NAME,
        appUrl,
        items,
      }),
    });

    if (error) {
      console.error("Failed to send purchase confirmation:", error);
      // We don't throw — webhook should still succeed even if email fails.
      // Buyer can re-download from dashboard.
      return;
    }

    console.log(`📧 Purchase confirmation sent to ${to} for order ${orderId}`);
  } catch (err) {
    console.error("Email send error:", err);
  }
}
