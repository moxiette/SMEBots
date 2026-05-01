"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, AlertTriangle, KeyRound } from "lucide-react";
import { Nav } from "@/components/marketing/Nav";
import { Footer } from "@/components/marketing/Footer";
import { ApiKeySetup } from "@/components/ApiKeySetup";
import {
  IntakeWizard,
  type IntakeData,
} from "@/components/bot/IntakeWizard";
import {
  UnifiedOutputViewer,
  type BotOutput,
} from "@/components/bot/UnifiedOutputViewer";
import type { BotConfig } from "@/lib/bot-configs";
import { getApiKey } from "@/lib/key-store";
import {
  generateDeliverables,
  classifyAnthropicError,
} from "@/lib/llm-client";

interface Props {
  config: BotConfig;
  programLabel?: string;
  ragLabel?: string;
}

export function BotPage({
  config,
  programLabel = "program_name",
  ragLabel,
}: Props) {
  const [generating, setGenerating] = useState(false);
  const [output, setOutput] = useState<BotOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [pendingIntake, setPendingIntake] = useState<IntakeData | null>(null);

  async function handleComplete(data: IntakeData) {
    setError(null);
    setOutput(null);

    const apiKey = getApiKey();
    if (!apiKey) {
      // Stash the intake so we can resume after they save a key.
      setPendingIntake(data);
      setKeyModalOpen(true);
      return;
    }

    await runGeneration(data, apiKey);
  }

  async function runGeneration(data: IntakeData, apiKey: string) {
    setGenerating(true);
    try {
      const result = await generateDeliverables({
        config,
        apiKey,
        programName: data.programName,
        goal: data.goal,
        guidedAnswers: data.guidedAnswers,
        optionalContext: data.optionalContext,
        detailLevel: data.detailLevel,
        styleChoice: data.styleChoice,
        selectedOutputs: data.selectedOutputs,
      });
      setOutput(result as BotOutput);
      setTimeout(() => {
        document
          .getElementById("output")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      setError(classifyAnthropicError(err));
    } finally {
      setGenerating(false);
    }
  }

  // After the user saves a key, automatically retry the generation they kicked off.
  function handleKeyModalClose() {
    setKeyModalOpen(false);
    const newKey = getApiKey();
    if (newKey && pendingIntake) {
      const intake = pendingIntake;
      setPendingIntake(null);
      runGeneration(intake, newKey);
    } else {
      setPendingIntake(null);
    }
  }

  // Surface a warning if some requested outputs were missing/truncated
  const truncationWarning = (() => {
    if (!output?._meta) return null;
    const missing = output._meta.missing_outputs as string[] | undefined;
    if (output._meta.truncated || (missing && missing.length > 0)) {
      return `Some outputs were not fully generated due to length limits. Try selecting fewer deliverables or use High-level detail.`;
    }
    return null;
  })();

  return (
    <>
      <Nav />
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-ink-900 mb-2">
            {config.name}
          </h1>
          <p className="text-sm text-plum-600 font-medium mb-4 max-w-2xl mx-auto uppercase tracking-widest">
            {config.acronymExpansion}
          </p>
          <p className="text-lg text-ink-600 max-w-2xl mx-auto leading-relaxed">
            {config.longDescription}
          </p>
          <p className="text-sm text-ink-400 mt-4 italic max-w-2xl mx-auto">
            {config.audienceLine}
          </p>
        </div>

        {!output && !generating && (
          <IntakeWizard config={config} onComplete={handleComplete} />
        )}

        {generating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border-2 border-plum-200 shadow-soft p-12 text-center"
          >
            <Loader2
              className="animate-spin mx-auto text-plum-600 mb-4"
              size={40}
            />
            <h2 className="text-2xl font-display font-bold text-ink-900 mb-2">
              Generating your deliverables
            </h2>
            <p className="text-ink-600">
              Calling Anthropic with your input. This usually takes fifteen to
              forty-five seconds.
            </p>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center"
          >
            <h3 className="font-display font-bold text-red-700 mb-2">
              Something went wrong
            </h3>
            <p className="text-red-700 text-sm mb-4">{error}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => {
                  setError(null);
                  setOutput(null);
                }}
                className="bg-red-700 hover:bg-red-800 text-white px-5 py-2 rounded-full text-sm font-medium"
              >
                Try again
              </button>
              <button
                onClick={() => setKeyModalOpen(true)}
                className="bg-white hover:bg-cream-100 text-ink-900 border border-ink-100 px-5 py-2 rounded-full text-sm font-medium inline-flex items-center gap-1.5"
              >
                <KeyRound size={14} /> Update API key
              </button>
            </div>
          </motion.div>
        )}

        {output && (
          <section id="output" className="mb-12">
            {truncationWarning && (
              <div className="mb-4 bg-peach-50 border border-peach-200 rounded-xl px-4 py-3 flex gap-3 items-start">
                <AlertTriangle
                  className="text-peach-400 shrink-0 mt-0.5"
                  size={18}
                />
                <div className="text-sm text-ink-900 leading-relaxed">
                  {truncationWarning}
                </div>
              </div>
            )}
            <UnifiedOutputViewer
              output={output}
              tabs={config.outputTabs.filter((t) =>
                Array.isArray(output._meta?.selected_outputs)
                  ? (output._meta.selected_outputs as string[]).includes(t.id)
                  : true
              )}
              programLabel={programLabel}
              ragLabel={ragLabel}
            />
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => {
                  setOutput(null);
                  setError(null);
                }}
                className="bg-plum-600 hover:bg-plum-700 text-white px-6 py-3 rounded-full text-sm font-medium shadow-soft"
              >
                Generate another
              </button>
            </div>
          </section>
        )}
      </main>

      <ApiKeySetup
        open={keyModalOpen}
        onClose={handleKeyModalClose}
        onSaved={() => {
          /* close handler will pick up the new key and resume */
        }}
      />
      <Footer />
    </>
  );
}
