"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export default function SignupForm() {
  const supabase = createClient();

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback`,
  },
});

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setMessage(
      "Account created. Check your email to confirm your account."
    );
    setLoading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm space-y-4 p-6"
    >
      <div>
        <h1 className="text-2xl font-bold">Create account</h1>
        <p className="mt-1 text-sm text-gray-500">
          Start tracking your study sessions.
        </p>
      </div>

      <Input
        type="email"
        name="email"
        placeholder="Email"
      />

      <Input
        type="password"
        name="password"
        placeholder="Password"
      />

      <Input
        type="password"
        name="confirmPassword"
        placeholder="Confirm password"
      />

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}

      {message && (
        <p className="text-sm text-green-600">
          {message}
        </p>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? "Creating account..." : "Create account"}
      </Button>

      <p className="text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium underline">
          Login
        </Link>
      </p>
    </form>
  );
}
