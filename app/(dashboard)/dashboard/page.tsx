import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ActivityHeatmap from "@/components/dashboard/activity-heatmap";
import PetWidget from "@/components/pet/PetWidget-temp";

export default async function DashboardPage() {
const supabase = await createClient();
const { data: claimsData } = await supabase.auth.getClaims();

if (!claimsData?.claims) {
redirect("/login");
}

const userId = claimsData.claims.sub;

if (typeof userId !== "string" || !userId) {
redirect("/login");
}

return ( <main className="min-h-screen bg-gray-50 px-4 py-6 dark:bg-gray-950 sm:px-6 lg:px-8"> <div className="mx-auto w-full max-w-7xl"> <div className="mb-6"> <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
Dashboard </h1> <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
Track your study progress and consistency. </p> </div>

    <ActivityHeatmap />
  </div>
</main>


);
}
