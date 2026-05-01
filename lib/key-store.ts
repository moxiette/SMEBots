// Bring-your-own-key (BYOK) store for the Anthropic API key.
//
// Why BYOK?
// GitHub Pages serves static files only — there is no server, so there's
// nowhere safe to keep a shared API key (anything we ship in the bundle is
// readable by every visitor and would be drained within minutes). Instead,
// each user pastes their OWN Anthropic API key, which we keep in their
// browser's localStorage. The key never leaves their machine; calls go
// browser → api.anthropic.com directly.
//
// Trade-off accepted: each user needs their own key. For an internal demo
// inside a company, that's fine — share one team key via a password manager
// and have everyone paste it in.

const STORAGE_KEY = "smebots:anthropic_api_key";

export function getApiKey(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setApiKey(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, key.trim());
  } catch {
    // localStorage might be disabled (private browsing, etc.) — silently fail.
  }
}

export function clearApiKey(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function hasApiKey(): boolean {
  const k = getApiKey();
  return !!k && k.length > 10;
}

// Light validation — Anthropic keys today look like "sk-ant-..." but we
// don't want to be brittle if that prefix changes. Just check the user
// pasted something that looks like a real key, not whitespace or a typo.
export function looksLikeAnthropicKey(raw: string): boolean {
  const k = raw.trim();
  if (k.length < 20) return false;
  // Most Anthropic keys begin with sk-ant-. We accept anything that starts
  // with sk- to be forward-compatible.
  return /^sk-[A-Za-z0-9_-]+$/.test(k);
}
