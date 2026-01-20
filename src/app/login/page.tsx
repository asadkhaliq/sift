"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
    } else {
      setStatus("sent");
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-paper p-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-medium text-tx mb-2">Sift</h1>
        <p className="text-sm text-tx-2 mb-8">
          A keyboard-first todo app for focused, intentional people.
        </p>

        {status === "sent" ? (
          <div className="p-4 bg-bg border border-ui rounded-sm">
            <p className="text-sm text-tx">
              Check your email for a magic link to sign in.
            </p>
            <p className="text-xs text-tx-2 mt-2">
              Didn&apos;t receive it?{" "}
              <button
                onClick={() => setStatus("idle")}
                className="text-blue underline"
              >
                Try again
              </button>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm text-tx-2 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
                className="w-full px-3 py-2 bg-paper border border-ui rounded-sm text-tx placeholder:text-tx-3 outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2 focus:ring-offset-paper"
              />
            </div>

            {status === "error" && (
              <p className="text-sm text-red">{errorMessage}</p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full px-3 py-2 bg-tx text-paper rounded-sm font-medium hover:bg-tx-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {status === "loading" ? "Sending..." : "Send magic link"}
            </button>
          </form>
        )}

        <p className="text-xs text-tx-3 mt-8 text-center">
          No password needed. We&apos;ll email you a link to sign in.
        </p>
      </div>
    </div>
  );
}
