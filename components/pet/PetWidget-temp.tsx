"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import PetCanvas from "./PetCanvas";

type PetWidgetProps = {
userId: string;
};

export default function PetWidget({ userId }: PetWidgetProps) {
const [supabase] = useState(() => createClient());

return <PetCanvas supabase={supabase} userId={userId} />;
}
