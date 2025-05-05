import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {

  const query = req.nextUrl.searchParams.get("API_ROUTE_SECRET");
  if(query !== process.env.API_ROUTE_SECRET) {
    return NextResponse.json({
      message: "APIを叩く権限がありません。"
    })
  }

  const data = await req.json();
  const { id, email } = data.record;

  console.log(data);

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const customer = await stripe.customers.create({
    email,
  });

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  await supabaseAdmin
    .from("profile")
    .update({
      stripe_customer: customer.id,
    })
    .eq("id", id);

  return NextResponse.json({
    message: `stripe customer created: ${customer.id}`,
  });
}
