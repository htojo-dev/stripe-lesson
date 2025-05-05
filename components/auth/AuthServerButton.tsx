import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import AuthClientButton from "./AuthClientButton";
import { Database } from "@/lib/database.types";

const AuthServerButton = async () => {
  const supabase = createServerComponentClient<Database>({cookies});
  const { data: user } = await supabase.auth.getSession();
  const session = user.session;
  

  return <AuthClientButton session={session} />;
};

export default AuthServerButton;
