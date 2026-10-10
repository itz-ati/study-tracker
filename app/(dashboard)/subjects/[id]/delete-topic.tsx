"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type DeleteTopicProps = {
  topicId: string;
};

export default function DeleteTopic({
  topicId,
}: DeleteTopicProps) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this topic?"
    );

    if (!confirmed) return;

    setLoading(true);

    const { error } = await supabase
      .from("topics")
      .delete()
      .eq("id", topicId);

    if (error) {
      window.alert(error.message);
      setLoading(false);
      return;
    }

    router.refresh();
  }

  return (
    <Button
      type="button"
      onClick={handleDelete}
      disabled={loading}
    >
      {loading ? "Deleting..." : "Delete"}
    </Button>
  );
}