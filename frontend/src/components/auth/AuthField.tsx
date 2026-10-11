"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type AuthFieldProps = {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  icon?: React.ComponentType<{ className?: string }>;
  placeholder?: string;
  autoComplete?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
};

export function AuthField({
  id,
  label,
  type = "text",
  value,
  onChange,
  icon: Icon,
  placeholder,
  autoComplete,
  error,
  required,
  disabled,
}: AuthFieldProps) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (show ? "text" : "password") : type;

  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-gray-600">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-300" />
        )}
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          disabled={disabled}
          className={`h-10 w-full rounded-xl border text-sm outline-none transition-colors ${
            Icon ? "pl-9" : "pl-3"
          } ${isPassword ? "pr-10" : "pr-3"} ${
            disabled
              ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
              : error
              ? "bg-white text-gray-800 border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-50"
              : "bg-white text-gray-800 border-gray-200 focus:border-(--brand-light) focus:ring-2 focus:ring-green-50"
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            tabIndex={-1}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
          >
            {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>
      {error && <p className="text-[11px] text-rose-500">{error}</p>}
    </div>
  );
}
