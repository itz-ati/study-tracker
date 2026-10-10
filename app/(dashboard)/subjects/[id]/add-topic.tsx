"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

type AddTopicProps = {
  subjectId: string;
};

export default function AddTopic({ subjectId }: AddTopicProps) {
  const router = useRouter();
  const supabase = createClient();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = formData.get("name") as string;

    if (!name.trim()) {
      setError("Topic name is required.");
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

    const { error } = await supabase.from("topics").insert({
      subject_id: subjectId,
      user_id: user.id,
      name: name.trim(),
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    form.reset();
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <Input
        type="text"
        name="name"
        placeholder="Topic name"
      />

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? "Adding..." : "Add topic"}
      </Button>
    </form>
  );
}