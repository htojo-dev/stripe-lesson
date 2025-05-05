import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const signature = req.headers.get("stripe-signature");
  const endpointSecret = process.env.STRIPE_SIGNING_SECRET;

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const reqBuffer = Buffer.from(await req.arrayBuffer());

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      reqBuffer,
      signature!,
      endpointSecret!
    );

    console.log(event);
    switch (event.type) {
      case "customer.subscription.created":
        const customerSubscriptionCreated = event.data.object;
        await supabaseAdmin
          .from("profile")
          .update({
            is_subscribed: true,
            interval: customerSubscriptionCreated.items.data[0].plan.interval,
          })
          .eq("stripe_customer", event.data.object.customer);
        break;
      case "customer.subscription.updated":
        const customerSubscriptionUpdated = event.data.object;

        if (customerSubscriptionUpdated.status === "canceled") {
          await supabaseAdmin
            .from("profile")
            .update({
              is_subscribed: false,
              interval: null,
            })
            .eq("stripe_customer", event.data.object.customer);
          break;
        } else {
          await supabaseAdmin
            .from("profile")
            .update({
              is_subscribed: true,
              interval: customerSubscriptionUpdated.items.data[0].plan.interval,
            })
            .eq("stripe_customer", event.data.object.customer);
          break;
        }
      case "customer.subscription.deleted":
        await supabaseAdmin
          .from("profile")
          .update({
            is_subscribed: false,
            interval: null,
          })
          .eq("stripe_customer", event.data.object.customer);
        break;
    }
    return NextResponse.json({ recieved: true });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json(`webhook Error: ${err.message}`, {
        status: 401,
      });
    }
    return NextResponse.json("Unknown webhook error", { status: 401 });
  }
}
