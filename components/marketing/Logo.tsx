"use client";

import Link from "next/link";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  };

  return (
    <Link href="/" className="inline-flex items-center group">
      <span
        className={`${sizes[size]} font-display font-semibold tracking-tight text-ink-900`}
      >
        SME<span className="gradient-text">Bots</span>
      </span>
    </Link>
  );
}
