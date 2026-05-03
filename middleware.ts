import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/admin(.*)",
  "/api/admin(.*)",
]);

// Routes that should NEVER hit Clerk — webhooks need raw body access
// and have their own signature-based auth.
const isPublicApiRoute = createRouteMatcher([
  "/api/webhooks/(.*)",
  "/api/checkout",
]);

export default clerkMiddleware(async (auth, req) => {
  // Let public API routes through without any Clerk processing
  if (isPublicApiRoute(req)) {
    return;
  }

  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
