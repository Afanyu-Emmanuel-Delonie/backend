"use client";

import { useRef } from "react";

type OtpInputProps = {
  length?: number;
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
};

export function OtpInput({ length = 6, value, onChange, error }: OtpInputProps) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  function handleChange(index: number, raw: string) {
    const digit = raw.replace(/\D/g, "").slice(-1);
    const next = [...value];
    next[index] = digit;
    onChange(next);
    if (digit && index < length - 1) inputs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length).split("");
    if (digits.length === 0) return;
    e.preventDefault();
    onChange(Array.from({ length }, (_, i) => digits[i] ?? ""));
    inputs.current[Math.min(digits.length, length) - 1]?.focus();
  }

  return (
    <div className="grid gap-1.5">
      <div className="flex justify-between gap-2">
        {Array.from({ length }).map((_, i) => (
          <input
            key={i}
            ref={(el) => {
              inputs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[i] ?? ""}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className={`h-12 w-11 rounded-xl border text-center text-lg font-semibold text-gray-800 outline-none transition-colors focus:ring-2 ${
              error
                ? "border-rose-300 focus:border-rose-400 focus:ring-rose-50"
                : "border-gray-200 focus:border-(--brand-light) focus:ring-green-50"
            }`}
          />
        ))}
      </div>
      {error && <p className="text-[11px] text-rose-500">{error}</p>}
    </div>
  );
}
