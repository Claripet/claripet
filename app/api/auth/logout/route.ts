import { createClient } from "@/lib/supabase/server";
import { ok, serverError } from "@/lib/helpers/response";
import { withErrorHandling } from "@/lib/helpers/handler";

export const POST = withErrorHandling(async () => {
  const supabase = createClient();
  const { error: authError } = await supabase.auth.signOut();

  if (authError) {
    return serverError(authError.message);
  }

  return ok({ message: "Logged out successfully" });
});
