import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseRouteHnadlerClient } from "@/utils/supabaseRouteHandlerClients";

export async function GET() {
  const supabase = supabaseRouteHnadlerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) {
    return NextResponse.json("Unauthorized", { status: 401 });
  }

  const { data: stripe_customer_data, error } = await supabase
    .from("profile")
    .select("stripe_customer")
    .eq("id", user.id)
    .single();

  if (error || !stripe_customer_data?.stripe_customer) {
    return NextResponse.json(
      { error: "Stripe customer ID not found" },
      { status: 400 }
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const session = await stripe.billingPortal.sessions.create({
    customer: stripe_customer_data.stripe_customer,
    return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
  });

  return NextResponse.json({ url: session.url });
}
