"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { KeyRound, ShieldCheck, ExternalLink, Trash2, X } from "lucide-react";
import {
  getApiKey,
  setApiKey,
  clearApiKey,
  looksLikeAnthropicKey,
} from "@/lib/key-store";

interface Props {
  open: boolean;
  onClose: () => void;
  // Called after the user successfully saves a key.
  onSaved?: () => void;
}

export function ApiKeySetup({ open, onClose, onSaved }: Props) {
  const [value, setValue] = useState("");
  const [hasKey, setHasKey] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setValue("");
      setError(null);
      setHasKey(!!getApiKey());
    }
  }, [open]);

  function handleSave() {
    setError(null);
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Please paste an Anthropic API key.");
      return;
    }
    if (!looksLikeAnthropicKey(trimmed)) {
      setError(
        'That does not look like a valid Anthropic API key. Keys start with "sk-ant-" and you can copy yours from console.anthropic.com.'
      );
      return;
    }
    setApiKey(trimmed);
    setHasKey(true);
    setValue("");
    onSaved?.();
    onClose();
  }

  function handleClear() {
    clearApiKey();
    setHasKey(false);
    setValue("");
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-ink-900/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-3xl shadow-pop max-w-lg w-full p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-ink-400 hover:text-ink-900 transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-plum-100 flex items-center justify-center">
                <KeyRound className="text-plum-600" size={20} />
              </div>
              <h2 className="text-2xl font-display font-bold text-ink-900">
                Anthropic API key
              </h2>
            </div>

            <p className="text-sm text-ink-600 leading-relaxed mb-5">
              SMEBots runs entirely in your browser — there is no backend.
              Generation calls go directly from this page to Anthropic using a
              key you provide. The key is stored only in your browser&apos;s
              local storage and never leaves your machine.
            </p>

            <div className="bg-plum-50 border border-plum-200 rounded-xl p-4 mb-5 flex gap-3">
              <ShieldCheck
                className="text-plum-600 shrink-0 mt-0.5"
                size={18}
              />
              <div className="text-xs text-ink-600 leading-relaxed">
                <strong className="text-ink-900">Where to get a key.</strong>{" "}
                Sign in at{" "}
                <a
                  href="https://console.anthropic.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-plum-600 hover:underline inline-flex items-center gap-0.5"
                >
                  console.anthropic.com
                  <ExternalLink size={11} />
                </a>{" "}
                → API Keys → Create Key. Anthropic charges your account per
                request, typically pennies per generation.
              </div>
            </div>

            <label className="block mb-4">
              <span className="block text-sm font-medium text-ink-900 mb-2">
                Paste your key
              </span>
              <input
                type="password"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="sk-ant-..."
                autoFocus
                className="w-full px-4 py-3 rounded-xl border-2 border-ink-100 focus:border-plum-400 focus:outline-none text-ink-900 font-mono text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                }}
              />
            </label>

            {error && (
              <p className="text-sm text-red-600 mb-4">{error}</p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
              {hasKey ? (
                <button
                  onClick={handleClear}
                  className="text-sm text-ink-400 hover:text-red-600 inline-flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 size={14} /> Forget my saved key
                </button>
              ) : (
                <span className="text-xs text-ink-400">
                  No key saved yet.
                </span>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-full text-sm font-medium text-ink-600 hover:bg-cream-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="bg-plum-600 hover:bg-plum-700 text-white px-5 py-2 rounded-full text-sm font-medium shadow-soft transition-all"
                >
                  Save key
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
