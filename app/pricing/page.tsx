import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SupabaseClient } from "@supabase/auth-helpers-nextjs";
import React from "react";
import Stripe from "stripe";
import { Database } from "@/lib/database.types";
import SubscripitonButton from "@/components/checkout/SubscriptionButton";
import AuthServerButton from "@/components/auth/AuthServerButton";
import Link from "next/link";
import { supabaseServer } from "@/utils/supabaseServer";

interface Plan {
  id: string;
  name: string;
  price: string | null;
  interval: Stripe.Price.Recurring.Interval | null;
  currency: string;
}

const getAllPlans = async (): Promise<Plan[]> => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const { data: plansList } = await stripe.plans.list();

  const plans = await Promise.all(
    plansList.map(async (plan) => {
      const product = await stripe.products.retrieve(plan.product as string);
      return {
        id: plan.id,
        name: product.name,
        price: plan.amount_decimal,
        interval: plan.interval,
        currency: plan.currency,
      };
    })
  );

  const sortedPlans = plans.sort(
    (a, b) => parseInt(a.price!) - parseInt(b.price!)
  );

  return sortedPlans;
};

const getProfileData = async (supabase: SupabaseClient<Database>) => {
  const { data: profile } = await supabase.from("profile").select("*").single();
  return profile;
};

const PricingPage = async () => {
  const supabase = supabaseServer();
  const { data: user } = await supabase.auth.getSession();

  const [plans, profile] = await Promise.all([
    getAllPlans(),
    getProfileData(supabase),
  ]);

  const showSubscribeButton =
    !!user.session && profile?.is_subscribed === false;
  const showCreateAccountButton = !user.session;
  const showManageSubscriptionButton =
    !!user.session && profile?.is_subscribed === true;

  return (
    <div className="w-full max-w-3xl mx-auto py-16 flex justify-around">
      {plans.map((plan) => (
        <Card className="shadow-md" key={plan.id}>
          <CardHeader>
            <CardTitle>{plan.name} プラン</CardTitle>
            <CardDescription>{plan.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              {plan.price}円 / {plan.interval}
            </p>
          </CardContent>
          <CardFooter>
            {showSubscribeButton && <SubscripitonButton planId={plan.id} />}
            {showCreateAccountButton && <AuthServerButton />}
            {showManageSubscriptionButton && (
              <Button>
                <Link href="/dashboard">サブスクリプション管理する</Link>
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default PricingPage;
