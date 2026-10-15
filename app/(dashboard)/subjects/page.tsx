import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function SubjectsPage() {
  const supabase = await createClient();
const { data: subjects, error } = await supabase
  .from("subjects")
  .select(`
    id,
    name,
    color,
    topics (
      id,
      is_done
    )
  `)
  .order("created_at", { ascending: true });
  if (error) {
    return (
      <main className="p-4">
        <p className="text-sm text-red-600">
          Failed to load subjects.
        </p>
      </main>
    );
  }

  return (
    <main className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
   <div className="mb-6 flex items-start justify-between gap-4">
  <div>
    <h1 className="text-2xl font-bold">Subjects</h1>
    <p className="mt-1 text-sm text-gray-500">
      Manage your subjects and topics.
    </p>
  </div>

  <Link
   href="/subjects/new"
className="block rounded-xl border border-black bg-white p-4 text-black transition hover:bg-black hover:text-white"
  >
    Add subject
  </Link>
</div>
      {subjects.length === 0 ? (
        <div className="rounded-xl border p-6 text-center">
          <p className="text-sm text-gray-500">
            No subjects yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {subjects.map((subject) => (
           <Link
  key={subject.id}
href={`/subjects/${subject.id}`}
  className="block rounded-xl border border-black bg-black p-4 text-white transition hover:bg-white hover:text-black"
>
  <div className="flex items-center gap-3">
    <div
      className="h-4 w-4 rounded-full"
      style={{
        backgroundColor: subject.color || "#000000",
      }}
    />

    <h2 className="font-medium">
      {subject.name}
    </h2>
  </div>
</Link>
          ))}
        </div>
      )}
    </main>
  );
}