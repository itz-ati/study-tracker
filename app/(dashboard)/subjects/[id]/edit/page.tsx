"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

type EditSubjectPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function EditSubjectPage({
  params,
}: EditSubjectPageProps) {
  const router = useRouter();
  const supabase = createClient();

  const [subjectId, setSubjectId] = useState("");
  const [name, setName] = useState("");
  const [color, setColor] = useState("#000000");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadSubject() {
      const { id } = await params;

      setSubjectId(id);

      const { data, error } = await supabase
        .from("subjects")
        .select("name, color")
        .eq("id", id)
        .single();

      if (error || !data) {
        setError("Subject not found.");
        return;
      }

      setName(data.name);
      setColor(data.color || "#000000");
    }

    loadSubject();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Subject name is required.");
      return;
    }

    setError("");
    setLoading(true);

    const { error } = await supabase
      .from("subjects")
      .update({
        name: name.trim(),
        color,
      })
      .eq("id", subjectId);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

 router.push("/subjects");
    router.refresh();
  }

  return (
    <main className="mx-auto w-full max-w-2xl p-4">
      <h1 className="text-2xl font-bold">Edit subject</h1>

      <p className="mt-1 text-sm text-gray-500">
        Update your subject.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input
          type="text"
          name="name"
          placeholder="Subject name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />

        <div>
          <label className="mb-2 block text-sm font-medium">
            Color
          </label>

          <input
            type="color"
            value={color}
            onChange={(event) => setColor(event.target.value)}
            className="h-10 w-16 cursor-pointer rounded border"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600">
            {error}
          </p>
        )}

        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save changes"}
        </Button>
      </form>
    </main>
  );
}