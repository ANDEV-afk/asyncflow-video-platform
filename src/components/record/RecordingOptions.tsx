"use client";

import type { RecordMode } from "@/components/record/types";

const options: { value: RecordMode; label: string }[] = [ // array of multiple recording options.
  { value: "screen-camera", label: "Screen + Camera" },
  { value: "screen-only", label: "Screen Only" },
  { value: "camera-only", label: "Camera Only" },
];

type RecordingOptionsProps = {
  recordMode: RecordMode;
  setRecordMode: (mode: RecordMode) => void;
  disabled?: boolean;
};

export default function RecordingOptions({
  recordMode,
  setRecordMode,
  disabled = false, // by default false means recording is allowed to be done.
}: RecordingOptionsProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Recording Type</p>
      <div className="space-y-2" role="radiogroup" aria-label="Recording type">
        {options.map((option) => (
          <label
            key={option.value}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
              recordMode === option.value
                ? "border-primary bg-primary/5"
                : "border-border hover:bg-muted/50"
            } ${disabled ? "pointer-events-none opacity-50" : ""}`}
          >
            <input
              type="radio"
              name="recordMode"
              value={option.value}
              checked={recordMode === option.value}
              onChange={() => setRecordMode(option.value)}
              disabled={disabled}
              className="size-4 accent-primary"
            />
            <span className="text-sm font-medium">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
