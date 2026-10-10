"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

type EditTopicProps = {
  topicId: string;
  currentName: string;
};

export default function EditTopic({
  topicId,
  currentName,
}: EditTopicProps) {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState(currentName);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Topic name is required.");
      return;
    }

    setError("");
    setLoading(true);

    const { error } = await supabase
      .from("topics")
      .update({
        name: name.trim(),
      })
      .eq("id", topicId);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setEditing(false);
    setLoading(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="text-sm font-medium underline"
      >
        Edit
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save"}
      </Button>

      <button
        type="button"
        onClick={() => {
          setEditing(false);
          setName(currentName);
          setError("");
        }}
        className="rounded-lg border px-3 py-2 text-sm"
      >
        Cancel
      </button>

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}