"use client";

import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-plum-100 bg-cream-50/50 backdrop-blur-sm py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Logo size="sm" />
            <p className="mt-3 text-sm text-ink-400 max-w-sm">
              AI bots that handle the busy work so you can do the work that
              matters. Subject Matter Expert bots for knowledge workers.
            </p>
          </div>

          {/* Bots */}
          <div>
            <h3 className="text-sm font-display font-bold text-ink-900 mb-3">
              Bots
            </h3>
            <ul className="space-y-2 text-sm text-ink-600">
              <li>
                <a href="/#bots" className="hover:text-plum-600 transition-colors">
                  All bots
                </a>
              </li>
              <li>
                <a href="/tpm-bot" className="hover:text-plum-600 transition-colors">
                  TPM Bot
                </a>
              </li>
              <li>
                <a href="/pm-bot" className="hover:text-plum-600 transition-colors">
                  PM Bot
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-plum-100 text-center text-xs text-ink-400">
          © {new Date().getFullYear()} SMEBots. Hosted on GitHub Pages. Powered
          by your own Anthropic API key — your data never touches our servers.
        </div>
      </div>
    </footer>
  );
}
