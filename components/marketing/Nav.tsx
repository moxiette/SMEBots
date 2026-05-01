"use client";

import Link from "next/link";
import { Logo } from "./Logo";
import { ApiKeyBadge } from "@/components/ApiKeyBadge";

export function Nav() {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-cream-50/80 border-b border-plum-100">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-ink-600">
          <Link href="/#bots" className="hover:text-plum-600 transition-colors">
            Bots
          </Link>
          <Link href="/#how" className="hover:text-plum-600 transition-colors">
            How it works
          </Link>
          <ApiKeyBadge />
          <Link
            href="/tpm-bot"
            className="bg-plum-600 hover:bg-plum-700 text-white px-4 py-2 rounded-full text-sm shadow-soft transition-all hover:shadow-pop hover:-translate-y-0.5"
          >
            Try a bot
          </Link>
        </nav>

        <div className="md:hidden flex items-center gap-3">
          <ApiKeyBadge />
          <Link
            href="/tpm-bot"
            className="bg-plum-600 text-white px-3 py-1.5 rounded-full text-sm"
          >
            Try
          </Link>
        </div>
      </div>
    </header>
  );
}
