export const dynamic = "force-dynamic";

import { getUser } from "@/lib/helpers/auth";
import { ok, unauthorized } from "@/lib/helpers/response";
import { withErrorHandling } from "@/lib/helpers/handler";

export const GET = withErrorHandling(async () => {
  const user = await getUser();

  if (!user) {
    return unauthorized();
  }

  return ok({
    id: user.id,
    email: user.email,
    full_name: user.profile?.full_name ?? null,
    phone: user.profile?.phone ?? null,
    role: user.profile?.role ?? "customer",
  });
});
