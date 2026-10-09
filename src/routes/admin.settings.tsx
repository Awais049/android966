import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { sb } from "@/lib/adminApi";
import { DEFAULT_SETTINGS, type SiteSettings } from "@/lib/siteSettings";
import { THEMES, applyTheme } from "@/lib/themes";
import ImagePicker from "@/components/admin/ImagePicker";
import { getAdminPassword, setAdminPassword, DEFAULT_ADMIN_EMAIL } from "@/lib/authLocal";
import { setSynchronousLogoUrl } from "@/lib/useLogo";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  const qc = useQueryClient();
  const [values, setValues] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [savedFlash, setSavedFlash] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [passUpdatedMsg, setPassUpdatedMsg] = useState<string | null>(null);

  const handleUpdateAdminPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPass || adminPass.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }
    setAdminPassword(adminPass);
    setPassUpdatedMsg("Admin password updated successfully ✓");
    setAdminPass("");
    setTimeout(() => setPassUpdatedMsg(null), 3500);
  };

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: async () => {
      try {
        const { data, error } = await sb
          .from("site_settings")
          .select("data")
          .eq("id", "main")
          .maybeSingle();
        if (error) throw error;
        return (data?.data ?? {}) as Partial<SiteSettings>;
      } catch (err) {
        console.warn("[AdminSettings] Supabase connection unavailable:", err);
        return {};
      }
    },
    retry: false,
  });

  useEffect(() => {
    if (data) setValues({ ...DEFAULT_SETTINGS, ...data });
  }, [data]);

  const save = useMutation({
    mutationFn: async (v: SiteSettings) => {
      setSynchronousLogoUrl(v.logo_url || "");
      const { error } = await sb
        .from("site_settings")
        .upsert({ id: "main", data: v, updated_at: new Date().toISOString() });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["site", "settings"] });
      qc.invalidateQueries({ queryKey: ["admin", "settings"] });
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2000);
    },
  });

  const set = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) =>
    setValues((prev) => ({ ...prev, [k]: v }));

  if (isLoading) return <p className="text-sm text-slate-500">Loading…</p>;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate(values);
      }}
      className="max-w-3xl space-y-6"
    >
      <Section title="Site Logo">
        <p className="text-xs text-slate-500">
          Upload your brand logo — it appears in the header, footer, admin sidebar, About page, sign-in, and checkout. Square images work best (recommended 512×512). Leave empty to use the default.
        </p>
        <ImagePicker
          label="Logo image"
          value={values.logo_url}
          onChange={(v) => {
            set("logo_url", v);
            setSynchronousLogoUrl(v);
          }}
          maxSizeKB={800}
        />
      </Section>

      <Section title="Website Theme">
        <p className="text-xs text-slate-500">
          Pick a color theme — it instantly re-skins the entire site (buttons, links, accents, surfaces).
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {THEMES.map((t) => {
            const active = values.theme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  const next = { ...values, theme: t.id };
                  setValues(next);
                  applyTheme(t.id);
                  save.mutate(next);
                }}

                className={`group flex flex-col gap-2 rounded-xl border p-3 text-left transition-all ${
                  active
                    ? "border-blue-600 ring-2 ring-blue-200"
                    : "border-slate-200 hover:border-slate-400"
                }`}
              >
                <div className="flex h-10 overflow-hidden rounded-md border border-slate-200">
                  {t.swatch.map((c) => (
                    <div key={c} className="flex-1" style={{ background: c }} />
                  ))}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{t.label}</div>
                  <div className="mt-0.5 text-[11px] leading-snug text-slate-500">{t.description}</div>
                </div>
                {active && (
                  <span className="mt-1 inline-flex w-fit rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
                    Active
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Hero Section">
        <Field label="Tagline (small text above title)">
          <input className="input" value={values.hero_tag} onChange={(e) => set("hero_tag", e.target.value)} />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Title (main)">
            <input className="input" value={values.hero_title} onChange={(e) => set("hero_title", e.target.value)} />
          </Field>
          <Field label="Title (highlighted / blue)">
            <input className="input" value={values.hero_title_highlight} onChange={(e) => set("hero_title_highlight", e.target.value)} />
          </Field>
        </div>
        <Field label="Subtitle / description">
          <textarea rows={3} className="input" value={values.hero_subtitle} onChange={(e) => set("hero_subtitle", e.target.value)} />
        </Field>
      </Section>

      <Section title="Stats">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Stat 1 value"><input className="input" value={values.stat_1_value} onChange={(e) => set("stat_1_value", e.target.value)} /></Field>
          <Field label="Stat 1 label"><input className="input" value={values.stat_1_label} onChange={(e) => set("stat_1_label", e.target.value)} /></Field>
          <Field label="Stat 2 value"><input className="input" value={values.stat_2_value} onChange={(e) => set("stat_2_value", e.target.value)} /></Field>
          <Field label="Stat 2 label"><input className="input" value={values.stat_2_label} onChange={(e) => set("stat_2_label", e.target.value)} /></Field>
          <Field label="Stat 3 value"><input className="input" value={values.stat_3_value} onChange={(e) => set("stat_3_value", e.target.value)} /></Field>
          <Field label="Stat 3 label"><input className="input" value={values.stat_3_label} onChange={(e) => set("stat_3_label", e.target.value)} /></Field>
        </div>
      </Section>

      <Section title="Social & Contact">
        <Field label="YouTube URL"><input className="input" value={values.youtube_url} onChange={(e) => set("youtube_url", e.target.value)} /></Field>
        <Field label="Facebook URL"><input className="input" value={values.facebook_url} onChange={(e) => set("facebook_url", e.target.value)} /></Field>
        <Field label="WhatsApp number (digits only, e.g. 923091726858)">
          <input className="input" value={values.whatsapp_number} onChange={(e) => set("whatsapp_number", e.target.value)} />
        </Field>
      </Section>

      <Section title="About Section">
        <Field label="Heading"><input className="input" value={values.about_heading} onChange={(e) => set("about_heading", e.target.value)} /></Field>
        <Field label="Body"><textarea rows={4} className="input" value={values.about_body} onChange={(e) => set("about_body", e.target.value)} /></Field>
      </Section>

      <Section title="Founder Page Access">
        <Field label="Founder Page PIN (share only with authorized users)">
          <input
            type="text"
            inputMode="numeric"
            className="input"
            value={values.founder_pin}
            onChange={(e) => set("founder_pin", e.target.value)}
            placeholder="e.g. 9660"
          />
        </Field>
        <p className="text-xs text-slate-500">
          Users must be signed in and enter this PIN once to unlock the Founder page. It stays unlocked per account until they sign out or clear browser storage. Change the PIN here to revoke access for everyone.
        </p>
      </Section>

      <Section title="Admin Security & Credentials">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Admin Email</label>
            <input
              type="text"
              readOnly
              disabled
              className="input cursor-not-allowed bg-slate-50 text-slate-500"
              value={DEFAULT_ADMIN_EMAIL}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Change Admin Password</label>
            <div className="flex gap-2">
              <input
                type="password"
                className="input"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                placeholder="Enter new password (min 8 chars)"
              />
              <button
                type="button"
                onClick={handleUpdateAdminPassword}
                className="shrink-0 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-medium text-white hover:bg-slate-800"
              >
                Update Password
              </button>
            </div>
            {passUpdatedMsg && <p className="mt-1 text-xs text-emerald-600 font-medium">{passUpdatedMsg}</p>}
          </div>
        </div>
        <p className="text-xs text-slate-500">
          Admin credentials are used to access this panel. Keep your password confidential and never share it publicly.
        </p>
      </Section>


      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={save.isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {save.isPending ? "Saving…" : "Save changes"}
        </button>
        {savedFlash && <span className="text-sm text-emerald-600">Saved ✓</span>}
        {save.error && <span className="text-sm text-red-600">{(save.error as Error).message}</span>}
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="mb-4 text-sm font-semibold text-slate-900">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-700">{label}</label>
      {children}
    </div>
  );
}
