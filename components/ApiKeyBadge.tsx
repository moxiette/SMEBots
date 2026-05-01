"use client";

// Tiny header badge that opens the API key setup modal. Shows the user's
// current state (key set / not set) at a glance from any page.

import { useEffect, useState } from "react";
import { KeyRound } from "lucide-react";
import { hasApiKey } from "@/lib/key-store";
import { ApiKeySetup } from "./ApiKeySetup";

export function ApiKeyBadge() {
  const [open, setOpen] = useState(false);
  const [keySet, setKeySet] = useState(false);

  useEffect(() => {
    setKeySet(hasApiKey());
  }, []);

  // Re-check after the modal closes (key may have been added/removed).
  function handleClose() {
    setOpen(false);
    setKeySet(hasApiKey());
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={
          keySet
            ? "inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-mint-200 bg-mint-100/60 text-mint-400 hover:bg-mint-100 transition-colors"
            : "inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-peach-200 bg-peach-100/60 text-peach-400 hover:bg-peach-100 transition-colors"
        }
        title={
          keySet
            ? "Your Anthropic API key is set. Click to update or remove."
            : "Set your Anthropic API key to use the bots."
        }
      >
        <KeyRound size={12} />
        {keySet ? "API key set" : "Set API key"}
      </button>
      <ApiKeySetup open={open} onClose={handleClose} />
    </>
  );
}
