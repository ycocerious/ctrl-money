"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { env } from "~/env";
import { createClient } from "~/lib/supabase/server";

export async function loginWithGoogle() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/`,
    },
  });

  if (error) {
    redirect("/error");
  }

  if (data.url) {
    redirect(data.url);
  }

  revalidatePath("/", "layout");
  redirect("/");
}
