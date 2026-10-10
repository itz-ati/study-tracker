"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type DeleteSubjectProps = {
  subjectId: string;
};

export default function DeleteSubject({
  subjectId,
}: DeleteSubjectProps) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this subject? All of its topics will also be deleted."
    );

    if (!confirmed) return;

    setLoading(true);

    const { error } = await supabase
      .from("subjects")
      .delete()
      .eq("id", subjectId);

    if (error) {
      window.alert(error.message);
      setLoading(false);
      return;
    }

    router.push("/subjects");
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