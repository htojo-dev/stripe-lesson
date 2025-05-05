"use client";

import { loadStripe } from "@stripe/stripe-js";
import { Button } from "../ui/button";

const SubscripitonButton = ({ planId }: { planId: string }) => {
  const processSubscripiton = async () => {
    const response = await fetch(
      `http://localhost:3000/api/subscription/${planId}`
    );

    const data = await response.json();

    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!)
    await stripe?.redirectToCheckout({sessionId: data.id});
  };

  return (
    <Button onClick={async () => processSubscripiton()}>
      サブスクリプション契約する
    </Button>
  );
};

export default SubscripitonButton;
