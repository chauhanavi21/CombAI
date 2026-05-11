import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface PurchaseConfirmationEmailProps {
  customerEmail: string;
  orderId: string;
  orderTotalCents: number;
  appName: string;
  appUrl: string;
  items: Array<{
    productTitle: string;
    variantName: string;
    priceCents: number;
    downloadUrl: string;
  }>;
}

const formatPrice = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    cents / 100
  );

export function PurchaseConfirmationEmail({
  customerEmail,
  orderId,
  orderTotalCents,
  appName,
  appUrl,
  items,
}: PurchaseConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Your {appName} order is ready · Download links inside
      </Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Brand header */}
          <Section style={headerStyle}>
            <Heading style={brandStyle}>
              {appName}
              <span style={{ color: "#B8956A" }}>.</span>
            </Heading>
          </Section>

          {/* Greeting */}
          <Section style={contentSection}>
            <Text style={eyebrowStyle}>ORDER CONFIRMED</Text>
            <Heading style={h1Style}>Thank you for your order.</Heading>
            <Text style={paragraphStyle}>
              Your purchase is ready. Tap any download button below to access
              your files. Links remain active for 90 days, but you can always
              regenerate fresh ones from your dashboard.
            </Text>
          </Section>

          {/* Order info */}
          <Section style={orderBoxStyle}>
            <Text style={orderLabelStyle}>ORDER</Text>
            <Text style={orderIdStyle}>#{orderId.slice(0, 8).toUpperCase()}</Text>
          </Section>

          {/* Line items */}
          {items.map((item, idx) => (
            <Section key={idx} style={itemSection}>
              <Heading style={itemTitleStyle}>{item.productTitle}</Heading>
              <Text style={itemMetaStyle}>
                {item.variantName} · {formatPrice(item.priceCents)}
              </Text>
              <Button href={item.downloadUrl} style={downloadButtonStyle}>
                Download
              </Button>
              <Text style={smallTextStyle}>
                If the button doesn't work, copy this link:{" "}
                <Link href={item.downloadUrl} style={linkStyle}>
                  {item.downloadUrl}
                </Link>
              </Text>
            </Section>
          ))}

          <Hr style={hrStyle} />

          {/* Total */}
          <Section style={totalSection}>
            <Text style={totalLabelStyle}>Total paid</Text>
            <Text style={totalValueStyle}>
              {formatPrice(orderTotalCents)}
            </Text>
          </Section>

          <Hr style={hrStyle} />

          {/* Dashboard CTA */}
          <Section style={ctaSection}>
            <Text style={paragraphStyle}>
              Access your purchase library anytime from your dashboard.
            </Text>
            <Button href={`${appUrl}/dashboard`} style={secondaryButtonStyle}>
              Open dashboard
            </Button>
          </Section>

          {/* Footer */}
          <Section style={footerStyle}>
            <Text style={footerTextStyle}>
              Questions about your order? Reply to this email and we'll get
              back within 24 hours.
            </Text>
            <Text style={footerSmallStyle}>
              You're receiving this because you placed an order with {appName}{" "}
              ({customerEmail}).
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles — using inline styles for max email client compatibility
const bodyStyle = {
  backgroundColor: "#FAFAF7",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  margin: 0,
  padding: 0,
};

const containerStyle = {
  maxWidth: "560px",
  margin: "0 auto",
  padding: "40px 24px",
};

const headerStyle = {
  paddingBottom: "32px",
  borderBottom: "1px solid #E8E6DD",
};

const brandStyle = {
  fontSize: "24px",
  fontWeight: 600,
  color: "#0F0E0C",
  margin: 0,
  letterSpacing: "-0.02em",
};

const contentSection = {
  paddingTop: "32px",
  paddingBottom: "16px",
};

const eyebrowStyle = {
  fontSize: "11px",
  fontWeight: 500,
  color: "#7B7768",
  letterSpacing: "0.15em",
  textTransform: "uppercase" as const,
  margin: "0 0 12px 0",
};

const h1Style = {
  fontSize: "32px",
  fontWeight: 500,
  color: "#0F0E0C",
  margin: "0 0 16px 0",
  lineHeight: 1.2,
  letterSpacing: "-0.02em",
};

const paragraphStyle = {
  fontSize: "15px",
  lineHeight: 1.6,
  color: "#514E44",
  margin: "0 0 16px 0",
};

const orderBoxStyle = {
  padding: "16px 20px",
  backgroundColor: "#F4F3EE",
  borderRadius: "12px",
  margin: "24px 0",
};

const orderLabelStyle = {
  fontSize: "10px",
  fontWeight: 500,
  color: "#7B7768",
  letterSpacing: "0.15em",
  textTransform: "uppercase" as const,
  margin: "0 0 4px 0",
};

const orderIdStyle = {
  fontFamily: "monospace",
  fontSize: "14px",
  color: "#0F0E0C",
  margin: 0,
};

const itemSection = {
  padding: "24px 0",
  borderBottom: "1px solid #E8E6DD",
};

const itemTitleStyle = {
  fontSize: "20px",
  fontWeight: 500,
  color: "#0F0E0C",
  margin: "0 0 4px 0",
  letterSpacing: "-0.01em",
};

const itemMetaStyle = {
  fontSize: "14px",
  color: "#7B7768",
  margin: "0 0 16px 0",
};

const downloadButtonStyle = {
  backgroundColor: "#0F0E0C",
  color: "#FAFAF7",
  fontSize: "14px",
  fontWeight: 500,
  padding: "12px 24px",
  borderRadius: "999px",
  textDecoration: "none",
  display: "inline-block",
};

const secondaryButtonStyle = {
  backgroundColor: "transparent",
  color: "#0F0E0C",
  fontSize: "14px",
  fontWeight: 500,
  padding: "12px 24px",
  borderRadius: "999px",
  textDecoration: "none",
  display: "inline-block",
  border: "1px solid #C9C5B6",
};

const smallTextStyle = {
  fontSize: "12px",
  color: "#A5A090",
  marginTop: "12px",
  wordBreak: "break-all" as const,
};

const linkStyle = {
  color: "#9A7A52",
  textDecoration: "underline",
};

const hrStyle = {
  border: "none",
  borderTop: "1px solid #E8E6DD",
  margin: "32px 0",
};

const totalSection = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const totalLabelStyle = {
  fontSize: "14px",
  color: "#514E44",
  margin: 0,
  display: "inline-block",
};

const totalValueStyle = {
  fontSize: "22px",
  fontWeight: 500,
  color: "#0F0E0C",
  margin: 0,
  letterSpacing: "-0.01em",
  float: "right" as const,
};

const ctaSection = {
  paddingTop: "16px",
  paddingBottom: "32px",
};

const footerStyle = {
  paddingTop: "32px",
  borderTop: "1px solid #E8E6DD",
};

const footerTextStyle = {
  fontSize: "13px",
  color: "#7B7768",
  margin: "0 0 16px 0",
  lineHeight: 1.5,
};

const footerSmallStyle = {
  fontSize: "11px",
  color: "#A5A090",
  margin: 0,
  lineHeight: 1.5,
};

export default PurchaseConfirmationEmail;
