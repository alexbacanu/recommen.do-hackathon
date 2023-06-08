// Appwrite
export const appwriteEndpoint =
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? process.env.PLASMO_PUBLIC_APPWRITE_ENDPOINT ?? "";
export const appwriteProject =
  process.env.NEXT_PUBLIC_APPWRITE_PROJECT ?? process.env.PLASMO_PUBLIC_APPWRITE_PROJECT ?? "";

// Stripe
export const stripePublishableKey =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? process.env.PLASMO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
