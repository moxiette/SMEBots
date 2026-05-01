"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Copy,
  Download,
  FileSpreadsheet,
  FileText,
  FileType,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import type { OutputTab, OutputFormat } from "@/lib/bot-configs";
import {
  downloadAsXlsx,
  downloadAsDocx,
  downloadAsCsv,
  downloadAsTxt,
  downloadAsMd,
} from "@/lib/exporters";

export interface BotOutput {
  [key: string]: string | Record<string, unknown> | undefined;
  summary?: Record<string, unknown>;
  _meta?: {
    model?: string;
    truncated?: boolean;
    missing_outputs?: string[];
    selected_outputs?: string[];
    [k: string]: unknown;
  };
}

interface Props {
  output: BotOutput;
  tabs: OutputTab[];
  programLabel?: string;
  ragLabel?: string;
}

type ViewMode = "preview" | "raw";

export function UnifiedOutputViewer({
  output,
  tabs,
  programLabel,
  ragLabel,
}: Props) {
  const [activeId, setActiveId] = useState<string>(tabs[0]?.id || "");
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("preview");
  const [downloading, setDownloading] = useState<string | null>(null);

  const activeTab = tabs.find((t) => t.id === activeId) || tabs[0];
  const activeContent = (output[activeTab.contentKey] as string) || "";

  const baseFilename = (() => {
    const programName =
      (programLabel
        ? (output.summary as Record<string, unknown>)?.[programLabel]
        : "") || "smebots-output";
    return `${String(programName)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")}-${activeTab.id}`;
  })();

  const summary = (output.summary as Record<string, unknown>) || {};
  const programName = programLabel ? (summary[programLabel] as string) : "";
  const rag = ragLabel ? (summary[ragLabel] as string) : "";
  const ragColors: Record<string, string> = {
    G: "bg-mint-100 text-mint-400",
    A: "bg-peach-100 text-peach-400",
    R: "bg-red-100 text-red-700",
  };

  function copy() {
    navigator.clipboard.writeText(activeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDownload(format: "xlsx" | "docx" | "csv" | "txt" | "md") {
    setDownloading(format);
    try {
      switch (format) {
        case "xlsx":
          await downloadAsXlsx(activeContent, baseFilename);
          break;
        case "docx":
          await downloadAsDocx(activeContent, baseFilename);
          break;
        case "csv":
          downloadAsCsv(activeContent, baseFilename);
          break;
        case "txt":
          downloadAsTxt(activeContent, baseFilename);
          break;
        case "md":
          downloadAsMd(activeContent, baseFilename);
          break;
      }
    } finally {
      setDownloading(null);
    }
  }

  function availableFormats(format: OutputFormat): {
    primary: {
      format: "xlsx" | "docx" | "csv" | "txt";
      label: string;
      icon: typeof FileSpreadsheet;
    };
    secondary: Array<{
      format: "xlsx" | "docx" | "csv" | "txt" | "md";
      label: string;
      icon: typeof FileSpreadsheet;
    }>;
  } {
    switch (format) {
      case "table":
        return {
          primary: { format: "xlsx", label: "Excel", icon: FileSpreadsheet },
          secondary: [
            { format: "csv", label: "CSV", icon: FileType },
            { format: "md", label: "Markdown", icon: FileText },
          ],
        };
      case "csv":
        return {
          primary: { format: "csv", label: "CSV", icon: FileType },
          secondary: [
            { format: "xlsx", label: "Excel", icon: FileSpreadsheet },
          ],
        };
      case "document":
        return {
          primary: { format: "docx", label: "Word", icon: FileText },
          secondary: [{ format: "md", label: "Markdown", icon: FileText }],
        };
      case "email":
        return {
          primary: { format: "txt", label: "Plain text", icon: FileText },
          secondary: [{ format: "md", label: "Markdown", icon: FileText }],
        };
    }
  }

  const formats = availableFormats(activeTab.format);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-3xl border-2 border-plum-200 shadow-soft overflow-hidden"
    >
      {(programName || Object.keys(summary).length > 0) && (
        <div className="bg-gradient-to-r from-plum-50 to-cream-100 px-6 py-5 border-b border-plum-100">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-xs text-plum-600 font-medium mb-1 uppercase tracking-widest">
                Deliverables for
              </div>
              <h3 className="text-xl font-display font-bold text-ink-900">
                {programName || "Your project"}
              </h3>
            </div>
            {rag && ragColors[rag] && (
              <span
                className={cn(
                  "px-3 py-1 rounded-full font-semibold text-sm",
                  ragColors[rag]
                )}
              >
                Status: {rag}
              </span>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-sm text-ink-600">
            {Object.entries(summary)
              .filter(
                ([k]) =>
                  k !== programLabel && k !== ragLabel && k !== "rag_reason"
              )
              .slice(0, 5)
              .map(([k, v]) => (
                <span
                  key={k}
                  className="bg-white px-3 py-1 rounded-full border border-plum-100"
                >
                  <strong className="text-plum-600">{String(v)}</strong>{" "}
                  <span className="text-ink-600">{k.replace(/_/g, " ")}</span>
                </span>
              ))}
          </div>
        </div>
      )}

      <div className="flex overflow-x-auto border-b border-ink-100 bg-cream-50">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveId(t.id)}
            className={cn(
              "px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 inline-flex items-center gap-2",
              activeId === t.id
                ? "text-plum-600 border-plum-500 bg-white"
                : "text-ink-600 border-transparent hover:text-plum-600"
            )}
          >
            <span>{t.emoji}</span>
            {t.label}
          </button>
        ))}
      </div>

      <div className="px-6 py-3 bg-cream-50/50 border-b border-ink-100 flex items-center justify-between gap-4 flex-wrap">
        <div className="text-xs text-ink-600 max-w-md">
          {activeTab.description}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-white border border-ink-100 rounded-lg p-0.5 flex">
            <button
              onClick={() => setViewMode("preview")}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                viewMode === "preview"
                  ? "bg-plum-600 text-white"
                  : "text-ink-600 hover:text-plum-600"
              )}
            >
              Preview
            </button>
            <button
              onClick={() => setViewMode("raw")}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                viewMode === "raw"
                  ? "bg-plum-600 text-white"
                  : "text-ink-600 hover:text-plum-600"
              )}
            >
              Raw
            </button>
          </div>

          <button
            onClick={copy}
            className="px-3 py-1.5 bg-white hover:bg-plum-50 text-ink-600 rounded-lg text-xs font-medium border border-ink-100 inline-flex items-center gap-1.5 transition-colors"
          >
            {copied ? (
              <>
                <Check size={12} /> Copied
              </>
            ) : (
              <>
                <Copy size={12} /> Copy
              </>
            )}
          </button>

          <button
            onClick={() => handleDownload(formats.primary.format)}
            disabled={downloading !== null}
            className="px-3 py-1.5 bg-plum-600 hover:bg-plum-700 text-white rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors disabled:opacity-60"
          >
            <Download size={12} />
            {downloading === formats.primary.format
              ? "..."
              : `Download ${formats.primary.label}`}
          </button>

          {formats.secondary.map((s) => (
            <button
              key={s.format}
              onClick={() => handleDownload(s.format)}
              disabled={downloading !== null}
              className="px-3 py-1.5 bg-white hover:bg-plum-50 text-ink-600 rounded-lg text-xs font-medium border border-ink-100 inline-flex items-center gap-1.5 transition-colors disabled:opacity-60"
            >
              <Download size={12} />
              {downloading === s.format ? "..." : s.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === "preview" ? (
          <motion.div
            key={`preview-${activeId}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-6 py-6 max-h-[600px] overflow-auto prose prose-sm max-w-none"
          >
            {activeContent ? (
              <div className="markdown-rendered">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {activeContent}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-ink-400 italic">(no content)</p>
            )}
          </motion.div>
        ) : (
          <motion.pre
            key={`raw-${activeId}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-6 py-6 text-xs text-ink-900 font-mono whitespace-pre-wrap leading-relaxed max-h-[600px] overflow-auto bg-cream-50/50"
          >
            {activeContent || "(no content)"}
          </motion.pre>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
