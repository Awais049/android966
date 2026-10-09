import { useEffect, useState, type ReactNode } from "react";
import { ShieldCheck } from "lucide-react";
import { useSiteSettings } from "@/lib/siteSettings";

const STORAGE_KEY = "founder_unlocked";

export function FounderPinGate({ children }: { children: ReactNode }) {
  const settings = useSiteSettings();
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setUnlocked(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      setUnlocked(false);
    }
  }, []);

  if (unlocked) return <>{children}</>;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const expected = (settings.founder_pin || "").trim();
    if (!expected) {
      setError("Access PIN is not configured. Please contact the admin.");
      return;
    }
    if (pin.trim() === expected) {
      try {
        localStorage.setItem(STORAGE_KEY, "1");
      } catch {}
      setUnlocked(true);
    } else {
      setError("Incorrect PIN. Please try again.");
    }
  };

  return (
    <div className="a9-container py-16">
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-white p-8 shadow-sm">
        <div className="mb-5 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft">
            <ShieldCheck className="h-7 w-7 text-brand" />
          </div>
          <h1 className="text-xl font-semibold text-text">Enter Access PIN</h1>
          <p className="mt-2 text-sm text-neutral">
            The Founder page is restricted. Enter the PIN to unlock it on this device.
          </p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-text">Access PIN</label>
            <input
              type="password"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="input w-full text-center tracking-[0.5em]"
              placeholder="••••"
              autoFocus
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" className="btn-primary w-full">Unlock Founder Page</button>
        </form>
      </div>
    </div>
  );
}
