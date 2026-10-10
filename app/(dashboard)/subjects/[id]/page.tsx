

import Link from "next/link";
import { notFound } from "next/navigation";
import AddTopic from "./add-topic";
import { createClient } from "@/lib/supabase/server";
import TopicItem from "./topic-item";
import DeleteSubject from "./delete-subject";
import DeleteTopic from "./delete-topic";
import EditTopic from "./edit-topic";
type SubjectPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function SubjectPage({
  params,
}: SubjectPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: subject, error: subjectError } = await supabase
    .from("subjects")
    .select("id, name, color")
    .eq("id", id)
    .single();

  if (subjectError || !subject) {
    notFound();
  }

  const { data: topics, error: topicsError } = await supabase
    .from("topics")
    .select("id, name, is_done, done_at")
    .eq("subject_id", id)
    .order("created_at", { ascending: true });

  if (topicsError) {
    return (
      <main className="mx-auto w-full max-w-2xl p-4">
        <p className="text-sm text-red-600">
          Failed to load topics.
        </p>
      </main>
    );
  }

  const totalTopics = topics.length;
  const completedTopics = topics.filter(
    (topic) => topic.is_done
  ).length;

  const progress =
    totalTopics === 0
      ? 0
      : Math.round((completedTopics / totalTopics) * 100);

  return (
    <main className="mx-auto w-full max-w-2xl p-4">
      <Link
        href="/subjects"
        className="text-sm font-medium underline"
      >
        ← Subjects
      </Link>

      <div className="mt-6">
        
<div className="flex items-center justify-between gap-4">
  <div className="flex items-center gap-3">
    <div
      className="h-5 w-5 rounded-full"
      style={{
        backgroundColor: subject.color || "#000000",
      }}
    />

    <h1 className="text-2xl font-bold">
      {subject.name}
    </h1>
  </div>
<div className="flex gap-2">
 <Link
href={`/subjects/${subject.id}/edit`}
  className="rounded-lg border border-black bg-black px-3 py-2 text-sm font-medium text-white transition hover:bg-white hover:text-black"
>
  Edit
</Link>

  <DeleteSubject subjectId={subject.id} />
</div>
</div>
        <div className="mt-6">
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-gray-500">Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>

      <div className="h-3 overflow-hidden rounded-full border border-gray-300 bg-white">
  <div
    className="h-full rounded-full bg-black transition-all"
    style={{ width: `${progress}%` }}
  />
</div>

          <p className="mt-2 text-sm text-gray-500">
            {completedTopics} of {totalTopics} topics completed
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold">Topics</h2>
      <AddTopic subjectId={subject.id} />
        {topics.length === 0 ? (
          <div className="mt-3 rounded-xl border p-6 text-center">
            <p className="text-sm text-gray-500">
              No topics yet.
            </p>
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {topics.map((topic) => (
 <div
  key={topic.id}
  className="flex items-center gap-2"
>
  <TopicItem
    id={topic.id}
    name={topic.name}
    isDone={topic.is_done}
  />

  <div className="flex gap-2">
    <EditTopic
      topicId={topic.id}
      currentName={topic.name}
    />

    <DeleteTopic topicId={topic.id} />
  </div>
</div>
))}
          </div>
        )}
      </div>
    </main>
  );
}