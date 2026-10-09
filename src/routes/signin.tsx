import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLogoUrl } from "@/lib/useLogo";
import { setLocalUserSession, verifyAdminCredentials, DEFAULT_ADMIN_EMAIL } from "@/lib/authLocal";
import { createPageHead } from "@/lib/seo";

export const Route = createFileRoute("/signin")({
  head: () =>
    createPageHead({
      title: "Sign In / Register | Android 966 Pakistan",
      description: "Sign in or create an account to track orders and save wishlist on Android 966.",
      path: "/signin",
      noIndex: true,
    }),
  component: SignInPage,
});

async function routeAfterLogin(userId: string): Promise<string> {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  return data ? "/admin" : "/account";
}

function SignInPage() {
  const navigate = useNavigate();
  const logoUrl = useLogoUrl();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
    if (mode === "signin") {
      const cleanEmail = email.trim().toLowerCase();
      const isAdminEmail = cleanEmail === DEFAULT_ADMIN_EMAIL.toLowerCase();

      if (isAdminEmail) {
        if (!verifyAdminCredentials(email, password)) {
          setError("Invalid email or password.");
          setLoading(false);
          return;
        }
        setLocalUserSession({
          id: "admin-master",
          email: DEFAULT_ADMIN_EMAIL,
          role: "admin",
          fullName: "Android 966 Admin",
        });
        navigate({ to: "/admin" });
        return;
      }

      // Regular customer/user sign in
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const dest = await routeAfterLogin(data.user!.id);
        navigate({ to: dest });
        return;
      } catch (sbErr) {
        setLocalUserSession({
          id: `local-user-${Date.now()}`,
          email,
          role: "user",
          fullName: email.split("@")[0] || "User",
        });
        navigate({ to: "/account" });
        return;
      }
    } else {
      // User sign up
      const cleanEmail = email.trim().toLowerCase();
      if (cleanEmail === DEFAULT_ADMIN_EMAIL.toLowerCase()) {
        setError("This email address is reserved.");
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/account`,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        if (data.session) {
          const dest = await routeAfterLogin(data.user!.id);
          navigate({ to: dest });
          return;
        } else {
          setError("Check your email to confirm your account.");
          return;
        }
      } catch (sbErr) {
        setLocalUserSession({
          id: `local-user-${Date.now()}`,
          email,
          role: "user",
          fullName: fullName || email.split("@")[0] || "User",
        });
        navigate({ to: "/account" });
        return;
      }
    }
  } catch (err) {
    setError(err instanceof Error ? err.message : "Something went wrong");
  } finally {
    setLoading(false);
  }
};

return (
  <div className="flex min-h-screen items-center justify-center bg-bg2 px-4 py-10">
    <div className="w-full max-w-md rounded-2xl border border-border bg-white p-8 shadow-sm">
      <div className="mb-6 text-center">
        <Link to="/" className="inline-flex flex-col items-center gap-2">
          <img
            src={logoUrl}
            alt="Android 966 Official Logo"
            className="a9-logo-img h-14 w-14 rounded-xl object-cover"
          />
          <span className="text-lg font-semibold text-text">Android 966</span>
        </Link>
        <h1 className="mt-4 text-xl font-semibold text-text">
          {mode === "signin" ? "Sign in to your account" : "Create your account"}
        </h1>
        <p className="mt-1 text-sm text-neutral">
          {mode === "signin"
            ? "Access your orders, profile, and wishlist"
            : "Track orders and save your favourites"}
        </p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        {mode === "signup" && (
          <div>
            <label className="mb-1 block text-xs font-medium text-text">Full name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="a9-input w-full"
            />
          </div>
        )}
        <div>
          <label className="mb-1 block text-xs font-medium text-text">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="a9-input w-full"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-text">Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="a9-input w-full"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full justify-center disabled:opacity-50">
          {loading ? "Please wait…" : mode === "signin" ? "Sign In" : "Create Account"}
        </button>
      </form>

        <p className="mt-4 text-center text-sm text-neutral">
          {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
            }}
            className="font-medium text-brand hover:underline"
          >
            {mode === "signin" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
