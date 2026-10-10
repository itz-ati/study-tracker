"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export default function NewSubjectPage() {
  const router = useRouter();
  const supabase = createClient();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [color, setColor] = useState("#000000");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;

    if (!name.trim()) {
      setError("Subject name is required.");
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { error } = await supabase.from("subjects").insert({
      user_id: user.id,
      name: name.trim(),
      color,
    });

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Add subject</h1>
        <p className="mt-1 text-sm text-gray-500">
          Add a subject to your study tracker.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          name="name"
          placeholder="Subject name"
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
          {loading ? "Adding..." : "Add subject"}
        </Button>
      </form>
    </main>
  );
}