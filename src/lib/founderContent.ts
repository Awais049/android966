import { useQuery } from "@tanstack/react-query";
import { sb } from "@/lib/adminApi";

export type FounderExperience = { role: string; company: string; period: string; points: string[] };
export type FounderEducation = { school: string; degree: string; period: string; detail: string };
export type FounderStat = { value: string; label: string };
export type FounderLanguage = { name: string; percent: number };

export interface FounderContent {
  image: string;
  name: string;
  role_tag: string;
  role_line: string;
  bio: string;
  linkedin_url: string;
  email: string;
  phone: string;
  youtube_url: string;
  location: string;
  whatsapp_number: string;
  stats: FounderStat[];
  experience: FounderExperience[];
  education: FounderEducation[];
  skills: string[];
  projects: string[];
  certificates: string[];
  languages: FounderLanguage[];
  cta_heading: string;
  cta_body: string;
}

export const DEFAULT_FOUNDER: FounderContent = {
  image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
  name: "Awais Ahmed",
  role_tag: "Founder & CEO",
  role_line: "Software Engineer · Digital Marketer · Content Creator",
  bio: "I'm a Software Engineering graduate passionate about digital innovation and technology. Along with web development skills, I actively explore digital marketing and AI tools. As a part-time YouTuber behind Android 966, I love sharing tech insights and creative ideas. My goal is to combine technical expertise with creativity to deliver meaningful impact in the tech industry.",
  linkedin_url: "https://www.linkedin.com/in/real-awais",
  email: "awaissh81@gmail.com",
  phone: "+92 312 6069613",
  youtube_url: "https://www.youtube.com/@Android966",
  location: "Gujrat, Punjab, Pakistan",
  whatsapp_number: "923091726858",
  stats: [
    { value: "BS", label: "Software Engineering" },
    { value: "3.42", label: "CGPA / 4.00" },
    { value: "10+", label: "Projects Delivered" },
    { value: "4", label: "Certifications" },
  ],
  experience: [
    {
      role: "Web Developer (WordPress)",
      company: "Admin to Us",
      period: "May 2025 — Present",
      points: ["Building responsive WordPress sites", "Custom themes & plugin integrations"],
    },
    {
      role: "Business Sales Executive",
      company: "HBL",
      period: "Feb 2025 — May 2025",
      points: ["Client acquisition and relationship management"],
    },
    {
      role: "Digital Marketing Intern (SEO)",
      company: "Technogic Systems",
      period: "Oct 2024 — Jan 2025",
      points: [
        "Keyword research (Semrush, Ubersuggest, Moz)",
        "SEO-friendly article writing",
        "WordPress blog posting with internal/external linking",
        "Backlink building (image, PDF, blog, bookmarks)",
      ],
    },
  ],
  education: [
    { school: "University of Gujrat", degree: "BS Software Engineering", period: "2020 — 2024", detail: "CGPA: 3.42 / 4.00" },
    { school: "Punjab Group of Colleges", degree: "Intermediate in Computer Science", period: "2018 — 2020", detail: "926 / 1100" },
    { school: "Websters International High School", degree: "Matriculation in Computer Science", period: "2016 — 2018", detail: "966 / 1100" },
  ],
  skills: [
    "Project Management", "HubSpot", "HTML / CSS / JavaScript",
    "C++, Java, Dart, Flutter", "Firebase, MongoDB, MS SQL",
    "Figma, Katalon, Draw.io", "Git & GitHub", "SEO Tools (Semrush, Moz)",
    "WordPress Development", "Social Media & Digital Marketing",
    "Video Editing", "YouTube Channel Management", "Canva & AI Design",
  ],
  projects: [
    "GYM Website (WordPress)", "Responsive Resume (HTML, CSS, JS)",
    "Basic Lottery App (Flutter)", "Warmplus Site (WordPress)",
    "Food App — FYP (Flutter)", "University M-S (C++, OOP)",
    "Inventory System (C++)", "SearchNum (Java, DSA)",
    "AGP (USA Company Site)", "NM Furniture (SEO)",
  ],
  certificates: [
    "Digital Marketing — Digiskills.pk",
    "Affiliate Marketing — Digiskills.pk",
    "Freelancing — Digiskills.pk",
    "SEO — Digiskills.pk",
  ],
  languages: [
    { name: "Urdu", percent: 100 },
    { name: "English", percent: 75 },
    { name: "Punjabi", percent: 70 },
  ],
  cta_heading: "Work with Awais",
  cta_body: "Available for web development, SEO, and digital marketing projects.",
};

export function useFounderContent() {
  const { data, isLoading } = useQuery({
    queryKey: ["site", "founder"],
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
        console.warn("[FounderContent] Supabase connection unavailable, using local defaults:", err);
        return {};
      }
    },
    staleTime: 60_000,
    retry: false,
  });
  return { content: { ...DEFAULT_FOUNDER, ...(data ?? {}) } as FounderContent, isLoading };
}
