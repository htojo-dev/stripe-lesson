import { NextRequest, NextResponse } from "next/server";
import { supabaseRouteHnadlerClient } from "@/utils/supabaseRouteHandlerClients";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
  const supabase = supabaseRouteHnadlerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(requestUrl.origin);
}
