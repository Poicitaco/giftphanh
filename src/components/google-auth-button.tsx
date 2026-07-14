"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function GoogleAuthButton() {
  const [error, setError] = useState("");

  async function continueWithGoogle() {
    setError("");
    const { error: authError } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
    if (authError) setError(authError.message);
  }

  return (
    <>
      <button className="google-auth-button" onClick={continueWithGoogle} type="button">
        continue with Google
      </button>
      {error && <span className="composer-error" role="alert">{error}</span>}
    </>
  );
}
