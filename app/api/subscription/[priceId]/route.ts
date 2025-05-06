import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseRouteHnadlerClient } from "@/utils/supabaseRouteHandlerClients";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const priceId = url.pathname.split("/").pop(); // [priceId] をパスから抽出

  if (!priceId) {
    return NextResponse.json({ error: "Missing priceId" }, { status: 400 });
  }

  const supabase = supabaseRouteHnadlerClient();
  const { data, error: userError } = await supabase.auth.getUser();
  const user = data.user;

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: stripe_customer_data, error: profileError } = await supabase
    .from("profile")
    .select("stripe_customer")
    .eq("id", user.id)
    .single();

  if (profileError || !stripe_customer_data?.stripe_customer) {
    return NextResponse.json(
      { error: "Stripe customer ID not found" },
      { status: 400 }
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const session = await stripe.checkout.sessions.create({
    customer: stripe_customer_data.stripe_customer,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/canceled`,
  });

  return NextResponse.json({ id: session.id });
}
