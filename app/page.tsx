import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import WelcomeSplash from "@/components/WelcomeSplash";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;

  if (code) {
    redirect(`/auth/callback?code=${encodeURIComponent(code)}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return <WelcomeSplash />;
}