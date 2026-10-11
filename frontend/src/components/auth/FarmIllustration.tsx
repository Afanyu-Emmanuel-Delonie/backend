export function FarmIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 260" className={className} fill="none" aria-hidden="true">
      {/* Sun */}
      <circle cx="338" cy="54" r="30" fill="var(--brand-gold)" opacity="0.9" />

      {/* Rolling hills */}
      <path
        d="M0,170 C70,135 150,190 230,155 C300,128 355,160 400,142 L400,260 L0,260 Z"
        fill="var(--brand-light-hover)"
        opacity="0.35"
      />
      <path
        d="M0,205 C65,178 145,222 225,190 C295,162 350,198 400,180 L400,260 L0,260 Z"
        fill="var(--brand-light)"
        opacity="0.55"
      />

      {/* Fence */}
      <g stroke="rgba(255,255,255,0.3)" strokeWidth="4" strokeLinecap="round">
        <line x1="18" y1="228" x2="18" y2="186" />
        <line x1="52" y1="228" x2="52" y2="180" />
        <line x1="86" y1="228" x2="86" y2="188" />
        <line x1="10" y1="196" x2="94" y2="191" />
        <line x1="10" y1="213" x2="94" y2="208" />
      </g>

      {/* Cow — back, grazing */}
      <g transform="translate(66 182) scale(0.72)" opacity="0.9">
        <rect x="0" y="22" width="78" height="42" rx="21" fill="white" />
        <circle cx="12" cy="30" r="17" fill="white" />
        <ellipse cx="4" cy="16" rx="6" ry="9" fill="white" />
        <ellipse cx="22" cy="16" rx="6" ry="9" fill="white" />
        <ellipse cx="20" cy="42" rx="10" ry="7" fill="var(--brand)" />
        <ellipse cx="50" cy="35" rx="9" ry="12" fill="var(--brand)" />
        <circle cx="6" cy="29" r="2" fill="var(--brand)" />
        <rect x="10" y="60" width="7" height="16" rx="3" fill="white" />
        <rect x="58" y="60" width="7" height="16" rx="3" fill="white" />
      </g>

      {/* Cow — front, main */}
      <g transform="translate(168 170)">
        <rect x="0" y="28" width="104" height="54" rx="27" fill="white" />
        <circle cx="18" cy="38" r="22" fill="white" />
        <ellipse cx="4" cy="20" rx="7" ry="11" fill="white" />
        <ellipse cx="30" cy="20" rx="7" ry="11" fill="white" />
        <ellipse cx="26" cy="56" rx="13" ry="9" fill="var(--brand)" />
        <ellipse cx="68" cy="46" rx="12" ry="16" fill="var(--brand)" />
        <circle cx="9" cy="37" r="2.4" fill="var(--brand)" />
        <ellipse cx="18" cy="48" rx="8" ry="5" fill="var(--nav-text)" opacity="0.6" />
        <rect x="14" y="80" width="9" height="20" rx="4" fill="white" />
        <rect x="80" y="80" width="9" height="20" rx="4" fill="white" />
        <path d="M100,40 q14,6 10,26" stroke="white" strokeWidth="5" strokeLinecap="round" fill="none" />
      </g>

      {/* Grass tufts */}
      <g stroke="rgba(255,255,255,0.35)" strokeWidth="3" strokeLinecap="round">
        <path d="M300,238 q3,-12 0,-18" />
        <path d="M308,238 q0,-14 4,-20" />
        <path d="M316,238 q-2,-10 1,-16" />
      </g>
    </svg>
  );
}
