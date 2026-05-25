import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Only protect dashboard routes. Everything else (landing /, sign-in, sign-up, api) is public.
const isProtectedRoute = createRouteMatcher([
  "/dashboard",
  "/dashboard/(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};