import { useRef, useState } from "react";
import { Link as LinkIcon, Upload, X } from "lucide-react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  label?: string;
  maxSizeKB?: number;
};

/**
 * Image picker with two modes:
 *  - URL: paste any web image URL
 *  - Upload: pick a file from the device, converts to base64 data URL
 *    (kept small — recommend under 1 MB per image)
 */
export default function ImagePicker({ value, onChange, label = "Image", maxSizeKB = 1200 }: Props) {
  const [mode, setMode] = useState<"url" | "upload">(
    value.startsWith("data:") ? "upload" : "url",
  );
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file");
      return;
    }
    if (file.size / 1024 > maxSizeKB) {
      setError(`Image too large. Keep under ${Math.round(maxSizeKB / 100) / 10} MB.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result || ""));
    reader.onerror = () => setError("Could not read file");
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="text-xs font-medium text-slate-700">{label}</label>
        <div className="inline-flex overflow-hidden rounded-md border border-slate-200 text-[11px]">
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`flex items-center gap-1 px-2 py-1 ${
              mode === "url" ? "bg-blue-600 text-white" : "bg-white text-slate-600"
            }`}
          >
            <LinkIcon className="h-3 w-3" /> URL
          </button>
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`flex items-center gap-1 px-2 py-1 ${
              mode === "upload" ? "bg-blue-600 text-white" : "bg-white text-slate-600"
            }`}
          >
            <Upload className="h-3 w-3" /> Upload
          </button>
        </div>
      </div>

      {mode === "url" ? (
        <input
          type="url"
          value={value.startsWith("data:") ? "" : value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="input"
        />
      ) : (
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600 hover:bg-slate-100"
          >
            <Upload className="h-4 w-4" /> Choose image from device
          </button>
          <p className="mt-1 text-[11px] text-slate-500">
            Keep under {Math.round(maxSizeKB / 100) / 10} MB. Stored inline.
          </p>
        </div>
      )}

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}

      {value && (
        <div className="mt-2 flex items-center gap-3">
          <img
            src={value}
            alt=""
            className="h-16 w-16 rounded-lg border border-slate-200 object-cover"
            onError={(e) => ((e.currentTarget.style.opacity = "0.3"))}
          />
          <button
            type="button"
            onClick={() => {
              onChange("");
              if (fileRef.current) fileRef.current.value = "";
            }}
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
          >
            <X className="h-3 w-3" /> Remove
          </button>
        </div>
      )}
    </div>
  );
}
