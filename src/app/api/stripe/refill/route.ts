import type { Profile } from "~/lib/types";

import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { appwriteClientService } from "~/lib/clients/appwrite-server";
import { getStripeInstance } from "~/lib/clients/stripe-server";
import { appwriteUrl } from "~/lib/envClient";
import { stripeRefillPrice } from "~/lib/envServer";

export async function GET(request: Request) {
  // Read JWT from Authorization header
  const authHeader = headers().get("Authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    console.log("stripe.subscription:", "JWT token missing");
    return new Response("JWT token missing", {
      status: 400,
    });
  }

  // Get user profile based on JWT
  const { sdkDatabases } = appwriteClientService(token);
  const { documents: profiles } = await sdkDatabases.listDocuments<Profile>("main", "profile");
  const profile = profiles[0];

  if (!profile) {
    console.log("stripe.subscription:", "Profile missing");
    return new Response("Cannot find profile for this token", {
      status: 404,
    });
  }

  const stripe = getStripeInstance();

  // User needs refill
  // Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    customer: profile.stripeCustomerId,

    mode: "payment",
    payment_method_types: ["card"],

    line_items: [
      {
        price: stripeRefillPrice,
        quantity: 1,
      },
    ],

    success_url: `${appwriteUrl}/payment/success`,
    cancel_url: `${appwriteUrl}/payment/cancel`,
  });

  console.log("stripe.subscription:", "OK");
  return NextResponse.json({ url: session.url });
}
