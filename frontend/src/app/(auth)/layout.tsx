"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import gsap from "gsap";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const leftRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLParagraphElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Left panel slides in from the left
      tl.fromTo(leftRef.current,
        { x: -60, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.7 }
      )
      // Logo fades down
      .fromTo(logoRef.current,
        { y: -16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 },
        "-=0.3"
      )
      // Headline fades up
      .fromTo(headlineRef.current,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        "-=0.3"
      )
      // Footer fades in
      .fromTo(footerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4 },
        "-=0.2"
      )
      // Right form panel fades + slides in from right
      .fromTo(rightRef.current,
        { x: 40, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6 },
        "-=0.5"
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div
        ref={leftRef}
        className="hidden lg:flex sticky top-0 h-screen relative flex-col justify-between w-[480px] shrink-0 overflow-hidden p-10 text-white"
        style={{ background: "var(--brand)" }}
      >
        <div className="pointer-events-none absolute inset-0">
          <svg className="absolute inset-0 h-full w-full opacity-[0.08]" aria-hidden="true">
            <defs>
              <pattern id="auth-dots" width="22" height="22" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.4" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#auth-dots)" />
          </svg>
        </div>

        <Link ref={logoRef} href="/overview" className="relative z-10 flex items-center gap-2.5">
          <BrandMark className="w-8 h-8 text-white" />
          <span className="font-heading font-semibold text-lg tracking-tight">FarmIQ</span>
        </Link>

        <div ref={headlineRef} className="relative z-10 space-y-4">
          <p className="text-3xl font-heading font-semibold leading-snug">
            Manage your farm<br />smarter, not harder.
          </p>
          <p className="text-sm" style={{ color: "var(--nav-text)" }}>
            Herd, health, production, finance — all in one place.
          </p>
        </div>

        <p ref={footerRef} className="relative z-10 text-xs" style={{ color: "var(--nav-text)" }}>
          © {new Date().getFullYear()} FarmIQ. All rights reserved.
        </p>
      </div>

      {/* Right panel */}
      <div ref={rightRef} className="flex-1 flex flex-col items-center justify-center p-6 bg-[var(--paper)]">
        <Link href="/overview" className="flex items-center gap-2 mb-8 lg:hidden">
          <BrandMark className="w-7 h-7 text-(--brand)" />
          <span className="font-heading font-semibold text-base" style={{ color: "var(--brand)" }}>
            FarmIQ
          </span>
        </Link>
        <div className="w-full max-w-[400px]">{children}</div>
      </div>
    </div>
  );
}
