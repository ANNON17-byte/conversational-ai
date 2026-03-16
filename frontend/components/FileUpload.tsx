"use client";

import { useState, useRef } from "react";
import { Upload, Check, AlertCircle } from "lucide-react";
import { uploadCSV } from "@/services/api";

export default function FileUpload() {
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus("uploading");
    try {
      const result = await uploadCSV(file);
      setMessage(
        `Uploaded "${result.table_name}" (${result.row_count} rows)`
      );
      setStatus("done");
      setTimeout(() => setStatus("idle"), 4000);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Upload failed");
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }

    // Reset input
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="relative">
      <input
        ref={fileRef}
        type="file"
        accept=".csv"
        onChange={handleUpload}
        className="hidden"
        id="csv-upload"
      />
      <label
        htmlFor="csv-upload"
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm cursor-pointer transition-all border ${
          status === "done"
            ? "border-green-500/30 bg-green-500/10 text-green-400"
            : status === "error"
              ? "border-red-500/30 bg-red-500/10 text-red-400"
              : "border-[var(--card-border)] bg-[var(--card)] hover:border-blue-500/30 text-[var(--muted)] hover:text-blue-400"
        }`}
      >
        {status === "uploading" && (
          <>
            <Upload className="w-4 h-4 animate-bounce" /> Uploading...
          </>
        )}
        {status === "done" && (
          <>
            <Check className="w-4 h-4" /> {message}
          </>
        )}
        {status === "error" && (
          <>
            <AlertCircle className="w-4 h-4" /> {message}
          </>
        )}
        {status === "idle" && (
          <>
            <Upload className="w-4 h-4" /> Upload CSV
          </>
        )}
      </label>
    </div>
  );
}
