import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Save, Trash2 } from "lucide-react";
import { sb } from "@/lib/adminApi";
import ImagePicker from "@/components/admin/ImagePicker";
import {
  DEFAULT_FOUNDER,
  type FounderContent,
  type FounderEducation,
  type FounderExperience,
  type FounderLanguage,
  type FounderStat,
} from "@/lib/founderContent";

export const Route = createFileRoute("/admin/founder")({
  component: AdminFounder,
});

function AdminFounder() {
  const qc = useQueryClient();
  const [v, setV] = useState<FounderContent>(DEFAULT_FOUNDER);
  const [flash, setFlash] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "founder"],
    queryFn: async () => {
      try {
        const { data, error } = await sb
          .from("founder_content")
          .select("data")
          .eq("id", "main")
          .maybeSingle();
        if (error) throw error;
        return (data?.data ?? {}) as Partial<FounderContent>;
      } catch (err) {
        console.warn("[AdminFounder] Supabase connection unavailable:", err);
        return {};
      }
    },
    retry: false,
  });

  useEffect(() => {
    if (data) setV({ ...DEFAULT_FOUNDER, ...data });
  }, [data]);

  const save = useMutation({
    mutationFn: async (payload: FounderContent) => {
      const { error } = await sb
        .from("founder_content")
        .upsert({ id: "main", data: payload, updated_at: new Date().toISOString() });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["site", "founder"] });
      qc.invalidateQueries({ queryKey: ["admin", "founder"] });
      setFlash(true);
      setTimeout(() => setFlash(false), 2000);
    },
  });

  const set = <K extends keyof FounderContent>(k: K, val: FounderContent[K]) =>
    setV((p) => ({ ...p, [k]: val }));

  const updateList = <T,>(
    key: "stats" | "experience" | "education" | "languages",
    i: number,
    patch: Partial<T>,
  ) => {
    setV((p) => ({
      ...p,
      [key]: (p[key] as T[]).map((x, idx) => (idx === i ? { ...x, ...patch } : x)),
    }));
  };
  const removeAt = (key: keyof FounderContent, i: number) => {
    setV((p) => ({ ...p, [key]: (p[key] as unknown[]).filter((_, idx) => idx !== i) as never }));
  };
  const addTo = <T,>(key: keyof FounderContent, item: T) => {
    setV((p) => ({ ...p, [key]: [...(p[key] as T[]), item] as never }));
  };

  if (isLoading) return <p className="text-sm text-slate-500">Loading…</p>;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate(v);
      }}
      className="max-w-4xl space-y-6"
    >
      <Section title="Profile">
        <ImagePicker
          label="Founder photo"
          value={v.image}
          onChange={(val) => set("image", val)}
          maxSizeKB={800}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Name">
            <input className="input" value={v.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label="Role tag (small badge)">
            <input className="input" value={v.role_tag} onChange={(e) => set("role_tag", e.target.value)} />
          </Field>
        </div>
        <Field label="Role line">
          <input className="input" value={v.role_line} onChange={(e) => set("role_line", e.target.value)} />
        </Field>
        <Field label="Bio">
          <textarea rows={5} className="input" value={v.bio} onChange={(e) => set("bio", e.target.value)} />
        </Field>
      </Section>

      <Section title="Contact & Links">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="LinkedIn URL"><input className="input" value={v.linkedin_url} onChange={(e) => set("linkedin_url", e.target.value)} /></Field>
          <Field label="YouTube URL"><input className="input" value={v.youtube_url} onChange={(e) => set("youtube_url", e.target.value)} /></Field>
          <Field label="Email"><input className="input" value={v.email} onChange={(e) => set("email", e.target.value)} /></Field>
          <Field label="Phone"><input className="input" value={v.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
          <Field label="WhatsApp number (digits only)"><input className="input" value={v.whatsapp_number} onChange={(e) => set("whatsapp_number", e.target.value)} /></Field>
          <Field label="Location"><input className="input" value={v.location} onChange={(e) => set("location", e.target.value)} /></Field>
        </div>
      </Section>

      <Section title="Stats (4 tiles)">
        {v.stats.map((s, i) => (
          <Row key={i} onRemove={() => removeAt("stats", i)}>
            <input className="input sm:col-span-4" placeholder="Value" value={s.value} onChange={(e) => updateList<FounderStat>("stats", i, { value: e.target.value })} />
            <input className="input sm:col-span-7" placeholder="Label" value={s.label} onChange={(e) => updateList<FounderStat>("stats", i, { label: e.target.value })} />
          </Row>
        ))}
        <AddButton onClick={() => addTo<FounderStat>("stats", { value: "", label: "" })}>Add stat</AddButton>
      </Section>

      <Section title="Experience">
        {v.experience.map((e, i) => (
          <div key={i} className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <input className="input" placeholder="Role" value={e.role} onChange={(ev) => updateList<FounderExperience>("experience", i, { role: ev.target.value })} />
              <input className="input" placeholder="Company" value={e.company} onChange={(ev) => updateList<FounderExperience>("experience", i, { company: ev.target.value })} />
              <input className="input" placeholder="Period" value={e.period} onChange={(ev) => updateList<FounderExperience>("experience", i, { period: ev.target.value })} />
            </div>
            <textarea
              rows={3}
              className="input"
              placeholder="Bullet points (one per line)"
              value={e.points.join("\n")}
              onChange={(ev) => updateList<FounderExperience>("experience", i, { points: ev.target.value.split("\n").filter(Boolean) })}
            />
            <button type="button" onClick={() => removeAt("experience", i)} className="inline-flex items-center gap-1 text-xs text-red-600 hover:underline">
              <Trash2 className="h-3 w-3" /> Remove
            </button>
          </div>
        ))}
        <AddButton onClick={() => addTo<FounderExperience>("experience", { role: "", company: "", period: "", points: [] })}>Add experience</AddButton>
      </Section>

      <Section title="Education">
        {v.education.map((e, i) => (
          <Row key={i} onRemove={() => removeAt("education", i)}>
            <input className="input sm:col-span-3" placeholder="School" value={e.school} onChange={(ev) => updateList<FounderEducation>("education", i, { school: ev.target.value })} />
            <input className="input sm:col-span-3" placeholder="Degree" value={e.degree} onChange={(ev) => updateList<FounderEducation>("education", i, { degree: ev.target.value })} />
            <input className="input sm:col-span-2" placeholder="Period" value={e.period} onChange={(ev) => updateList<FounderEducation>("education", i, { period: ev.target.value })} />
            <input className="input sm:col-span-3" placeholder="Detail" value={e.detail} onChange={(ev) => updateList<FounderEducation>("education", i, { detail: ev.target.value })} />
          </Row>
        ))}
        <AddButton onClick={() => addTo<FounderEducation>("education", { school: "", degree: "", period: "", detail: "" })}>Add education</AddButton>
      </Section>

      <ListSection title="Skills" items={v.skills} onChange={(arr) => set("skills", arr)} placeholder="Skill" />
      <ListSection title="Projects" items={v.projects} onChange={(arr) => set("projects", arr)} placeholder="Project name" />
      <ListSection title="Certifications" items={v.certificates} onChange={(arr) => set("certificates", arr)} placeholder="Certificate" />

      <Section title="Languages">
        {v.languages.map((l, i) => (
          <Row key={i} onRemove={() => removeAt("languages", i)}>
            <input className="input sm:col-span-6" placeholder="Language" value={l.name} onChange={(e) => updateList<FounderLanguage>("languages", i, { name: e.target.value })} />
            <input type="number" className="input sm:col-span-5" placeholder="Percent" value={l.percent} onChange={(e) => updateList<FounderLanguage>("languages", i, { percent: Number(e.target.value) })} />
          </Row>
        ))}
        <AddButton onClick={() => addTo<FounderLanguage>("languages", { name: "", percent: 50 })}>Add language</AddButton>
      </Section>

      <Section title="Call to Action">
        <Field label="Heading"><input className="input" value={v.cta_heading} onChange={(e) => set("cta_heading", e.target.value)} /></Field>
        <Field label="Body"><textarea rows={2} className="input" value={v.cta_body} onChange={(e) => set("cta_body", e.target.value)} /></Field>
      </Section>

      <div className="sticky bottom-0 flex items-center gap-3 border-t border-slate-200 bg-white/95 py-3 backdrop-blur">
        <button
          type="submit"
          disabled={save.isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="h-4 w-4" /> {save.isPending ? "Saving…" : "Save Founder page"}
        </button>
        {flash && <span className="text-sm text-emerald-600">Saved ✓</span>}
        {save.error && <span className="text-sm text-red-600">{(save.error as Error).message}</span>}
      </div>
    </form>
  );
}

function ListSection({
  title,
  items,
  onChange,
  placeholder,
}: {
  title: string;
  items: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
}) {
  return (
    <Section title={title}>
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 sm:grid sm:grid-cols-12">
          <input
            className="input flex-1 sm:col-span-11"
            placeholder={placeholder}
            value={item}
            onChange={(e) => onChange(items.map((x, idx) => (idx === i ? e.target.value : x)))}
          />
          <button
            type="button"
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            className="inline-flex shrink-0 items-center justify-center rounded-md border border-red-200 px-3 text-red-600 hover:bg-red-50 sm:col-span-1 sm:px-0"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <AddButton onClick={() => onChange([...items, ""])}>Add</AddButton>
    </Section>
  );
}

function Row({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <div className="flex flex-col gap-2 sm:grid sm:grid-cols-12 sm:items-center">
      {children}
      <button
        type="button"
        onClick={onRemove}
        className="inline-flex items-center justify-center gap-1 rounded-md border border-red-200 px-3 py-2 text-xs text-red-600 hover:bg-red-50 sm:col-span-1 sm:py-0"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function AddButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-slate-700"
    >
      <Plus className="h-3 w-3" /> {children}
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="mb-4 text-sm font-semibold text-slate-900">{title}</h2>
      <div className="space-y-3">{children}</div>
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
