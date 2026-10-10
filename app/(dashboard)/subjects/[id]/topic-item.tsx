"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type TopicItemProps = {
  id: string;
  name: string;
  isDone: boolean;
};

export default function TopicItem({
  id,
  name,
  isDone,
}: TopicItemProps) {
  const router = useRouter();
  const supabase = createClient();

  const [checked, setChecked] = useState(isDone);
  const [loading, setLoading] = useState(false);

  async function handleChange() {
    if (loading) return;

    const newValue = !checked;

    setChecked(newValue);
    setLoading(true);

    const { error } = await supabase
      .from("topics")
      .update({
        is_done: newValue,
        done_at: newValue ? new Date().toISOString() : null,
      })
      .eq("id", id);

    if (error) {
      setChecked(checked);
      setLoading(false);
      return;
    }

    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border p-4">
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        disabled={loading}
        className="h-4 w-4"
      />

      <span
        className={
          checked
            ? "text-gray-400 line-through"
            : ""
        }
      >
        {name}
      </span>
    </div>
  );
}