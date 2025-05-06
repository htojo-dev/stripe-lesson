import { Database } from "@/lib/database.types";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const supabaseRouteHnadlerClient = () => {
  return createRouteHandlerClient<Database>({ cookies: () => cookies() });
};